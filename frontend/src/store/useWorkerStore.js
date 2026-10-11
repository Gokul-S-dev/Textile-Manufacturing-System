import { create } from 'zustand';
import { workforceService } from '../services/workforceService';
import { useAuditStore } from './useAuditStore';

export const initialWorkers = [
  {
    id: 'W-015',
    code: 'O-15',
    name: 'Ramesh Kumar',
    role: 'Senior Airjet Loom Operator',
    department: 'Weaving',
    assignedMachine: 'Picanol Airjet Loom W-07',
    assignedMachineCode: 'W-07',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 2.5,
    basicWage: 850,
    hourlyOtRate: 150,
    incentives: 200,
    phone: '+91 98765 11015',
    joinDate: '2022-04-10',
  },
  {
    id: 'W-001',
    code: 'O-01',
    name: 'Ravi Shankar',
    role: 'Loom Operator Grade I',
    department: 'Weaving',
    assignedMachine: 'Picanol OmniPlus Loom W-01',
    assignedMachineCode: 'W-01',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 1.0,
    basicWage: 800,
    hourlyOtRate: 140,
    incentives: 150,
    phone: '+91 98765 11001',
    joinDate: '2021-08-15',
  },
  {
    id: 'W-003',
    code: 'O-02',
    name: 'Manoj Tiwari',
    role: 'Loom Operator Grade I',
    department: 'Weaving',
    assignedMachine: 'Picanol OmniPlus Loom W-02',
    assignedMachineCode: 'W-02',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 2.0,
    basicWage: 800,
    hourlyOtRate: 140,
    incentives: 180,
    phone: '+91 98765 11003',
    joinDate: '2023-01-20',
  },
  {
    id: 'W-008',
    code: 'O-03',
    name: 'Amit Sharma',
    role: 'Rapier Specialist Operator',
    department: 'Weaving',
    assignedMachine: 'Sulzer Rapier Loom W-03',
    assignedMachineCode: 'W-03',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 0.5,
    basicWage: 850,
    hourlyOtRate: 150,
    incentives: 250,
    phone: '+91 98765 11008',
    joinDate: '2020-11-05',
  },
  {
    id: 'W-006',
    code: 'O-04',
    name: 'Gopal Yadav',
    role: 'Rapier Operator',
    department: 'Weaving',
    assignedMachine: 'Sulzer Rapier Loom W-04',
    assignedMachineCode: 'W-04',
    shift: 'Shift B (14:00 - 22:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 0,
    basicWage: 780,
    hourlyOtRate: 135,
    incentives: 100,
    phone: '+91 98765 11006',
    joinDate: '2024-02-12',
  },
  {
    id: 'W-007',
    code: 'O-05',
    name: 'Prakash Rao',
    role: 'Airjet Operator',
    department: 'Weaving',
    assignedMachine: 'Tsudakoma Loom W-05',
    assignedMachineCode: 'W-05',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 1.5,
    basicWage: 820,
    hourlyOtRate: 145,
    incentives: 160,
    phone: '+91 98765 11007',
    joinDate: '2022-09-01',
  },
  {
    id: 'W-012',
    code: 'O-06',
    name: 'Subhash Sen',
    role: 'Master Jacquard Craftsman',
    department: 'Weaving',
    assignedMachine: 'Bonas Jacquard Loom W-06',
    assignedMachineCode: 'W-06',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 3.0,
    basicWage: 950,
    hourlyOtRate: 175,
    incentives: 300,
    phone: '+91 98765 11012',
    joinDate: '2019-06-18',
  },
  {
    id: 'W-011',
    code: 'O-07',
    name: 'Vinod Meena',
    role: 'Ring Spinning Technician',
    department: 'Spinning',
    assignedMachine: 'Rieter Ring Spinning S-01',
    assignedMachineCode: 'S-01',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 1.0,
    basicWage: 750,
    hourlyOtRate: 130,
    incentives: 120,
    phone: '+91 98765 11011',
    joinDate: '2023-05-14',
  },
  {
    id: 'W-002',
    code: 'O-08',
    name: 'Sanjay Gupta',
    role: 'Ring Spinning Operator',
    department: 'Spinning',
    assignedMachine: 'Rieter Ring Spinning S-02',
    assignedMachineCode: 'S-02',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 0,
    basicWage: 750,
    hourlyOtRate: 130,
    incentives: 100,
    phone: '+91 98765 11002',
    joinDate: '2023-08-22',
  },
  {
    id: 'W-009',
    code: 'O-12',
    name: 'Kishore Lal',
    role: 'Master Dyes Chemist & Operator',
    department: 'Dyeing',
    assignedMachine: 'Fong High Temp Vat D-01',
    assignedMachineCode: 'D-01',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 2.0,
    basicWage: 900,
    hourlyOtRate: 160,
    incentives: 220,
    phone: '+91 98765 11009',
    joinDate: '2021-03-10',
  },
  {
    id: 'W-014',
    code: 'O-14',
    name: 'Om Prakash',
    role: 'Loom Technician',
    department: 'Weaving',
    assignedMachine: 'Picanol Airjet Loom W-08',
    assignedMachineCode: 'W-08',
    shift: 'Shift B (14:00 - 22:00)',
    status: 'ABSENT',
    workingHours: 0,
    overtimeHours: 0,
    basicWage: 800,
    hourlyOtRate: 140,
    incentives: 0,
    phone: '+91 98765 11014',
    joinDate: '2022-12-01',
  },
  {
    id: 'W-QA1',
    code: 'QA-01',
    name: 'Sunil Verma',
    role: 'Chief Quality Inspector',
    department: 'Quality Control',
    assignedMachine: 'Uster Inspection Frame Q-01',
    assignedMachineCode: 'Q-01',
    shift: 'Shift A (06:00 - 14:00)',
    status: 'PRESENT',
    workingHours: 8,
    overtimeHours: 2.0,
    basicWage: 920,
    hourlyOtRate: 165,
    incentives: 250,
    phone: '+91 98765 11099',
    joinDate: '2020-02-15',
  },
];

