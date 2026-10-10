import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify signature and expiration
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Attach to request
    req.user = {
      id: decoded.userId,
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
