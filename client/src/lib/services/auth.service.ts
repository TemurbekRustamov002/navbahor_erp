// Authentication Service
import { apiClient, setAuthToken } from '../api';
import { simpleApiClient } from '../apiClient';
import { User } from '@/types/auth';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expires_in?: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<{ user: User; token: AuthToken }> {
    try {
      // Try simple API client first (no auth required for login)
      const response = await simpleApiClient.post<LoginResponse>('/auth/login', credentials);

      // Transform backend response to frontend format
      const token: AuthToken = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || '',
        expiresIn: response.expires_in || 3600,
        tokenType: 'Bearer'
      };

      // Set token for future requests
      setAuthToken(response.accessToken);

      return {
        user: response.user,
        token
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Noto\'g\'ri foydalanuvchi nomi yoki parol');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<{ user: User; token: AuthToken }> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', userData);

      const token: AuthToken = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || '',
        expiresIn: response.expires_in || 3600,
        tokenType: 'Bearer'
      };

      setAuthToken(response.accessToken);

      return {
        user: response.user,
        token
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
        refreshToken: refreshToken
      });

      const newToken: AuthToken = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: 3600,
        tokenType: 'Bearer'
      };

      setAuthToken(response.accessToken);

      return newToken;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors, clear token anyway
      console.warn('Logout API call failed:', error);
    } finally {
      setAuthToken(null);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/profile');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get current user');
    }
  }
}

export const authService = new AuthService();