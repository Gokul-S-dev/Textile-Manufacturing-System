import { create } from 'zustand';
import { useAuditStore } from './useAuditStore';
import { machinesService } from '../services/machinesService';
import { workforceService } from '../services/workforceService';

export const useMachineStore = create((set, get) => ({
  machines: [],
  isLoading: false,

  fetchMachines: async () => {
    set({ isLoading: true });
    try {
      const data = await machinesService.getMachines();
      set({ machines: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch machines', error);
      set({ isLoading: false, machines: [] });
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
      if (newStatus === 'IDLE' && get().machines.find(m => m.id === machineId)?.status === 'BREAKDOWN') {
        await machinesService.completeMaintenance(machineId, reason);
      } else {
        await machinesService.updateStatus(machineId, newStatus);
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
    } catch (error) {
      console.error('Failed to update machine status', error);
    }
  },

  assignWorkerToMachine: async (machineId, workerName, workerId) => {
    try {
      // Assuming a generic runId or fetching from current state if available.
      // For now we map it directly.
      await workforceService.assignWorker({
        employeeId: workerId,
        runId: machineId, // The UI currently maps machine to worker assignment.
        shiftCode: 'SHIFT-DAY'
      });
      
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
    } catch (error) {
      console.error('Failed to assign worker', error);
    }
  },
}));
