import { PrismaClient } from '@prisma/client';
import { logAudit } from '../audit/audit.service.js';

const prisma = new PrismaClient();

// ================= SUPPLIERS =================
export const createSupplier = async (data, userId) => {
  const { name, email, phone, address } = data;
  const supplier = await prisma.supplier.create({ 
    data: { name, email, phone, address } 
  });
  await logAudit({ userId, action: 'SUPPLIER_CREATED', entity: 'Supplier', entityId: supplier.id });
  return supplier;
};

export const listSuppliers = async () => prisma.supplier.findMany();

// ================= PURCHASE ORDERS =================
export const createPurchaseOrder = async (supplierId, items, userId) => {
  return await prisma.$transaction(async (tx) => {
    const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier || !supplier.isActive) throw { status: 400, message: 'Invalid or inactive supplier' };

    // Calculate total
    let total = 0;
    const poItems = items.map(item => {
      const lineTotal = item.quantity * item.unitPrice;
      total += lineTotal;
      return { itemId: item.itemId, quantity: item.quantity, unitPrice: item.unitPrice };
    });

    const po = await tx.purchaseOrder.create({
      data: {
        poNumber: `PO-${Date.now()}`,
        supplierId,
        status: 'ISSUED',
        totalAmount: total,
        items: { create: poItems }
      },
      include: { items: true }
    });

    await logAudit({ userId, action: 'PO_CREATED', entity: 'PurchaseOrder', entityId: po.id }, tx);
    return po;
  });
};

export const listPurchaseOrders = async () => prisma.purchaseOrder.findMany({ include: { supplier: true } });

// ================= GOODS RECEIPTS =================
export const confirmGoodsReceipt = async (poId, receivedItems, invoiceRef, userId) => {
  return await prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.findUnique({ where: { id: poId }, include: { items: true } });
    if (!po || !['ISSUED', 'PARTIAL'].includes(po.status)) throw { status: 400, message: 'PO not eligible for receipt' };

    // Find default warehouse for raw materials (mock logic for demo)
    const warehouse = await tx.warehouse.findFirst();
    if (!warehouse) throw { status: 500, message: 'System missing default warehouse' };

    const grn = await tx.goodsReceipt.create({
      data: {
        grnNumber: `GRN-${Date.now()}`,
        poId,
        invoiceRef
      }
    });

    let allFulfilled = true;

    for (const item of receivedItems) {
      const poItem = po.items.find(pi => pi.itemId === item.itemId);
      if (!poItem) throw { status: 400, message: `Item ${item.itemId} not on PO` };
      
      // Strict rule: No over-receipt
      if (item.acceptedQuantity > Number(poItem.quantity)) {
        throw { status: 400, message: 'Cannot receive more than ordered' };
      }

      // 1. Create Internal Batch
      const batch = await tx.inventoryBatch.create({
        data: {
          itemId: item.itemId,
          internalBatchNumber: `BATCH-${Date.now()}-${item.itemId.substring(0,4)}`,
          supplierBatchNumber: item.supplierBatch,
          supplierId: po.supplierId
        }
      });

      // 2. Increment Stock Atomic
      const existingBalance = await tx.inventoryBalance.findFirst({
        where: { itemId: item.itemId, warehouseId: warehouse.id, batchId: batch.id }
      });

      if (existingBalance) {
        await tx.inventoryBalance.update({
          where: { id: existingBalance.id },
          data: { quantity: { increment: item.acceptedQuantity } }
        });
      } else {
        await tx.inventoryBalance.create({
          data: { itemId: item.itemId, warehouseId: warehouse.id, batchId: batch.id, quantity: item.acceptedQuantity }
        });
      }

      // 3. Movement record
      await tx.stockMovement.create({
        data: {
          itemId: item.itemId, warehouseId: warehouse.id, batchId: batch.id,
          type: 'RECEIPT', quantity: item.acceptedQuantity, previousBalance: 0, newBalance: item.acceptedQuantity,
          referenceId: grn.grnNumber, reason: 'PO Goods Receipt', createdBy: userId
        }
      });
      
      if (item.acceptedQuantity < Number(poItem.quantity)) allFulfilled = false;
    }

    // 4. Update PO Status
    await tx.purchaseOrder.update({
      where: { id: poId },
      data: { status: allFulfilled ? 'COMPLETED' : 'PARTIAL' }
    });

    await logAudit({ userId, action: 'GOODS_RECEIPT_CONFIRMED', entity: 'GoodsReceipt', entityId: grn.id, details: { poId } }, tx);
    
    return grn;
  });
};
