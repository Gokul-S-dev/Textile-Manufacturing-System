import { create } from 'zustand';
import { useAuditStore } from './useAuditStore';
import { machinesService } from '../services/machinesService';

export const initialMachines = [
  {
    id: 'M-W01',
    code: 'W-01',
    name: 'Picanol OmniPlus Airjet 01',
    type: 'Weaving',
    status: 'RUNNING',
    currentOrder: 'ORD-25',
    currentWorker: 'Ravi Shankar (Op O-01)',
    currentWorkerId: 'W-001',
    productionTodayMeters: 420,
    downtimeHours: 0.0,
    rpm: 950,
    efficiency: 96.2,
    location: 'Weaving Shed A',
  },
  {
    id: 'M-W02',
    code: 'W-02',
    name: 'Picanol OmniPlus Airjet 02',
    type: 'Weaving',
    status: 'RUNNING',
    currentOrder: 'ORD-28',
    currentWorker: 'Manoj Tiwari (Op O-02)',
    currentWorkerId: 'W-003',
    productionTodayMeters: 390,
    downtimeHours: 0.2,
    rpm: 940,
    efficiency: 94.5,
    location: 'Weaving Shed A',
  },
  {
    id: 'M-W03',
    code: 'W-03',
    name: 'Sulzer G6500 Rapier Loom 03',
    type: 'Weaving',
    status: 'RUNNING',
    currentOrder: 'ORD-1024',
    currentWorker: 'Amit Sharma (Op O-03)',
    currentWorkerId: 'W-008',
    productionTodayMeters: 310,
    downtimeHours: 0.0,
    rpm: 650,
    efficiency: 92.0,
    location: 'Weaving Shed A',
  },
  {
    id: 'M-W04',
    code: 'W-04',
    name: 'Sulzer G6500 Rapier Loom 04',
    type: 'Weaving',
    status: 'RUNNING',
    currentOrder: 'ORD-30',
    currentWorker: 'Gopal Yadav (Op O-04)',
    currentWorkerId: 'W-006',
    productionTodayMeters: 295,
    downtimeHours: 0.1,
    rpm: 640,
    efficiency: 91.5,
    location: 'Weaving Shed B',
  },
  {
    id: 'M-W05',
    code: 'W-05',
    name: 'Tsudakoma ZAX9100 Airjet 05',
    type: 'Weaving',
    status: 'RUNNING',
    currentOrder: 'ORD-30',
    currentWorker: 'Prakash Rao (Op O-05)',
    currentWorkerId: 'W-007',
    productionTodayMeters: 410,
    downtimeHours: 0.0,
    rpm: 920,
    efficiency: 93.4,
    location: 'Weaving Shed B',
  },
  {
    id: 'M-W07',
    code: 'W-07',
    name: 'Picanol Airjet Loom W-07',
    type: 'Weaving',
    status: 'RUNNING',
    currentOrder: 'ORD-25 (Single Jersey)',
    currentWorker: 'Ramesh Kumar (Operator O-15)',
    currentWorkerId: 'W-015',
    productionTodayMeters: 450,
    downtimeHours: 0.0,
    rpm: 980,
    efficiency: 95.0,
    location: 'Weaving Shed A',
  },
  {
    id: 'M-S01',
    code: 'S-01',
    name: 'Rieter G38 Ring Spinning 01',
    type: 'Spinning',
    status: 'RUNNING',
    currentOrder: 'ORD-25 (Yarn Lot)',
    currentWorker: 'Vinod Meena (Op O-07)',
    currentWorkerId: 'W-011',
    productionTodayMeters: 520,
    downtimeHours: 0.0,
    rpm: 18500,
    efficiency: 97.1,
    location: 'Spinning Mill Hall',
  },
  {
    id: 'M-S02',
    code: 'S-02',
    name: 'Rieter G38 Ring Spinning 02',
    type: 'Spinning',
    status: 'RUNNING',
    currentOrder: 'ORD-34',
    currentWorker: 'Sanjay Gupta (Op O-08)',
    currentWorkerId: 'W-002',
    productionTodayMeters: 490,
    downtimeHours: 0.0,
    rpm: 18200,
    efficiency: 95.8,
    location: 'Spinning Mill Hall',
  },
  {
    id: 'M-D01',
    code: 'D-01',
    name: 'Fong High Temp Dyeing Vat 01',
    type: 'Dyeing',
    status: 'RUNNING',
    currentOrder: 'ORD-29',
    currentWorker: 'Kishore Lal (Op O-12)',
    currentWorkerId: 'W-009',
    productionTodayMeters: 350,
    downtimeHours: 0.0,
    rpm: 0,
    efficiency: 93.0,
    location: 'Dyeing & Finishing Wing',
  },
  {
    id: 'M-D02',
    code: 'D-02',
    name: 'Thies Soft-Flow Dyeing Vat 02',
    type: 'Dyeing',
    status: 'RUNNING',
    currentOrder: 'ORD-35',
    currentWorker: 'Arjun Das (Op O-13)',
    currentWorkerId: 'W-010',
    productionTodayMeters: 325,
    downtimeHours: 0.0,
    rpm: 0,
    efficiency: 91.0,
    location: 'Dyeing & Finishing Wing',
  },
];

