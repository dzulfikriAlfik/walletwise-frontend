/**
 * Wallet Store
 * Global state for wallet management
 */

import { create } from 'zustand'
import type { Wallet, WalletSummary } from '@/types'

interface WalletState {
  wallets: Wallet[]
  selectedWallet: Wallet | null
  summary: WalletSummary | null
  isLoading: boolean
}

interface WalletActions {
  setWallets: (wallets: Wallet[]) => void
  addWallet: (wallet: Wallet) => void
  updateWallet: (id: string, data: Partial<Wallet>) => void
  removeWallet: (id: string) => void
  selectWallet: (wallet: Wallet | null) => void
  setSummary: (summary: WalletSummary) => void
  setLoading: (loading: boolean) => void
  clearWallets: () => void
}

type WalletStore = WalletState & WalletActions

export const useWalletStore = create<WalletStore>((set) => ({
  // Initial state
  wallets: [],
  selectedWallet: null,
  summary: null,
  isLoading: false,

  // Actions
  setWallets: (wallets) =>
    set({ wallets, isLoading: false }),

  addWallet: (wallet) =>
    set((state) => ({
      wallets: [...state.wallets, wallet],
    })),

  updateWallet: (id, data) =>
    set((state) => ({
      wallets: state.wallets.map((wallet) =>
        wallet.id === id ? { ...wallet, ...data } : wallet
      ),
      selectedWallet:
        state.selectedWallet?.id === id
          ? { ...state.selectedWallet, ...data }
          : state.selectedWallet,
    })),

  removeWallet: (id) =>
    set((state) => ({
      wallets: state.wallets.filter((wallet) => wallet.id !== id),
      selectedWallet:
        state.selectedWallet?.id === id ? null : state.selectedWallet,
    })),

  selectWallet: (wallet) =>
    set({ selectedWallet: wallet }),

  setSummary: (summary) =>
    set({ summary }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  clearWallets: () =>
    set({
      wallets: [],
      selectedWallet: null,
      summary: null,
      isLoading: false,
    }),
}))
