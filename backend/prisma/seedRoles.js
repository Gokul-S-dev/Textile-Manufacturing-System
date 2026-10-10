import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding RAW MATERIAL & INVENTORY roles and users...');

  // 1. Create or Find Role
  const roleName = 'INVENTORY_MANAGER';
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  
  if (!role) {
    role = await prisma.role.create({
      data: {
        name: roleName,
        description: 'Raw Material and Inventory Manager',
        permissions: {
          create: [
            { resource: 'inventory', action: 'read' },
            { resource: 'inventory', action: 'manage' },
            { resource: 'inventory', action: 'receive' },
            { resource: 'purchasing', action: 'read' },
            { resource: 'purchasing', action: 'create' }
          ]
        }
      }
    });
    console.log('Created Role:', role.name);
  } else {
    console.log('Role already exists:', role.name);
  }

  // 2. Create User
  const email = 'inventory@textile.local';
  const passwordStr = 'Inventory@123!';
  const passwordHash = await argon2.hash(passwordStr);

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Inventory Admin',
        passwordHash,
        isActive: true,
        roles: {
          create: {
            roleId: role.id
          }
        }
      }
    });
    console.log(`Created User: ${email} with password: ${passwordStr}`);
  } else {
    // Ensure role is attached
    const hasRole = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: role.id }
    });
    
    if (!hasRole) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id }
      });
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash } // reset password so we know it
    });
    console.log(`Updated User: ${email} with password: ${passwordStr}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
