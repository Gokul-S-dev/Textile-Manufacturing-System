import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

describe('Auth & User Management', () => {
  let adminTokens;
  let testUser;

  beforeAll(async () => {
    // Setup test user
    const passwordHash = await argon2.hash('password123');
    const role = await prisma.role.findFirst({ where: { name: 'SUPER_ADMIN' } });
    
    testUser = await prisma.user.upsert({
      where: { email: 'testadmin@textile.local' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'testadmin@textile.local',
        name: 'Test Admin',
        passwordHash,
        roles: { create: { roleId: role.id } }
      }
    });
  });

  it('should reject invalid passwords', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testadmin@textile.local',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('should login successfully and return tokens', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testadmin@textile.local',
      password: 'password123'
    });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    
    // Check if httpOnly cookie is set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/refreshToken=.*HttpOnly/);
    
    adminTokens = {
      accessToken: res.body.accessToken,
      cookie: cookies[0]
    };
  });

  it('should allow accessing protected routes with token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminTokens.accessToken}`);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('testadmin@textile.local');
  });

  it('should reject requests without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('should record audit logs for login', async () => {
    const log = await prisma.auditLog.findFirst({
      where: { userId: testUser.id, action: 'LOGIN' },
      orderBy: { createdAt: 'desc' }
    });
    expect(log).toBeDefined();
    expect(log.action).toBe('LOGIN');
  });
});
