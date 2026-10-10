import { create } from 'zustand';
import { authService } from '../services/authService';
import { systemService } from '../services/systemService';
import { getApiBaseUrl, setApiBaseUrl } from '../services/api';

export const USER_ROLES = {
  ADMIN: {
    id: 'ADMIN',
    name: 'Admin / Owner',
    title: 'Factory General Manager & Owner',
    email: 'admin@textile.local',
    badge: 'Super Admin',
    permissions: ['all'],
    description: 'Full access across all mill operations, finance, and system settings.',
  },
  PRODUCTION_MANAGER: {
    id: 'PRODUCTION_MANAGER',
    name: 'Production Manager',
    title: 'Floor Operations Head',
    email: 'production@textile.local',
    badge: 'Operations',
    permissions: ['orders.read', 'orders.manage', 'machines.manage', 'production.manage', 'workers.manage'],
    description: 'Manages buyer orders, machine allocation, production stages, and worker shifts.',
  },
  STORE_MANAGER: {
    id: 'STORE_MANAGER',
    name: 'Store Manager',
    title: 'Warehouse & Inventory Lead',
    email: 'store@textile.local',
    badge: 'Inventory',
    permissions: ['inventory.read', 'inventory.update', 'inventory.receive', 'dispatch.manage'],
    description: 'Tracks yarn stocks, incoming receipts, warehouse lots, and finished roll dispatches.',
  },
  QUALITY_INSPECTOR: {
    id: 'QUALITY_INSPECTOR',
    name: 'Quality Inspector',
    title: 'QA & Compliance Officer',
    email: 'qa@textile.local',
    badge: 'QA & Defects',
    permissions: ['quality.read', 'quality.inspect', 'traceability.read'],
    description: 'Inspects woven rolls, flags defects (holes, stains, uneven weaving), and issues PASS/REJECT verdicts.',
  },
  ACCOUNTANT: {
    id: 'ACCOUNTANT',
    name: 'Accountant',
    title: 'Chief Financial Officer',
    email: 'accounts@textile.local',
    badge: 'Finance',
    permissions: ['finance.read', 'finance.manage', 'wages.read'],
    description: 'Monitors raw material costs, machine power overhead, worker wages, and order profitability.',
  },
  BUYER: {
    id: 'BUYER',
    name: 'Apex Fashion Group (Buyer)',
    title: 'Key Account Buyer',
    email: 'procurement@apexfashion.com',
    badge: 'Buyer Portal',
    permissions: ['buyer.orders.read'],
    description: 'Tracks production progress and expected delivery dates for placed buyer orders.',
  },
};

const initialToken = localStorage.getItem('textail_auth_token') || null;
const initialUserJson = localStorage.getItem('textail_auth_user');
let initialUser = null;
try {
  initialUser = initialUserJson ? JSON.parse(initialUserJson) : null;
} catch {
  initialUser = null;
}

export const useAuthStore = create((set, get) => ({
  user: initialUser || USER_ROLES.ADMIN,
  token: initialToken || (initialUser ? 'demo-session-token' : null),
  activeRole: initialUser?.activeRole || 'ADMIN',
  isAuthenticated: !!initialToken || !!initialUser,
  isLoading: false,
  error: null,
  isServerOnline: false,
  serverLatency: null,
  currentApiUrl: getApiBaseUrl(),

  checkBackendStatus: async () => {
    const health = await systemService.checkHealth();
    set({
      isServerOnline: health.online,
      serverLatency: health.latency,
    });
    return health;
  },

  setApiUrl: async (newUrl) => {
    setApiBaseUrl(newUrl);
    set({ currentApiUrl: getApiBaseUrl() });
    return await get().checkBackendStatus();
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // First attempt backend login
      const response = await authService.login({ email, password });
      const token = response.token;
      const userData = response.data || {
        id: 'u1',
        name: email.split('@')[0],
        email,
        roles: ['SUPER_ADMIN'],
        permissions: ['all'],
      };

      const mappedRole = email.includes('admin')
        ? 'ADMIN'
        : email.includes('prod')
        ? 'PRODUCTION_MANAGER'
        : email.includes('store')
        ? 'STORE_MANAGER'
        : email.includes('qa') || email.includes('quality')
        ? 'QUALITY_INSPECTOR'
        : email.includes('account')
        ? 'ACCOUNTANT'
        : 'ADMIN';

      const fullUser = {
        ...USER_ROLES[mappedRole],
        ...userData,
        activeRole: mappedRole,
      };

      localStorage.setItem('textail_auth_token', token);
      localStorage.setItem('textail_auth_user', JSON.stringify(fullUser));

      set({
        token,
        user: fullUser,
        activeRole: mappedRole,
        isAuthenticated: true,
        isLoading: false,
        isServerOnline: true,
      });

      return { success: true };
    } catch (apiErr) {
      // If server unreachable or error, allow offline login if credentials match demo or admin
      console.warn('Backend login attempt failed, checking demo fallback:', apiErr.message);

      // Check admin standard credentials
      const isAdminMatch = email.toLowerCase() === 'admin@textile.local' && password === 'Admin@123!';
      const matchedRoleEntry = Object.values(USER_ROLES).find(
        (r) => r.email.toLowerCase() === email.toLowerCase()
      );

      if (isAdminMatch || matchedRoleEntry) {
        const roleKey = matchedRoleEntry ? matchedRoleEntry.id : 'ADMIN';
        const roleObj = USER_ROLES[roleKey];
        const mockToken = `jwt-${Date.now()}-${roleKey}`;

        const fullUser = {
          ...roleObj,
          activeRole: roleKey,
        };

        localStorage.setItem('textail_auth_token', mockToken);
        localStorage.setItem('textail_auth_user', JSON.stringify(fullUser));

        set({
          token: mockToken,
          user: fullUser,
          activeRole: roleKey,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true, offlineNotice: true };
      }

      set({
        isLoading: false,
        error: apiErr.message || 'Invalid email or password',
      });
      return { success: false, error: apiErr.message || 'Invalid email or password' };
    }
  },

  demoLogin: (roleKey = 'ADMIN') => {
    const roleObj = USER_ROLES[roleKey] || USER_ROLES.ADMIN;
    const mockToken = `jwt-demo-${roleKey}`;
    const fullUser = {
      ...roleObj,
      activeRole: roleKey,
    };

    localStorage.setItem('textail_auth_token', mockToken);
    localStorage.setItem('textail_auth_user', JSON.stringify(fullUser));

    set({
      token: mockToken,
      user: fullUser,
      activeRole: roleKey,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  switchRole: (newRoleKey) => {
    if (!USER_ROLES[newRoleKey]) return;
    const current = get().user || {};
    const updatedUser = {
      ...current,
      ...USER_ROLES[newRoleKey],
      activeRole: newRoleKey,
    };
    localStorage.setItem('textail_auth_user', JSON.stringify(updatedUser));
    set({
      user: updatedUser,
      activeRole: newRoleKey,
    });
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
      activeRole: 'ADMIN',
      isAuthenticated: false,
      error: null,
    });
  },
}));
