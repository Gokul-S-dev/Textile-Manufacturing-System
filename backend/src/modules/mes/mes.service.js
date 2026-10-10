import prisma from '../../config/db.js';
import createError from 'http-errors';

export const mesService = {
  async getMesOrders(query) {
    return prisma.manufacturingOrder.findMany({
      where: {
        status: { in: ['RELEASED', 'IN_PROGRESS', 'PAUSED'] }
      },
      include: {
        scheduledStages: { orderBy: { plannedStart: 'asc' } },
        batches: true
      }
    });
  },

  async getOrderProgress(orderId) {
    return prisma.manufacturingOrder.findUnique({
      where: { id: orderId },
      include: {
        scheduledStages: {
          include: { runs: true }
        },
        delays: true
      }
    });
  },

  async startOrder(orderId) {
    const order = await prisma.manufacturingOrder.findUnique({
      where: { id: orderId }
    });
    
    if (!order) throw createError(404, 'Order not found');
    if (order.status !== 'RELEASED' && order.status !== 'PAUSED') {
      throw createError(400, 'Order must be RELEASED or PAUSED to start');
    }

    return prisma.manufacturingOrder.update({
      where: { id: orderId },
      data: { status: 'IN_PROGRESS' }
    });
  },

  async startStage(stageId) {
    const stage = await prisma.scheduledStage.findUnique({
      where: { id: stageId },
      include: { order: true }
    });

    if (!stage) throw createError(404, 'Stage not found');
    if (stage.order.status !== 'IN_PROGRESS') {
      throw createError(400, 'Cannot start stage. Order is not IN_PROGRESS');
    }

    return prisma.scheduledStage.update({
      where: { id: stageId },
      data: { status: 'IN_PROGRESS' }
    });
  },

  async pauseStage(stageId) {
    return prisma.scheduledStage.update({
      where: { id: stageId },
      data: { status: 'DELAYED' } // using existing or closest string
    });
  },

  async resumeStage(stageId) {
    return prisma.scheduledStage.update({
      where: { id: stageId },
      data: { status: 'IN_PROGRESS' }
    });
  },

  async completeStage(stageId) {
    // Should validate that all runs are completed and output matches expected
    return prisma.scheduledStage.update({
      where: { id: stageId },
      data: { status: 'COMPLETED' }
    });
  },

  async recordRun(data) {
    const { stageId, machineId, inputQuantity, operatorId } = data;
    
    const stage = await prisma.scheduledStage.findUnique({
      where: { id: stageId },
      include: { order: true }
    });
    
    if (!stage) throw createError(404, 'Scheduled stage not found');

    return prisma.productionRun.create({
      data: {
        scheduledStageId: stageId,
        orderId: stage.orderId,
        machineId,
        stage: stage.stage,
        inputQuantity,
        status: 'IN_PROGRESS',
        startTime: new Date()
      }
    });
  },

  async recordConsumption(runId, data) {
    const { batchId, quantity } = data;
    
    // Transactional consumption: reduce inventory balance, record MaterialConsumption
    return prisma.$transaction(async (tx) => {
      const run = await tx.productionRun.findUnique({ where: { id: runId } });
      if (!run) throw createError(404, 'Run not found');

      const consumption = await tx.materialConsumption.create({
        data: {
          runId,
          batchId,
          actualQuantity: quantity
        }
      });
      
      const batch = await tx.inventoryBatch.findUnique({ where: { id: batchId } });
      
      if (batch) {
         // Deduct from Balance
         const balance = await tx.inventoryBalance.findFirst({
           where: { batchId: batchId }
         });
         
         if (balance) {
           if (Number(balance.quantity) < quantity) {
             throw createError(400, 'Insufficient physical stock to consume');
           }
           await tx.inventoryBalance.update({
             where: { id: balance.id },
             data: { quantity: Number(balance.quantity) - quantity }
           });
           
           await tx.stockMovement.create({
             data: {
               itemId: balance.itemId,
               type: 'CONSUMPTION',
               quantity,
               reference: `RUN-${runId}`,
               fromWarehouseId: balance.warehouseId,
               batchId
             }
           });
         }
      }

      return consumption;
    });
  },

  async recordOutput(runId, data) {
    const { acceptedQuantity, rejectedQuantity, wastageQuantity, operatorRemarks } = data;
    
    return prisma.productionRun.update({
      where: { id: runId },
      data: {
        acceptedQuantity,
        rejectedQuantity,
        wastageQuantity,
        operatorRemarks,
        status: 'COMPLETED',
        endTime: new Date()
      }
    });
  },

  async reportDelay(data) {
    const { orderId, type, reason, reportedById } = data;
    
    const delay = await prisma.productionDelay.create({
      data: {
        orderId,
        type,
        reason,
        reportedById
      }
    });
    
    // Also pause the MO
    await prisma.manufacturingOrder.update({
      where: { id: orderId },
      data: { status: 'PAUSED' }
    });
    
    return delay;
  },

  async resolveDelay(delayId) {
    const delay = await prisma.productionDelay.update({
      where: { id: delayId },
      data: {
        status: 'RESOLVED',
        resolutionTime: new Date()
      }
    });
    
    // Check if any other delays exist, if not resume MO
    const openDelays = await prisma.productionDelay.count({
      where: { orderId: delay.orderId, status: 'OPEN' }
    });
    
    if (openDelays === 0) {
      await prisma.manufacturingOrder.update({
        where: { id: delay.orderId },
        data: { status: 'IN_PROGRESS' }
      });
    }
    
    return delay;
  }
};
