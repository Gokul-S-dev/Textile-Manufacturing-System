import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { createReservation } from '../src/modules/inventory/inventory.service.js';

const prisma = new PrismaClient();

describe('Inventory Reservations & Concurrency', () => {
  let warehouse;
  let item;
  let adminId;

  beforeAll(async () => {
    const role = await prisma.role.findFirst({ where: { name: 'SUPER_ADMIN' } });
    const user = await prisma.user.upsert({
      where: { email: 'inv@test.local' },
      update: { isActive: true },
      create: {
        email: 'inv@test.local',
        name: 'Inv Admin',
        passwordHash: 'dummy',
        roles: { create: { roleId: role.id } }
      }
    });
    adminId = user.id;

    warehouse = await prisma.warehouse.findFirst();
    item = await prisma.item.findFirst();
    
    // Reset or seed a specific balance for the test
    const batch = await prisma.inventoryBatch.findFirst({ where: { itemId: item.id } });
    if (batch) {
        await prisma.inventoryBalance.upsert({
          where: { itemId_warehouseId_batchId: { itemId: item.id, warehouseId: warehouse.id, batchId: batch.id } },
          update: { quantity: 50, reservedQuantity: 0 },
          create: { itemId: item.id, warehouseId: warehouse.id, batchId: batch.id, quantity: 50, reservedQuantity: 0 }
        });
    }
  });

  it('should strictly enforce concurrent material reservations without over-allocating', async () => {
    // We attempt 3 concurrent reservations of 20 units each.
    // Total physical stock is 50. Total requested is 60.
    // The third reservation should fail due to our strict `quantity: { gte: reservedQuantity + newQty }` lock.
    
    const reservationPromises = [
      createReservation({ itemId: item.id, warehouseId: warehouse.id, quantity: 20 }, adminId),
      createReservation({ itemId: item.id, warehouseId: warehouse.id, quantity: 20 }, adminId),
      createReservation({ itemId: item.id, warehouseId: warehouse.id, quantity: 20 }, adminId)
    ];

    const results = await Promise.allSettled(reservationPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    // Exactly 2 should succeed (20 + 20 = 40 reserved)
    expect(successful.length).toBe(2);
    // Exactly 1 should fail (remaining 10 < 20 requested)
    expect(failed.length).toBe(1);
    
    expect(failed[0].reason.message).toContain('Insufficient unreserved physical stock');
  });
});
