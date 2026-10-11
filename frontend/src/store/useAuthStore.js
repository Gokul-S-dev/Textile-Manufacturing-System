import { create } from 'zustand';
import { authService } from '../services/authService';
import { systemService } from '../services/systemService';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

export const USER_ROLES = {
  ADMIN: { id: 'ADMIN', name: 'Admin / Owner', badge: 'Full Mill Access' },
  PRODUCTION_MANAGER: { id: 'PRODUCTION_MANAGER', name: 'Production Mgr', badge: 'Looms & Floor' },
  STORE_MANAGER: { id: 'STORE_MANAGER', name: 'Store Manager', badge: 'Yarn & Warehouse' },
  QUALITY_INSPECTOR: { id: 'QUALITY_INSPECTOR', name: 'Quality Inspector', badge: 'Rolls & Defects' },
  ACCOUNTANT: { id: 'ACCOUNTANT', name: 'Accountant', badge: 'Cost & Wages' },
  BUYER: { id: 'BUYER', name: 'Buyer Portal', badge: 'Track ORD-1024' },
};

const normalizeRole = (role) => {
  if (!role) return 'ADMIN';
  const value = typeof role === 'string' ? role : role.name || role.id || role.code || 'ADMIN';
  return String(value).toUpperCase();
};

const initialToken = localStorage.getItem('textail_auth_token') || null;
const initialUserJson = localStorage.getItem('textail_auth_user');
let initialUser = null;
try {
  initialUser = initialUserJson ? JSON.parse(initialUserJson) : null;
} catch {
  initialUser = null;
}

const normalizeRoles = (roles = []) => {
  if (!Array.isArray(roles)) return [];
  return roles.map(normalizeRole).filter(Boolean);
};

export const useAuthStore = create((set, get) => ({
  user: initialUser,
  token: initialToken,
  roles: normalizeRoles(initialUser?.roles || []),
  permissions: Array.isArray(initialUser?.permissions) ? initialUser.permissions : [],
  activeRole: initialUser?.activeRole || normalizeRole(initialUser?.roles?.[0] || 'ADMIN'),
  isAuthenticated: !!initialToken && !!initialUser,
  isLoading: false,
  error: null,
  isServerOnline: false,
  serverLatency: null,
  currentApiUrl: getApiBaseUrl(),
  isSidebarExpanded: localStorage.getItem('textail_sidebar_expanded') === 'true',

  toggleSidebarExpanded: () => {
    const next = !get().isSidebarExpanded;
    localStorage.setItem('textail_sidebar_expanded', String(next));
    set({ isSidebarExpanded: next });
  },

  hasRole: (role) => {
    const normalized = normalizeRole(role);
    return get().roles.includes(normalized);
  },

  hasPermission: (permission) => {
    if (get().roles.includes('ADMIN') || get().activeRole === 'ADMIN') return true;
    const perms = get().permissions || [];
    if (perms.includes(permission) || perms.includes('*')) return true;
    if (get().activeRole === 'PRODUCTION_MANAGER' || get().roles.includes('PRODUCTION_MANAGER')) {
      const allowedPrefixes = ['production.', 'machines.', 'inventory.', 'workforce.', 'quality.', 'sales.'];
      if (allowedPrefixes.some((p) => permission.startsWith(p))) return true;
    }
    if (get().activeRole === 'BUYER' || get().roles.includes('BUYER')) {
      if (permission === 'sales.read' || permission === 'buyer.read') return true;
    }
    return false;
  },

  switchRole: (role) => {
    const normalized = normalizeRole(role);
    const roles = get().roles.length ? get().roles : ['ADMIN'];
    if (!roles.includes(normalized)) {
      return false;
    }

    const nextUser = get().user ? { ...get().user, activeRole: normalized } : null;
    if (nextUser) {
      localStorage.setItem('textail_auth_user', JSON.stringify(nextUser));
    }

    set({ activeRole: normalized, user: nextUser });
    return true;
  },

  hydrateAuth: async () => {
    const savedToken = localStorage.getItem('textail_auth_token');
    if (!savedToken) {
      set({ isAuthenticated: false, user: null, token: null, roles: [], permissions: [], activeRole: null });
      return false;
    }

    try {
      const meResponse = await authService.getMe();
      const userData = {
        ...meResponse.user,
        roles: Array.isArray(meResponse.roles) ? meResponse.roles : [],
        permissions: Array.isArray(meResponse.permissions) ? meResponse.permissions : [],
        activeRole: normalizeRole((meResponse.roles || [])[0] || 'ADMIN'),
      };

      const roles = normalizeRoles(userData.roles);
      localStorage.setItem('textail_auth_user', JSON.stringify(userData));
      set({
        user: userData,
        token: savedToken,
        roles,
        permissions: userData.permissions,
        activeRole: userData.activeRole,
        isAuthenticated: true,
        error: null,
      });
      return true;
    } catch (error) {
      localStorage.removeItem('textail_auth_token');
      localStorage.removeItem('textail_auth_user');
      set({
        token: null,
        user: null,
        roles: [],
        permissions: [],
        activeRole: null,
        isAuthenticated: false,
        error: error.message || 'Session expired',
      });
      return false;
    }
  },

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
    const normalized = setApiBaseUrl(newUrl);
    set({ currentApiUrl: normalized });
    return await get().checkBackendStatus();
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const loginResponse = await authService.login({ email, password });
      const token = loginResponse.accessToken || loginResponse.token;

      if (!token) {
        throw new Error('Authentication token was not returned by the backend.');
      }

      localStorage.setItem('textail_auth_token', token);

      const meResponse = await authService.getMe();
      const userData = {
        ...meResponse.user,
        roles: Array.isArray(meResponse.roles) ? meResponse.roles : [],
        permissions: Array.isArray(meResponse.permissions) ? meResponse.permissions : [],
        activeRole: normalizeRole((meResponse.roles || [])[0] || 'ADMIN'),
      };

      const roles = normalizeRoles(userData.roles);
      localStorage.setItem('textail_auth_user', JSON.stringify(userData));

      set({
        token,
        user: userData,
        roles,
        permissions: userData.permissions,
        activeRole: userData.activeRole,
        isAuthenticated: true,
        isLoading: false,
        isServerOnline: true,
      });

      return { success: true };
    } catch (apiErr) {
      localStorage.removeItem('textail_auth_token');
      localStorage.removeItem('textail_auth_user');
      set({
        isLoading: false,
        error: apiErr.message || 'Invalid email or password',
        token: null,
        user: null,
        roles: [],
        permissions: [],
        activeRole: null,
        isAuthenticated: false,
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
      roles: [],
      permissions: [],
      activeRole: null,
      isAuthenticated: false,
      error: null,
    });
  },
}));
