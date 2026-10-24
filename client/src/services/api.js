import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
    : '/api',
  withCredentials: true, // Include HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any stale auth state — the auth store handles redirect
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  getSettings: () => api.get('/user/settings'),
  updateSettings: (data) => api.patch('/user/settings', data),
};

// Tools API
export const toolsApi = {
  getAll: (params) => api.get('/tools', { params }),
  getById: (id) => api.get(`/tools/${id}`),
  getCategories: () => api.get('/tools/categories'),
};

// Health
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
