import api from './api';

export const purchasingService = {
  async getSuppliers() {
    const res = await api.get('/purchasing/suppliers');
    return res.data;
  },
  async createSupplier(data) {
    const res = await api.post('/purchasing/suppliers', data);
    return res.data;
  },
  async getPurchaseOrders() {
    const res = await api.get('/purchasing/purchase-orders');
    return res.data;
  },
  async createPurchaseOrder(data) {
    const res = await api.post('/purchasing/purchase-orders', data);
    return res.data;
  },
  async confirmGoodsReceipt(id, data) {
    const res = await api.post(`/purchasing/purchase-orders/${id}/confirm`, data);
    return res.data;
  }
};