export const useMachineStore = create((set, get) => ({
  machines: initialMachines,
  isLoading: false,
  error: null,

  fetchMachines: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await machinesService.getMachines();
      if (Array.isArray(data) && data.length > 0) {
        set({ machines: data, isLoading: false, error: null });
      } else {
        set({ machines: initialMachines, isLoading: false, error: null });
      }
    } catch (error) {
      console.warn('Failed to fetch machines, using floor machines roster', error);
      if (get().machines.length === 0) {
        set({ machines: initialMachines });
      }
      set({ isLoading: false });
    }
  },

  getTotalMachinesCount: () => get().machines.length,
  getRunningCount: () => get().machines.filter((m) => m.status === 'RUNNING').length,
  getIdleCount: () => get().machines.filter((m) => m.status === 'IDLE').length,
  getBreakdownCount: () => get().machines.filter((m) => m.status === 'BREAKDOWN').length,
  getMaintenanceCount: () => get().machines.filter((m) => m.status === 'MAINTENANCE').length,

  getTodayTotalOutputMeters: () => {
    return get().machines.reduce((sum, m) => sum + (Number(m.productionTodayMeters) || 0), 0);
  },

  updateMachineStatus: async (machineId, newStatus, reason, changedBy = 'Production Manager') => {
    try {
      if (newStatus === 'IDLE' && get().machines.find((m) => m.id === machineId)?.status === 'BREAKDOWN') {
        await machinesService.completeMaintenance(machineId, reason);
      } else {
        await machinesService.updateStatus(machineId, newStatus);
      }
    } catch (err) {
      console.warn('Backend machine status API failed, updating local state', err);
    }

    set((state) => ({
      machines: state.machines.map((m) => {
        if (m.id === machineId || m.code === machineId) {
          return {
            ...m,
            status: newStatus,
            breakdownReason: newStatus === 'BREAKDOWN' ? reason || 'Reported breakdown' : null,
          };
        }
        return m;
      }),
    }));

    useAuditStore.getState().addLog({
      userName: changedBy,
      userRole: 'PRODUCTION_MANAGER',
      action: 'MACHINE_STATUS_CHANGE',
      target: `Machine ${machineId}`,
      details: `Status changed to ${newStatus}. Reason: ${reason || 'Operator floor report'}.`,
      badgeColor: newStatus === 'BREAKDOWN' ? 'red' : newStatus === 'RUNNING' ? 'green' : 'blue',
    });
  },

  assignWorkerToMachine: (machineId, workerName, workerId) => {
    set((state) => ({
      machines: state.machines.map((m) => {
        if (m.id === machineId || m.code === machineId) {
          return {
            ...m,
            currentWorker: workerName,
            currentWorkerId: workerId,
          };
        }
        return m;
      }),
    }));
  },
}));
