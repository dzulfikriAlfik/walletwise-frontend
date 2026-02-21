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
import { CrudPopup } from '@/components/ui/CrudPopup'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    setIsSubmitting(true)
    try {
      await createWallet({
        name: form.name.trim(),
        balance: form.balance,
        currency: form.currency,
      })
      setForm({ name: '', balance: 0, currency: 'USD' })
      setIsCreating(false)
      setError('')
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (id: string, name: string, balance: number) => {
    setError('')
    setIsSubmitting(true)
    try {
      await updateWallet(id, { name, balance })
      setEditingId(null)
      setError('')
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message || t('wallets.updateFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreatePopup = () => {
    setError('')
    setForm({ name: '', balance: 0, currency: 'USD' })
    setIsCreating(true)
  }

  const closeCreatePopup = () => {
    setIsCreating(false)
    setError('')
  }

  const openEditPopup = (wallet: { id: string; name: string; balance: number }) => {
    setError('')
    setEditingId(wallet.id)
  }

  const closeEditPopup = () => {
    setEditingId(null)
    setError('')
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
      <div className="space-y-8">
        <div>
          <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-5 w-64 mt-2 bg-muted rounded animate-pulse" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('wallets.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('wallets.subtitle')} {tier === SubscriptionTier.FREE && (
            <span>
              {t('wallets.subtitleLimit', { current: walletLimit.current, max: walletLimit.max })}
              {' '}
              <Link to="/billing" className="text-primary hover:underline font-medium">
                {t('wallets.upgradePro')}
              </Link>
              {' '}
              {t('wallets.forUnlimited')}
            </span>
          )}
        </p>
      </div>

      {/* Summary Card - Digital wallet feel */}
      {wallets.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t('wallets.totalBalance')}</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground mt-1">
              {formatCurrency(effectiveTotalBalance, selectedCurrency)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('wallets.totalFromWallets', { count: wallets.length })}
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
          {canCreateWallet && (
            <Button onClick={openCreatePopup} className="hidden md:inline-flex">
              {t('wallets.addWallet')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Wallet List */}
          <div className="space-y-3">
            {wallets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">💰</p>
                <p className="text-muted-foreground">{t('wallets.noWallets')}</p>
              </div>
            ) : (
              walletsWithFlags.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`flex items-center justify-between p-5 rounded-xl border border-border transition-colors ${
                    wallet.isFrozenExtra ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/40'
                  }`}
                >
                  <>
                      <div>
                        <p className="font-medium text-foreground">{wallet.name}</p>
                        <p className="text-sm text-muted-foreground font-medium tabular-nums">
                          {formatCurrency(wallet.balance, wallet.currency)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!wallet.isFrozenExtra && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditPopup(wallet)}
                          >
                            {t('common.edit')}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(wallet.id)}
                        >
                          {t('common.delete')}
                        </Button>
                      </div>
                    </>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Wallet Popup */}
      <CrudPopup
        open={isCreating}
        onClose={closeCreatePopup}
        title={t('wallets.addWallet')}
        formId="create-wallet-form"
        primaryLabel={t('common.save')}
        primaryLoading={isSubmitting}
        primaryDisabled={!form.name.trim()}
        secondaryLabel={t('common.cancel')}
        onSecondaryClick={closeCreatePopup}
        error={error}
      >
        <form id="create-wallet-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('wallets.namePlaceholder')}</label>
            <Input
              placeholder={t('wallets.namePlaceholder')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('wallets.initialBalance')}</label>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder={t('wallets.initialBalance')}
              value={form.balance || ''}
              onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Currency</label>
            <select
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </form>
      </CrudPopup>

      {/* Edit Wallet Popup */}
      {(() => {
        const walletToEdit = wallets.find((w) => w.id === editingId)
        if (!walletToEdit) return null
        return (
          <EditWalletPopup
            open={!!editingId}
            wallet={walletToEdit}
            onClose={closeEditPopup}
            onSave={(name, balance) => handleUpdate(walletToEdit.id, name, balance)}
            error={error}
            isSubmitting={isSubmitting}
          />
        )
      })()}

      {/* Mobile FAB */}
      {canCreateWallet && (
        <button
          type="button"
          onClick={openCreatePopup}
          className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center text-2xl font-medium hover:bg-primary/90 active:scale-95 transition-all"
          aria-label={t('wallets.addWallet')}
        >
          +
        </button>
      )}

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

function EditWalletPopup({
  open,
  wallet,
  onClose,
  onSave,
  error,
  isSubmitting,
}: {
  open: boolean
  wallet: { name: string; balance: number }
  onClose: () => void
  onSave: (name: string, balance: number) => void
  error: string
  isSubmitting: boolean
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(wallet.name)
  const [balance, setBalance] = useState(wallet.balance)

  useEffect(() => {
    if (open) {
      setName(wallet.name)
      setBalance(wallet.balance)
    }
  }, [open, wallet.name, wallet.balance])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim(), balance)
  }

  return (
    <CrudPopup
      open={open}
      onClose={onClose}
      title={`${t('common.edit')} Wallet`}
      onPrimaryClick={handleSave}
      primaryLabel={t('common.save')}
      primaryLoading={isSubmitting}
      primaryDisabled={!name.trim()}
      secondaryLabel={t('common.cancel')}
      onSecondaryClick={onClose}
      error={error}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('wallets.namePlaceholder')}</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('wallets.initialBalance')}</label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={balance}
            onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </CrudPopup>
  )
}
