import { Router } from 'express';
import { login, refresh, logout, logoutAll, me, changePassword } from './auth.controller.js';
import { loginSchema, refreshSchema, changePasswordSchema } from './auth.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting disabled as requested
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', logout);

// Protected routes
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, me);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
