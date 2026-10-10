import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  createManufacturingOrder,
  getManufacturingOrders,
  getManufacturingOrderById,
  updateManufacturingOrder,
  submitManufacturingOrder,
  approveManufacturingOrder,
  cancelManufacturingOrder,
  checkMaterialReadiness,
  reserveMaterialsForOrder,
  releaseOrderForProduction,
  generateSchedulePreview,
  commitSchedule,
  getScheduleConflicts
} from './production.controller.js';

const router = Router();

// Manufacturing Order Lifecycle
router.post('/orders', authenticate, authorize('production.create'), createManufacturingOrder);
router.get('/orders', authenticate, authorize('production.read'), getManufacturingOrders);
router.get('/orders/:id', authenticate, authorize('production.read'), getManufacturingOrderById);
router.patch('/orders/:id', authenticate, authorize('production.plan'), updateManufacturingOrder);
router.post('/orders/:id/submit', authenticate, authorize('production.plan'), submitManufacturingOrder);
router.post('/orders/:id/approve', authenticate, authorize('production.override'), approveManufacturingOrder);
router.post('/orders/:id/cancel', authenticate, authorize('production.plan'), cancelManufacturingOrder);

// Material Readiness & Validation
router.post('/orders/:id/check-materials', authenticate, authorize('production.plan'), checkMaterialReadiness);
router.post('/orders/:id/reserve-materials', authenticate, authorize('production.schedule'), reserveMaterialsForOrder);
router.post('/orders/:id/release', authenticate, authorize('production.release'), releaseOrderForProduction);

// Core Scheduling Engine
router.post('/schedules', authenticate, authorize('production.schedule'), generateSchedulePreview);
router.post('/schedules/:id/commit', authenticate, authorize('production.commit_schedule'), commitSchedule);
router.get('/conflicts', authenticate, authorize('production.read'), getScheduleConflicts);

export default router;
