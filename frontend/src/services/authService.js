import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch {
      // Return success anyway to allow local logout
      return { success: true };
    }
  },

  async signup(userData) {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
};