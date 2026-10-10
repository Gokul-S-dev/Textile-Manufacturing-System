import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  getMesOrders,
  getMesOrderProgress,
  startProductionOrder,
  startStage,
  pauseStage,
  resumeStage,
  completeStage,
  recordProductionRun,
  recordMaterialConsumption,
  recordProductionOutput,
  reportDelay,
  resolveDelay
} from './mes.controller.js';

const router = Router();

// MES Orders Dashboard
router.get('/orders', authenticate, authorize('production.read'), getMesOrders);
router.get('/orders/:orderId/progress', authenticate, authorize('production.read'), getMesOrderProgress);
router.post('/orders/:orderId/start', authenticate, authorize('production.execute'), startProductionOrder);

// Stage Execution
router.post('/stages/:stageId/start', authenticate, authorize('production.execute'), startStage);
router.post('/stages/:stageId/pause', authenticate, authorize('production.execute'), pauseStage);
router.post('/stages/:stageId/resume', authenticate, authorize('production.execute'), resumeStage);
router.post('/stages/:stageId/complete', authenticate, authorize('production.execute'), completeStage);

// Production Runs & Consumption
router.post('/stages/:stageId/runs', authenticate, authorize('production.execute'), recordProductionRun);
router.post('/runs/:runId/consumption', authenticate, authorize('production.execute'), recordMaterialConsumption);
router.post('/runs/:runId/output', authenticate, authorize('production.execute'), recordProductionOutput);

// Exceptions & Delays
router.post('/orders/:orderId/delays', authenticate, authorize('production.execute'), reportDelay);
router.patch('/delays/:delayId/resolve', authenticate, authorize('production.override'), resolveDelay);

export default router;
