/**
 * Category Hook
 * Provides category management and options for transactions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { QUERY_KEYS, SUBSCRIPTION_LIMITS } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth.store'
import type { CreateCategoryData, UpdateCategoryData } from '@/types'
import { SubscriptionTier } from '@/types'

/**
 * Get effective tier for category limits.
 * Pro Trial expired = Free (no custom categories).
 */
function getEffectiveTierForCategories(): SubscriptionTier {
  const user = useAuthStore.getState().user
  if (!user) return SubscriptionTier.FREE

  const sub = user.subscription
  const tier = (sub?.tier || 'free') as SubscriptionTier

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

export function useCategories() {
  const categoriesQuery = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: categoryService.getAll,
  })

  return {
    categoryOptions: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    refetch: categoriesQuery.refetch,
  }
}

export function useCustomCategories() {
  const queryClient = useQueryClient()

  const effectiveTier = getEffectiveTierForCategories()
  const canUseCustomCategories = SUBSCRIPTION_LIMITS[effectiveTier]?.CUSTOM_CATEGORIES ?? false

  const customQuery = useQuery({
    queryKey: [...QUERY_KEYS.CATEGORIES, 'custom'],
    queryFn: categoryService.getCustom,
    enabled: canUseCustomCategories,
  })

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES })
    },
  })

  return {
    customCategories: customQuery.data ?? [],
    isLoading: customQuery.isLoading,
    canUseCustomCategories,
    createCategory: (data: CreateCategoryData) => createMutation.mutateAsync(data),
    updateCategory: (id: string, data: UpdateCategoryData) =>
      updateMutation.mutateAsync({ id, data }),
    deleteCategory: (id: string) => deleteMutation.mutateAsync(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    refetch: customQuery.refetch,
  }
}
