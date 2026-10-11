import axios from 'axios';

const STORAGE_KEY_API_URL = 'textail_api_base_url';
const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const normalizeApiUrl = (url) => {
  if (!url) return DEFAULT_API_BASE_URL;
  const normalized = String(url).trim().replace(/\/+$/, '');

  if (/\/api$/i.test(normalized)) {
    return `${normalized}/v1`;
  }

  if (!/\/api\/v1$/i.test(normalized) && !/\/api$/i.test(normalized)) {
    return `${normalized}/api/v1`;
  }

  return normalized;
};

export const getApiBaseUrl = () => {
  return normalizeApiUrl(localStorage.getItem(STORAGE_KEY_API_URL) || DEFAULT_API_BASE_URL);
};

export const setApiBaseUrl = (url) => {
  const normalized = normalizeApiUrl(url);
  if (normalized) {
    localStorage.setItem(STORAGE_KEY_API_URL, normalized);
  } else {
    localStorage.removeItem(STORAGE_KEY_API_URL);
  }
  return normalized;
};

// Create Axios client
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach dynamic baseURL and JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('textail_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401/403 and format errors nicely
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        console.warn('Session expired or unauthorized. Token cleared.');
        // Don't auto-clear if it was a login attempt
        if (!error.config.url.includes('/auth/login')) {
          localStorage.removeItem('textail_auth_token');
          window.dispatchEvent(new CustomEvent('textail:auth_unauthorized'));
        }
      } else if (status === 403) {
        console.warn('Forbidden: Insufficient permissions for this action.');
      }
      return Promise.reject(new Error(data?.message || data?.error || `HTTP error ${status}`));
    }
    if (error.code === 'ECONNABORTED' || !error.response) {
      return Promise.reject(new Error('Backend server is unreachable. Check network or server status.'));
    }
    return Promise.reject(error);
  }
);

export default api;