import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  getExecutiveDashboard,
  getProductionDashboard,
  getQualityDashboard,
  getInventoryDashboard,
  getSalesDashboard,
  getFinanceDashboard,
  exportReport
} from './analytics.controller.js';

const router = Router();

router.use(authenticate);

router.get('/executive', authorize('analytics.read'), getExecutiveDashboard);
router.get('/production', authorize('analytics.read'), getProductionDashboard);
router.get('/quality', authorize('analytics.read'), getQualityDashboard);
router.get('/inventory', authorize('analytics.read'), getInventoryDashboard);
router.get('/sales', authorize('analytics.read'), getSalesDashboard);
router.get('/finance', authorize('analytics.read'), getFinanceDashboard);

router.get('/reports/:type/export', authorize('analytics.export'), exportReport);

export default router;
