import { Router } from 'express';
import * as workforceService from './workforce.service.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();
router.use(authenticate);

router.get('/employees', authorize('workforce.read'), async (req, res, next) => {
  try {
    const employees = await workforceService.listEmployees();
    res.status(200).json(employees);
  } catch (error) { next(error); }
});

router.post('/shifts', authorize('workforce.manage'), async (req, res, next) => {
  try {
    const shift = await workforceService.createShift(req.body);
    res.status(201).json(shift);
  } catch (error) { next(error); }
});

router.post('/attendance', authorize('attendance.manage'), async (req, res, next) => {
  try {
    const { employeeId, shiftId, date } = req.body;
    const att = await workforceService.checkInAttendance(employeeId, shiftId, date, req.user.id);
    res.status(200).json(att);
  } catch (error) { next(error); }
});

router.post('/worker-assignments', authorize('workforce.assign'), async (req, res, next) => {
  try {
    const assignment = await workforceService.assignWorker(req.body, req.user.id);
    res.status(201).json(assignment);
  } catch (error) { next(error); }
});

export default router;
