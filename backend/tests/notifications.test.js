import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';
import { notificationsService } from '../src/modules/notifications/notifications.service.js';

let token;
let user;

beforeAll(async () => {
  // Login as admin
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@textile.local',
    password: 'Admin@123!'
  });
  token = res.body.accessToken;

  user = await prisma.user.findUnique({ where: { email: 'admin@textile.local' } });

  // Create a rule for tests
  await prisma.notificationRule.create({
    data: {
      name: 'Test Low Stock',
      eventType: 'inventory.low_stock',
      roles: ['ADMIN'],
      channels: ['IN_APP', 'EMAIL']
    }
  });
});

describe('Notifications Module', () => {
  it('should publish a domain event successfully', async () => {
    const event = await notificationsService.publishEvent('inventory.low_stock', { itemId: '123', stock: 5 });
    expect(event.eventType).toBe('inventory.low_stock');
    expect(event.status).toBe('PENDING');
  });

  it('should fetch user preferences (and default create)', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/preferences')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.inAppEnabled).toBe(true);
  });

  it('should fetch notification rules', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/rules')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
