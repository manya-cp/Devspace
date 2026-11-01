import axios from 'axios';

// Support both VITE_API_BASE_URL and VITE_API_URL, defaulting to relative '/api'
const getBaseURL = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envBase && typeof envBase === 'string' && envBase.trim().length > 0) {
    return envBase.trim().replace(/\/+$/, '');
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token in Authorization: Bearer <token>
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devspace_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected endpoint, clear stale token and user
      const currentPath = window.location.pathname;
      if (
        currentPath.startsWith('/dashboard') ||
        currentPath.startsWith('/editor') ||
        currentPath.startsWith('/settings')
      ) {
        localStorage.removeItem('devspace_token');
        localStorage.removeItem('devspace_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
