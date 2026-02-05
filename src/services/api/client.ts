/**
 * Axios client configuration
 * Base HTTP client with interceptors
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_CONFIG } from '@/utils/constants'
import type { ApiError } from '@/types'

/**
 * Create axios instance with default config
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor
 * Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage or store
    const authStorage = localStorage.getItem('auth-storage')
    
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage)
        const token = state?.tokens?.accessToken

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Failed to parse auth storage:', error)
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor
 * Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && originalRequest) {
      // TODO: Implement token refresh logic
      // For now, clear auth and redirect to login
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        },
      } as ApiError)
    }

    // Return formatted error
    return Promise.reject(error.response?.data || error)
  }
)
