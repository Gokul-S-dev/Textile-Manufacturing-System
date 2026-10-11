import argon2 from 'argon2';
import { logAudit } from '../audit/audit.service.js';
import { revokeAllUserTokens } from '../auth/token.service.js';
import prisma from '../../config/db.js';

const selectSafeUser = {
  id: true, email: true, name: true, department: true, isActive: true, createdAt: true,
  roles: { select: { role: { select: { name: true } } } }
};

const getActorPermissionSet = async (tx, actorId) => {
  const actor = await tx.user.findUnique({
    where: { id: actorId },
    select: {
      roles: {
        select: {
          role: { select: { permissions: { select: { permission: { select: { name: true } } } } } }
        }
      }
    }
  });
  return new Set(actor?.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.name)) || []);
};

const assertDelegatedRoles = async (tx, actorId, targetUserId, roles) => {
  if (actorId === targetUserId) throw { status: 403, message: 'Users cannot change their own roles' };

  const actorPermissions = await getActorPermissionSet(tx, actorId);
  if (!actorPermissions.has('roles.assign')) {
    throw { status: 403, message: 'Role assignment is not delegated to this user' };
  }

  const rolePermissions = await tx.rolePermission.findMany({
    where: { roleId: { in: roles.map((role) => role.id) } },
    select: { permission: { select: { name: true } } }
  });
  const unauthorizedPermission = rolePermissions.find(({ permission }) => !actorPermissions.has(permission.name));
  if (unauthorizedPermission) {
    throw { status: 403, message: 'Cannot delegate permissions that the actor does not possess' };
  }
};

export const createUser = async (data, actorId) => {
  const passwordHash = await argon2.hash(data.password);
  
  return await prisma.$transaction(async (tx) => {
    const roles = await tx.role.findMany({ where: { name: { in: data.roles } } });
    if (roles.length !== data.roles.length) throw { status: 400, message: 'One or more roles invalid' };
    await assertDelegatedRoles(tx, actorId, null, roles);



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
    await assertDelegatedRoles(tx, actorId, userId, roles);

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
  if (userId === actorId && !isActive) {
    throw { status: 403, message: 'Users cannot deactivate their own account' };
  }

  // Prevent deactivating the last active privileged account.
  if (!isActive) {
    const userToDeactivate = await prisma.user.findUnique({ where: { id: userId }, include: { roles: { include: { role: true } } } });
    const isPrivileged = userToDeactivate.roles.some(ur => ['SUPER_ADMIN', 'ADMIN'].includes(ur.role.name));
    
    if (isPrivileged) {
      const activePrivilegedUsers = await prisma.userRole.count({
        where: { role: { name: { in: ['SUPER_ADMIN', 'ADMIN'] } }, user: { isActive: true, id: { not: userId } } }
      });
      if (activePrivilegedUsers === 0) throw { status: 403, message: 'Cannot deactivate the last active privileged account' };
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
