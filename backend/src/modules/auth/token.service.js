import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env.js';
import argon2 from 'argon2';

const prisma = new PrismaClient();

export const generateTokens = async (user) => {
  // Access token payload: include permissions directly for fast RBAC checks
  const permissions = user.roles.flatMap(ur => ur.role.permissions.map(p => p.permission.name));
  const uniquePermissions = [...new Set(permissions)];
  
  const payload = {
    userId: user.id,
    roles: user.roles.map(ur => ur.role.name),
    permissions: uniquePermissions
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' }); // Short-lived

  // Generate opaque refresh token
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = await argon2.hash(refreshToken);

  // Store hashed refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt
    }
  });

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldRefreshToken) => {
  // Find all sessions
  const sessions = await prisma.refreshSession.findMany();
  let foundSession = null;
  
  for (const session of sessions) {
    if (await argon2.verify(session.tokenHash, oldRefreshToken)) {
      foundSession = session;
      break;
    }
  }

  if (!foundSession) {
    throw { status: 401, message: 'Invalid or expired refresh token' };
  }

  if (new Date() > foundSession.expiresAt) {
    await prisma.refreshSession.delete({ where: { id: foundSession.id } });
    throw { status: 401, message: 'Refresh token expired' };
  }

  // Revoke old session
  await prisma.refreshSession.delete({ where: { id: foundSession.id } });

  // Get user to generate new tokens
  const user = await prisma.user.findUnique({
    where: { id: foundSession.userId },
    include: {
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } }
    }
  });

  if (!user || !user.isActive) {
    throw { status: 401, message: 'User inactive or deleted' };
  }

  return await generateTokens(user);
};

export const revokeAllUserTokens = async (userId) => {
  await prisma.refreshSession.deleteMany({
    where: { userId }
  });
};
