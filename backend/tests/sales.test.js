import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/db.js';

let token;
let customer;
let order;

beforeAll(async () => {
  // Login as admin
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@textile.local',
    password: 'Admin@123!'
  });
  token = res.body.accessToken;

  // Create a customer
  const custRes = await request(app)
    .post('/api/v1/sales/customers')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Customer',
      email: 'test@customer.com',
      type: 'WHOLESALE'
    });
  customer = custRes.body;
});

describe('Sales & Fulfillment Module', () => {
  it('should create a sales order', async () => {
    // Find an item first
    const item = await prisma.item.findFirst({ where: { type: 'FINISHED_GOOD' } });
    if (!item) {
        console.warn('Skipping test: no finished good items found');
        return;
    }

    const res = await request(app)
      .post('/api/v1/sales/sales-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId: customer.id,
        lines: [
          { itemId: item.id, quantity: 100, unitPrice: 50.0 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('DRAFT');
    expect(Number(res.body.totalAmount)).toBe(5000);
    order = res.body;
  });

  it('should confirm a sales order', async () => {
    if (!order) return;
    const res = await request(app)
      .post(`/api/v1/sales/sales-orders/${order.id}/confirm`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CONFIRMED');
  });

  it('should attempt stock allocation', async () => {
    if (!order) return;
    const res = await request(app)
      .post(`/api/v1/sales/sales-orders/${order.id}/allocate`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
