import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { generateTokens, revokeAllUserTokens } from './token.service.js';
import { logAudit } from '../audit/audit.service.js';

const prisma = new PrismaClient();

export const authenticateUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
    }
  });

  // Prevent account enumeration by always throwing generic error
  const invalidError = { status: 401, message: 'Invalid email or password' };

  if (!user) throw invalidError;
  if (!user.isActive) {
    await logAudit({ userId: user.id, action: 'FAILED_LOGIN', entity: 'User', entityId: user.id, details: { reason: 'Inactive account' } });
    throw invalidError;
  }

  const validPassword = await argon2.verify(user.passwordHash, password);
  if (!validPassword) {
    await logAudit({ userId: user.id, action: 'FAILED_LOGIN', entity: 'User', entityId: user.id, details: { reason: 'Wrong password' } });
    throw invalidError;
  }

  await logAudit({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id });
  return await generateTokens(user);
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw { status: 404, message: 'User not found' };

  const validPassword = await argon2.verify(user.passwordHash, currentPassword);
  if (!validPassword) throw { status: 401, message: 'Invalid current password' };

  const passwordHash = await argon2.hash(newPassword);
  
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  // Revoke all tokens to force re-login across all devices
  await revokeAllUserTokens(userId);
  await logAudit({ userId, action: 'PASSWORD_CHANGED', entity: 'User', entityId: userId });
};
