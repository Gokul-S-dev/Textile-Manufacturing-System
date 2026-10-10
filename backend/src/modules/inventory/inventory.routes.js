import { Router } from 'express';
import { getAllItems, getItemStock, editItem } from './inventory.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();

// Need authentication and permissions
router.get('/items', authenticate, authorize('inventory.read'), getAllItems);
router.get('/items/:itemId/stock', authenticate, authorize('inventory.read'), getItemStock);
router.patch('/items/:itemId', authenticate, authorize('inventory.update'), editItem);

export default router;
