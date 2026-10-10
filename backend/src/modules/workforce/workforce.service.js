import { PrismaClient } from '@prisma/client';
import { logAudit } from '../audit/audit.service.js';

const prisma = new PrismaClient();

// ================= WORKFORCE =================
export const listEmployees = async () => prisma.employee.findMany();

export const checkInAttendance = async (employeeId, shiftId, date, userId) => {
  return await prisma.$transaction(async (tx) => {
    // Prevent duplicate attendance using upsert and unique constraint
    const attendance = await tx.attendance.upsert({
      where: {
        employeeId_shiftId_date: { employeeId, shiftId, date: new Date(date) }
      },
      update: {
        checkIn: new Date()
      },
      create: {
        employeeId,
        shiftId,
        date: new Date(date),
        checkIn: new Date()
      }
    });
    
    await logAudit({ userId, action: 'ATTENDANCE_CHECK_IN', entity: 'Attendance', entityId: attendance.id }, tx);
    return attendance;
  });
};

export const createShift = async (data) => prisma.shift.create({ data });

export const assignWorker = async (data, userId) => {
  return await prisma.$transaction(async (tx) => {
    // Prevent overlapping active assignments
    const existing = await tx.workerAssignment.findFirst({
      where: {
        employeeId: data.employeeId,
        shift: data.shiftCode
      }
    });

    if (existing) {
      throw { status: 409, message: 'Employee is already assigned to this shift and run' };
    }

    const assignment = await tx.workerAssignment.create({
      data: {
        employeeId: data.employeeId,
        runId: data.runId,
        shift: data.shiftCode
      }
    });

    await logAudit({ userId, action: 'WORKER_ASSIGNED', entity: 'WorkerAssignment', entityId: assignment.id }, tx);
    return assignment;
  });
};
