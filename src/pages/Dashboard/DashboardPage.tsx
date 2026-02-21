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
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    )
  }

  const hasData = wallets.length > 0 || (summary && summary.transactionCount > 0)

  if (!hasData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-6xl mb-4">📊</p>
            <p className="text-gray-600 mb-4">{t('dashboard.createFirst')}</p>
            <div className="flex gap-4 justify-center">
              <Link to="/wallets">
                <Button>{t('wallets.addWallet')}</Button>
              </Link>
              <Link to="/transactions">
                <Button variant="outline">{t('transactions.addTransaction')}</Button>
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
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              {t('dashboard.totalBalance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {formatAmount(totalBalance)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {t('wallets.totalFromWallets', { count: wallets.length })}
            </p>
          </CardContent>
        </Card>

        {summary && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t('dashboard.totalIncome')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(summary.totalIncome)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t('dashboard.totalExpense')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {formatAmount(summary.totalExpense)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t('dashboard.netBalance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${
                    summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatAmount(summary.balance)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.transactionCount} {t('transactions.title').toLowerCase()}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
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
            <div className="text-center py-8 text-gray-500">
              <p>{t('dashboard.noTransactions')}</p>
              <Link to="/transactions" className="mt-2 inline-block">
                <Button variant="outline" size="sm">
                  {t('transactions.addTransaction')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">
                      {TRANSACTION_CATEGORY_LABELS[tx.category as keyof typeof TRANSACTION_CATEGORY_LABELS] ?? tx.category} • {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${
                      tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === TransactionType.INCOME ? '+' : '-'}
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
