import prisma from '../../config/db.js';
import createError from 'http-errors';

export const mesService = {
  async getMesOrders(query) {
    return prisma.manufacturingOrder.findMany({
      where: {
        status: { in: ['RELEASED', 'IN_PROGRESS', 'PAUSED'] }
      },
      include: {
        ScheduledStage: { orderBy: { plannedStart: 'asc' } },
        runs: true,
        ProductionBatch: true
      }
    });
  },

  async getOrderProgress(orderId) {
    return prisma.manufacturingOrder.findUnique({
      where: { id: orderId },
      include: {
        ScheduledStage: true,
        runs: { include: { rolls: true, consumptions: true } },
        ProductionDelay: true
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
    const { stageId, machineId } = data;
    
    const stage = await prisma.scheduledStage.findUnique({
      where: { id: stageId },
      include: { order: true }
    });
    
    if (!stage) throw createError(404, 'Scheduled stage not found');
    if (!machineId) throw createError(400, 'A machine is required to start a production run');

    return prisma.productionRun.create({
      data: {
        orderId: stage.orderId,
        machineId,
        stage: stage.stage,
        status: 'IN_PROGRESS',
        startTime: new Date()
      }
    });
  },

  async recordConsumption(runId, data) {
    const { batchId, quantity } = data;
    if (!batchId || Number(quantity) <= 0) {
      throw createError(400, 'A batch and positive consumption quantity are required');
    }
    
    // Transactional consumption: reduce inventory balance, record MaterialConsumption
    return prisma.$transaction(async (tx) => {
      const run = await tx.productionRun.findUnique({ where: { id: runId } });
      if (!run) throw createError(404, 'Run not found');

      const consumption = await tx.materialConsumption.create({
        data: {
          runId,
          batchId,
          quantity
        }
      });
      
      const batch = await tx.inventoryBatch.findUnique({ where: { id: batchId } });
      
      if (batch) {
         // Deduct from Balance
         const balance = await tx.inventoryBalance.findFirst({
           where: { batchId: batchId }
         });
         
         if (balance) {
           if (Number(balance.quantity) - Number(balance.reservedQuantity || 0) < quantity) {
             throw createError(400, 'Insufficient physical stock to consume');
           }
           const previousBalance = Number(balance.quantity);
           const newBalance = previousBalance - Number(quantity);
           await tx.inventoryBalance.update({
             where: { id: balance.id },
             data: {
               quantity: newBalance,
               reservedQuantity: Math.max(0, Number(balance.reservedQuantity || 0) - Number(quantity))
             }
           });
           
           await tx.stockMovement.create({
             data: {
               itemId: balance.itemId,
               type: 'CONSUMPTION',
               quantity,
               previousBalance,
               newBalance,
               referenceId: `RUN-${runId}`,
               warehouseId: balance.warehouseId,
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

    if (Number(acceptedQuantity || 0) < 0 || Number(rejectedQuantity || 0) < 0 || Number(wastageQuantity || 0) < 0) {
      throw createError(400, 'Production quantities cannot be negative');
    }

    return prisma.$transaction(async (tx) => {
      const run = await tx.productionRun.findUnique({ where: { id: runId } });
      if (!run) throw createError(404, 'Run not found');
      if (run.status === 'COMPLETED') throw createError(409, 'Production run is already completed');

      const completedRun = await tx.productionRun.update({
        where: { id: runId },
        data: { status: 'COMPLETED', endTime: new Date() }
      });

      if (Number(acceptedQuantity || 0) > 0) {
        await tx.fabricRoll.create({
          data: {
            rollNumber: `ROLL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            runId,
            length: acceptedQuantity,
            weight: data.weight || 0,
            status: 'PENDING_INSPECTION'
          }
        });
      }

      return completedRun;
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
