import { notificationsService } from './notifications.service.js';

export const getMyNotifications = async (req, res, next) => {
  try { res.json(await notificationsService.getMyNotifications(req.user.id)); } catch (err) { next(err); }
};

export const getUnreadCount = async (req, res, next) => {
  try { res.json(await notificationsService.getUnreadCount(req.user.id)); } catch (err) { next(err); }
};

export const markAsRead = async (req, res, next) => {
  try { res.json(await notificationsService.markAsRead(req.params.id, req.user.id)); } catch (err) { next(err); }
};

export const markAllAsRead = async (req, res, next) => {
  try { res.json(await notificationsService.markAllAsRead(req.user.id)); } catch (err) { next(err); }
};

export const getPreferences = async (req, res, next) => {
  try { res.json(await notificationsService.getPreferences(req.user.id)); } catch (err) { next(err); }
};

export const updatePreferences = async (req, res, next) => {
  try { res.json(await notificationsService.updatePreferences(req.user.id, req.body)); } catch (err) { next(err); }
};

export const getRules = async (req, res, next) => {
  try { res.json(await notificationsService.getRules()); } catch (err) { next(err); }
};

export const createRule = async (req, res, next) => {
  try { res.status(201).json(await notificationsService.createRule(req.body)); } catch (err) { next(err); }
};

export const toggleRule = async (req, res, next) => {
  try { res.json(await notificationsService.toggleRule(req.params.id)); } catch (err) { next(err); }
};
