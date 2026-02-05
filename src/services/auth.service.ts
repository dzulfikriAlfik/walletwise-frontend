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
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', userData)
    return data
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
    const { data } = await apiClient.get<User>('/auth/profile')
    return data
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    })
    return data
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
