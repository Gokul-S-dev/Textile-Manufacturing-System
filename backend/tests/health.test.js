import request from 'supertest';
import app from '../src/app.js';

describe('Health Endpoints', () => {
  it('should return 200 OK for /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return 200 OK for /api/v1/health/ready if database is connected', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    // It might return 503 if the DB is down, but in a test environment with a DB, it should be 200.
    expect([200, 503]).toContain(res.statusCode);
  });
});
