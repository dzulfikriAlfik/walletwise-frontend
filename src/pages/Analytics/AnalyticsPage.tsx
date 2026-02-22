/**
 * Analytics Page (Pro+)
 * Spending by category, income vs expense trends, monthly breakdown
 */

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { useWallets } from '@/hooks/useWallet'
import { useAuth } from '@/hooks/useAuth'
import { transactionService } from '@/services/transaction.service'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/utils/format'
import { TRANSACTION_CATEGORY_LABELS } from '@/utils/constants'
import { SUBSCRIPTION_LIMITS } from '@/utils/constants'
import { SubscriptionTier } from '@/types'
import { QUERY_KEYS } from '@/utils/constants'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { wallets } = useWallets()

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [walletId, setWalletId] = useState('')

  const selectedCurrency = (user?.settings?.currency || 'USD') as string
  const tier = user?.subscription?.tier ?? SubscriptionTier.FREE
  const canViewAnalytics = SUBSCRIPTION_LIMITS[tier]?.ANALYTICS ?? false

  const filters = useMemo(
    () => ({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      walletId: walletId || undefined,
    }),
    [startDate, endDate, walletId]
  )

  const { data: analytics, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.TRANSACTIONS, 'analytics', filters],
    queryFn: () => transactionService.getAnalytics(filters),
    enabled: canViewAnalytics,
  })

  if (!canViewAnalytics) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('analytics.title', 'Analytics')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('analytics.proPlusRequired', 'Pro+ subscription required for analytics.')}
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              {t('analytics.upgradePrompt', 'Upgrade to Pro+ to view spending by category, income trends, and monthly breakdowns.')}
            </p>
            <Link to="/billing">
              <Button>{t('analytics.upgradeToProPlus', 'Upgrade to Pro+')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('analytics.title', 'Analytics')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('analytics.subtitle', 'Spending insights and trends')}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.filters')}</CardTitle>
          <CardDescription>{t('analytics.filterDescription', 'Filter analytics by date range and wallet')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.from')}</label>
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.to')}</label>
              <DatePicker value={endDate} onChange={setEndDate} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.wallet')}</label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
              >
                <option value="">{t('transactions.allWallets')}</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-32 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ) : analytics ? (
        <>
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalIncome')}</p>
                <p className="text-xl font-bold text-success mt-1">
                  ≈ +{formatCurrency(
                    analytics.summary.totalIncome,
                    selectedCurrency
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalExpense')}</p>
                <p className="text-xl font-bold text-destructive mt-1">
                  ≈ −{formatCurrency(
                    analytics.summary.totalExpense,
                    selectedCurrency
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.netBalance')}</p>
                <p
                  className={`text-xl font-bold mt-1 ${
                    analytics.summary.balance >= 0 ? 'text-success' : 'text-destructive'
                  }`}
                >
                  ≈ {analytics.summary.balance >= 0 ? '+' : ''}
                  {formatCurrency(analytics.summary.balance, selectedCurrency)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">{t('transactions.title')}</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {analytics.summary.transactionCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Spending by Category */}
          {analytics.spendingByCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.spendingByCategory', 'Spending by Category')}</CardTitle>
                <CardDescription>{t('analytics.spendingByCategoryDesc', 'Breakdown of expenses by category')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.spendingByCategory
                    .sort((a, b) => b.total - a.total)
                    .map(({ category, total }) => (
                      <div
                        key={category}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <span className="font-medium text-foreground">
                          {TRANSACTION_CATEGORY_LABELS[category as keyof typeof TRANSACTION_CATEGORY_LABELS] ?? category}
                        </span>
                        <span className="font-semibold text-destructive tabular-nums">
                          −{formatCurrency(total, selectedCurrency)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Trend */}
          {analytics.monthlyTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.monthlyTrend', 'Monthly Trend')}</CardTitle>
                <CardDescription>{t('analytics.monthlyTrendDesc', 'Income vs expense by month')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 overflow-x-auto">
                  {analytics.monthlyTrend.map(({ month, income, expense, balance }) => (
                    <div
                      key={month}
                      className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0 min-w-[280px]"
                    >
                      <span className="text-sm font-medium text-foreground shrink-0">
                        {month}
                      </span>
                      <div className="flex gap-4 text-sm tabular-nums shrink-0">
                        <span className="text-success">+{formatCurrency(income, selectedCurrency)}</span>
                        <span className="text-destructive">−{formatCurrency(expense, selectedCurrency)}</span>
                        <span
                          className={
                            balance >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'
                          }
                        >
                          {balance >= 0 ? '+' : ''}{formatCurrency(balance, selectedCurrency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.summary.transactionCount === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {t('analytics.noData', 'No transactions in the selected period.')}
                </p>
                <Link to="/transactions" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">{t('transactions.addTransaction')}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  )
}
