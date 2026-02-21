/**
 * Dashboard Page
 * Overview of finances: wallet summary, transaction summary, recent transactions
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { useWallets } from '@/hooks/useWallet'
import { useTransactions } from '@/hooks/useTransaction'
import { useAuth } from '@/hooks/useAuth'
import { QUERY_KEYS } from '@/utils/constants'
import { formatCurrency } from '@/utils/format'
import { TRANSACTION_CATEGORY_LABELS, FX_RATES, CURRENCIES } from '@/utils/constants'
import { TransactionType } from '@/types'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { wallets, isLoading: walletsLoading } = useWallets()
  const {
    transactions,
    summary,
    isLoading: transactionsLoading,
  } = useTransactions()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
  }, [queryClient])

  const selectedCurrency = (user?.settings?.currency || 'USD') as 'USD' | 'IDR'
  const currencySymbol = CURRENCIES.find((c) => c.value === selectedCurrency)?.symbol ?? selectedCurrency

  const totalBalance = wallets.reduce((sum, w) => {
    const fromRate = FX_RATES[w.currency as keyof typeof FX_RATES] ?? 1
    const toRate = FX_RATES[selectedCurrency] ?? 1
    return sum + (w.balance / fromRate) * toRate
  }, 0)

  const recentTransactions = (transactions ?? []).slice(0, 5)
  const isLoading = walletsLoading || transactionsLoading

  const formatAmount = (amount: number) =>
    `${currencySymbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-5 w-64 mt-2 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                {i === 1 && <div className="h-4 w-20 mt-2 bg-muted rounded animate-pulse" />}
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between py-3">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasData = wallets.length > 0 || (summary && summary.transactionCount > 0)

  if (!hasData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.createFirst')}</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-5xl md:text-6xl mb-4">📊</p>
            <p className="text-muted-foreground mb-6">{t('dashboard.createFirst')}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/wallets">
                <Button className="w-full sm:w-auto">{t('wallets.addWallet')}</Button>
              </Link>
              <Link to="/transactions">
                <Button variant="outline" className="w-full sm:w-auto">{t('transactions.addTransaction')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Total Balance - Most Prominent Hero Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-6 md:p-8">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t('dashboard.totalBalance')}
          </p>
          <p className="text-3xl md:text-4xl font-bold text-foreground mt-1">
            {formatAmount(totalBalance)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('wallets.totalFromWallets', { count: wallets.length })}
          </p>
        </CardContent>
      </Card>

      {/* Income vs Expense - Glanceable */}
      {summary && summary.transactionCount > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalIncome')}</p>
              <p className="text-xl md:text-2xl font-bold text-success mt-1">
                +{formatAmount(summary.totalIncome)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalExpense')}</p>
              <p className="text-xl md:text-2xl font-bold text-destructive mt-1">
                −{formatAmount(summary.totalExpense)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.netBalance')}</p>
              <p
                className={`text-xl md:text-2xl font-bold mt-1 ${
                  summary.balance >= 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                {summary.balance >= 0 ? '+' : ''}{formatAmount(summary.balance)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {summary.transactionCount} {t('transactions.title').toLowerCase()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions - Clean list, amount right-aligned */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
            <CardDescription>
              {recentTransactions.length > 0
                ? t('dashboard.recentDescription')
                : t('dashboard.noTransactions')}
            </CardDescription>
          </div>
          <Link to="/transactions">
            <Button variant="outline" size="sm">
              {t('dashboard.viewAll')}
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('dashboard.noTransactions')}</p>
              <Link to="/transactions" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  {t('transactions.addTransaction')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{tx.description}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {TRANSACTION_CATEGORY_LABELS[tx.category as keyof typeof TRANSACTION_CATEGORY_LABELS] ?? tx.category} • {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    className={`font-semibold tabular-nums shrink-0 ${
                      tx.type === TransactionType.INCOME ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {tx.type === TransactionType.INCOME ? '+' : '−'}
                    {formatCurrency(tx.amount, tx.wallet?.currency ?? 'USD')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
