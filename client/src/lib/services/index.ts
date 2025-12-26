// Centralized API Services Export
export { authService } from './auth.service';
export { toysService } from './toys.service';
export { markasService } from './markas.service';
export { customersService } from './customers.service';
export { labService } from './lab.service';
export { scaleService } from './scale.service';

// Re-export API client
export { apiClient, setAuthToken, API_BASE_URL, WS_URL } from '../api';

// Service utilities
export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1'}/health`, {
      method: 'GET',
      timeout: 5000
    } as any);
    return true;
  } catch {
    return false;
  }
};

export const getDemoMode = (): boolean => {
  return false;
};

export const getWebSocketsEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS === 'true';
};

export const getRealTimeEnabled = (): boolean => {
  return process.env.NEXT_PUBLIC_ENABLE_REAL_TIME === 'true';
};