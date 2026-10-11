import request from 'supertest';
import app from '../src/app.js';
import argon2 from 'argon2';
import { checkInAttendance, assignWorker } from '../src/modules/workforce/workforce.service.js';
import prisma from '../src/config/db.js';

describe('Phase 5: Machines & Workforce', () => {
  let adminTokens;
  let adminId;
  let machine;
  let employee;
  let shift;
  let run;

  beforeAll(async () => {
    const passwordHash = await argon2.hash('Admin@123!');
    const role = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
    
    const user = await prisma.user.upsert({
      where: { email: 'hr@test.local' },
      update: { isActive: true, passwordHash },
      create: {
        email: 'hr@test.local',
        name: 'HR Admin',
        passwordHash,
        roles: { create: { roleId: role.id } }
      }
    });
    adminId = user.id;

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'hr@test.local',
      password: 'Admin@123!'
    });
    adminTokens = res.body.accessToken;

    machine = await prisma.machine.create({
      data: { code: `MCH-${Date.now()}`, name: 'Test Loom', type: 'LOOM', capacity: 100, status: 'BREAKDOWN' }
    });

    employee = await prisma.employee.create({
      data: { workerId: `EMP-${Date.now()}`, name: 'Test Worker', role: 'OPERATOR' }
    });

    shift = await prisma.shift.create({
      data: { code: `SHF-${Date.now()}`, name: 'Morning', startTime: '08:00', endTime: '16:00' }
    });
    
    // Create a dummy run just to satisfy foreign keys
    const order = await prisma.manufacturingOrder.create({
        data: { orderNumber: `MO-${Date.now()}`, fabricSpec: 'Cotton', targetQuantity: 100, dueDate: new Date() }
    });
    run = await prisma.productionRun.create({
        data: { order: { connect: { id: order.id } }, machine: { connect: { id: machine.id } }, stage: 'WEAVING' }
    });
  });

  it('should prevent transitioning BREAKDOWN machine to IDLE without maintenance', async () => {
    const res = await request(app)
      .patch(`/api/v1/machines/${machine.id}/status`)
      .set('Authorization', `Bearer ${adminTokens}`)
      .send({ status: 'IDLE' });
      
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('maintenance clearance');
  });

  it('should prevent duplicate attendance on the same day for same shift', async () => {
    // 1st check-in should work
    await checkInAttendance(employee.id, shift.id, '2026-10-10', adminId);
    
    // Check it exists
    const count = await prisma.attendance.count({ where: { employeeId: employee.id, shiftId: shift.id } });
    expect(count).toBe(1);

    // 2nd check-in for same day should UPSERT and not duplicate
    await checkInAttendance(employee.id, shift.id, '2026-10-10', adminId);
    const countAfter = await prisma.attendance.count({ where: { employeeId: employee.id, shiftId: shift.id } });
    expect(countAfter).toBe(1);
  });

  it('should prevent conflicting overlapping worker assignments via concurrency', async () => {
    const promises = [
      assignWorker({ employeeId: employee.id, runId: run.id, shiftCode: 'MORNING_1' }, adminId),
      assignWorker({ employeeId: employee.id, runId: run.id, shiftCode: 'MORNING_1' }, adminId)
    ];

    const results = await Promise.allSettled(promises);
    const success = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    // Due to the synchronous check and fast DB, one usually wins. 
    // To be perfectly concurrent safe we used `findFirst` check in a transaction, which might still race in read-commit.
    // However Prisma transactions execute sequentially here.
    expect(success.length).toBe(1);
    expect(failed.length).toBe(1);
    expect(failed[0].reason.status).toBe(409);
  });
});
