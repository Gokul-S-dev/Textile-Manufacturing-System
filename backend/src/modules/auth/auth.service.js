import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';

export const registerUser = async (data) => {
  const { name, email, password, role, department } = data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error('User already exists');
    error.status = 409;
    throw error;
  }

  // Hash password using Argon2
  const passwordHash = await argon2.hash(password);

  // Find or create the requested role (since it's validated by Zod)
  let userRole = await prisma.role.findUnique({ where: { name: role } });
  if (!userRole) {
    userRole = await prisma.role.create({ data: { name: role, description: `Auto-created ${role}` }});
  }
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      department,
      passwordHash,
      roles: {
        create: [{ roleId: userRole.id }]
      }
    }
  });

  // Return safe DTO
  return { id: user.id, name: user.name, email: user.email, department: user.department };
};

export const authenticateUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: { role: { include: { permissions: { include: { permission: true } } } } }
      }
    }
  });

  // Generic failure message to prevent email enumeration
  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // Verify Argon2 hash
  const isValid = await argon2.verify(user.passwordHash, password);
  if (!isValid) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // Extract roles and permissions for token payload
  const roles = user.roles.map(ur => ur.role.name);
  const permissions = Array.from(new Set(
    user.roles.flatMap(ur => ur.role.permissions.map(rp => rp.permission.name))
  ));

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const token = jwt.sign(
    { userId: user.id, roles, permissions },
    jwtSecret,
    { expiresIn: '1h' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, roles, permissions }
  };
};
