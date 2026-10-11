import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

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
});

describe('Analytics Module', () => {
  it('should fetch executive dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/executive')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('production');
    expect(res.body).toHaveProperty('quality');
    expect(res.body).toHaveProperty('finance');
  });

  it('should fetch finance dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/finance')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalReceivables');
  });

  it('should generate CSV export for finance', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/reports/finance/export')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Total Receivables');
  });
});
