import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { LOCALES, type LocaleCode } from '@/i18n'
import { CURRENCIES, QUERY_KEYS } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import type { SupportedCurrency } from '@/types'

export function SettingsDropdown() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuthStore()

  const [open, setOpen] = useState(false)

  // Safely derive initial values even when user or settings are undefined
  const initialLanguage: LocaleCode =
    (user?.settings && (user.settings.language as LocaleCode)) || 'en'
  const initialCurrency: SupportedCurrency =
    (user?.settings && user.settings.currency) || 'USD'

  const [language, setLanguage] = useState<LocaleCode>(initialLanguage)
  const [currency, setCurrency] = useState<SupportedCurrency>(initialCurrency)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (!language || !currency) {
        throw new Error('Missing settings')
      }
      const updatedUser = await authService.updateSettings({
        language,
        currency,
      })
      return updatedUser
    },
    onSuccess: (updatedUser) => {
      updateUser(updatedUser)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
      setOpen(false)
      setError('')
    },
    onError: (err: unknown) => {
      setError(
        (err as { error?: { message?: string } })?.error?.message ||
          'Failed to save settings. Please try again.',
      )
    },
  })

  const handleOpenToggle = () => {
    setOpen((prev) => !prev)
    // Reset to current stored values when opening
    if (!open && user?.settings) {
      setLanguage(user.settings.language as LocaleCode)
      setCurrency(user.settings.currency)
      setError('')
    }
  }

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as LocaleCode
    setLanguage(value)
    i18n.changeLanguage(value)
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SupportedCurrency
    setCurrency(value)
  }

  const handleSave = () => {
    mutation.mutate()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpenToggle}
        className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
      >
        {t('settings.title', 'Settings')}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-lg z-50 p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('settings.language', 'Language')}
            </label>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {LOCALES.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('settings.currency', 'Currency')}
            </label>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {CURRENCIES.filter((c) => c.value === 'USD' || c.value === 'IDR').map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? t('common.processing') : t('common.save')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

