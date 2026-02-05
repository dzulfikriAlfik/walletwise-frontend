/**
 * Transaction-related type definitions
 */

export const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const

export type TransactionType = typeof TransactionType[keyof typeof TransactionType]

export const TransactionCategory = {
  // Income categories
  SALARY: 'salary',
  FREELANCE: 'freelance',
  INVESTMENT: 'investment',
  OTHER_INCOME: 'other_income',
  
  // Expense categories
  FOOD: 'food',
  TRANSPORT: 'transport',
  ENTERTAINMENT: 'entertainment',
  BILLS: 'bills',
  SHOPPING: 'shopping',
  HEALTH: 'health',
  EDUCATION: 'education',
  OTHER_EXPENSE: 'other_expense',
} as const

export type TransactionCategory = typeof TransactionCategory[keyof typeof TransactionCategory]

export interface Transaction {
  id: string
  walletId: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionData {
  walletId: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  date: string
}

export interface UpdateTransactionData {
  type?: TransactionType
  category?: TransactionCategory
  amount?: number
  description?: string
  date?: string
}

export interface TransactionFilters {
  walletId?: string
  type?: TransactionType
  category?: TransactionCategory
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export const TransactionPeriod = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const

export type TransactionPeriod = typeof TransactionPeriod[keyof typeof TransactionPeriod]

export interface TransactionSummary {
  period: TransactionPeriod
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactionCount: number
}
