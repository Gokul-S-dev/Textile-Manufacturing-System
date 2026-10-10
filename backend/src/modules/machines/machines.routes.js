import { Router } from 'express';
import * as machinesService from './machines.service.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();
router.use(authenticate);

router.post('/', authorize('machines.manage'), async (req, res, next) => {
  try {
    const machine = await machinesService.createMachine(req.body, req.user.id);
    res.status(201).json(machine);
  } catch (error) { next(error); }
});

router.get('/', authorize('machines.read'), async (req, res, next) => {
  try {
    const machines = await machinesService.listMachines();
    res.status(200).json(machines);
  } catch (error) { next(error); }
});

router.patch('/:id/status', authorize('machines.status.manage'), async (req, res, next) => {
  try {
    const updated = await machinesService.updateMachineStatus(req.params.id, req.body.status, req.user.id);
    res.status(200).json(updated);
  } catch (error) { next(error); }
});

router.post('/maintenance/:id/complete', authorize('maintenance.clear'), async (req, res, next) => {
  try {
    const cleared = await machinesService.completeMaintenance(req.params.id, req.body.notes, req.user.id);
    res.status(200).json(cleared);
  } catch (error) { next(error); }
});

export default router;
