/**
 * FX Rates Hook
 * Fetches and caches exchange rates for currency conversion
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settings.service'
import { QUERY_KEYS } from '@/utils/constants'
import { FX_RATES } from '@/utils/constants'

export function useFxRates() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: QUERY_KEYS.FX_RATES,
    queryFn: settingsService.getFxRates,
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  const refreshMutation = useMutation({
    mutationFn: settingsService.refreshFxRates,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.FX_RATES, data)
    },
  })

  const rates = query.data?.rates ?? (FX_RATES as Record<string, number>)
  const updatedAt = query.data?.updatedAt
  const isLoading = query.isLoading
  const isRefreshing = refreshMutation.isPending
  const refreshError = refreshMutation.error

  return {
    rates,
    updatedAt,
    isLoading,
    isRefreshing,
    refreshError,
    refresh: refreshMutation.mutateAsync,
    refetch: query.refetch,
  }
}
