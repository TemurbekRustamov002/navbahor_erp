// Simple API Client without authentication requirements
import axios, { AxiosInstance } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

// Create simple axios instance
const simpleApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple response interceptor for error handling
simpleApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Simple API methods that work without auth
export const simpleApiClient = {
  get: async <T = any>(url: string) => {
    try {
      const response = await simpleApi.get<T>(url);
      return response.data;
    } catch (error) {
      console.error(`GET ${url} failed:`, error);
      throw error;
    }
  },

  post: async <T = any>(url: string, data?: any) => {
    try {
      const response = await simpleApi.post<T>(url, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} failed:`, error);
      throw error;
    }
  },

  put: async <T = any>(url: string, data?: any) => {
    try {
      const response = await simpleApi.put<T>(url, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} failed:`, error);
      throw error;
    }
  },

  delete: async <T = any>(url: string) => {
    try {
      const response = await simpleApi.delete<T>(url);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} failed:`, error);
      throw error;
    }
  }
};

export { API_BASE_URL };