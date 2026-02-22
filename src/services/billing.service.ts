/**
 * Billing Service
 * Handles subscription plans and payment creation
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

export interface CreatePaymentResult {
  paymentId: string
  gatewayRef: string
  status: string
  redirectUrl?: string
  invoiceUrl?: string
  expiresAt?: string
  message?: string
  subscription?: {
    tier: string
    isActive: boolean
    endDate: string
  }
}

export const billingService = {
  getPlans: async (): Promise<BillingPlans> => {
    const { data } = await apiClient.get<ApiResponse<BillingPlans>>('/billing/plans')
    return data.data
  },

  createPayment: async (params: {
    targetTier: 'pro_trial' | 'pro' | 'pro_plus'
    billingPeriod: 'monthly' | 'yearly'
    gateway: 'stripe' | 'xendit'
    method: 'card' | 'invoice' | 'va' | 'ewallet' | 'qris'
  }): Promise<CreatePaymentResult> => {
    const { data } = await apiClient.post<ApiResponse<CreatePaymentResult>>('/payments/create', params)
    return data.data
  },
}
