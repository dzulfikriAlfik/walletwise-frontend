/**
 * Transactions Page
 * Transaction list with filters, CRUD, and summary
 */

import { useState, useMemo, useEffect } from 'react'
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
import { useWallets } from '@/hooks/useWallet'
import { useTransactions } from '@/hooks/useTransaction'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate } from '@/utils/format'
import { TRANSACTION_CATEGORY_LABELS } from '@/utils/constants'
import {
  TransactionType,
  TransactionCategory,
  type CreateTransactionData,
  type UpdateTransactionData,
  type TransactionFilters,
} from '@/types'

export default function TransactionsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { wallets } = useWallets()

  const [filters, setFilters] = useState<TransactionFilters>({})
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<CreateTransactionData>({
    walletId: '',
    type: TransactionType.EXPENSE,
    category: TransactionCategory.FOOD,
    amount: 0,
    description: '',
    date: new Date().toISOString().slice(0, 16),
  })

  const {
    transactions,
    summary,
    isLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(filters)

  const selectedCurrency = (user?.settings?.currency || 'USD') as string

  useEffect(() => {
    if (isAdding && wallets.length > 0 && !form.walletId) {
      setForm((f) => ({ ...f, walletId: wallets[0].id }))
    }
  }, [isAdding, wallets, form.walletId])

  const categoryOptions = useMemo(
    () =>
      [
        [TransactionCategory.SALARY, TransactionCategory.FREELANCE, TransactionCategory.INVESTMENT, TransactionCategory.OTHER_INCOME],
        [TransactionCategory.FOOD, TransactionCategory.TRANSPORT, TransactionCategory.ENTERTAINMENT, TransactionCategory.BILLS, TransactionCategory.SHOPPING, TransactionCategory.HEALTH, TransactionCategory.EDUCATION, TransactionCategory.OTHER_EXPENSE],
      ].flat(),
    []
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.walletId || !form.description.trim() || form.amount <= 0) {
      setError(t('transactions.createFailed'))
      return
    }
    setIsSubmitting(true)
    try {
      await createTransaction({
        ...form,
        date: new Date(form.date).toISOString(),
      })
      setForm({
        walletId: wallets[0]?.id ?? '',
        type: TransactionType.EXPENSE,
        category: TransactionCategory.FOOD,
        amount: 0,
        description: '',
        date: new Date().toISOString().slice(0, 16),
      })
      setIsAdding(false)
      setError('')
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message ?? t('transactions.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (id: string, data: UpdateTransactionData) => {
    setError('')
    setIsSubmitting(true)
    try {
      await updateTransaction(id, {
        ...data,
        ...(data.date && { date: new Date(data.date).toISOString() }),
      })
      setEditingId(null)
      setError('')
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message ?? t('transactions.updateFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const openAddPopup = () => {
    setError('')
    setForm({
      walletId: wallets[0]?.id ?? '',
      type: TransactionType.EXPENSE,
      category: TransactionCategory.FOOD,
      amount: 0,
      description: '',
      date: new Date().toISOString().slice(0, 16),
    })
    setIsAdding(true)
  }

  const closeAddPopup = () => {
    setIsAdding(false)
    setError('')
  }

  const openEditPopup = (tx: { id: string }) => {
    setError('')
    setEditingId(tx.id)
  }

  const closeEditPopup = () => {
    setEditingId(null)
    setError('')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setError('')
    setIsDeleting(true)
    try {
      await deleteTransaction(deleteTarget)
      setDeleteTarget(null)
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message ?? t('transactions.deleteFailed'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    if (!isDeleting) setDeleteTarget(null)
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
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('transactions.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('transactions.subtitle')}</p>
      </div>

      {/* Summary - Glanceable income vs expense */}
      {summary && summary.transactionCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('transactions.summary')}</CardTitle>
            <CardDescription>
              {summary.transactionCount} {t('transactions.title').toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalIncome')}</p>
                <p className="text-xl font-bold text-success mt-1">
                  +{formatCurrency(summary.totalIncome, selectedCurrency)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.totalExpense')}</p>
                <p className="text-xl font-bold text-destructive mt-1">
                  −{formatCurrency(summary.totalExpense, selectedCurrency)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.netBalance')}</p>
                <p
                  className={`text-xl font-bold mt-1 tabular-nums ${
                    summary.balance >= 0 ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {summary.balance >= 0 ? '+' : ''}{formatCurrency(summary.balance, selectedCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters - Visually grouped, touch-friendly */}
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.filters')}</CardTitle>
          <CardDescription>{t('transactions.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.wallet')}</label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={filters.walletId ?? ''}
                onChange={(e) =>
                  setFilters({ ...filters, walletId: e.target.value || undefined })
                }
              >
                <option value="">{t('transactions.allWallets')}</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.type')}</label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={filters.type ?? ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    type: (e.target.value || undefined) as TransactionType | undefined,
                  })
                }
              >
                <option value="">{t('transactions.allTypes')}</option>
                <option value={TransactionType.INCOME}>{t('transactions.income')}</option>
                <option value={TransactionType.EXPENSE}>{t('transactions.expense')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.category')}</label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={filters.category ?? ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category: (e.target.value || undefined) as TransactionCategory | undefined,
                  })
                }
              >
                <option value="">{t('transactions.allCategories')}</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {TRANSACTION_CATEGORY_LABELS[c as keyof typeof TRANSACTION_CATEGORY_LABELS] ?? c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.from')}</label>
              <Input
                type="date"
                value={filters.startDate ?? ''}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value || undefined })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.to')}</label>
              <Input
                type="date"
                value={filters.endDate ?? ''}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value || undefined })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add / List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('transactions.title')}</CardTitle>
            <CardDescription>{t('transactions.subtitle')}</CardDescription>
          </div>
          {wallets.length > 0 && (
            <Button onClick={openAddPopup} className="hidden md:inline-flex">
              {t('transactions.addTransaction')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Transaction List */}
          <div className="space-y-2">
            {(transactions ?? []).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-2">📝</p>
                <p className="text-muted-foreground">{t('transactions.noTransactions')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('transactions.createFirst')}</p>
                {wallets.length > 0 && (
                  <Button className="mt-4" onClick={openAddPopup}>
                    {t('transactions.addTransaction')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(transactions ?? []).map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{tx.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {TRANSACTION_CATEGORY_LABELS[tx.category as keyof typeof TRANSACTION_CATEGORY_LABELS] ?? tx.category} • {formatDate(tx.date)} • {tx.wallet?.name ?? tx.walletId}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <p
                          className={`font-semibold tabular-nums shrink-0 ${
                            tx.type === TransactionType.INCOME ? 'text-success' : 'text-destructive'
                          }`}
                        >
                          {tx.type === TransactionType.INCOME ? '+' : '−'}
                          {formatCurrency(tx.amount, tx.wallet?.currency ?? 'USD')}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditPopup(tx)}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(tx.id)}
                          >
                            {t('common.delete')}
                          </Button>
                        </div>
                      </div>
                  </>
                </div>
              ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Popup */}
      <CrudPopup
        open={isAdding}
        onClose={closeAddPopup}
        title={t('transactions.addTransaction')}
        formId="add-transaction-form"
        primaryLabel={t('common.save')}
        primaryLoading={isSubmitting}
        primaryDisabled={!form.walletId || !form.description.trim() || form.amount <= 0}
        secondaryLabel={t('common.cancel')}
        onSecondaryClick={closeAddPopup}
        error={error}
      >
        <form id="add-transaction-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.wallet')}</label>
            <select
              required
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={form.walletId}
              onChange={(e) => setForm({ ...form, walletId: e.target.value })}
            >
              <option value="">-- {t('transactions.wallet')} --</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.currency})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.type')}</label>
            <select
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as TransactionType,
                  category:
                    e.target.value === TransactionType.INCOME
                      ? TransactionCategory.SALARY
                      : TransactionCategory.FOOD,
                })
              }
            >
              <option value={TransactionType.INCOME}>{t('transactions.income')}</option>
              <option value={TransactionType.EXPENSE}>{t('transactions.expense')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.category')}</label>
            <select
              required
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as TransactionCategory })
              }
            >
              {(form.type === TransactionType.INCOME
                ? [
                    TransactionCategory.SALARY,
                    TransactionCategory.FREELANCE,
                    TransactionCategory.INVESTMENT,
                    TransactionCategory.OTHER_INCOME,
                  ]
                : [
                    TransactionCategory.FOOD,
                    TransactionCategory.TRANSPORT,
                    TransactionCategory.ENTERTAINMENT,
                    TransactionCategory.BILLS,
                    TransactionCategory.SHOPPING,
                    TransactionCategory.HEALTH,
                    TransactionCategory.EDUCATION,
                    TransactionCategory.OTHER_EXPENSE,
                  ]
              ).map((c) => (
                <option key={c} value={c}>
                  {TRANSACTION_CATEGORY_LABELS[c as keyof typeof TRANSACTION_CATEGORY_LABELS] ?? c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.amount')}</label>
            <Input
              type="number"
              required
              min={0.01}
              step={0.01}
              value={form.amount || ''}
              onChange={(e) =>
                setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.description')}</label>
            <Input
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.date')}</label>
            <Input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </form>
      </CrudPopup>

      {/* Edit Transaction Popup */}
      {(() => {
        const txToEdit = (transactions ?? []).find((tx) => tx.id === editingId)
        if (!txToEdit) return null
        return (
          <EditTransactionPopup
            open={!!editingId}
            transaction={txToEdit}
            onClose={closeEditPopup}
            onSave={(data) => handleUpdate(txToEdit.id, data)}
            error={error}
            isSubmitting={isSubmitting}
          />
        )
      })()}

      {/* Mobile FAB */}
      {wallets.length > 0 && (
        <button
          type="button"
          onClick={openAddPopup}
          className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center text-2xl font-medium hover:bg-primary/90 active:scale-95 transition-all"
          aria-label={t('transactions.addTransaction')}
        >
          +
        </button>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={t('transactions.deleteTransaction')}
        message={t('transactions.deleteConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  )
}

function EditTransactionPopup({
  open,
  transaction,
  onClose,
  onSave,
  error,
  isSubmitting,
}: {
  open: boolean
  transaction: { type: string; category: string; amount: number; description: string; date: string }
  onClose: () => void
  onSave: (data: UpdateTransactionData) => void
  error: string
  isSubmitting: boolean
}) {
  const { t } = useTranslation()
  const [type, setType] = useState(transaction.type)
  const [category, setCategory] = useState(transaction.category)
  const [amount, setAmount] = useState(transaction.amount)
  const [description, setDescription] = useState(transaction.description)
  const [date, setDate] = useState(transaction.date.slice(0, 16))

  useEffect(() => {
    if (open) {
      setType(transaction.type)
      setCategory(transaction.category)
      setAmount(transaction.amount)
      setDescription(transaction.description)
      setDate(transaction.date.slice(0, 16))
    }
  }, [open, transaction.type, transaction.category, transaction.amount, transaction.description, transaction.date])

  const categoryOptions = [
    TransactionCategory.SALARY,
    TransactionCategory.FREELANCE,
    TransactionCategory.INVESTMENT,
    TransactionCategory.OTHER_INCOME,
    TransactionCategory.FOOD,
    TransactionCategory.TRANSPORT,
    TransactionCategory.ENTERTAINMENT,
    TransactionCategory.BILLS,
    TransactionCategory.SHOPPING,
    TransactionCategory.HEALTH,
    TransactionCategory.EDUCATION,
    TransactionCategory.OTHER_EXPENSE,
  ]

  const handleSave = () => {
    onSave({
      type: type as TransactionType,
      category: category as TransactionCategory,
      amount,
      description,
      date: new Date(date).toISOString(),
    })
  }

  return (
    <CrudPopup
      open={open}
      onClose={onClose}
      title={t('transactions.editTransaction', 'Edit Transaction')}
      onPrimaryClick={handleSave}
      primaryLabel={t('common.save')}
      primaryLoading={isSubmitting}
      primaryDisabled={!description.trim() || amount <= 0}
      secondaryLabel={t('common.cancel')}
      onSecondaryClick={onClose}
      error={error}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.type')}</label>
          <select
            className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value={TransactionType.INCOME}>{t('transactions.income')}</option>
            <option value={TransactionType.EXPENSE}>{t('transactions.expense')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.category')}</label>
          <select
            className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {TRANSACTION_CATEGORY_LABELS[c as keyof typeof TRANSACTION_CATEGORY_LABELS] ?? c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.amount')}</label>
          <Input
            type="number"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.description')}</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">{t('transactions.date')}</label>
          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
    </CrudPopup>
  )
}
