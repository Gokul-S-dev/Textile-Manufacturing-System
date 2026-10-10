import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
  getRules,
  createRule,
  toggleRule
} from './notifications.controller.js';

const router = Router();

router.use(authenticate);

// Personal notifications
router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

// Preferences
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferences);

// Admin Rules
router.get('/rules', authorize('notifications.manage'), getRules);
router.post('/rules', authorize('notifications.manage'), createRule);
router.post('/rules/:id/toggle', authorize('notifications.manage'), toggleRule);

export default router;
