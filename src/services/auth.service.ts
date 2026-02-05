/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './api/client'
import type {
  LoginCredentials,
  RegisterData,
  User,
} from '@/types'

interface AuthResponse {
  user: User
}

// Backend response structure
interface BackendUser {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  subscription: {
    tier: string
    isActive: boolean
    startDate?: string
    endDate?: string | null
  }
  createdAt?: string
  updatedAt?: string
}

// Transform backend user to frontend User type
const transformUser = (backendUser: BackendUser): User => {
  return {
    profile: {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.name,
      avatarUrl: backendUser.avatarUrl || undefined,
      createdAt: backendUser.createdAt || new Date().toISOString(),
      updatedAt: backendUser.updatedAt || new Date().toISOString(),
    },
    subscription: {
      tier: backendUser.subscription.tier as 'free' | 'pro',
      isActive: backendUser.subscription.isActive,
      startDate: backendUser.subscription.startDate || new Date().toISOString(),
      endDate: backendUser.subscription.endDate || undefined,
    },
  }
}

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<any>('/auth/login', credentials)
    // Backend now sets httpOnly cookies automatically
    return {
      user: transformUser(data.data.user),
    }
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await apiClient.post<any>('/auth/register', userData)
    // Backend now sets httpOnly cookies automatically
    return {
      user: transformUser(data.data.user),
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
    return transformUser(data.data)
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<void> => {
    await apiClient.post('/auth/refresh')
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
