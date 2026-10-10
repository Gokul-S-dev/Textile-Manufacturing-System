import api from './api';

export const machinesService = {
  async getMachines() {
    const res = await api.get('/machines');
    return res.data;
  },
  async addMachine(data) {
    const res = await api.post('/machines', data);
    return res.data;
  },
  async updateStatus(id, status) {
    const res = await api.patch(`/machines/${id}/status`, { status });
    return res.data;
  },
  async completeMaintenance(id, notes) {
    const res = await api.post(`/machines/maintenance/${id}/complete`, { notes });
    return res.data;
  }
};
