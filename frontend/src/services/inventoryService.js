import api from './api';

export const inventoryService = {
  async getItems() {
    const response = await api.get('/inventory/items');
    return response.data;
  },

  async getItemStock(itemId) {
    const response = await api.get(`/inventory/items/${itemId}/stock`);
    return response.data;
  },

  async updateItem(itemId, data) {
    const response = await api.patch(`/inventory/items/${itemId}`, data);
    return response.data;
  },

  async createReceipt(receiptData) {
    // If backend implements /inventory/receipts
    const response = await api.post('/inventory/receipts', receiptData);
    return response.data;
  },

  async createMovement(movementData) {
    // If backend implements /inventory/movements
    const response = await api.post('/inventory/movements', movementData);
    return response.data;
  },

  async createReservation(reservationData) {
    // If backend implements /inventory/reservations
    const response = await api.post('/inventory/reservations', reservationData);
    return response.data;
  },
};
