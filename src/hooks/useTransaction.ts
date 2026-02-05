/**
 * Transaction Hook
 * Provides transaction management functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTransactionStore } from '@/stores/transaction.store'
import { transactionService } from '@/services/transaction.service'
import { QUERY_KEYS } from '@/utils/constants'
import type {
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  QueryParams,
} from '@/types'

export const useTransactions = (
  filters?: TransactionFilters,
  params?: QueryParams
) => {
  const queryClient = useQueryClient()
  const { transactions, setTransactions, addTransaction, updateTransaction, removeTransaction } =
    useTransactionStore()

  /**
   * Get all transactions query
   */
  const transactionsQuery = useQuery({
    queryKey: [...QUERY_KEYS.TRANSACTIONS, filters, params],
    queryFn: async () => {
      const data = await transactionService.getAll(filters, params)
      setTransactions(data.data)
      return data
    },
  })

  /**
   * Get transaction summary query
   */
  const summaryQuery = useQuery({
    queryKey: [...QUERY_KEYS.TRANSACTIONS, 'summary', filters],
    queryFn: () => transactionService.getSummary(filters),
  })

  /**
   * Create transaction mutation
   */
  const createMutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: (newTransaction) => {
      addTransaction(newTransaction)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
    },
  })

  /**
   * Update transaction mutation
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionData }) =>
      transactionService.update(id, data),
    onSuccess: (updatedTransaction) => {
      updateTransaction(updatedTransaction.id, updatedTransaction)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
    },
  })

  /**
   * Delete transaction mutation
   */
  const deleteMutation = useMutation({
    mutationFn: transactionService.delete,
    onSuccess: (_, id) => {
      removeTransaction(id)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
    },
  })

  const createTransaction = async (data: CreateTransactionData) => {
    return await createMutation.mutateAsync(data)
  }

  const updateTransactionById = async (id: string, data: UpdateTransactionData) => {
    return await updateMutation.mutateAsync({ id, data })
  }

  const deleteTransaction = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  return {
    transactions: transactionsQuery.data?.data || transactions,
    pagination: transactionsQuery.data?.pagination,
    summary: summaryQuery.data,
    isLoading: transactionsQuery.isLoading,
    createTransaction,
    updateTransaction: updateTransactionById,
    deleteTransaction,
    refetch: transactionsQuery.refetch,
  }
}
