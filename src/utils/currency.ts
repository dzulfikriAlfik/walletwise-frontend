/**
 * Currency conversion utilities (global, used across all pages)
 * Uses FX_RATES from constants
 */

import { FX_RATES, type FxCurrency } from './constants'

/**
 * Convert amount from one currency to another.
 * Uses USD as base: amountInUsd = amount / fromRate, result = amountInUsd * toRate
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  const from = fromCurrency as FxCurrency
  const to = toCurrency as FxCurrency
  const fromRate = FX_RATES[from] ?? 1
  const toRate = FX_RATES[to] ?? 1
  const amountInUsd = amount / fromRate
  return amountInUsd * toRate
}
