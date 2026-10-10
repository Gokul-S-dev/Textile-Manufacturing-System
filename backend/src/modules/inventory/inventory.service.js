import prisma from '../../config/db.js';
import { Prisma } from '@prisma/client';

export const getItems = async () => {
  return await prisma.item.findMany({
    include: {
      balances: true,
      supplier: true,
      batches: true
    }
  });
};

export const getItemStock = async (itemId) => {
  return await prisma.inventoryBalance.findMany({
    where: { itemId },
    include: { warehouse: true, batch: true }
  });
};

export const updateItem = async (itemId, data) => {
  return await prisma.item.update({
    where: { id: itemId },
    data,
  });
};

// -----------------------------------------------------------------------------
// FR-01.1 - RECEIVE RAW MATERIALS
// -----------------------------------------------------------------------------
export const recordReceipt = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {
    // Check if batch exists or create it
    let batch = await tx.inventoryBatch.findUnique({
      where: { internalBatchNumber: data.internalBatchNumber }
    });

    const item = await tx.item.findUnique({ where: { id: data.itemId } });
    if (!item) throw new Error('Item not found');

    if (!batch) {
      batch = await tx.inventoryBatch.create({
        data: {
          itemId: data.itemId,
          internalBatchNumber: data.internalBatchNumber,
          supplierBatchNumber: data.supplierBatchNumber,
          supplierId: item.supplierId
        }
      });
    } else if (batch.itemId !== data.itemId) {
      throw new Error('Batch exists but belongs to a different item');
    }

    // Get or create balance
    let balance = await tx.inventoryBalance.findFirst({
      where: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        batchId: batch.id
      }
    });

    const previousQty = balance ? Number(balance.quantity) : 0;
    const newQty = previousQty + data.quantity;

    if (!balance) {
      balance = await tx.inventoryBalance.create({
        data: {
          itemId: data.itemId,
          warehouseId: data.warehouseId,
          batchId: batch.id,
          quantity: newQty,
          reservedQuantity: 0
        }
      });
    } else {
      balance = await tx.inventoryBalance.update({
        where: { id: balance.id },
        data: { quantity: newQty }
      });
    }

    // Record movement
    const movement = await tx.stockMovement.create({
      data: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        batchId: batch.id,
        type: 'RECEIPT',
        quantity: data.quantity,
        previousBalance: previousQty,
        newBalance: newQty,
        referenceId: data.referenceId,
        reason: data.reason,
        createdBy: userId
      }
    });

    return { batch, balance, movement };
  });
};

// -----------------------------------------------------------------------------
// FR-01.3 - TRANSFERS & CONSUMPTION
// -----------------------------------------------------------------------------
export const processMovement = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {
    // Example implementation for ADUSTMENT_OUT / CONSUMPTION
    if (['ADJUSTMENT_OUT', 'CONSUMPTION'].includes(data.type)) {
      const balance = await tx.inventoryBalance.findFirst({
        where: { itemId: data.itemId, warehouseId: data.sourceWarehouseId, batchId: data.batchId || null }
      });

      if (!balance || Number(balance.quantity) - Number(balance.reservedQuantity) < data.quantity) {
        throw new Error('Insufficient unreserved stock');
      }

      const prev = Number(balance.quantity);
      const newQty = prev - data.quantity;

      await tx.inventoryBalance.update({
        where: { id: balance.id },
        data: { quantity: newQty }
      });

      return await tx.stockMovement.create({
        data: {
          itemId: data.itemId,
          warehouseId: data.sourceWarehouseId,
          batchId: data.batchId,
          type: data.type,
          quantity: data.quantity,
          previousBalance: prev,
          newBalance: newQty,
          referenceId: data.referenceId,
          reason: data.reason,
          createdBy: userId
        }
      });
    }
    throw new Error('Movement type not fully implemented in this demo');
  });
};

// -----------------------------------------------------------------------------
// FR-01.6 - RESERVATIONS
// -----------------------------------------------------------------------------
export const createReservation = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {
    // Attempt optimistic concurrency update to prevent race conditions
    // We only update if (quantity - reservedQuantity) >= data.quantity
    
    // 1. Find a valid balance row
    const balance = await tx.inventoryBalance.findFirst({
      where: { 
        itemId: data.itemId, 
        warehouseId: data.warehouseId 
      }
    });

    if (!balance) throw { status: 404, message: 'No stock found in this warehouse' };

    // 2. Perform atomic update where the condition is strictly enforced
    const updatedBalance = await tx.inventoryBalance.updateMany({
      where: {
        id: balance.id,
        quantity: { gte: Number(balance.reservedQuantity) + data.quantity }
      },
      data: {
        reservedQuantity: { increment: data.quantity }
      }
    });

    if (updatedBalance.count === 0) {
      throw { status: 409, message: 'Insufficient unreserved physical stock for reservation (Concurrency conflict)' };
    }

    // 3. Record reservation
    const reservation = await tx.materialReservation.create({
      data: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        productionJobId: data.productionJobId,
        quantity: data.quantity,
        createdBy: userId
      }
    });

    return reservation;
  });
};

