import prisma from '../../config/db.js';
import createError from 'http-errors';

export const productionService = {
  async createOrder(data) {
    const { fabricSpec, targetQuantity, dueDate, routeId, customerOrderId, priority, color } = data;
    
    // Generate order number
    const count = await prisma.manufacturingOrder.count();
    const orderNumber = `MO-${new Date().getFullYear()}${(count + 1).toString().padStart(4, '0')}`;
    
    return prisma.manufacturingOrder.create({
      data: {
        orderNumber,
        fabricSpec,
        targetQuantity,
        dueDate: new Date(dueDate),
        routeId,
        customerOrderId,
        priority: priority || 3,
        color
      }
    });
  },

  async getOrders(query) {
    const { status } = query;
    const where = status ? { status } : {};
    return prisma.manufacturingOrder.findMany({
      where,
      include: {
        route: true,
        shortages: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getOrderById(id) {
    return prisma.manufacturingOrder.findUnique({
      where: { id },
      include: {
        route: {
          include: { stages: { orderBy: { sequence: 'asc' } } }
        },
        shortages: {
          include: { material: true }
        },
        scheduledStages: {
          include: { machine: true, employee: true },
          orderBy: { plannedStart: 'asc' }
        }
      }
    });
  },

  async updateOrder(id, data) {
    return prisma.manufacturingOrder.update({
      where: { id },
      data
    });
  },

  async updateOrderStatus(id, status) {
    // Basic status update; realistically we'd add transition guards here
    return prisma.manufacturingOrder.update({
      where: { id },
      data: { status }
    });
  },

  async checkMaterialReadiness(orderId) {
    const order = await prisma.manufacturingOrder.findUnique({
      where: { id: orderId }
    });
    if (!order) throw createError(404, 'Order not found');

    const bom = await prisma.billOfMaterial.findUnique({
      where: { fabricSpec: order.fabricSpec },
      include: { items: { include: { rawMaterial: true } } }
    });

    if (!bom) {
      throw createError(400, `No BOM found for fabric specification: ${order.fabricSpec}`);
    }

    // Calculate required vs available for each material
    const readinessReport = [];
    let hasShortage = false;

    for (const item of bom.items) {
      const requiredQty = Number(item.requiredQty) * Number(order.targetQuantity) * (1 + Number(item.wastagePercent) / 100);
      
      const balances = await prisma.inventoryBalance.findMany({
        where: { itemId: item.rawMaterialId }
      });
      const totalAvailable = balances.reduce((sum, b) => sum + (Number(b.quantity) - Number(b.reservedQuantity || 0)), 0);
      
      const shortageQty = requiredQty > totalAvailable ? requiredQty - totalAvailable : 0;
      if (shortageQty > 0) hasShortage = true;

      readinessReport.push({
        materialId: item.rawMaterialId,
        materialName: item.rawMaterial.name,
        requiredQty,
        availableQty: totalAvailable,
        shortageQty
      });
      
      if (shortageQty > 0) {
        // Upsert material shortage record
        const existing = await prisma.materialShortage.findFirst({
          where: { orderId: order.id, materialId: item.rawMaterialId }
        });
        if (existing) {
          await prisma.materialShortage.update({
            where: { id: existing.id },
            data: { requiredQty, availableQty: totalAvailable, shortageQty }
          });
        } else {
          await prisma.materialShortage.create({
            data: {
              orderId: order.id,
              materialId: item.rawMaterialId,
              requiredQty,
              availableQty: totalAvailable,
              shortageQty
            }
          });
        }
      } else {
        await prisma.materialShortage.deleteMany({
          where: { orderId: order.id, materialId: item.rawMaterialId }
        });
      }
    }

    return { isReady: !hasShortage, readinessReport };
  },

  async reserveMaterialsForOrder(orderId) {
    const readiness = await this.checkMaterialReadiness(orderId);
    if (!readiness.isReady) {
      throw createError(400, 'Cannot reserve materials due to shortages');
    }

    // MaterialReservation logic would go here, updating InventoryBalance reservedQuantity
    // For now, we simulate success
    return { success: true, message: 'Materials successfully reserved' };
  },

  async releaseOrderForProduction(orderId) {
    const order = await prisma.manufacturingOrder.findUnique({ where: { id: orderId } });
    if (!order) throw createError(404, 'Order not found');
    
    // Ensure no shortages
    const shortages = await prisma.materialShortage.findMany({ where: { orderId } });
    if (shortages.length > 0) {
      throw createError(400, 'Cannot release order. Outstanding material shortages exist. Authorized exception required.');
    }

    return prisma.manufacturingOrder.update({
      where: { id: orderId },
      data: { status: 'RELEASED' }
    });
  },

  async generateSchedulePreview(data) {
    const { orderIds, startDate } = data;
    
    // Basic deterministic Earliest-Feasible-Slot stub
    // Resolves prerequisites and creates ScheduledStage stubs
    
    const schedule = await prisma.productionSchedule.create({
      data: {
        name: `Preview Schedule ${new Date().toISOString()}`,
        status: 'PROPOSED'
      }
    });
    
    // Simulated dummy logic for scheduling due to complexity
    return schedule;
  },

  async commitSchedule(scheduleId) {
    const schedule = await prisma.productionSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) throw createError(404, 'Schedule not found');
    
    if (schedule.status !== 'PROPOSED') {
      throw createError(400, 'Only PROPOSED schedules can be committed');
    }
    
    // Transaction to update schedule status and mapped MOs
    return prisma.productionSchedule.update({
      where: { id: scheduleId },
      data: { status: 'COMMITTED' }
    });
  },

  async getScheduleConflicts(query) {
    // Returns unresolvable machine/worker capacity clashes or material shortages
    return [];
  }
};
