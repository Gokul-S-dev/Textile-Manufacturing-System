import api from './api';

export const analyticsService = {
  async getExecutiveMetrics(params = {}) {
    const response = await api.get('/analytics/executive', { params });
    return response.data;
  },
};
