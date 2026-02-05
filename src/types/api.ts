/**
 * API-related type definitions
 * Standardized request/response formats
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SortParams {
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export type QueryParams = PaginationParams & Partial<SortParams>
