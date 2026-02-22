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
  category: string // system key or custom category id
  amount: number
  description: string
  date: string
  createdAt: string
  updatedAt: string
  wallet?: { id: string; name: string; currency: string }
}

export interface CreateTransactionData {
  walletId: string
  type: TransactionType
  category: string // system key (e.g. 'food') or custom category id
  amount: number
  description: string
  date: string
}

export interface UpdateTransactionData {
  type?: TransactionType
  category?: string
  amount?: number
  description?: string
  date?: string
}

export interface TransactionFilters {
  walletId?: string
  type?: TransactionType
  category?: string
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
  totalIncome: number
  totalExpense: number
  balance: number
  transactionCount: number
  byCategory?: Array<{ category: string; total: number; count: number }>
}

export interface TransactionAnalytics {
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    transactionCount: number
  }
  spendingByCategory: Array<{ category: string; total: number }>
  incomeByCategory: Array<{ category: string; total: number }>
  monthlyTrend: Array<{
    month: string
    income: number
    expense: number
    balance: number
  }>
}
