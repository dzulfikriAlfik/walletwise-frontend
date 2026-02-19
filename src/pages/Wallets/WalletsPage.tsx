/**
 * Wallets Page
 * Wallet management with subscription-based limits
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useQueryClient } from '@tanstack/react-query'
import { useWallets } from '@/hooks/useWallet'
import { useAuth } from '@/hooks/useAuth'
import { CURRENCIES, FX_RATES, QUERY_KEYS, SUBSCRIPTION_LIMITS } from '@/utils/constants'
import { SubscriptionTier } from '@/types'

export default function WalletsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Force refetch profile on mount so subscription (incl. pro_trial endDate) is always fresh
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
  }, [queryClient])
  const {
    wallets,
    summary,
    isLoading,
    createWallet,
    updateWallet,
    deleteWallet,
    canCreateWallet,
    walletLimit,
  } = useWallets()

  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    balance: 0,
    currency: 'USD',
  })
  const [error, setError] = useState('')

  const tier = user?.subscription?.tier || 'free'
  const selectedCurrency = (user?.settings?.currency || 'USD') as 'USD' | 'IDR'

  const frozenWalletIds = useMemo(() => {
    if (!user) return new Set<string>()

    const sub = user.subscription
    if (sub.tier !== SubscriptionTier.PRO_TRIAL || !sub.endDate) {
      return new Set<string>()
    }

    const now = new Date()
    const endDate = new Date(sub.endDate)
    if (endDate > now) {
      // Trial still active – nothing frozen
      return new Set<string>()
    }

    const trialStart = new Date(sub.startDate)
    const freeLimit = SUBSCRIPTION_LIMITS[SubscriptionTier.FREE].MAX_WALLETS ?? 3

    // Determine which wallets are above the free limit and created during trial
    const sorted = [...wallets].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )

    const extraAfterFreeLimit = sorted.slice(freeLimit)
    const frozen = extraAfterFreeLimit.filter((w) => new Date(w.createdAt) >= trialStart)

    return new Set<string>(frozen.map((w) => w.id))
  }, [user, wallets])

  const walletsWithFlags = useMemo(
    () =>
      wallets.map((w) => ({
        ...w,
        isFrozenExtra: frozenWalletIds.has(w.id),
      })),
    [wallets, frozenWalletIds],
  )

  const effectiveTotalBalance = useMemo(() => {
    // Convert each wallet balance to selectedCurrency via USD as base
    return wallets.reduce((sum, w) => {
      if (frozenWalletIds.has(w.id)) return sum
      const fromRate = FX_RATES[w.currency as 'USD' | 'IDR'] ?? 1
      const toRate = FX_RATES[selectedCurrency] ?? 1
      const amountInUsd = w.balance / fromRate
      const amountInSelected = amountInUsd * toRate
      return sum + amountInSelected
    }, 0)
  }, [wallets, frozenWalletIds, selectedCurrency])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError(t('wallets.walletNameRequired'))
      return
    }
    try {
      await createWallet({
        name: form.name.trim(),
        balance: form.balance,
        currency: form.currency,
      })
      setForm({ name: '', balance: 0, currency: 'USD' })
      setIsCreating(false)
    } catch (err: unknown) {
      const apiErr = err as { error?: { code?: string; message?: string } }
      const isTrialExpired = apiErr?.error?.code === 'PRO_TRIAL_EXPIRED'
      setError(
        isTrialExpired ? t('wallets.trialExpired') : apiErr?.error?.message || t('wallets.createFailed')
      )
      if (isTrialExpired) {
        setIsCreating(false)
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WALLETS })
      }
    }
  }

  const handleUpdate = async (id: string, name: string, balance: number) => {
    setError('')
    try {
      await updateWallet(id, { name, balance })
      setEditingId(null)
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message || t('wallets.updateFailed'))
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setError('')
    setIsDeleting(true)
    try {
      await deleteWallet(deleteTarget)
      setDeleteTarget(null)
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message || t('wallets.deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) setDeleteTarget(null)
  }

  const formatCurrency = (amount: number, currency: string) => {
    const curr = CURRENCIES.find((c) => c.value === currency)
    const symbol = curr?.symbol || currency
    return `${symbol} ${amount.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('wallets.title')}</h1>
        <p className="text-gray-600 mt-1">
          {t('wallets.subtitle')} {tier === SubscriptionTier.FREE && (
            <span>
              {t('wallets.subtitleLimit', { current: walletLimit.current, max: walletLimit.max })}
              {' '}
              <Link to="/billing" className="text-blue-600 hover:underline">
                {t('wallets.upgradePro')}
              </Link>
              {' '}
              {t('wallets.forUnlimited')}
            </span>
          )}
        </p>
      </div>

      {/* Summary Card */}
      {wallets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('wallets.totalBalance')}</CardTitle>
            <CardDescription>
              {t('wallets.totalFromWallets', { count: wallets.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(effectiveTotalBalance, selectedCurrency)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Wallet - Show button or form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('wallets.walletList')}</CardTitle>
            <CardDescription>
              {canCreateWallet
                ? t('wallets.createNew')
                : t('wallets.limitReached')}
            </CardDescription>
          </div>
          {canCreateWallet && !isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              {t('wallets.addWallet')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {isCreating && (
            <form onSubmit={handleCreate} className="p-4 border rounded-lg bg-gray-50 space-y-3">
              <Input
                placeholder={t('wallets.namePlaceholder')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <div className="flex gap-3">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder={t('wallets.initialBalance')}
                  value={form.balance || ''}
                  onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
                />
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{t('common.save')}</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          )}

          {/* Wallet List */}
          <div className="space-y-3">
            {wallets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">💰</p>
                <p>{t('wallets.noWallets')}</p>
              </div>
            ) : (
              walletsWithFlags.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  {editingId === wallet.id && !wallet.isFrozenExtra ? (
                    <EditWalletForm
                      wallet={wallet}
                      onSave={(name, balance) => handleUpdate(wallet.id, name, balance)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <div>
                        <p className="font-medium text-gray-900">{wallet.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(wallet.balance, wallet.currency)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!wallet.isFrozenExtra && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(wallet.id)}
                          >
                            {t('common.edit')}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(wallet.id)}
                        >
                          {t('common.delete')}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t('wallets.deleteTitle')}
        message={t('wallets.deleteMessage')}
        confirmLabel={t('wallets.deleteConfirm')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  )
}

function EditWalletForm({
  wallet,
  onSave,
  onCancel,
}: {
  wallet: { name: string; balance: number }
  onSave: (name: string, balance: number) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(wallet.name)
  const [balance, setBalance] = useState(wallet.balance)

  return (
    <div className="flex-1 flex gap-2 items-center">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <Input
        type="number"
        min={0}
        step={0.01}
        value={balance}
        onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
        className="w-32"
      />
      <Button size="sm" onClick={() => onSave(name, balance)}>
        {t('common.save')}
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        {t('common.cancel')}
      </Button>
    </div>
  )
}
