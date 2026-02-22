/**
 * Transaction Service
 * Handles transaction-related API calls
 * Backend returns { success, data } - we extract data
 */

import { apiClient } from './api/client'
import type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionSummary,
  TransactionAnalytics,
  PaginatedResponse,
  QueryParams,
} from '@/types'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const transactionService = {
  /**
   * Get all transactions with optional filters
   */
  getAll: async (
    filters?: TransactionFilters,
    _params?: QueryParams
  ): Promise<PaginatedResponse<Transaction>> => {
    const { data } = await apiClient.get<ApiResponse<Transaction[]>>(
      '/transactions',
      { params: filters }
    )
    const list = data.data
    return {
      data: list,
      pagination: {
        page: 1,
        limit: list.length,
        total: list.length,
        totalPages: 1,
      },
    }
  },

  /**
   * Get single transaction by ID
   */
  getById: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`)
    return data.data
  },

  /**
   * Create new transaction
   */
  create: async (transactionData: CreateTransactionData): Promise<Transaction> => {
    const { data } = await apiClient.post<ApiResponse<Transaction>>(
      '/transactions',
      transactionData
    )
    return data.data
  },

  /**
   * Update transaction
   */
  update: async (
    id: string,
    transactionData: UpdateTransactionData
  ): Promise<Transaction> => {
    const { data } = await apiClient.patch<ApiResponse<Transaction>>(
      `/transactions/${id}`,
      transactionData
    )
    return data.data
  },

  /**
   * Delete transaction
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/transactions/${id}`)
  },

  /**
   * Get transaction summary
   */
  getSummary: async (filters?: TransactionFilters): Promise<TransactionSummary> => {
    const { data } = await apiClient.get<ApiResponse<TransactionSummary>>(
      '/transactions/summary',
      { params: filters }
    )
    return data.data
  },

  /**
   * Get analytics (Pro+ only)
   */
  getAnalytics: async (filters?: TransactionFilters): Promise<TransactionAnalytics> => {
    const { data } = await apiClient.get<ApiResponse<TransactionAnalytics>>(
      '/transactions/analytics',
      { params: filters }
    )
    return data.data
  },

  /**
   * Export transactions as CSV or Excel (Pro+ only)
   * Returns blob for download
   */
  exportTransactions: async (
    format: 'csv' | 'excel',
    filters?: TransactionFilters
  ): Promise<Blob> => {
    const params = new URLSearchParams({ format })
    if (filters?.walletId) params.set('walletId', filters.walletId)
    if (filters?.type) params.set('type', filters.type)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.startDate) params.set('startDate', filters.startDate)
    if (filters?.endDate) params.set('endDate', filters.endDate)
    const res = await apiClient.get(`/transactions/export?${params}`, {
      responseType: 'blob',
    })
    return res.data as Blob
  },
}
