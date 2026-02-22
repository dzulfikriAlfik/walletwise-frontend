import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { LOCALES, type LocaleCode } from '@/i18n'
import { CURRENCIES, QUERY_KEYS } from '@/utils/constants'
import { SelectSimple } from '@/components/ui/Select'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import type { SupportedCurrency } from '@/types'

export interface SettingsDropdownProps {
  /** When true, render settings inline (no dropdown) - for mobile drawer to avoid cut-off */
  inline?: boolean
  /** Called when save succeeds - e.g. to close mobile drawer */
  onSaveSuccess?: () => void
}

export function SettingsDropdown({ inline = false, onSaveSuccess }: SettingsDropdownProps) {
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
      onSaveSuccess?.()
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

  const handleLanguageChange = (value: string) => {
    const v = value as LocaleCode
    setLanguage(v)
    i18n.changeLanguage(v)
  }

  const handleCurrencyChange = (value: string) => {
    setCurrency(value as SupportedCurrency)
  }

  const handleSave = () => {
    mutation.mutate()
  }

  const content = (
    <div className={inline ? 'w-full space-y-3' : 'absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card shadow-lg z-50 p-4 space-y-3 min-w-[200px]'}>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('settings.language', 'Language')}
            </label>
            <SelectSimple
              value={language}
              onValueChange={handleLanguageChange}
              options={LOCALES.map(({ code, label }) => ({ value: code, label }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              {t('settings.currency', 'Currency')}
            </label>
            <SelectSimple
              value={currency}
              onValueChange={handleCurrencyChange}
              options={CURRENCIES.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            {!inline && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={mutation.isPending}
              >
                {t('common.cancel')}
              </Button>
            )}
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
  )

  if (inline) {
    return (
      <div className="w-full space-y-3">
        <p className="text-sm font-medium text-foreground">{t('settings.title', 'Settings')}</p>
        {content}
      </div>
    )
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
      {open && content}
    </div>
  )
}

