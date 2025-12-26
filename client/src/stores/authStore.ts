'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Role, LoginRequest, LoginResponse } from '@/types/auth'
import { apiClient, setAuthToken } from '@/lib/api'
import { simpleApiClient } from '@/lib/apiClient'
import { Permission, getRolePermissions } from '@/lib/permissions'

interface AuthState {
  // State
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  permissions: Permission[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Backend connection
  backendConnected: boolean
  isDemoMode: boolean

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>
  logout: () => void
  refreshAuth: () => Promise<boolean>
  checkAuthStatus: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  clearError: () => void
  setBackendStatus: (connected: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      backendConnected: true,
      isDemoMode: false,

      // Unified Login function
      login: async (credentials: LoginRequest): Promise<boolean> => {
        set({ isLoading: true, error: null })

        try {
          // Try backend authentication
          const response = await apiClient.post<LoginResponse>('/auth/login', credentials)

          // CRITICAL: Sync with API client headers
          setAuthToken(response.accessToken)

          // Also set in localStorage for extra safety / other parts of app
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth-token', response.accessToken);
          }

          const user = response.user as User
          const permissions = getRolePermissions(user.role as Role)

          set({
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken || null,
            permissions,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isDemoMode: false,
            backendConnected: true
          })

          return true
        } catch (backendError: any) {
          console.error('Backend login failed:', backendError.message)

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            permissions: [],
            isAuthenticated: false,
            isLoading: false,
            error: 'Login yoki parol noto\'g\'ri',
            backendConnected: false,
            isDemoMode: false
          })

          return false
        }
      },

      // Unified Logout
      logout: () => {
        setAuthToken(null)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          permissions: [],
          isAuthenticated: false,
          error: null,
          isDemoMode: false
        })
      },

      // Refresh token
      refreshAuth: async (): Promise<boolean> => {
        const { refreshToken, isDemoMode } = get()

        if (isDemoMode) return true

        if (!refreshToken) {
          get().logout()
          return false
        }

        try {
          const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
            refreshToken
          })

          setAuthToken(response.accessToken)
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth-token', response.accessToken);
          }

          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            backendConnected: true,
            error: null
          })

          return true
        } catch (error) {
          get().logout()
          return false
        }
      },

      // Check authentication status
      checkAuthStatus: async () => {
        const { user, accessToken, isDemoMode } = get()

        if (!user || !accessToken) {
          set({ isAuthenticated: false })
          return
        }

        if (isDemoMode) {
          set({ isAuthenticated: true, backendConnected: false })
          return
        }

        try {
          // Sync token before checking
          setAuthToken(accessToken)

          // Verify with backend
          await apiClient.get('/auth/profile')
          set({
            isAuthenticated: true,
            backendConnected: true,
            error: null
          })
        } catch (error) {
          // Try to refresh token
          const refreshSuccess = await get().refreshAuth()
          if (!refreshSuccess) {
            get().logout()
          }
        }
      },

      // Permission helpers
      hasPermission: (permission: Permission): boolean => {
        const { permissions } = get()
        return permissions.includes(permission)
      },

      hasAnyPermission: (requiredPermissions: Permission[]): boolean => {
        const { permissions } = get()
        return requiredPermissions.some(p => permissions.includes(p))
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // Set backend connection status
      setBackendStatus: (connected: boolean) => {
        set({ backendConnected: connected })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
        backendConnected: state.backendConnected
      })
    }
  )
)