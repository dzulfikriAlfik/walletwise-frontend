/**
 * User-related type definitions
 * Following IPA Level 2 standards for clear type definitions
 */

export const SubscriptionTier = {
  FREE: 'free',
  PRO: 'pro',
} as const

export type SubscriptionTier = typeof SubscriptionTier[keyof typeof SubscriptionTier]

export interface Subscription {
  tier: SubscriptionTier
  startDate: string
  endDate?: string
  isActive: boolean
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  profile: UserProfile
  subscription: Subscription
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}