export const useWorkerStore = create((set, get) => ({
  workers: initialWorkers,
  isLoading: false,

  fetchWorkers: async () => {
    set({ isLoading: true });
    try {
      const data = await workforceService.getEmployees();
      if (Array.isArray(data) && data.length > 0) {
        // Merge with existing rich workers to retain UI fields
        const currentWorkers = get().workers.length > 0 ? get().workers : initialWorkers;
        const merged = currentWorkers.map((w) => {
          const match = data.find((d) => d.id === w.id || d.workerId === w.code || d.name === w.name);
          if (match) {
            return {
              ...w,
              id: match.id || w.id,
              code: match.workerId || w.code,
              name: match.name || w.name,
              role: match.role || w.role,
              hourlyOtRate: Number(match.hourlyRate) > 0 ? Number(match.hourlyRate) * 10 : w.hourlyOtRate,
            };
          }
          return w;
        });

        // Add any non-test backend workers not already in list
        data.forEach((beWorker) => {
          if (!beWorker.name.toLowerCase().includes('test worker')) {
            const exists = merged.some((m) => m.id === beWorker.id || m.code === beWorker.workerId);
            if (!exists) {
              merged.push({
                id: beWorker.id,
                code: beWorker.workerId,
                name: beWorker.name,
                role: beWorker.role,
                department: beWorker.role === 'QC' ? 'Quality Control' : 'Weaving',
                assignedMachine: 'Floor Pool',
                assignedMachineCode: 'POOL',
                shift: 'Shift A (06:00 - 14:00)',
                status: 'PRESENT',
                workingHours: 8,
                overtimeHours: 0,
                basicWage: 800,
                hourlyOtRate: 140,
                incentives: 150,
                phone: '+91 98000 00000',
                joinDate: new Date().toISOString().split('T')[0],
              });
            }
          }
        });

        set({ workers: merged, isLoading: false });
      } else {
        set({ workers: initialWorkers, isLoading: false });
      }
    } catch (error) {
      console.warn('Failed to fetch workers from backend, using active roster', error);
      if (get().workers.length === 0) {
        set({ workers: initialWorkers });
      }
      set({ isLoading: false });
    }
  },

  // Calculate daily wage for a worker: Basic + Overtime + Incentives
  calculateWorkerWage: (worker) => {
    if (worker.status === 'ABSENT') return 0;
    const basic = Number(worker.basicWage) || 0;
    const ot = (Number(worker.overtimeHours) || 0) * (Number(worker.hourlyOtRate) || 0);
    const inc = Number(worker.incentives) || 0;
    return basic + ot + inc;
  },

  // Calculate total mill daily wage payout
  getTotalDailyWages: () => {
    return get().workers.reduce((sum, w) => sum + get().calculateWorkerWage(w), 0);
  },

  updateAttendance: async (workerId, status, workingHours, overtimeHours, shiftId) => {
    try {
      if (status !== 'ABSENT' && shiftId) {
        await workforceService.checkInAttendance({
          employeeId: workerId,
          shiftId: shiftId,
          date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.warn('Attendance backend sync failed, updating local state', error);
    }

    set((state) => ({
      workers: state.workers.map((w) => {
        if (w.id === workerId) {
          return {
            ...w,
            status,
            workingHours: status === 'ABSENT' ? 0 : Number(workingHours),
            overtimeHours: status === 'ABSENT' ? 0 : Number(overtimeHours),
          };
        }
        return w;
      }),
    }));
  },

  updateWageParameters: (workerId, basicWage, hourlyOtRate, incentives) => {
    set((state) => ({
      workers: state.workers.map((w) => {
        if (w.id === workerId) {
          return {
            ...w,
            basicWage: Number(basicWage),
            hourlyOtRate: Number(hourlyOtRate),
            incentives: Number(incentives),
          };
        }
        return w;
      }),
    }));
  },

  updateEmployeeDetails: async (workerId, updatedData) => {
    // 1. Update local Zustand state immediately
    set((state) => ({
      workers: state.workers.map((w) => {
        if (w.id === workerId || w.code === workerId) {
          return {
            ...w,
            ...updatedData,
            basicWage: updatedData.basicWage !== undefined ? Number(updatedData.basicWage) : w.basicWage,
            hourlyOtRate: updatedData.hourlyOtRate !== undefined ? Number(updatedData.hourlyOtRate) : w.hourlyOtRate,
            incentives: updatedData.incentives !== undefined ? Number(updatedData.incentives) : w.incentives,
          };
        }
        return w;
      }),
    }));

    // 2. Sync to backend API
    try {
      await workforceService.updateEmployee(workerId, {
        name: updatedData.name,
        role: updatedData.role,
        hourlyRate: updatedData.hourlyOtRate ? Number(updatedData.hourlyOtRate) / 10 : undefined,
        isActive: updatedData.status !== 'INACTIVE',
      });
    } catch (error) {
      console.warn('Could not sync employee update to backend, local state updated.', error);
    }

    // 3. Log to audit trail
    useAuditStore.getState().addLog({
      userName: 'Production Manager',
      userRole: 'PRODUCTION_MANAGER',
      action: 'EMPLOYEE_UPDATED',
      target: updatedData.name || workerId,
      details: `Updated details for ${updatedData.name || workerId}: Role=${updatedData.role}, Dept=${updatedData.department}, Machine=${updatedData.assignedMachine}.`,
      badgeColor: 'blue',
    });
  },

  addEmployee: async (newWorkerData) => {
    const nextCode = `O-${String(get().workers.length + 1).padStart(2, '0')}`;
    const newWorker = {
      id: `W-${Date.now()}`,
      code: newWorkerData.code || nextCode,
      name: newWorkerData.name,
      role: newWorkerData.role || 'Loom Operator Grade I',
      department: newWorkerData.department || 'Weaving',
      assignedMachine: newWorkerData.assignedMachine || 'Floor Pool',
      assignedMachineCode: newWorkerData.assignedMachineCode || 'POOL',
      shift: newWorkerData.shift || 'Shift A (06:00 - 14:00)',
      status: newWorkerData.status || 'PRESENT',
      workingHours: 8,
      overtimeHours: 0,
      basicWage: Number(newWorkerData.basicWage) || 800,
      hourlyOtRate: Number(newWorkerData.hourlyOtRate) || 140,
      incentives: Number(newWorkerData.incentives) || 150,
      phone: newWorkerData.phone || '+91 98000 00000',
      joinDate: new Date().toISOString().split('T')[0],
      ...newWorkerData,
    };

    set((state) => ({
      workers: [newWorker, ...state.workers],
    }));

    try {
      await workforceService.createEmployee({
        workerId: newWorker.code,
        name: newWorker.name,
        role: newWorker.role,
        hourlyRate: Number(newWorker.hourlyOtRate) / 10,
        isActive: true,
      });
    } catch (error) {
      console.warn('Could not sync new employee to backend, local state saved.', error);
    }

    useAuditStore.getState().addLog({
      userName: 'Production Manager',
      userRole: 'PRODUCTION_MANAGER',
      action: 'EMPLOYEE_CREATED',
      target: newWorker.name,
      details: `Registered new operator ${newWorker.name} (${newWorker.code}) in ${newWorker.department}.`,
      badgeColor: 'green',
    });

    return newWorker;
  },
}));
