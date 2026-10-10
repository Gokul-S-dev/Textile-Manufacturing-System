import { create } from 'zustand';
import { authService } from '../services/authService';
import { systemService } from '../services/systemService';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

const initialToken = localStorage.getItem('textail_auth_token') || null;
const initialUserJson = localStorage.getItem('textail_auth_user');
let initialUser = null;
try {
  initialUser = initialUserJson ? JSON.parse(initialUserJson) : null;
} catch {
  initialUser = null;
}

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  token: initialToken,
  activeRole: initialUser?.activeRole || null,
  isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,
  isServerOnline: false,
  serverLatency: null,
  currentApiUrl: getApiBaseUrl(),

  checkBackendStatus: async () => {
    try {
      const health = await systemService.checkHealth();
      set({
        isServerOnline: health.online,
        serverLatency: health.latency,
      });
      return health;
    } catch {
      set({
        isServerOnline: false,
        serverLatency: null,
      });
      return { online: false, latency: null };
    }
  },

  setApiUrl: async (newUrl) => {
    setApiBaseUrl(newUrl);
    set({ currentApiUrl: getApiBaseUrl() });
    return await get().checkBackendStatus();
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      const token = response.token;
      const userData = response.data; // Now relies entirely on backend

      localStorage.setItem('textail_auth_token', token);
      localStorage.setItem('textail_auth_user', JSON.stringify(userData));

      set({
        token,
        user: userData,
        activeRole: userData?.roles?.[0] || 'USER',
        isAuthenticated: true,
        isLoading: false,
        isServerOnline: true,
      });

      return { success: true };
    } catch (apiErr) {
      set({
        isLoading: false,
        error: apiErr.message || 'Invalid email or password',
      });
      return { success: false, error: apiErr.message || 'Invalid email or password' };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('textail_auth_token');
    localStorage.removeItem('textail_auth_user');
    set({
      token: null,
      user: null,
      activeRole: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
