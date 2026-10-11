import { logAudit } from '../audit/audit.service.js';
import prisma from '../../config/db.js';

export const listEmployees = async () => prisma.employee.findMany({
  include: {
    attendance: { orderBy: { date: 'desc' }, take: 1 },
    assignments: { take: 1 }
  },
  orderBy: { workerId: 'asc' }
});

export const createEmployee = async (data, userId) => {
  const count = await prisma.employee.count();
  const workerId = data.workerId || `EMP-${String(count + 1).padStart(3, '0')}`;
  const employee = await prisma.employee.create({
    data: {
      workerId,
      name: data.name,
      role: data.role || 'OPERATOR',
      hourlyRate: Number(data.hourlyRate) || 16,
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  });
  if (userId) {
    await logAudit({ userId, action: 'EMPLOYEE_CREATED', entity: 'Employee', entityId: employee.id });
  }
  return employee;
};

export const updateEmployee = async (id, data, userId) => {
  let employee = await prisma.employee.findUnique({ where: { id } }).catch(() => null);
  if (!employee) {
    employee = await prisma.employee.findUnique({ where: { workerId: id } }).catch(() => null);
    if (!employee) {
      throw { status: 404, message: 'Employee not found' };
    }
  }

  const updated = await prisma.employee.update({
    where: { id: employee.id },
    data: {
      name: data.name !== undefined ? data.name : undefined,
      role: data.role !== undefined ? data.role : undefined,
      hourlyRate: data.hourlyRate !== undefined ? Number(data.hourlyRate) : undefined,
      isActive: data.isActive !== undefined ? data.isActive : undefined,
    }
  });

  if (userId) {
    await logAudit({ userId, action: 'EMPLOYEE_UPDATED', entity: 'Employee', entityId: updated.id });
  }

  return updated;
};


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
