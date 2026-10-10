import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  addCustomerAddress,
  getSalesOrders,
  createSalesOrder,
  getSalesOrderById,
  updateSalesOrder,
  submitOrder,
  confirmOrder,
  holdOrder,
  resumeOrder,
  cancelOrder,
  allocateStock,
  createPickList,
  startPickList,
  completePickList,
  createPackingRecord,
  createShipment,
  dispatchShipment,
  deliverShipment,
  reportShipmentException
} from './sales.controller.js';

const router = Router();

// Customer Endpoints
router.get('/customers', authenticate, authorize('sales.read'), getCustomers);
router.post('/customers', authenticate, authorize('sales.manage'), createCustomer);
router.get('/customers/:id', authenticate, authorize('sales.read'), getCustomerById);
router.patch('/customers/:id', authenticate, authorize('sales.manage'), updateCustomer);
router.post('/customers/:id/addresses', authenticate, authorize('sales.manage'), addCustomerAddress);

// Sales Order Endpoints
router.get('/sales-orders', authenticate, authorize('sales.read'), getSalesOrders);
router.post('/sales-orders', authenticate, authorize('sales.manage'), createSalesOrder);
router.get('/sales-orders/:id', authenticate, authorize('sales.read'), getSalesOrderById);
router.patch('/sales-orders/:id', authenticate, authorize('sales.manage'), updateSalesOrder);

// Order Lifecycle
router.post('/sales-orders/:id/submit', authenticate, authorize('sales.manage'), submitOrder);
router.post('/sales-orders/:id/confirm', authenticate, authorize('sales.approve'), confirmOrder);
router.post('/sales-orders/:id/hold', authenticate, authorize('sales.approve'), holdOrder);
router.post('/sales-orders/:id/resume', authenticate, authorize('sales.approve'), resumeOrder);
router.post('/sales-orders/:id/cancel', authenticate, authorize('sales.approve'), cancelOrder);
router.post('/sales-orders/:id/allocate', authenticate, authorize('sales.execute'), allocateStock);

// Fulfillment (Picking & Packing)
router.post('/pick-lists', authenticate, authorize('warehouse.execute'), createPickList);
router.post('/pick-lists/:id/start', authenticate, authorize('warehouse.execute'), startPickList);
router.post('/pick-lists/:id/complete', authenticate, authorize('warehouse.execute'), completePickList);
router.post('/packing-records', authenticate, authorize('warehouse.execute'), createPackingRecord);

// Shipments
router.post('/shipments', authenticate, authorize('sales.execute'), createShipment);
router.post('/shipments/:id/dispatch', authenticate, authorize('sales.execute'), dispatchShipment);
router.post('/shipments/:id/deliver', authenticate, authorize('sales.execute'), deliverShipment);
router.post('/shipments/:id/report-exception', authenticate, authorize('sales.execute'), reportShipmentException);

export default router;
