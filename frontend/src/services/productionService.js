import api from './api';

export const productionService = {
  async getOrders() {
    const res = await api.get('/production/orders');
    return res.data;
  },
  async createOrder(data) {
    const res = await api.post('/production/orders', data);
    return res.data;
  },
  async updateOrder(id, data) {
    const res = await api.patch(`/production/orders/${id}`, data);
    return res.data;
  },
  async releaseOrder(id) {
    const res = await api.post(`/production/orders/${id}/release`);
    return res.data;
  }
};
