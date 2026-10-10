import { Router } from 'express';
import { createSupplier, listSuppliers, createPurchaseOrder, listPurchaseOrders, confirmReceipt } from './purchasing.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();

router.use(authenticate);

// Suppliers
router.post('/suppliers', authorize('suppliers.manage'), createSupplier);
router.get('/suppliers', authorize('suppliers.read'), listSuppliers);

// Purchase Orders
router.post('/purchase-orders', authorize('purchasing.create'), createPurchaseOrder);
router.get('/purchase-orders', authorize('purchasing.read'), listPurchaseOrders);

// Goods Receipts
router.post('/purchase-orders/:id/confirm', authorize('inventory.receive'), confirmReceipt);

export default router;
