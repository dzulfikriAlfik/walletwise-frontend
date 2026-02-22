/**
 * Application constants
 */

import { SubscriptionTier, TransactionCategory } from '@/types'

/** Build mode: development | production */
export const APP_MODE = import.meta.env.MODE

/** Whether running in production (used when building with .env.production) */
export const IS_PRODUCTION = APP_MODE === 'production'

/**
 * API Configuration
 * Values from .env (dev) or .env.production (prod build)
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
} as const

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
  USER_PREFERENCES: 'user-preferences',
} as const

/**
 * Route Paths
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  WALLETS: '/wallets',
  TRANSACTIONS: '/transactions',
  ANALYTICS: '/analytics',
  BILLING: '/billing',
  CATEGORIES: '/categories',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const

/**
 * Subscription Limits
 * free: 3 wallets
 * pro_trial: unlimited (while trial active)
 * pro: unlimited
 * pro_plus: unlimited + analytics + export
 */
export const SUBSCRIPTION_LIMITS = {
  [SubscriptionTier.FREE]: {
    MAX_WALLETS: 3,
    ANALYTICS: false,
    EXPORT: false,
    CUSTOM_CATEGORIES: false,
  },
  [SubscriptionTier.PRO_TRIAL]: {
    MAX_WALLETS: null, // unlimited during active trial (handled via trial dates)
    ANALYTICS: false,
    EXPORT: false,
    CUSTOM_CATEGORIES: true, // while trial active (expired = same as free)
  },
  [SubscriptionTier.PRO]: {
    MAX_WALLETS: null, // unlimited
    ANALYTICS: false,
    EXPORT: false,
    CUSTOM_CATEGORIES: true,
  },
  [SubscriptionTier.PRO_PLUS]: {
    MAX_WALLETS: null, // unlimited
    ANALYTICS: true,
    EXPORT: true,
    CUSTOM_CATEGORIES: true,
  },
} as const

/**
 * Transaction Category Labels
 */
export const TRANSACTION_CATEGORY_LABELS: Record<TransactionCategory, string> = {
  // Income
  [TransactionCategory.SALARY]: 'Gaji',
  [TransactionCategory.FREELANCE]: 'Freelance',
  [TransactionCategory.INVESTMENT]: 'Investasi',
  [TransactionCategory.OTHER_INCOME]: 'Pendapatan Lain',
  
  // Expense
  [TransactionCategory.FOOD]: 'Makanan & Minuman',
  [TransactionCategory.TRANSPORT]: 'Transportasi',
  [TransactionCategory.ENTERTAINMENT]: 'Hiburan',
  [TransactionCategory.BILLS]: 'Tagihan',
  [TransactionCategory.SHOPPING]: 'Belanja',
  [TransactionCategory.HEALTH]: 'Kesehatan',
  [TransactionCategory.EDUCATION]: 'Pendidikan',
  [TransactionCategory.OTHER_EXPENSE]: 'Pengeluaran Lain',
}

/**
 * Currency Options
 */
export const CURRENCIES = [
  { value: 'IDR', label: 'Rupiah (IDR)', symbol: 'Rp' },
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
] as const

/**
 * Approximate FX rates relative to USD (global, used across all pages)
 * 1 USD = FX_RATES[code] units of that currency
 */
export const FX_RATES = {
  USD: 1,
  IDR: 16862,
  EUR: 0.92,
} as const

export type FxCurrency = keyof typeof FX_RATES

/**
 * Date Format Patterns
 */
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
} as const

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

/**
 * Query Keys for React Query
 */
export const QUERY_KEYS = {
  AUTH: ['auth'],
  USER: ['user'],
  WALLETS: ['wallets'],
  WALLET: (id: string) => ['wallet', id],
  TRANSACTIONS: ['transactions'],
  TRANSACTION: (id: string) => ['transaction', id],
  CATEGORIES: ['categories'],
  SUBSCRIPTION: ['subscription'],
  FX_RATES: ['fx-rates'],
} as const

/** Transaction time range options (Money Lover style) */
export const TRANSACTION_TIME_RANGES = [
  { value: 'daily' as const, labelKey: 'settings.timeRange.daily' },
  { value: 'weekly' as const, labelKey: 'settings.timeRange.weekly' },
  { value: 'monthly' as const, labelKey: 'settings.timeRange.monthly' },
] as const

/** First day of week options (0=Sunday, 1=Monday, ...) */
export const FIRST_DAY_OF_WEEK_OPTIONS = [
  { value: 0 as const, labelKey: 'settings.firstDayOfWeek.sunday' },
  { value: 1 as const, labelKey: 'settings.firstDayOfWeek.monday' },
  { value: 2 as const, labelKey: 'settings.firstDayOfWeek.tuesday' },
  { value: 3 as const, labelKey: 'settings.firstDayOfWeek.wednesday' },
  { value: 4 as const, labelKey: 'settings.firstDayOfWeek.thursday' },
  { value: 5 as const, labelKey: 'settings.firstDayOfWeek.friday' },
  { value: 6 as const, labelKey: 'settings.firstDayOfWeek.saturday' },
] as const
