/**
 * Transaction Service
 * Handles transaction-related API calls
 */

import { apiClient } from './api/client'
import type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionSummary,
  PaginatedResponse,
  QueryParams,
} from '@/types'

export const transactionService = {
  /**
   * Get all transactions with optional filters
   */
  getAll: async (
    filters?: TransactionFilters,
    params?: QueryParams
  ): Promise<PaginatedResponse<Transaction>> => {
    const { data } = await apiClient.get<PaginatedResponse<Transaction>>(
      '/transactions',
      {
        params: { ...filters, ...params },
      }
    )
    return data
  },

  /**
   * Get single transaction by ID
   */
  getById: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.get<Transaction>(`/transactions/${id}`)
    return data
  },

  /**
   * Create new transaction
   */
  create: async (transactionData: CreateTransactionData): Promise<Transaction> => {
    const { data } = await apiClient.post<Transaction>(
      '/transactions',
      transactionData
    )
    return data
  },

  /**
   * Update transaction
   */
  update: async (
    id: string,
    transactionData: UpdateTransactionData
  ): Promise<Transaction> => {
    const { data } = await apiClient.patch<Transaction>(
      `/transactions/${id}`,
      transactionData
    )
    return data
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
    const { data } = await apiClient.get<TransactionSummary>(
      '/transactions/summary',
      {
        params: filters,
      }
    )
    return data
  },

  /**
   * Get transactions by wallet
   */
  getByWallet: async (
    walletId: string,
    params?: QueryParams
  ): Promise<PaginatedResponse<Transaction>> => {
    const { data } = await apiClient.get<PaginatedResponse<Transaction>>(
      `/wallets/${walletId}/transactions`,
      {
        params,
      }
    )
    return data
  },
}
