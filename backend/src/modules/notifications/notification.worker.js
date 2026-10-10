import prisma from '../../config/db.js';
import { logger } from '../../utils/logger.js';

const BATCH_SIZE = 10;
const POLLING_INTERVAL_MS = 5000;

export const startNotificationWorker = () => {
  setInterval(processOutbox, POLLING_INTERVAL_MS);
  logger.info('Notification Outbox Worker started');
};

const processOutbox = async () => {
  try {
    const events = await prisma.notificationEvent.findMany({
      where: { status: 'PENDING' },
      take: BATCH_SIZE,
      orderBy: { createdAt: 'asc' }
    });

    if (events.length === 0) return;

    for (const event of events) {
      await processSingleEvent(event);
    }
  } catch (err) {
    logger.error('Error in Notification Worker', err);
  }
};

const processSingleEvent = async (event) => {
  try {
    const rules = await prisma.notificationRule.findMany({
      where: { eventType: event.eventType, isActive: true }
    });

    if (rules.length === 0) {
      // Mark as processed immediately if no routing rule exists
      await prisma.notificationEvent.update({ where: { id: event.id }, data: { status: 'PROCESSED' } });
      return;
    }

    for (const rule of rules) {
      // Find eligible users
      const users = await prisma.user.findMany({
        where: {
          role: { in: rule.roles },
          isActive: true
        },
        include: { notificationPreference: true }
      });

      for (const user of users) {
        const prefs = user.notificationPreference || { inAppEnabled: true, emailEnabled: true };

        // Process IN_APP channel
        if (rule.channels.includes('IN_APP') && prefs.inAppEnabled) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              eventId: event.id,
              title: `Alert: ${event.eventType}`,
              body: `New event triggered: ${event.eventType}`,
              type: 'INFO'
            }
          });
        }

        // Process EMAIL channel (simulation of delivery via NotificationDelivery outbox)
        if (rule.channels.includes('EMAIL') && prefs.emailEnabled) {
          await prisma.notificationDelivery.create({
            data: {
              notificationId: 'SYS_GENERATED',
              channel: 'EMAIL',
              recipient: user.email,
              status: 'PENDING' // Simulating external email outbox
            }
          });
        }
      }
    }

    await prisma.notificationEvent.update({ where: { id: event.id }, data: { status: 'PROCESSED' } });
  } catch (err) {
    logger.error(`Error processing event ${event.id}`, err);
    await prisma.notificationEvent.update({
      where: { id: event.id },
      data: { status: 'FAILED', errorMsg: err.message }
    });
  }
};
