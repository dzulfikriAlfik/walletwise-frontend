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
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message ?? t('transactions.createFailed'))
    }
  }

  const handleUpdate = async (id: string, data: UpdateTransactionData) => {
    setError('')
    try {
      await updateTransaction(id, {
        ...data,
        ...(data.date && { date: new Date(data.date).toISOString() }),
      })
      setEditingId(null)
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message ?? t('transactions.updateFailed'))
    }
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
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('transactions.title')}</h1>
        <p className="text-gray-600 mt-1">{t('transactions.subtitle')}</p>
      </div>

      {/* Summary */}
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
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.totalIncome')}</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome, selectedCurrency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.totalExpense')}</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpense, selectedCurrency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.netBalance')}</p>
                <p
                  className={`text-xl font-bold ${
                    summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(summary.balance, selectedCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.filters')}</CardTitle>
          <CardDescription>{t('transactions.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-sm text-gray-600">{t('transactions.wallet')}</label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <label className="text-sm text-gray-600">{t('transactions.type')}</label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <label className="text-sm text-gray-600">{t('transactions.category')}</label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <label className="text-sm text-gray-600">{t('transactions.from')}</label>
              <Input
                type="date"
                className="mt-1"
                value={filters.startDate ?? ''}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value || undefined })
                }
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">{t('transactions.to')}</label>
              <Input
                type="date"
                className="mt-1"
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
          {wallets.length > 0 && !isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              {t('transactions.addTransaction')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {isAdding && (
            <form
              onSubmit={handleCreate}
              className="p-4 border rounded-lg bg-gray-50 space-y-3"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-600">{t('transactions.wallet')}</label>
                  <select
                    required
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  <label className="text-sm text-gray-600">{t('transactions.type')}</label>
                  <select
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-600">{t('transactions.category')}</label>
                  <select
                    required
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                  <label className="text-sm text-gray-600">{t('transactions.amount')}</label>
                  <Input
                    type="number"
                    required
                    min={0.01}
                    step={0.01}
                    className="mt-1"
                    value={form.amount || ''}
                    onChange={(e) =>
                      setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('transactions.description')}</label>
                <Input
                  required
                  className="mt-1"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('transactions.date')}</label>
                <Input
                  type="datetime-local"
                  required
                  className="mt-1"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{t('common.save')}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          )}

          {/* Transaction List */}
          <div className="space-y-2">
            {(transactions ?? []).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-4xl mb-2">📝</p>
                <p>{t('transactions.noTransactions')}</p>
                <p className="text-sm mt-1">{t('transactions.createFirst')}</p>
                {wallets.length > 0 && (
                  <Button
                    className="mt-4"
                    onClick={() => setIsAdding(true)}
                  >
                    {t('transactions.addTransaction')}
                  </Button>
                )}
              </div>
            ) : (
              (transactions ?? []).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  {editingId === tx.id ? (
                    <EditTransactionForm
                      transaction={tx}
                      onSave={(data) => handleUpdate(tx.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <div>
                        <p className="font-medium text-gray-900">{tx.description}</p>
                        <p className="text-sm text-gray-500">
                          {TRANSACTION_CATEGORY_LABELS[tx.category as keyof typeof TRANSACTION_CATEGORY_LABELS] ?? tx.category} • {formatDate(tx.date)} • {tx.wallet?.name ?? tx.walletId}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p
                          className={`font-semibold ${
                            tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {tx.type === TransactionType.INCOME ? '+' : '-'}
                          {formatCurrency(tx.amount, tx.wallet?.currency ?? 'USD')}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(tx.id)}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteTarget(tx.id)}
                          >
                            {t('common.delete')}
                          </Button>
                        </div>
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

function EditTransactionForm({
  transaction,
  onSave,
  onCancel,
}: {
  transaction: { type: string; category: string; amount: number; description: string; date: string }
  onSave: (data: UpdateTransactionData) => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const [type, setType] = useState(transaction.type)
  const [category, setCategory] = useState(transaction.category)
  const [amount, setAmount] = useState(transaction.amount)
  const [description, setDescription] = useState(transaction.description)
  const [date, setDate] = useState(
    transaction.date.slice(0, 16)
  )

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

  return (
    <div className="flex-1 flex flex-wrap gap-2 items-center">
      <select
        className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value={TransactionType.INCOME}>{t('transactions.income')}</option>
        <option value={TransactionType.EXPENSE}>{t('transactions.expense')}</option>
      </select>
      <select
        className="flex h-9 rounded-md border border-input bg-background px-2 text-sm"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        {categoryOptions.map((c) => (
          <option key={c} value={c}>
            {TRANSACTION_CATEGORY_LABELS[c as keyof typeof TRANSACTION_CATEGORY_LABELS] ?? c}
          </option>
        ))}
      </select>
      <Input
        type="number"
        min={0.01}
        step={0.01}
        value={amount}
        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
        className="w-24"
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-1 min-w-[120px]"
      />
      <Input
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-48"
      />
      <Button
        size="sm"
        onClick={() =>
          onSave({ type: type as TransactionType, category: category as TransactionCategory, amount, description, date: new Date(date).toISOString() })
        }
      >
        {t('common.save')}
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        {t('common.cancel')}
      </Button>
    </div>
  )
}
