// Professional API Client for ERP Backend Integration
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration with sanitization
const sanitize = (v?: string, fallback: string = '') => (v ?? fallback).trim();
const trimTrailingSlash = (v: string) => v.replace(/\/$/, '');

const RAW_API_BASE_URL = sanitize(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:3000/api/v1');
const RAW_WS_URL = sanitize(process.env.NEXT_PUBLIC_WS_URL, 'ws://localhost:3000');

const API_BASE_URL = trimTrailingSlash(RAW_API_BASE_URL);
const WS_URL = trimTrailingSlash(RAW_WS_URL);

console.log('🔧 API Configuration:', { API_BASE_URL, WS_URL });

// Create axios instance with default configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or auth store
    const token = authToken ||
      (typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null) ||
      (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null) ||
      (typeof window !== 'undefined' && (window as any).useAuthStore?.getState?.()?.accessToken);

    // List of endpoints that don't require authentication
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/health',
      '/warehouse/health',
      '/markas/health',
      '/lab/health',
      '/scale/health',
      '/customers/health'
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint) || config.url?.endsWith('/health')
    );

    // If no token in memory, try storage
    let currentToken = token;
    if (!currentToken && typeof window !== 'undefined') {
      // 1. Try direct keys
      currentToken = localStorage.getItem('auth-token') || localStorage.getItem('accessToken');

      // 2. Try Zustand auth-storage
      if (!currentToken) {
        try {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const parsed = JSON.parse(authStorage);
            currentToken = parsed.state?.accessToken;
          }
        } catch (e) {
          console.error('Failed to parse auth-storage');
        }
      }
    }

    // Add auth token if available and not a public endpoint
    if (currentToken && !config.headers.Authorization && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${currentToken}`;
      console.log('🔐 Adding auth token to request:', config.url);
    } else if (!currentToken && !isPublicEndpoint) {
      console.warn('⚠️ No auth token available for API request:', config.url);
    } else if (isPublicEndpoint) {
      console.log('🌐 Public endpoint, no auth required:', config.url);
    }

    // Add request timestamp for performance tracking
    (config as any).metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401 || (status === 400 && error.response?.data?.error?.code === 'UNAUTHORIZED')) {
      // Token expired or invalid - redirect to login
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        // Clear local storage tokens
        localStorage.removeItem('auth-token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('auth-storage'); // CRITICAL: Clear zustand store to stop redirect loops
        window.location.href = '/?error=unauthorized';
      }
    }

    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    api.get<T>(url, config).then(res => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, config).then(res => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, config).then(res => res.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, config).then(res => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, config).then(res => res.data),
};

export { api, API_BASE_URL, WS_URL };