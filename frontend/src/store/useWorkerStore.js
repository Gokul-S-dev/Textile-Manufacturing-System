import { create } from 'zustand';
import { workforceService } from '../services/workforceService';

export const useWorkerStore = create((set, get) => ({
  workers: [],
  isLoading: false,

  fetchWorkers: async () => {
    set({ isLoading: true });
    try {
      const data = await workforceService.getEmployees();
      set({ workers: data, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch workers', error);
      set({ workers: [], isLoading: false });
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
          date: new Date().toISOString().split('T')[0]
        });
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
    } catch (error) {
      console.error('Failed to update attendance', error);
    }
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
}));
