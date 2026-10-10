import { Router } from 'express';
import { create, list, updateRoles, updateStatus, resetPassword } from './users.controller.js';
import { createUserSchema, updateRolesSchema, updateStatusSchema, resetPasswordSchema } from './users.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();

// All routes here require users.manage permission
router.use(authenticate, authorize('users.manage'));

router.post('/', validate(createUserSchema), create);
router.get('/', list);
router.patch('/:id/roles', validate(updateRolesSchema), updateRoles);
router.patch('/:id/status', validate(updateStatusSchema), updateStatus);
router.post('/:id/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
