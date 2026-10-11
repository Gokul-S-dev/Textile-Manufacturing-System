import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        isActive: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                permissions: { select: { permission: { select: { name: true } } } }
              }
            }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const roles = user.roles.map(({ role }) => role.name);
    const permissions = [...new Set(
      user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.name))
    )];

    req.user = {
      id: user.id,
      roles,
      permissions
    };
    
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
