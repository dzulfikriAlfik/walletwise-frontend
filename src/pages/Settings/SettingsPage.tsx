/**
 * Settings Page
 * Full page for user preferences and app configuration
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LOCALES, type LocaleCode } from '@/i18n'
import { CURRENCIES } from '@/utils/constants'
import {
  TRANSACTION_TIME_RANGES,
  FIRST_DAY_OF_WEEK_OPTIONS,
  QUERY_KEYS,
} from '@/utils/constants'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import { useFxRates } from '@/hooks/useFxRates'
import type { SupportedCurrency, TransactionTimeRange, FirstDayOfWeek } from '@/types'
import { format, parseISO } from 'date-fns'
import { SelectSimple } from '@/components/ui/Select'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuthStore()
  const { rates, updatedAt, isRefreshing, refreshError, refresh } = useFxRates()

  const [language, setLanguage] = useState<LocaleCode>('en')
  const [currency, setCurrency] = useState<SupportedCurrency>('USD')
  const [transactionTimeRange, setTransactionTimeRange] =
    useState<TransactionTimeRange>('weekly')
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<FirstDayOfWeek>(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.settings) {
      setLanguage((user.settings.language as LocaleCode) ?? 'en')
      setCurrency(user.settings.currency ?? 'USD')
      setTransactionTimeRange(user.settings.transactionTimeRange ?? 'weekly')
      setFirstDayOfWeek(user.settings.firstDayOfWeek ?? 0)
    }
  }, [user?.settings])

  const mutation = useMutation({
    mutationFn: async () => {
      const updatedUser = await authService.updateSettings({
        language,
        currency,
        transactionTimeRange,
        firstDayOfWeek,
      })
      return updatedUser
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS })
      i18n.changeLanguage(language)
      setError('')
    },
    onError: (err: unknown) => {
      setError(
        (err as { error?: { message?: string } })?.error?.message ??
          'Failed to save settings.'
      )
    },
  })

  const handleSave = () => {
    mutation.mutate()
  }

  const handleRefreshFxRates = async () => {
    try {
      await refresh()
    } catch {
      // Error shown via refreshError
    }
  }

  const fxRatesDate = updatedAt
    ? format(parseISO(updatedAt), 'dd MMM yyyy HH:mm')
    : '—'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('settings.title', 'Settings')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('settings.subtitle', 'Manage your preferences and app configuration')}
        </p>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.general', 'General')}</CardTitle>
          <CardDescription>
            {t('settings.generalDesc', 'Language and currency preferences')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('settings.language', 'Language')}
            </label>
            <SelectSimple
              value={language}
              onValueChange={(v) => setLanguage(v as LocaleCode)}
              options={LOCALES.map(({ code, label }) => ({ value: code, label }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('settings.currency', 'Currency')}
            </label>
            <SelectSimple
              value={currency}
              onValueChange={(v) => setCurrency(v as SupportedCurrency)}
              options={CURRENCIES.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Transaction Display */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.transactionDisplay', 'Transaction Display')}</CardTitle>
          <CardDescription>
            {t('settings.transactionDisplayDesc', 'How transactions are grouped on the Transactions page')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('settings.timeRangeLabel', 'Time Range')}
            </label>
            <SelectSimple
              value={transactionTimeRange}
              onValueChange={(v) => setTransactionTimeRange(v as TransactionTimeRange)}
              options={TRANSACTION_TIME_RANGES.map((opt) => ({
                value: opt.value,
                label: t(opt.labelKey),
              }))}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('settings.timeRangeHint', 'Daily: 7 days. Weekly: weeks of current month. Monthly: months of current year.')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('settings.firstDayOfWeekLabel', 'First Day of Week')}
            </label>
            <SelectSimple
              value={String(firstDayOfWeek)}
              onValueChange={(v) => setFirstDayOfWeek(parseInt(v, 10) as FirstDayOfWeek)}
              options={FIRST_DAY_OF_WEEK_OPTIONS.map((opt) => ({
                value: String(opt.value),
                label: t(opt.labelKey),
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rates */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.exchangeRates', 'Exchange Rates')}</CardTitle>
          <CardDescription>
            {t('settings.exchangeRatesDesc', 'Update currency conversion rates from a free API')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t('settings.lastUpdated', 'Last updated')}: {fxRatesDate}
              </p>
              {Object.keys(rates).length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.keys(rates).slice(0, 5).join(', ')}
                  {Object.keys(rates).length > 5 ? '…' : ''}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleRefreshFxRates}
              disabled={isRefreshing}
            >
              {isRefreshing
                ? t('common.processing')
                : t('settings.updateRates', 'Update Rates')}
            </Button>
          </div>
          {refreshError && (
            <p className="text-sm text-destructive mt-2">
              {(refreshError as { error?: { message?: string } })?.error?.message ??
                'Failed to update rates'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        {error && <p className="text-sm text-destructive mr-4 self-center">{error}</p>}
        <Button onClick={handleSave} disabled={mutation.isPending}>
          {mutation.isPending ? t('common.processing') : t('common.save')}
        </Button>
      </div>
    </div>
  )
}
