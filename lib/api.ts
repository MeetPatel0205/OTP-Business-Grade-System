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
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/login', data),
  
  logout: () =>
    api.post('/logout'),
  
  getUser: () =>
    api.get('/user'),
};

export const otpAPI = {
  sendOtp: (email: string) =>
    api.post('/send-otp', { email }),
  
  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/verify-otp', data),
  
  resendOtp: (email: string) =>
    api.post('/resend-otp', { email }),
};

export default api;
