import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true })); // Important for cookies
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from './modules/auth/auth.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

import { errorHandler } from './middleware/errorHandler.js';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';

// Setup HTTP request logging
app.use(pinoHttp({ logger }));

// Health Check Routes
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health/ready', async (req, res) => {
  try {
    // Check DB connection
    const { connectDB } = await import('./config/db.js');
    await connectDB();
    res.status(200).json({ status: 'ready', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/inventory', inventoryRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
