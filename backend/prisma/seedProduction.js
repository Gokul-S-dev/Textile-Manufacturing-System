import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PRODUCTION_MANAGER roles and users...');

  // 1. Create or Find Role
  const roleName = 'PRODUCTION_MANAGER';
  let role = await prisma.role.findUnique({ where: { name: roleName } });
  
  if (!role) {
    role = await prisma.role.create({
      data: {
        name: roleName,
        description: 'Operations and Floor Manager',
        permissions: {
          create: [
            'machines.read', 'machines.manage', 'machines.assign', 'machines.status.manage',
            'maintenance.read', 'maintenance.manage', 'maintenance.clear',
            'workforce.read', 'workforce.manage', 'workforce.assign',
            'attendance.read', 'attendance.manage', 'attendance.approve'
          ].map(p => ({
            permission: {
              connectOrCreate: {
                where: { name: p },
                create: { name: p }
              }
            }
          }))
        }
      }
    });
    console.log('Created Role:', role.name);
  } else {
    console.log('Role already exists:', role.name);
  }

  // 2. Create User
  const email = 'production@textile.local';
  const passwordStr = 'Production@123!';
  const passwordHash = await argon2.hash(passwordStr);

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Production Admin',
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
      data: { passwordHash }
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
