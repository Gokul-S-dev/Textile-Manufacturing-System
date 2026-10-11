import { logAudit } from '../audit/audit.service.js';
import prisma from '../../config/db.js';

// ================= MACHINES =================
export const createMachine = async (data, userId) => {
  const machine = await prisma.machine.create({ data });
  await logAudit({ userId, action: 'MACHINE_CREATED', entity: 'Machine', entityId: machine.id });
  return machine;
};

export const updateMachineStatus = async (machineId, status, userId) => {
  return await prisma.$transaction(async (tx) => {
    const machine = await tx.machine.findUnique({ where: { id: machineId } });
    if (!machine) throw { status: 404, message: 'Machine not found' };

    // Prevent making a machine available if it's broken without maintenance
    if (machine.status === 'BREAKDOWN' && status === 'IDLE') {
      throw { status: 400, message: 'Cannot transition from BREAKDOWN to IDLE without maintenance clearance' };
    }

    const updated = await tx.machine.update({
      where: { id: machineId },
      data: { status }
    });

    await logAudit({ userId, action: `MACHINE_STATUS_${status}`, entity: 'Machine', entityId: machineId }, tx);
    return updated;
  });
};

export const listMachines = async () => prisma.machine.findMany({ include: { capabilities: true } });

// ================= MAINTENANCE =================
export const completeMaintenance = async (recordId, notes, userId) => {
  return await prisma.$transaction(async (tx) => {
    const record = await tx.maintenanceRecord.findUnique({ where: { id: recordId } });
    if (!record) throw { status: 404, message: 'Maintenance record not found' };

    await tx.maintenanceRecord.update({
      where: { id: recordId },
      data: { description: `${record.description}\n[Completed]: ${notes}` }
    });

    // Clearance sets machine back to IDLE
    await tx.machine.update({
      where: { id: record.machineId },
      data: { status: 'IDLE' }
    });

    await logAudit({ userId, action: 'MAINTENANCE_COMPLETED', entity: 'Machine', entityId: record.machineId }, tx);
    return record;
  });
};
