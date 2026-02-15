/**
 * Billing Service
 * Handles subscription upgrade and plan fetching
 */

import { apiClient } from './api/client'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface BillingPlans {
  free: PlanInfo
  pro: PlanInfo & { prices: { monthly: number; yearly: number }; trialDays: number }
  pro_plus: PlanInfo & { prices: { monthly: number; yearly: number } }
}

interface PlanInfo {
  tier: string
  name: string
  maxWallets: number | null
  features: string[]
  analytics: boolean
  export: boolean
}

export interface UpgradeResult {
  subscription: {
    tier: string
    isActive: boolean
    startDate: string
    endDate: string | null
    trialEndDate: string | null
  }
  payment: {
    amount: number
    currency: string
    billingPeriod: string
    isTrial: boolean
  }
}

export const billingService = {
  getPlans: async (): Promise<BillingPlans> => {
    const { data } = await apiClient.get<ApiResponse<BillingPlans>>('/billing/plans')
    return data.data
  },

  upgrade: async (params: {
    targetTier: 'pro' | 'pro_plus'
    billingPeriod?: 'monthly' | 'yearly'
    useTrial?: boolean
  }): Promise<UpgradeResult> => {
    const { data } = await apiClient.post<ApiResponse<UpgradeResult>>('/billing/upgrade', params)
    return data.data
  },

  dummyPayment: async (params: {
    targetTier: 'pro' | 'pro_plus'
    billingPeriod?: 'monthly' | 'yearly'
  }): Promise<UpgradeResult & { paymentStatus: string; transactionId: string }> => {
    const { data } = await apiClient.post<ApiResponse<UpgradeResult & { paymentStatus: string; transactionId: string }>>(
      '/billing/dummy-payment',
      params
    )
    return data.data
  },
}
