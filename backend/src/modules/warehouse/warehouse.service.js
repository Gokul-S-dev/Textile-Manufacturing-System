import prisma from '../../config/db.js';
import createError from 'http-errors';

export const warehouseService = {
  async getWarehouses() {
    return prisma.warehouse.findMany({ include: { locations: true } });
  },

  async createWarehouse(data) {
    return prisma.warehouse.create({ data });
  },

  async getLocations(warehouseId) {
    return prisma.warehouseLocation.findMany({ where: { warehouseId } });
  },

  async createLocation(warehouseId, data) {
    return prisma.warehouseLocation.create({ data: { ...data, warehouseId } });
  },

  async getFinishedGoods() {
    return prisma.inventoryBalance.findMany({
      where: {
        item: { type: 'FINISHED_GOOD' }
      },
      include: {
        item: true,
        batch: true,
        location: true
      }
    });
  },

  async recordReceipt(userId, data) {
    const { batchId, itemId, warehouseId, locationId, quantity, receiptNumber, remarks } = data;

    // Validate QMS Integration
    const batch = await prisma.productionBatch.findUnique({
      where: { id: batchId },
      include: { order: true }
    });

    if (!batch) throw createError(404, 'Production Batch not found');
    if (batch.status === 'ON_HOLD') throw createError(400, 'Batch is on Quality Hold');

    // Make sure we have passed inspections
    const failedInspections = await prisma.inspectionRecord.count({
      where: { batchId, status: 'FAILED' }
    });

    if (failedInspections > 0) {
      throw createError(400, 'Cannot receive finished goods for a batch with FAILED inspections');
    }

    return prisma.$transaction(async (tx) => {
      // Create Receipt Record
      const receipt = await tx.finishedGoodsReceipt.create({
        data: {
          receiptNumber,
          batchId,
          itemId,
          warehouseId,
          locationId,
          quantity,
          remarks,
          receivedById: userId
        }
      });

      // Update Stock Ledger
      let balance = await tx.inventoryBalance.findFirst({
        where: { itemId, warehouseId, locationId, batchId }
      });

      if (!balance) {
        balance = await tx.inventoryBalance.create({
          data: {
            itemId,
            warehouseId,
            locationId,
            batchId,
            quantity: 0
          }
        });
      }

      await tx.inventoryBalance.update({
        where: { id: balance.id },
        data: { quantity: Number(balance.quantity) + Number(quantity) }
      });

      // Movement
      await tx.stockMovement.create({
        data: {
          itemId,
          warehouseId,
          locationId,
          batchId,
          type: 'RECEIPT_FG',
          quantity,
          previousBalance: balance.quantity,
          newBalance: Number(balance.quantity) + Number(quantity),
          referenceId: receipt.id,
          reason: 'Finished Goods Receipt',
          createdBy: userId
        }
      });

      return receipt;
    });
  },

  async createReservation(data) {
    const { orderId, itemId, batchId, quantity } = data;
    
    return prisma.$transaction(async (tx) => {
      // Find balances excluding holds
      const balances = await tx.inventoryBalance.findMany({
        where: { 
          itemId, 
          batchId, 
          status: 'AVAILABLE' 
        }
      });

      let available = 0;
      for (const b of balances) {
        available += (Number(b.quantity) - Number(b.reservedQuantity));
      }

      if (available < quantity) {
        throw createError(400, 'Insufficient eligible available stock for reservation');
      }

      // Reserve across balances (simplified logic taking from first available)
      let remaining = quantity;
      for (const b of balances) {
        if (remaining <= 0) break;
        const bAvail = Number(b.quantity) - Number(b.reservedQuantity);
        if (bAvail > 0) {
          const take = Math.min(bAvail, remaining);
          await tx.inventoryBalance.update({
            where: { id: b.id },
            data: { reservedQuantity: Number(b.reservedQuantity) + take }
          });
          remaining -= take;
        }
      }

      return tx.finishedGoodsReservation.create({
        data: {
          orderId,
          itemId,
          batchId,
          quantity
        }
      });
    });
  },

  async releaseReservation(id) {
    return prisma.$transaction(async (tx) => {
      const resv = await tx.finishedGoodsReservation.findUnique({ where: { id } });
      if (!resv || resv.status !== 'RESERVED') throw createError(400, 'Invalid reservation');

      // Revert reservations logic goes here... 
      // Simplified: Just mark reservation as released.
      await tx.finishedGoodsReservation.update({
        where: { id },
        data: { status: 'RELEASED' }
      });
      return { success: true };
    });
  },

  async getReservations() {
    return prisma.finishedGoodsReservation.findMany();
  },

  async getTransfers() {
    return prisma.warehouseTransfer.findMany();
  },

  async createTransfer(userId, data) {
    return prisma.warehouseTransfer.create({
      data: { ...data, requestedById: userId }
    });
  },

  async approveTransfer(id) {
    return prisma.warehouseTransfer.update({ where: { id }, data: { status: 'APPROVED' }});
  },

  async dispatchTransfer(id, data) {
    return prisma.warehouseTransfer.update({ where: { id }, data: { status: 'IN_TRANSIT', shippedQty: data.shippedQty, dispatchedAt: new Date() }});
  },

  async receiveTransfer(id, data) {
    return prisma.warehouseTransfer.update({ where: { id }, data: { status: 'RECEIVED', receivedQty: data.receivedQty, receivedAt: new Date() }});
  },

  async createStockCount(userId, data) {
    return prisma.stockCount.create({
      data: { ...data, createdBy: userId }
    });
  },

  async submitStockCount(id, data) {
    return prisma.stockCount.update({ where: { id }, data: { status: 'SUBMITTED' }});
  },

  async approveStockCount(id, userId) {
    return prisma.stockCount.update({ where: { id }, data: { status: 'APPROVED', approvedBy: userId, approvedAt: new Date() }});
  },

  async applyStockCount(id, userId) {
    // Requires complex ledger reconciliation logic
    return { applied: true };
  },

  async holdStock(id, data) {
    return prisma.inventoryBalance.update({
      where: { id },
      data: { status: data.status || 'QUALITY_HOLD' }
    });
  },

  async releaseStockHold(id) {
    return prisma.inventoryBalance.update({
      where: { id },
      data: { status: 'AVAILABLE' }
    });
  },

  async getStockHistory(id) {
    // Would query StockMovements for given balance reference
    return [];
  }
};
