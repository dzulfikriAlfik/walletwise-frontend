/**
 * Transaction Store
 * Global state for transaction management
 */

import { create } from 'zustand'
import type { Transaction, TransactionSummary } from '@/types'

interface TransactionState {
  transactions: Transaction[]
  summary: TransactionSummary | null
  isLoading: boolean
}

interface TransactionActions {
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, data: Partial<Transaction>) => void
  removeTransaction: (id: string) => void
  setSummary: (summary: TransactionSummary) => void
  setLoading: (loading: boolean) => void
  clearTransactions: () => void
}

type TransactionStore = TransactionState & TransactionActions

export const useTransactionStore = create<TransactionStore>((set) => ({
  // Initial state
  transactions: [],
  summary: null,
  isLoading: false,

  // Actions
  setTransactions: (transactions) =>
    set({ transactions, isLoading: false }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  updateTransaction: (id, data) =>
    set((state) => ({
      transactions: state.transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, ...data } : transaction
      ),
    })),

  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter(
        (transaction) => transaction.id !== id
      ),
    })),

  setSummary: (summary) =>
    set({ summary }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  clearTransactions: () =>
    set({
      transactions: [],
      summary: null,
      isLoading: false,
    }),
}))
