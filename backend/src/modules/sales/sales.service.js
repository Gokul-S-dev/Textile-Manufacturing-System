import prisma from '../../config/db.js';
import createError from 'http-errors';

export const salesService = {
  // Customers
  async getCustomers() {
    return prisma.customer.findMany({ include: { addresses: true } });
  },

  async createCustomer(data) {
    const { addresses, ...customerData } = data;
    return prisma.customer.create({
      data: {
        ...customerData,
        addresses: addresses ? { create: addresses } : undefined
      },
      include: { addresses: true }
    });
  },

  async getCustomerById(id) {
    return prisma.customer.findUnique({ where: { id }, include: { addresses: true, orders: true } });
  },

  async updateCustomer(id, data) {
    return prisma.customer.update({ where: { id }, data });
  },

  async addCustomerAddress(customerId, data) {
    return prisma.customerAddress.create({ data: { ...data, customerId } });
  },

  // Sales Orders
  async getSalesOrders() {
    return prisma.customerOrder.findMany({
      include: { customer: true, lines: true },
      orderBy: { orderDate: 'desc' }
    });
  },

  async createSalesOrder(data) {
    const { lines, ...orderData } = data;

    let subtotal = 0;
    const createLines = lines.map(l => {
      subtotal += l.quantity * l.unitPrice;
      return {
        itemId: l.itemId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        specifications: l.specifications
      };
    });

    const totalAmount = subtotal - (orderData.discounts || 0) + (orderData.taxes || 0) + (orderData.shippingCharges || 0);

    return prisma.customerOrder.create({
      data: {
        ...orderData,
        orderNumber: `SO-${Math.floor(10000 + Math.random() * 90000)}`,
        subtotal,
        totalAmount,
        lines: { create: createLines }
      },
      include: { lines: true }
    });
  },

  async getSalesOrderById(id) {
    return prisma.customerOrder.findUnique({
      where: { id },
      include: { customer: true, lines: { include: { item: true } }, shipments: true, pickLists: true }
    });
  },

  async updateSalesOrder(id, data) {
    return prisma.customerOrder.update({ where: { id }, data });
  },

  async changeOrderStatus(id, status) {
    return prisma.customerOrder.update({ where: { id }, data: { status } });
  },

  async confirmOrder(id, userId) {
    return prisma.customerOrder.update({
      where: { id },
      data: { status: 'CONFIRMED', approvalById: userId }
    });
  },

  async cancelOrder(id, userId) {
    // Requires inventory release logic
    return prisma.customerOrder.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
  },

  async allocateStock(orderId) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.customerOrder.findUnique({ where: { id: orderId }, include: { lines: true } });
      if (!order) throw createError(404, 'Order not found');

      let allAllocated = true;

      for (const line of order.lines) {
        const remainingToAllocate = Number(line.quantity) - Number(line.reservedQty) - Number(line.fulfilledQty);
        
        if (remainingToAllocate <= 0) continue;

        const balances = await tx.inventoryBalance.findMany({
          where: { itemId: line.itemId, status: 'AVAILABLE' },
          orderBy: { updatedAt: 'asc' } // FIFO
        });

        let lineAllocated = 0;
        for (const b of balances) {
          if (lineAllocated >= remainingToAllocate) break;

          const available = Number(b.quantity) - Number(b.reservedQuantity);
          if (available > 0) {
            const take = Math.min(available, remainingToAllocate - lineAllocated);
            
            // Update Balance ReservedQty
            await tx.inventoryBalance.update({
              where: { id: b.id },
              data: { reservedQuantity: Number(b.reservedQuantity) + take }
            });

            // Create Reservation Record
            await tx.finishedGoodsReservation.create({
              data: {
                orderId: order.id,
                itemId: line.itemId,
                batchId: b.batchId,
                quantity: take
              }
            });

            lineAllocated += take;
          }
        }

        await tx.customerOrderLine.update({
          where: { id: line.id },
          data: { reservedQty: Number(line.reservedQty) + lineAllocated }
        });

        if (lineAllocated < remainingToAllocate) allAllocated = false;
      }

      await tx.customerOrder.update({
        where: { id: orderId },
        data: { status: allAllocated ? 'PROCESSING' : 'PARTIAL' }
      });

      return { success: true, allAllocated };
    });
  },

  // Fulfillment
  async createPickList(data) {
    return prisma.pickList.create({
      data: {
        pickListNumber: `PL-${Date.now()}`,
        orderId: data.orderId,
        items: { create: data.items }
      }
    });
  },

  async startPickList(id, userId) {
    return prisma.pickList.update({
      where: { id },
      data: { status: 'IN_PROGRESS', assignedToId: userId }
    });
  },

  async completePickList(id, data) {
    return prisma.$transaction(async (tx) => {
      // Expect data.items array with pickedQty
      if (data.items) {
        for (const item of data.items) {
          await tx.pickListItem.update({
            where: { id: item.id },
            data: { pickedQty: item.pickedQty }
          });
        }
      }
      return tx.pickList.update({ where: { id }, data: { status: 'COMPLETED' } });
    });
  },

  async createPackingRecord(userId, data) {
    return prisma.packingRecord.create({
      data: {
        packingRef: `PK-${Date.now()}`,
        orderId: data.orderId,
        packageCount: data.packageCount,
        packedById: userId,
        notes: data.notes
      }
    });
  },

  // Shipments & Dispatch
  async createShipment(data) {
    return prisma.shipment.create({
      data: {
        shipmentNumber: `SH-${Date.now()}`,
        orderId: data.orderId,
        carrier: data.carrier,
        trackingNumber: data.trackingNumber
      }
    });
  },

  async dispatchShipment(id, userId) {
    return prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.findUnique({
        where: { id },
        include: { order: { include: { lines: true } } }
      });
      if (!shipment) throw createError(404, 'Shipment not found');
      if (['DISPATCHED', 'IN_TRANSIT', 'DELIVERED'].includes(shipment.status)) {
        throw createError(409, 'Shipment has already been dispatched');
      }
      if (['CANCELLED', 'ON_HOLD'].includes(shipment.order.status)) {
        throw createError(400, `Cannot dispatch an order in ${shipment.order.status} status`);
      }

      const reservations = await tx.finishedGoodsReservation.findMany({
        where: { orderId: shipment.orderId, status: 'RESERVED' }
      });
      const batchIds = reservations.map((reservation) => reservation.batchId).filter(Boolean);
      if (batchIds.length > 0) {
        const blockedInspection = await tx.inspectionRecord.findFirst({
          where: {
            batchId: { in: batchIds },
            status: { in: ['FAILED', 'ON_HOLD'] }
          }
        });
        if (blockedInspection) {
          throw createError(409, 'Dispatch blocked by a failed or held quality inspection');
        }
      }

      for (const reservation of reservations) {
        const balance = await tx.inventoryBalance.findFirst({
          where: {
            itemId: reservation.itemId,
            batchId: reservation.batchId,
            status: 'AVAILABLE'
          }
        });
        if (!balance || Number(balance.quantity) < Number(reservation.quantity)) {
          throw createError(409, 'Insufficient finished-goods stock for dispatch');
        }

        const previousBalance = Number(balance.quantity);
        const newBalance = previousBalance - Number(reservation.quantity);
        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: {
            quantity: newBalance,
            reservedQuantity: Math.max(0, Number(balance.reservedQuantity) - Number(reservation.quantity))
          }
        });
        await tx.stockMovement.create({
          data: {
            itemId: reservation.itemId,
            warehouseId: balance.warehouseId,
            batchId: reservation.batchId,
            type: 'TRANSFER_OUT',
            quantity: reservation.quantity,
            previousBalance,
            newBalance,
            referenceId: id,
            reason: 'Finished goods dispatch',
            createdBy: userId
          }
        });
        await tx.finishedGoodsReservation.update({
          where: { id: reservation.id },
          data: { status: 'CONSUMED' }
        });
      }

      for (const line of shipment.order.lines) {
        const fulfilled = reservations
          .filter((reservation) => reservation.itemId === line.itemId)
          .reduce((sum, reservation) => sum + Number(reservation.quantity), 0);
        if (fulfilled > 0) {
          await tx.customerOrderLine.update({
            where: { id: line.id },
            data: { fulfilledQty: Number(line.fulfilledQty) + fulfilled }
          });
        }
      }

      const refreshedLines = await tx.customerOrderLine.findMany({ where: { orderId: shipment.orderId } });
      const orderFulfilled = refreshedLines.every((line) => Number(line.fulfilledQty) >= Number(line.quantity));
      await tx.customerOrder.update({
        where: { id: shipment.orderId },
        data: { status: orderFulfilled ? 'FULFILLED' : 'PARTIAL' }
      });

      const dispatchedShipment = await tx.shipment.update({
        where: { id },
        data: { status: 'DISPATCHED', dispatchDate: new Date(), operatorId: userId }
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: id,
          eventType: 'DISPATCHED',
          location: 'Warehouse Dock'
        }
      });
      return dispatchedShipment;
    });
  },

  async deliverShipment(id) {
    return prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.update({
        where: { id },
        data: { status: 'DELIVERED', actualDelDate: new Date() }
      });

      // Update Order Status check if all fulfilled
      await tx.customerOrder.update({
        where: { id: shipment.orderId },
        data: { status: 'FULFILLED' } // simplified
      });

      await tx.shipmentEvent.create({
        data: { shipmentId: id, eventType: 'DELIVERED' }
      });
      return shipment;
    });
  },

  async reportShipmentException(id, data) {
    return prisma.$transaction(async (tx) => {
      await tx.shipment.update({
        where: { id },
        data: { status: 'EXCEPTION' }
      });
      return tx.shipmentEvent.create({
        data: {
          shipmentId: id,
          eventType: 'EXCEPTION',
          notes: data.notes
        }
      });
    });
  }
};
