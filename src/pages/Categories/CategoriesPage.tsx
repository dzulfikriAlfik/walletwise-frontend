/**
 * Categories Page
 * Custom category management (Pro / Pro Trial)
 */

import { useEffect, useState } from 'react'
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
import { SelectSimple } from '@/components/ui/Select'
import { useQueryClient } from '@tanstack/react-query'
import { useCustomCategories } from '@/hooks/useCategory'
import { QUERY_KEYS } from '@/utils/constants'
export default function CategoriesPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER })
  }, [queryClient])

  const {
    customCategories,
    isLoading,
    canUseCustomCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting,
  } = useCustomCategories()

  const [isCreatingOpen, setIsCreatingOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', type: 'expense' as 'income' | 'expense' })
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError(t('categories.nameRequired'))
      return
    }
    try {
      await createCategory({ name: form.name.trim(), type: form.type })
      setForm({ name: '', type: 'expense' })
      setIsCreatingOpen(false)
    } catch (err: unknown) {
      setError(
        (err as { error?: { message?: string } })?.error?.message || t('categories.createFailed')
      )
    }
  }

  const handleUpdate = async (id: string, name: string, type: 'income' | 'expense') => {
    setError('')
    try {
      await updateCategory(id, { name, type })
      setEditingId(null)
    } catch (err: unknown) {
      setError(
        (err as { error?: { message?: string } })?.error?.message || t('categories.updateFailed')
      )
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteCategory(deleteTarget)
      setDeleteTarget(null)
    } catch {
      // Error handled by mutation
    }
  }

  const incomeCategories = customCategories.filter((c) => c.type === 'income')
  const expenseCategories = customCategories.filter((c) => c.type === 'expense')

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-9 w-48 bg-muted rounded-lg animate-pulse" />
          <div className="h-5 w-64 mt-2 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t('categories.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {canUseCustomCategories
            ? t('categories.subtitle')
            : t('categories.proRequired')}{' '}
          {!canUseCustomCategories && (
            <Link to="/billing" className="text-primary hover:underline font-medium">
              {t('categories.upgradePro')}
            </Link>
          )}
        </p>
      </div>

      {!canUseCustomCategories ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-5xl mb-4">📂</p>
            <p className="text-muted-foreground mb-6">{t('categories.proRequired')}</p>
            <Link to="/billing">
              <Button>{t('common.upgrade')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t('categories.customCount', { count: customCategories.length })}
            </p>
            <Button onClick={() => setIsCreatingOpen(true)}>{t('categories.addCategory')}</Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('categories.incomeCategories')}</CardTitle>
                <CardDescription>{t('categories.incomeCategoriesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {incomeCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">{t('categories.noCategories')}</p>
                ) : (
                  <ul className="space-y-2">
                    {incomeCategories.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40 hover:bg-muted/60"
                      >
                        <span className="font-medium">{c.name}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(c.id)}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(c.id)}
                          >
                            {t('common.delete')}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('categories.expenseCategories')}</CardTitle>
                <CardDescription>{t('categories.expenseCategoriesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                {expenseCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">{t('categories.noCategories')}</p>
                ) : (
                  <ul className="space-y-2">
                    {expenseCategories.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40 hover:bg-muted/60"
                      >
                        <span className="font-medium">{c.name}</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(c.id)}
                          >
                            {t('common.edit')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(c.id)}
                          >
                            {t('common.delete')}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <CrudPopup
            open={isCreatingOpen}
            onClose={() => setIsCreatingOpen(false)}
            title={t('categories.addCategory')}
            formId="add-category-form"
            primaryLabel={t('common.save')}
            primaryLoading={isCreating}
            primaryDisabled={!form.name.trim()}
            secondaryLabel={t('common.cancel')}
            onSecondaryClick={() => setIsCreatingOpen(false)}
            error={error}
          >
            <form id="add-category-form" onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t('categories.type')}
                </label>
                <SelectSimple
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as 'income' | 'expense' })}
                  options={[
                    { value: 'income', label: t('transactions.income') },
                    { value: 'expense', label: t('transactions.expense') },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t('categories.name')}
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('categories.namePlaceholder')}
                />
              </div>
            </form>
          </CrudPopup>

          {editingId && (() => {
            const cat = customCategories.find((c) => c.id === editingId)
            if (!cat) return null
            return (
              <EditCategoryPopup
                category={cat}
                onClose={() => setEditingId(null)}
                onSave={(name, type) => handleUpdate(editingId, name, type)}
                error={error}
                isSubmitting={isUpdating}
              />
            )
          })()}

          <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
            title={t('categories.deleteTitle')}
            message={t('categories.deleteMessage')}
            confirmLabel={t('common.delete')}
            cancelLabel={t('common.cancel')}
            variant="destructive"
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  )
}

function EditCategoryPopup({
  category,
  onClose,
  onSave,
  error,
  isSubmitting,
}: {
  category: { id: string; name: string; type: string }
  onClose: () => void
  onSave: (name: string, type: 'income' | 'expense') => void
  error: string
  isSubmitting: boolean
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(category.name)
  const [type, setType] = useState<'income' | 'expense'>(category.type as 'income' | 'expense')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) onSave(name.trim(), type)
  }

  return (
    <CrudPopup
      open
      onClose={onClose}
      title={t('categories.editCategory')}
      formId="edit-category-form"
      primaryLabel={t('common.save')}
      primaryLoading={isSubmitting}
      primaryDisabled={!name.trim()}
      secondaryLabel={t('common.cancel')}
      onSecondaryClick={onClose}
      error={error}
    >
      <form id="edit-category-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t('categories.type')}
          </label>
          <SelectSimple
            value={type}
            onValueChange={(v) => setType(v as 'income' | 'expense')}
            options={[
              { value: 'income', label: t('transactions.income') },
              { value: 'expense', label: t('transactions.expense') },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t('categories.name')}
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('categories.namePlaceholder')}
          />
        </div>
      </form>
    </CrudPopup>
  )
}
