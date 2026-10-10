import { Router } from 'express';
import { signup, login, logout, me } from './auth.controller.js';
import { signupSchema, loginSchema } from './auth.validation.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/authenticate.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

import { authorize } from '../../middleware/authorize.js';

// Auth endpoints
// Only SUPER_ADMIN (or users with users.manage permission) can register new users
router.post('/signup', authenticate, authorize('users.manage'), validate(signupSchema), signup);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
