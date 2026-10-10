import api from './api';

export const workforceService = {
  async getEmployees() {
    const res = await api.get('/workforce/employees');
    return res.data;
  },
  async createShift(data) {
    const res = await api.post('/workforce/shifts', data);
    return res.data;
  },
  async checkInAttendance(data) {
    const res = await api.post('/workforce/attendance', data);
    return res.data;
  },
  async assignWorker(data) {
    const res = await api.post('/workforce/worker-assignments', data);
    return res.data;
  }
};
