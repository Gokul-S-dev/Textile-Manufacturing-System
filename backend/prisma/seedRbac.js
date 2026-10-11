import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const ROLES_AND_PERMISSIONS = {
  'ADMIN': {
    name: 'ADMIN',
    description: 'System Administrator - Full Mill Access',
    email: 'admin@textile.local',
    permissions: [
      'analytics.export', 'analytics.read', 'attendance.manage', 'finance.approve', 
      'finance.manage', 'finance.read', 'inventory.read', 'inventory.receive', 
      'inventory.reserve', 'inventory.transfer', 'inventory.update', 'machines.manage', 
      'machines.read', 'machines.status.manage', 'maintenance.clear', 'notifications.manage', 
      'production.commit_schedule', 'production.create', 'production.execute', 'production.override', 
      'production.plan', 'production.read', 'production.release', 'production.schedule', 
      'purchasing.create', 'purchasing.read', 'quality.approve', 'quality.execute', 
      'quality.manage', 'quality.read', 'sales.approve', 'sales.execute', 'sales.manage', 
      'sales.read', 'suppliers.manage', 'suppliers.read', 'users.manage', 'warehouse.approve', 
      'warehouse.execute', 'warehouse.manage', 'warehouse.read', 'workforce.assign', 
      'workforce.manage', 'workforce.read', 'audit_logs.read', 'roles.assign'
    ]
  },
  'FACTORY_MANAGER': {
    name: 'FACTORY_MANAGER',
    description: 'Factory Manager - Overall operations monitor',
    email: 'manager@textile.local',
    permissions: [
      'analytics.read', 'finance.read', 'inventory.read', 'machines.read', 
      'production.read', 'purchasing.read', 'quality.read', 'sales.read', 
      'suppliers.read', 'warehouse.read', 'workforce.read', 'analytics.export', 'audit_logs.read'
    ]
  },
  'PRODUCTION_MANAGER': {
    name: 'PRODUCTION_MANAGER',
    description: 'Production Planner & Supervisor - Looms & Floor',
    email: 'production@textile.local',
    permissions: [
      'production.plan', 'production.schedule', 'production.create', 'production.release', 
      'production.commit_schedule', 'production.execute', 'production.override', 'production.read', 
      'machines.manage', 'machines.read', 'machines.status.manage', 'inventory.read', 
      'inventory.reserve', 'inventory.transfer', 'warehouse.read', 'workforce.assign', 'workforce.read',
      'analytics.read', 'quality.read', 'sales.read'
    ]
  },
  'STORE_MANAGER': {
    name: 'STORE_MANAGER',
    description: 'Warehouse / Inventory Officer - Yarn & Warehouse',
    email: 'store@textile.local',
    permissions: [
      'inventory.read', 'inventory.receive', 'inventory.transfer', 'inventory.update', 
      'warehouse.read', 'warehouse.manage', 'warehouse.execute', 'warehouse.approve', 
      'purchasing.read', 'sales.read', 'sales.execute', 'analytics.read', 'machines.read', 'production.read'
    ]
  },
  'QUALITY_INSPECTOR': {
    name: 'QUALITY_INSPECTOR',
    description: 'Quality Control Inspector - Rolls & Defects',
    email: 'quality@textile.local',
    permissions: [
      'quality.read', 'quality.execute', 'quality.manage', 'quality.approve', 'production.read',
      'analytics.read', 'machines.read', 'inventory.read', 'sales.read'
    ]
  },
  'ACCOUNTANT': {
    name: 'ACCOUNTANT',
    description: 'Finance Officer - Cost & Wages',
    email: 'accountant@textile.local',
    permissions: [
      'finance.read', 'finance.manage', 'finance.approve', 'sales.read', 'purchasing.read', 
      'attendance.manage', 'analytics.read'
    ]
  },
  'BUYER': {
    name: 'BUYER',
    description: 'Sales & Dispatch Officer',
    email: 'buyer@textile.local',
    permissions: [
      'sales.read', 'sales.manage', 'sales.approve', 'sales.execute', 'inventory.read', 'warehouse.read'
    ]
  }
};

async function main() {
  console.log('Seeding RBAC Model...');

  // 1. Gather all distinct permissions
  const allPerms = new Set();
  for (const r of Object.values(ROLES_AND_PERMISSIONS)) {
    r.permissions.forEach(p => allPerms.add(p));
  }

  // 2. Upsert permissions
  for (const permName of allPerms) {
    await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName, description: `Permission for ${permName}` }
    });
  }
  
  const allDbPerms = await prisma.permission.findMany();
  const permMap = Object.fromEntries(allDbPerms.map(p => [p.name, p.id]));

  // 3. Upsert roles, link permissions and users
  for (const key of Object.keys(ROLES_AND_PERMISSIONS)) {
    const roleDef = ROLES_AND_PERMISSIONS[key];
    
    // Create/update Role
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description }
    });

    // Clear existing permissions for this role and re-add
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    const rpData = roleDef.permissions.map(p => ({
      roleId: role.id,
      permissionId: permMap[p]
    }));
    await prisma.rolePermission.createMany({ data: rpData });

    // Create User
    const passwordHash = await argon2.hash('Admin@123!');
    let user = await prisma.user.findUnique({ where: { email: roleDef.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: roleDef.email,
          name: roleDef.name.replace('_', ' '),
          passwordHash,
          isActive: true
        }
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, isActive: true }
      });
    }

    // Attach Role to User
    const hasRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: role.id }
    });
    if (!hasRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id }
      });
    }

    console.log(`Seeded Role: ${roleDef.name} -> User: ${roleDef.email}`);
  }

  console.log('RBAC Seeding Complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
