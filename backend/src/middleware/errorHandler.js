import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(err);

  // If it's a known error with a status code
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  // If it's a Prisma error (e.g. Unique constraint failed)
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with this unique identifier already exists.' });
  }

  // Generic fallback
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    message: 'Internal Server Error',
    error: isDev ? err.message : undefined,
    stack: isDev ? err.stack : undefined
  });
};
