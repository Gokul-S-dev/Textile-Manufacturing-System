import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  getWarehouses,
  createWarehouse,
  getWarehouseLocations,
  createWarehouseLocation,
  getFinishedGoods,
  recordFinishedGoodsReceipt,
  getReservations,
  createReservation,
  releaseReservation,
  getTransfers,
  createTransfer,
  approveTransfer,
  dispatchTransfer,
  receiveTransfer,
  createStockCount,
  submitStockCount,
  approveStockCount,
  applyStockCount,
  holdStock,
  releaseStockHold,
  getStockHistory
} from './warehouse.controller.js';

const router = Router();

// Warehouses & Locations
router.get('/warehouses', authenticate, authorize('warehouse.read'), getWarehouses);
router.post('/warehouses', authenticate, authorize('warehouse.manage'), createWarehouse);
router.get('/warehouses/:id/locations', authenticate, authorize('warehouse.read'), getWarehouseLocations);
router.post('/warehouses/:id/locations', authenticate, authorize('warehouse.manage'), createWarehouseLocation);

// Finished Goods
router.get('/finished-goods', authenticate, authorize('warehouse.read'), getFinishedGoods);
router.post('/finished-goods/receipts', authenticate, authorize('warehouse.execute'), recordFinishedGoodsReceipt);
router.post('/finished-goods/reservations', authenticate, authorize('warehouse.execute'), createReservation);
router.get('/finished-goods/reservations', authenticate, authorize('warehouse.read'), getReservations);
router.post('/finished-goods/reservations/:id/release', authenticate, authorize('warehouse.execute'), releaseReservation);

// Transfers
router.get('/warehouse-transfers', authenticate, authorize('warehouse.read'), getTransfers);
router.post('/warehouse-transfers', authenticate, authorize('warehouse.execute'), createTransfer);
router.post('/warehouse-transfers/:id/approve', authenticate, authorize('warehouse.approve'), approveTransfer);
router.post('/warehouse-transfers/:id/dispatch', authenticate, authorize('warehouse.execute'), dispatchTransfer);
router.post('/warehouse-transfers/:id/receive', authenticate, authorize('warehouse.execute'), receiveTransfer);

// Cycle Counts & Adjustments
router.post('/stock-counts', authenticate, authorize('warehouse.execute'), createStockCount);
router.post('/stock-counts/:id/submit', authenticate, authorize('warehouse.execute'), submitStockCount);
router.post('/stock-counts/:id/approve', authenticate, authorize('warehouse.approve'), approveStockCount);
router.post('/stock-counts/:id/apply', authenticate, authorize('warehouse.approve'), applyStockCount);

// Status Management & Holds
router.post('/warehouse-stock/:id/hold', authenticate, authorize('warehouse.manage'), holdStock);
router.post('/warehouse-stock/:id/release-hold', authenticate, authorize('warehouse.manage'), releaseStockHold);
router.get('/warehouse-stock/:id/history', authenticate, authorize('warehouse.read'), getStockHistory);

export default router;
