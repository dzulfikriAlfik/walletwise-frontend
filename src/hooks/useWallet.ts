/**
 * Wallet Hook
 * Provides wallet management functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWalletStore } from '@/stores/wallet.store'
import { walletService } from '@/services/wallet.service'
import { QUERY_KEYS, SUBSCRIPTION_LIMITS } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth.store'
import type { CreateWalletData, UpdateWalletData } from '@/types'
import { SubscriptionTier } from '@/types'

export const useWallets = () => {
  const queryClient = useQueryClient()
  const { wallets, setWallets, addWallet, updateWallet, removeWallet } =
    useWalletStore()
  const { user } = useAuthStore()

  /**
   * Get all wallets query
   */
  const walletsQuery = useQuery({
    queryKey: QUERY_KEYS.WALLETS,
    queryFn: async () => {
      const data = await walletService.getAll()
      setWallets(data)
      return data
    },
  })

  // Wallet summary is derived on the client from wallets to support
  // Pro trial behaviour (excluding frozen wallets) – no extra API call here.

  /**
   * Create wallet mutation
   */
  const createMutation = useMutation({
    mutationFn: walletService.create,
    onSuccess: (newWallet) => {
      addWallet(newWallet)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
    },
  })

  /**
   * Update wallet mutation
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWalletData }) =>
      walletService.update(id, data),
    onSuccess: (updatedWallet) => {
      updateWallet(updatedWallet.id, updatedWallet)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
    },
  })

  /**
   * Delete wallet mutation
   */
  const deleteMutation = useMutation({
    mutationFn: walletService.delete,
    onSuccess: (_, id) => {
      removeWallet(id)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
    },
  })

  /**
   * Determine effective subscription tier for wallet limits.
   * When Pro trial has expired, treat as Free for creation limits.
   */
  const getEffectiveTierForLimits = (): SubscriptionTier => {
    if (!user) return SubscriptionTier.FREE
    const sub = user.subscription
    const tier = (sub?.tier || 'free') as SubscriptionTier

    // Pro trial: unlimited only when endDate is in the future; treat as free when expired
    if (tier === SubscriptionTier.PRO_TRIAL) {
      const endStr = sub?.endDate
      if (endStr) {
        const end = new Date(endStr)
        const now = new Date()
        if (!Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) {
          return SubscriptionTier.FREE
        }
      }
      return SubscriptionTier.PRO_TRIAL
    }

    return tier
  }

  /**
   * Check if user can create more wallets
   */
  const canCreateWallet = (): boolean => {
    if (!user) return false

    const effectiveTier = getEffectiveTierForLimits()
    const maxWallets = SUBSCRIPTION_LIMITS[effectiveTier].MAX_WALLETS

    // Unlimited for Pro / active Pro trial / Pro+ users
    if (maxWallets === null) return true

    // Check limit when there is a numeric cap
    return wallets.length < maxWallets
  }

  /**
   * Get wallet limit info
   */
  const getWalletLimit = () => {
    if (!user) return { current: 0, max: 0, canCreate: false }

    const effectiveTier = getEffectiveTierForLimits()
    const maxWallets = SUBSCRIPTION_LIMITS[effectiveTier].MAX_WALLETS

    return {
      current: wallets.length,
      max: maxWallets,
      canCreate: canCreateWallet(),
    }
  }

  const createWallet = async (data: CreateWalletData) => {
    if (!canCreateWallet()) {
      throw new Error('Limit wallet tercapai. Upgrade ke Pro untuk wallet unlimited.')
    }
    return await createMutation.mutateAsync(data)
  }

  const updateWalletById = async (id: string, data: UpdateWalletData) => {
    return await updateMutation.mutateAsync({ id, data })
  }

  const deleteWallet = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  return {
    wallets,
    summary: undefined,
    isLoading: walletsQuery.isLoading,
    createWallet,
    updateWallet: updateWalletById,
    deleteWallet,
    canCreateWallet: canCreateWallet(),
    walletLimit: getWalletLimit(),
    refetch: walletsQuery.refetch,
  }
}
