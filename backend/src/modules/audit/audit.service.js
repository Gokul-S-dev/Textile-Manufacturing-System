import { logger } from '../../utils/logger.js';
import prisma from '../../config/db.js';

/**
 * Creates an immutable audit log entry.
 * @param {Object} params 
 * @param {string} [params.userId] - Optional. Actor performing the action.
 * @param {string} params.action - E.g. 'UPDATE_STOCK', 'USER_DEACTIVATED'
 * @param {string} params.entity - E.g. 'InventoryBalance', 'User'
 * @param {string} [params.entityId] - ID of the affected resource.
 * @param {Object} [params.details] - Before/after values, reasons, etc.
 * @param {any} [tx] - Optional Prisma transaction client
 */
export const logAudit = async ({ userId, action, entity, entityId, details }, tx = prisma) => {
  try {
    // Redact sensitive details if mistakenly passed
    const safeDetails = { ...details };
    if (safeDetails.passwordHash) delete safeDetails.passwordHash;
    if (safeDetails.token) delete safeDetails.token;

    await tx.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details: Object.keys(safeDetails).length > 0 ? safeDetails : null
      }
    });
  } catch (error) {
    // We log the error but don't necessarily crash the app, though in strict systems we might want to.
    logger.error('Failed to write audit log:', error);
  }
};
