/**
 * Utility functions
 * Pure functions without side effects
 */

/**
 * Format number as currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'IDR',
  locale: string = 'id-ID'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date to readable string
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' = 'short',
  locale: string = 'id-ID'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (format === 'long') {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj)
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years} tahun lalu`
  if (months > 0) return `${months} bulan lalu`
  if (days > 0) return `${days} hari lalu`
  if (hours > 0) return `${hours} jam lalu`
  if (minutes > 0) return `${minutes} menit lalu`
  return 'Baru saja'
}

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return (value / total) * 100
}

/**
 * Clamp number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}
