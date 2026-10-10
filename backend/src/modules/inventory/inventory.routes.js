import { Router } from 'express';
import { getAllItems, getItemStock, editItem, receiveRawMaterial, createMovement, reserveMaterial } from './inventory.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { receiptSchema, movementSchema, reservationSchema } from './inventory.validation.js';

const router = Router();

// Need authentication and permissions
router.get('/items', authenticate, authorize('inventory.read'), getAllItems);
router.get('/items/:itemId/stock', authenticate, authorize('inventory.read'), getItemStock);
router.patch('/items/:itemId', authenticate, authorize('inventory.update'), editItem);

router.post('/receipts', authenticate, authorize('inventory.receive'), validate(receiptSchema), receiveRawMaterial);
router.post('/movements', authenticate, authorize('inventory.transfer'), validate(movementSchema), createMovement);
router.post('/reservations', authenticate, authorize('inventory.reserve'), validate(reservationSchema), reserveMaterial);

export default router;
