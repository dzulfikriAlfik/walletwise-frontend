/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './api/client'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types'

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<any>('/auth/login', credentials)
    // Transform backend response to match frontend structure
    return {
      user: data.data.user,
      tokens: {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
    }
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await apiClient.post<any>('/auth/register', userData)
    // Transform backend response to match frontend structure
    return {
      user: data.data.user,
      tokens: {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<any>('/auth/profile')
    return data.data
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<any>('/auth/refresh', {
      refreshToken,
    })
    // Transform backend response to match frontend structure
    return {
      user: data.data.user,
      tokens: {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, newPassword })
  },
}
