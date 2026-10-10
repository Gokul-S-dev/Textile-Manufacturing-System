import api from './api';

export const systemService = {
  async checkHealth() {
    const startTime = performance.now();
    try {
      const response = await api.get('/health', { timeout: 3000 });
      const latency = Math.round(performance.now() - startTime);
      return { online: true, latency, data: response.data };
    } catch (err) {
      return { online: false, latency: null, error: err.message };
    }
  },
};
