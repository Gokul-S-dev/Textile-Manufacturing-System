import prisma from '../../config/db.js';
import createError from 'http-errors';

export const notificationsService = {
  // Publishing an event (Called by internal services)
  async publishEvent(eventType, payload) {
    return prisma.notificationEvent.create({
      data: { eventType, payload }
    });
  },

  // Inbox
  async getMyNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  },

  async getUnreadCount(userId) {
    const count = await prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  },

  async markAsRead(id, userId) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) throw createError(404, 'Notification not found');
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  },

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  },

  // Preferences
  async getPreferences(userId) {
    let pref = await prisma.notificationPreference.findUnique({ where: { userId } });
    if (!pref) {
      pref = await prisma.notificationPreference.create({ data: { userId } });
    }
    return pref;
  },

  async updatePreferences(userId, data) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data }
    });
  },

  // Rules
  async getRules() {
    return prisma.notificationRule.findMany();
  },

  async createRule(data) {
    return prisma.notificationRule.create({ data });
  },

  async toggleRule(id) {
    const rule = await prisma.notificationRule.findUnique({ where: { id } });
    return prisma.notificationRule.update({
      where: { id },
      data: { isActive: !rule.isActive }
    });
  }
};
