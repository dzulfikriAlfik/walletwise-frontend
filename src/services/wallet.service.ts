/**
 * Wallet Service
 * Handles wallet-related API calls
 */

import { apiClient } from './api/client'
import type {
  Wallet,
  CreateWalletData,
  UpdateWalletData,
  WalletSummary,
} from '@/types'

export const walletService = {
  /**
   * Get all user wallets
   */
  getAll: async (): Promise<Wallet[]> => {
    const { data } = await apiClient.get<Wallet[]>('/wallets')
    return data
  },

  /**
   * Get single wallet by ID
   */
  getById: async (id: string): Promise<Wallet> => {
    const { data } = await apiClient.get<Wallet>(`/wallets/${id}`)
    return data
  },

  /**
   * Create new wallet
   */
  create: async (walletData: CreateWalletData): Promise<Wallet> => {
    const { data } = await apiClient.post<Wallet>('/wallets', walletData)
    return data
  },

  /**
   * Update wallet
   */
  update: async (id: string, walletData: UpdateWalletData): Promise<Wallet> => {
    const { data } = await apiClient.patch<Wallet>(`/wallets/${id}`, walletData)
    return data
  },

  /**
   * Delete wallet
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/wallets/${id}`)
  },

  /**
   * Get wallet summary
   */
  getSummary: async (): Promise<WalletSummary> => {
    const { data } = await apiClient.get<WalletSummary>('/wallets/summary')
    return data
  },
}
