import { Router } from 'express';
import { login, refresh, logout, logoutAll, me, changePassword } from './auth.controller.js';
import { loginSchema, refreshSchema, changePasswordSchema } from './auth.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many authentication attempts, please try again later' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', authLimiter, validate(refreshSchema), refresh);
router.post('/logout', logout); // Optional: add authenticate if needed

// Protected routes
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, me);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
