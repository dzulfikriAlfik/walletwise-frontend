/**
 * Currency conversion utilities (global, used across all pages)
 * Uses FX_RATES from constants or optional dynamic rates
 */

import { FX_RATES } from './constants'

/**
 * Convert amount from one currency to another.
 * Uses USD as base: amountInUsd = amount / fromRate, result = amountInUsd * toRate
 * @param amount - Amount in fromCurrency
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param rates - Optional dynamic rates (from API). Falls back to FX_RATES if not provided.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates?: Record<string, number>
): number {
  const r: Record<string, number> = rates ?? { ...FX_RATES }
  const fromRate = r[fromCurrency] ?? 1
  const toRate = r[toCurrency] ?? 1
  const amountInUsd = amount / fromRate
  return amountInUsd * toRate
}
