/**
 * Transaction grouping utilities (Money Lover style)
 * Computes date range buckets for daily, weekly, and monthly views
 */

import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  format,
  parseISO,
  isWithinInterval,
  startOfWeek,
} from 'date-fns'
import type { TransactionTimeRange } from '@/types'

export interface DateRangeBucket {
  id: string
  label: string
  startDate: Date
  endDate: Date
}

/** 0=Sunday, 1=Monday, ... 6=Saturday */
type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

const DAY_NAMES: Record<FirstDayOfWeek, number> = {
  0: 0, // Sunday
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
}

/**
 * Get start of week for a given date, with configurable first day
 */
function getStartOfWeek(d: Date, firstDay: FirstDayOfWeek): Date {
  return startOfWeek(d, { weekStartsOn: DAY_NAMES[firstDay] as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
}

/**
 * Daily: 7 days starting from first day of current week
 */
function getDailyBuckets(firstDayOfWeek: FirstDayOfWeek): DateRangeBucket[] {
  const now = new Date()
  const weekStart = getStartOfWeek(now, firstDayOfWeek)
  const buckets: DateRangeBucket[] = []

  for (let i = 0; i < 7; i++) {
    const d = addDays(weekStart, i)
    const next = addDays(d, 1)
    buckets.push({
      id: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEEE, d MMM yyyy'),
      startDate: d,
      endDate: new Date(next.getTime() - 1),
    })
  }
  return buckets
}

/**
 * Weekly: weeks of current month (Week 1: 1-7, Week 2: 8-14, etc.)
 */
function getWeeklyBuckets(): DateRangeBucket[] {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const buckets: DateRangeBucket[] = []
  let weekNum = 1
  let weekStart = new Date(monthStart)

  while (weekStart <= monthEnd) {
    const weekEndDate = addDays(weekStart, 7)
    const end = weekEndDate > monthEnd ? monthEnd : new Date(weekEndDate.getTime() - 1)
    buckets.push({
      id: `week-${weekNum}`,
      label: `Week ${weekNum} (${format(weekStart, 'd')}-${format(end, 'd MMM')})`,
      startDate: new Date(weekStart),
      endDate: end,
    })
    weekStart = addDays(weekStart, 7)
    weekNum++
  }
  return buckets
}

/**
 * Monthly: Jan through Dec of current year
 */
function getMonthlyBuckets(): DateRangeBucket[] {
  const now = new Date()
  const year = now.getFullYear()
  const buckets: DateRangeBucket[] = []

  for (let m = 1; m <= 12; m++) {
    const d = new Date(year, m - 1, 1)
    const start = startOfMonth(d)
    const end = endOfMonth(d)
    buckets.push({
      id: format(start, 'yyyy-MM'),
      label: format(start, 'MMMM yyyy'),
      startDate: start,
      endDate: end,
    })
  }
  return buckets
}

export function getTransactionBuckets(
  timeRange: TransactionTimeRange,
  firstDayOfWeek: FirstDayOfWeek
): DateRangeBucket[] {
  switch (timeRange) {
    case 'daily':
      return getDailyBuckets(firstDayOfWeek)
    case 'weekly':
      return getWeeklyBuckets()
    case 'monthly':
      return getMonthlyBuckets()
    default:
      return getWeeklyBuckets()
  }
}

/**
 * Get overall date range for API fetch (covers all buckets)
 */
export function getDateRangeForFetch(
  timeRange: TransactionTimeRange,
  firstDayOfWeek: FirstDayOfWeek
): { startDate: string; endDate: string } {
  const buckets = getTransactionBuckets(timeRange, firstDayOfWeek)
  if (buckets.length === 0) {
    const now = new Date()
    return {
      startDate: format(startOfYear(now), 'yyyy-MM-dd'),
      endDate: format(endOfYear(now), 'yyyy-MM-dd'),
    }
  }
  const start = buckets[0]!.startDate
  const end = buckets[buckets.length - 1]!.endDate
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  }
}

/**
 * Assign a transaction to a bucket by its date
 */
export function getBucketForTransaction(
  txDate: string,
  buckets: DateRangeBucket[]
): DateRangeBucket | null {
  const d = parseISO(txDate)
  for (const b of buckets) {
    if (isWithinInterval(d, { start: b.startDate, end: b.endDate })) {
      return b
    }
  }
  return null
}
