import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  getStandards,
  createStandard,
  getInspectionPlans,
  createInspectionPlan,
  getInspections,
  createInspection,
  startInspection,
  recordResults,
  completeInspection,
  submitDisposition,
  getDefects,
  createDefect,
  createRework,
  updateRework,
  getCAPA,
  createCAPA,
  getSummary
} from './quality.controller.js';

const router = Router();

// Configuration & Standards
router.get('/standards', authenticate, authorize('quality.read'), getStandards);
router.post('/standards', authenticate, authorize('quality.manage'), createStandard);

router.get('/inspection-plans', authenticate, authorize('quality.read'), getInspectionPlans);
router.post('/inspection-plans', authenticate, authorize('quality.manage'), createInspectionPlan);

router.get('/defects', authenticate, authorize('quality.read'), getDefects);
router.post('/defects', authenticate, authorize('quality.manage'), createDefect);

// Inspection Execution
router.get('/inspections', authenticate, authorize('quality.read'), getInspections);
router.post('/inspections', authenticate, authorize('quality.execute'), createInspection);
router.post('/inspections/:id/start', authenticate, authorize('quality.execute'), startInspection);
router.post('/inspections/:id/results', authenticate, authorize('quality.execute'), recordResults);
router.post('/inspections/:id/complete', authenticate, authorize('quality.execute'), completeInspection);
router.post('/inspections/:id/disposition', authenticate, authorize('quality.approve'), submitDisposition);

// Remediation
router.post('/rework', authenticate, authorize('quality.manage'), createRework);
router.patch('/rework/:id', authenticate, authorize('quality.manage'), updateRework);

router.get('/capa', authenticate, authorize('quality.read'), getCAPA);
router.post('/capa', authenticate, authorize('quality.manage'), createCAPA);

// Reports
router.get('/reports/summary', authenticate, authorize('quality.read'), getSummary);

export default router;
