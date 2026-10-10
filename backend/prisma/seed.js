import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  const roles = [
    { name: 'SUPER_ADMIN', description: 'Full system administration' },
    { name: 'ADMIN', description: 'Operational management' },
    { name: 'INVENTORY_MANAGER', description: 'Manage inventory and warehouses' },
    { name: 'STORE_STAFF', description: 'Record receipts and issues' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }

  const permissions = [
    { name: 'inventory.read', description: 'Read inventory balances' },
    { name: 'inventory.create', description: 'Create inventory items' },
    { name: 'users.manage', description: 'Manage users and roles' },
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    });
  }

  // Create super admin
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  
  if (superAdminRole) {
    const adminEmail = 'admin@textile.local';
    const passwordHash = await argon2.hash('Admin@123!');
    
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: 'Super Admin',
        passwordHash,
        roles: {
          create: { roleId: superAdminRole.id }
        }
      }
    });
  }
  
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
