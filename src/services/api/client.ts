/**
 * Axios client configuration
 * Base HTTP client with interceptors
 */

import axios, { type AxiosInstance, AxiosError } from 'axios'
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
  withCredentials: true, // Important: send cookies with requests
})

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
      // Try to refresh token
      try {
        await apiClient.post('/auth/refresh')
        // Retry original request
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
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
