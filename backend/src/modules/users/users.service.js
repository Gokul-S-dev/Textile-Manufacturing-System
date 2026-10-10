import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { logAudit } from '../audit/audit.service.js';
import { revokeAllUserTokens } from '../auth/token.service.js';

const prisma = new PrismaClient();

const selectSafeUser = {
  id: true, email: true, name: true, department: true, isActive: true, createdAt: true,
  roles: { select: { role: { select: { name: true } } } }
};

export const createUser = async (data, actorId) => {
  const passwordHash = await argon2.hash(data.password);
  
  return await prisma.$transaction(async (tx) => {
    const roles = await tx.role.findMany({ where: { name: { in: data.roles } } });
    if (roles.length !== data.roles.length) throw { status: 400, message: 'One or more roles invalid' };

    const user = await tx.user.create({
      data: {
        email: data.email,
        name: data.name,
        department: data.department,
        passwordHash,
        roles: { create: roles.map(r => ({ roleId: r.id })) }
      },
      select: selectSafeUser
    });

    await logAudit({ userId: actorId, action: 'USER_CREATED', entity: 'User', entityId: user.id }, tx);
    return user;
  });
};

export const listUsers = async () => {
  return await prisma.user.findMany({ select: selectSafeUser });
};

export const updateUserRoles = async (userId, newRoles, actorId) => {
  return await prisma.$transaction(async (tx) => {
    const roles = await tx.role.findMany({ where: { name: { in: newRoles } } });
    if (roles.length !== newRoles.length) throw { status: 400, message: 'One or more roles invalid' };

    await tx.userRole.deleteMany({ where: { userId } });
    
    const user = await tx.user.update({
      where: { id: userId },
      data: { roles: { create: roles.map(r => ({ roleId: r.id })) } },
      select: selectSafeUser
    });

    await revokeAllUserTokens(userId);
    await logAudit({ userId: actorId, action: 'USER_ROLES_UPDATED', entity: 'User', entityId: userId, details: { roles: newRoles } }, tx);
    return user;
  });
};

export const updateUserStatus = async (userId, isActive, actorId) => {
  // Prevent deactivating the last active SUPER_ADMIN
  if (!isActive) {
    const userToDeactivate = await prisma.user.findUnique({ where: { id: userId }, include: { roles: { include: { role: true } } } });
    const isSuperAdmin = userToDeactivate.roles.some(ur => ur.role.name === 'SUPER_ADMIN');
    
    if (isSuperAdmin) {
      const activeSuperAdmins = await prisma.userRole.count({
        where: { role: { name: 'SUPER_ADMIN' }, user: { isActive: true, id: { not: userId } } }
      });
      if (activeSuperAdmins === 0) throw { status: 403, message: 'Cannot deactivate the last active SUPER_ADMIN' };
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: selectSafeUser
  });

  if (!isActive) await revokeAllUserTokens(userId);
  await logAudit({ userId: actorId, action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', entity: 'User', entityId: userId });
  return user;
};

export const adminResetPassword = async (userId, newPassword, actorId) => {
  const passwordHash = await argon2.hash(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });

  await revokeAllUserTokens(userId);
  await logAudit({ userId: actorId, action: 'ADMIN_PASSWORD_RESET', entity: 'User', entityId: userId });
};
