/**
 * Wallet-related type definitions
 */

export interface Wallet {
  id: string
  userId: string
  name: string
  balance: number
  currency: string
  color?: string
  icon?: string
  createdAt: string
  updatedAt: string
}

export interface CreateWalletData {
  name: string
  balance: number
  currency: string
  color?: string
  icon?: string
}

export interface UpdateWalletData {
  name?: string
  balance?: number
  color?: string
  icon?: string
}

export interface WalletSummary {
  totalBalance: number
  walletCount: number
  currency: string
}

export interface WalletLimit {
  current: number
  max: number | null // null = unlimited for Pro users
  canCreate: boolean
}
