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
  /**
   * When Pro trial expires, wallets created during trial
   * above the free limit can be marked as frozen extras.
   * They are excluded from total balance and cannot be edited.
   */
  isFrozenExtra?: boolean
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
