import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

describe('Purchasing & Goods Receipt', () => {
  let adminTokens;
  let supplier;
  let po;
  let item;

  beforeAll(async () => {
    // Setup test user with SUPER_ADMIN
    const passwordHash = await argon2.hash('password123');
    const role = await prisma.role.findFirst({ where: { name: 'SUPER_ADMIN' } });
    
    const user = await prisma.user.upsert({
      where: { email: 'purchasing@test.local' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'purchasing@test.local',
        name: 'Purchasing Admin',
        passwordHash,
        roles: { create: { roleId: role.id } }
      }
    });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'purchasing@test.local',
      password: 'password123'
    });
    adminTokens = res.body.accessToken;

    item = await prisma.item.findFirst({ where: { type: 'RAW_MATERIAL' } });
  });

  it('should create a supplier', async () => {
    const res = await request(app)
      .post('/api/v1/purchasing/suppliers')
      .set('Authorization', `Bearer ${adminTokens}`)
      .send({
        name: 'Test Supplier',
        email: 'john@supplier.com',
        phone: '123456789'
      });
      
    expect(res.statusCode).toBe(201);
    supplier = res.body;
  });

  it('should create a purchase order', async () => {
    const res = await request(app)
      .post('/api/v1/purchasing/purchase-orders')
      .set('Authorization', `Bearer ${adminTokens}`)
      .send({
        supplierId: supplier.id,
        items: [
          { itemId: item.id, quantity: 100, unitPrice: 50.0 }
        ]
      });
      
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ISSUED');
    po = res.body;
  });

  it('should reject receiving more than ordered', async () => {
    const res = await request(app)
      .post(`/api/v1/purchasing/purchase-orders/${po.id}/confirm`)
      .set('Authorization', `Bearer ${adminTokens}`)
      .send({
        invoiceRef: 'INV-001',
        items: [
          { itemId: item.id, acceptedQuantity: 150, supplierBatch: 'B-001' } // Ordered 100
        ]
      });
      
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Cannot receive more than ordered');
  });

  it('should process Goods Receipt successfully and update PO status', async () => {
    const res = await request(app)
      .post(`/api/v1/purchasing/purchase-orders/${po.id}/confirm`)
      .set('Authorization', `Bearer ${adminTokens}`)
      .send({
        invoiceRef: 'INV-001',
        items: [
          { itemId: item.id, acceptedQuantity: 100, supplierBatch: 'B-001' }
        ]
      });
      
    expect(res.statusCode).toBe(201);
    
    // Check PO Status changed to COMPLETED
    const updatedPo = await prisma.purchaseOrder.findUnique({ where: { id: po.id } });
    expect(updatedPo.status).toBe('COMPLETED');
    
    // Check Stock Balance Incremented
    const balance = await prisma.inventoryBalance.findFirst({ where: { itemId: item.id } });
    expect(Number(balance.quantity)).toBeGreaterThanOrEqual(100);
    
    // Check Audit Log
    const log = await prisma.auditLog.findFirst({ where: { action: 'GOODS_RECEIPT_CONFIRMED' } });
    expect(log).toBeDefined();
  });
});
