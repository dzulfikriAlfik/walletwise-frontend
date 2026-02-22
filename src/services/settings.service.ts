/**
 * Settings Service
 * API calls for settings (FX rates, etc.)
 */

import { apiClient } from './api/client'

export interface FxRatesResponse {
  baseCode: string
  rates: Record<string, number>
  updatedAt: string
}

export const settingsService = {
  /**
   * Get current FX rates from cache
   */
  getFxRates: async (): Promise<FxRatesResponse> => {
    const { data } = await apiClient.get<{ success: boolean; data: FxRatesResponse }>(
      '/settings/fx-rates'
    )
    return data.data
  },

  /**
   * Refresh FX rates from external API (requires auth)
   */
  refreshFxRates: async (): Promise<FxRatesResponse> => {
    const { data } = await apiClient.post<{
      success: boolean
      data: FxRatesResponse
      message?: string
    }>('/settings/fx-rates/refresh')
    return data.data
  },
}
