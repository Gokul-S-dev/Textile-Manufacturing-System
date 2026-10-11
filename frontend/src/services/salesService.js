import api from './api';

export const salesService = {
  async getSalesOrders() {
    const res = await api.get('/sales/sales-orders');
    return res.data;
  },
  async getCustomers() {
    const res = await api.get('/sales/customers');
    return res.data;
  },
  async createSalesOrder(data) {
    const res = await api.post('/sales/sales-orders', data);
    return res.data;
  },
  async updateSalesOrder(id, data) {
    const res = await api.patch(`/sales/sales-orders/${id}`, data);
    return res.data;
  }
};
