/**
 * Subscription and billing-related type definitions
 */

export interface SubscriptionPlan {
  tier: SubscriptionTier
  name: string
  price: number
  currency: string
  billingPeriod: 'monthly' | 'yearly'
  features: SubscriptionFeature[]
}

export interface SubscriptionFeature {
  name: string
  description: string
  included: boolean
}

export interface BillingHistory {
  id: string
  userId: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  date: string
  invoiceUrl?: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_transfer'
  last4?: string
  expiryDate?: string
  isDefault: boolean
}

export const SUBSCRIPTION_FEATURES: Record<string, SubscriptionFeature[]> = {
  free: [
    { name: 'Up to 3 wallets', description: 'Create up to 3 wallets', included: true },
    { name: 'Transaction tracking', description: 'Track income and expenses', included: true },
    { name: 'Basic summary', description: 'View basic financial summary', included: true },
    { name: 'Unlimited wallets', description: 'Create unlimited wallets', included: false },
    { name: 'Advanced analytics', description: 'Detailed financial insights', included: false },
    { name: 'Data export', description: 'Export data to CSV/Excel', included: false },
  ],
  pro: [
    { name: 'Unlimited wallets', description: 'Create unlimited wallets', included: true },
    { name: 'Transaction tracking', description: 'Track income and expenses', included: true },
    { name: 'Basic summary', description: 'View basic financial summary', included: true },
    { name: '7-day free trial', description: 'Try Pro free for 7 days', included: true },
    { name: 'Advanced analytics', description: 'Detailed financial insights', included: false },
    { name: 'Data export', description: 'Export data to CSV/Excel', included: false },
  ],
  pro_plus: [
    { name: 'Unlimited wallets', description: 'Create unlimited wallets', included: true },
    { name: 'Transaction tracking', description: 'Track income and expenses', included: true },
    { name: 'Advanced analytics', description: 'Detailed financial insights', included: true },
    { name: 'Data export', description: 'Export data to CSV/Excel', included: true },
  ],
}
