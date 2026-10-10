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
import purchasingRoutes from './modules/purchasing/purchasing.routes.js';
import machinesRoutes from './modules/machines/machines.routes.js';
import workforceRoutes from './modules/workforce/workforce.routes.js';
import productionRoutes from './modules/production/production.routes.js';
import mesRoutes from './modules/mes/mes.routes.js';
import qualityRoutes from './modules/quality/quality.routes.js';
import warehouseRoutes from './modules/warehouse/warehouse.routes.js';
import salesRoutes from './modules/sales/sales.routes.js';
import financeRoutes from './modules/finance/finance.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import { startNotificationWorker } from './modules/notifications/notification.worker.js';
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
app.use('/api/v1/purchasing', purchasingRoutes);
app.use('/api/v1/machines', machinesRoutes);
app.use('/api/v1/workforce', workforceRoutes);
app.use('/api/v1/production', productionRoutes);
app.use('/api/v1/mes', mesRoutes);
app.use('/api/v1/quality', qualityRoutes);
app.use('/api/v1/warehouse', warehouseRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
// Global Error Handler
app.use(errorHandler);

export default app;
