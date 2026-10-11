import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();
const credentialsPath = path.resolve(process.cwd(), '.dev-credentials.json');

const readPermissionSets = {
  admin: ['analytics.export', 'analytics.read', 'attendance.manage', 'finance.approve', 'finance.manage', 'finance.read', 'inventory.read', 'inventory.receive', 'inventory.reserve', 'inventory.transfer', 'inventory.update', 'machines.manage', 'machines.read', 'machines.status.manage', 'maintenance.clear', 'notifications.manage', 'production.commit_schedule', 'production.create', 'production.execute', 'production.override', 'production.plan', 'production.read', 'production.release', 'production.schedule', 'purchasing.create', 'purchasing.read', 'quality.approve', 'quality.execute', 'quality.manage', 'quality.read', 'sales.approve', 'sales.execute', 'sales.manage', 'sales.read', 'suppliers.manage', 'suppliers.read', 'users.manage', 'warehouse.approve', 'warehouse.execute', 'warehouse.manage', 'warehouse.read', 'workforce.assign', 'workforce.manage', 'workforce.read', 'audit_logs.read', 'roles.assign'],
  factory: ['analytics.export', 'analytics.read', 'finance.read', 'inventory.read', 'machines.read', 'production.read', 'purchasing.read', 'quality.read', 'sales.read', 'suppliers.read', 'warehouse.read', 'workforce.read', 'audit_logs.read'],
  procurement: ['purchasing.create', 'purchasing.read', 'suppliers.read', 'suppliers.manage'],
  procurementApprover: ['purchasing.read', 'purchasing.approve', 'suppliers.read'],
  inventory: ['inventory.read', 'inventory.receive', 'inventory.transfer', 'inventory.update', 'warehouse.read', 'warehouse.execute', 'analytics.read'],
  planner: ['production.create', 'production.plan', 'production.read', 'production.schedule', 'production.release', 'machines.read', 'inventory.read', 'analytics.read', 'sales.read'],
  supervisor: ['production.read', 'production.execute', 'machines.read', 'machines.status.manage', 'workforce.read', 'workforce.assign', 'analytics.read', 'inventory.read'],
  qualityInspector: ['quality.read', 'quality.execute', 'quality.manage', 'production.read', 'analytics.read'],
  qualityApprover: ['quality.read', 'quality.approve', 'production.read', 'analytics.read'],
  warehouse: ['warehouse.read', 'warehouse.manage', 'warehouse.execute', 'warehouse.approve', 'inventory.read', 'analytics.read'],
  sales: ['sales.read', 'sales.manage', 'sales.approve', 'sales.execute'],
  dispatch: ['sales.read', 'sales.execute', 'warehouse.read'],
  finance: ['finance.read', 'finance.manage', 'finance.approve', 'analytics.read'],
  hr: ['workforce.read', 'workforce.manage', 'attendance.manage'],
  auditor: ['analytics.read', 'finance.read', 'inventory.read', 'production.read', 'quality.read', 'sales.read', 'warehouse.read', 'workforce.read', 'audit_logs.read']
};

const accountDefinitions = [
  ['SYSTEM_ADMINISTRATOR', 'System Administrator', 'admin@textile.local', 'System Administrator', readPermissionSets.admin],
  ['FACTORY_MANAGER', 'Factory Manager', 'manager@textile.local', 'Factory Manager', readPermissionSets.factory],
  ['PROCUREMENT_OFFICER', 'Procurement Officer', 'procurement@textile.local', 'Procurement Officer', readPermissionSets.procurement],
  ['PROCUREMENT_APPROVER', 'Procurement Approver', 'procurement.approver@textile.local', 'Procurement Approver', readPermissionSets.procurementApprover],
  ['INVENTORY_OFFICER', 'Inventory Officer', 'inventory@textile.local', 'Inventory Officer', readPermissionSets.inventory],
  ['PRODUCTION_PLANNER', 'Production Planner', 'planner@textile.local', 'Production Planner', readPermissionSets.planner],
  ['PRODUCTION_SUPERVISOR', 'Production Supervisor', 'supervisor@textile.local', 'Production Supervisor', readPermissionSets.supervisor],
  ['QUALITY_INSPECTOR', 'Quality Inspector', 'quality@textile.local', 'Quality Inspector', readPermissionSets.qualityInspector],
  ['QUALITY_APPROVER', 'Quality Approver', 'quality.approver@textile.local', 'Quality Approver', readPermissionSets.qualityApprover],
  ['WAREHOUSE_OFFICER', 'Warehouse Officer', 'warehouse@textile.local', 'Warehouse Officer', readPermissionSets.warehouse],
  ['SALES_OFFICER', 'Sales Officer', 'sales@textile.local', 'Sales Officer', readPermissionSets.sales],
  ['DISPATCH_OFFICER', 'Dispatch Officer', 'dispatch@textile.local', 'Dispatch Officer', readPermissionSets.dispatch],
  ['FINANCE_OFFICER', 'Finance Officer', 'finance@textile.local', 'Finance Officer', readPermissionSets.finance],
  ['HR_WORKFORCE_OFFICER', 'HR Workforce Officer', 'hr@textile.local', 'HR Workforce Officer', readPermissionSets.hr],
  ['AUDITOR', 'Auditor Read Only', 'auditor@textile.local', 'Auditor', readPermissionSets.auditor]
];

const generateTemporaryPassword = () => crypto.randomBytes(24).toString('base64url');

async function main() {
  if (process.env.NODE_ENV === 'production' || process.env.TMMS_DEV_SEED !== 'true') {
    throw new Error('Development account seeding requires NODE_ENV != production and TMMS_DEV_SEED=true.');
  }

  const permissionNames = [...new Set(accountDefinitions.flatMap(([, , , , permissions]) => permissions))];
  for (const name of permissionNames) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name, description: `Permission for ${name}` }
    });
  }

  const permissions = await prisma.permission.findMany({ where: { name: { in: permissionNames } } });
  const permissionIds = new Map(permissions.map((permission) => [permission.name, permission.id]));
  const generatedCredentials = {};

  for (const [roleName, roleDescription, email, userName, rolePermissions] of accountDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: { description: roleDescription },
      create: { name: roleName, description: roleDescription }
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: rolePermissions.map((permission) => ({ roleId: role.id, permissionId: permissionIds.get(permission) }))
    });

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const temporaryPassword = generateTemporaryPassword();
      user = await prisma.user.create({
        data: { email, name: userName, passwordHash: await argon2.hash(temporaryPassword), isActive: true }
      });
      generatedCredentials[email] = { role: roleName, temporaryPassword };
    }

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: role.id } },
      update: {},
      create: { userId: user.id, roleId: role.id }
    });
  }

  if (Object.keys(generatedCredentials).length > 0) {
    await fs.writeFile(credentialsPath, `${JSON.stringify(generatedCredentials, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    console.log(`Generated credentials for new development accounts at ${credentialsPath}`);
  } else {
    console.log('No new accounts were created; existing passwords and assignments were preserved.');
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
