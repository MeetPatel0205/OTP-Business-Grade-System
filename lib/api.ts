import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  // Register/Login now just initiates OTP
  sendOtp: (email: string, name?: string) =>
    api.post('/auth/send-otp', { email, name }),

  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }),

  resendOtp: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  logout: () =>
    api.post('/auth/logout'),

  getUser: () =>
    api.get('/auth/user'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  get: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  updateRole: (userId: number, role: string) => api.put(`/users/${userId}/role`, { role }),
  getAuditLogs: (id: number) => api.get(`/users/${id}/audit`),
};

export const roleAPI = {
  getAll: () => api.get('/roles'),
  getAssignable: () => api.get('/roles/assignable'),
  getPermissions: () => api.get('/roles/permissions'),
};

export const businessAPI = {
  getAll: () => api.get('/business'),
  get: (id: number) => api.get(`/business/${id}`),
  create: (data: any) => api.post('/business', data),
  update: (id: number, data: any) => api.put(`/business/${id}`, data),
  delete: (id: number) => api.delete(`/business/${id}`),
  getAudit: (id: number) => api.get(`/business/${id}/audit`),
};

// Deprecate standalone otpAPI and passwordAPI in favor of authAPI for this new flow
// or keep them if other parts use them, but pointing to new endpoints?
// Plan says "Update api.ts".
// Better to export authAPI as the main interface.

export default api;
