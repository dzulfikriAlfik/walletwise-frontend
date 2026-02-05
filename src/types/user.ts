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

// AuthTokens type kept for backward compatibility but no longer used in auth flow
// Tokens are now stored in httpOnly cookies
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

// AuthResponse no longer includes tokens as they are handled via httpOnly cookies
export interface AuthResponse {
  user: User
}
