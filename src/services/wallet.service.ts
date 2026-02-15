/**
 * Wallet Service
 * Handles wallet-related API calls
 * Backend returns { success, data } - we extract data
 */

import { apiClient } from './api/client'
import type {
  Wallet,
  CreateWalletData,
  UpdateWalletData,
  WalletSummary,
} from '@/types'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const walletService = {
  getAll: async (): Promise<Wallet[]> => {
    const { data } = await apiClient.get<ApiResponse<Wallet[]>>('/wallets')
    return data.data
  },

  getById: async (id: string): Promise<Wallet> => {
    const { data } = await apiClient.get<ApiResponse<Wallet>>(`/wallets/${id}`)
    return data.data
  },

  create: async (walletData: CreateWalletData): Promise<Wallet> => {
    const { data } = await apiClient.post<ApiResponse<Wallet>>('/wallets', walletData)
    return data.data
  },

  update: async (id: string, walletData: UpdateWalletData): Promise<Wallet> => {
    const { data } = await apiClient.patch<ApiResponse<Wallet>>(`/wallets/${id}`, walletData)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/wallets/${id}`)
  },

  getSummary: async (): Promise<WalletSummary> => {
    const { data } = await apiClient.get<ApiResponse<WalletSummary>>('/wallets/summary')
    const d = data.data as Record<string, unknown>
    return {
      totalBalance: d.totalBalance as number,
      walletCount: d.totalWallets as number,
      currency: 'USD',
    } as WalletSummary
  },
}
