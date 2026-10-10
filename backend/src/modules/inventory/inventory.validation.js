import { z } from 'zod';

export const receiptSchema = z.object({
  body: z.object({
    itemId: z.string().uuid(),
    warehouseId: z.string().uuid(),
    quantity: z.number().positive(),
    internalBatchNumber: z.string().min(1),
    supplierBatchNumber: z.string().optional(),
    referenceId: z.string().optional(),
    reason: z.string().optional()
  })
});

export const movementSchema = z.object({
  body: z.object({
    itemId: z.string().uuid(),
    sourceWarehouseId: z.string().uuid().optional(),
    destinationWarehouseId: z.string().uuid().optional(),
    batchId: z.string().uuid().optional(),
    type: z.enum(['TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'CONSUMPTION']),
    quantity: z.number().positive(),
    referenceId: z.string().optional(),
    reason: z.string().optional()
  }).superRefine((data, ctx) => {
    if (['TRANSFER_IN', 'TRANSFER_OUT'].includes(data.type)) {
      if (!data.sourceWarehouseId || !data.destinationWarehouseId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Transfers require both source and destination warehouses',
        });
      }
    }
  })
});

export const reservationSchema = z.object({
  body: z.object({
    itemId: z.string().uuid(),
    warehouseId: z.string().uuid(),
    productionJobId: z.string().min(1),
    quantity: z.number().positive()
  })
});
