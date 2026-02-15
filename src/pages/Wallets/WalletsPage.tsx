/**
 * Wallets Page
 * Wallet management with subscription-based limits
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { useAuth } from '@/hooks/useAuth'
import { CURRENCIES } from '@/utils/constants'
import { SubscriptionTier } from '@/types'

export default function WalletsPage() {
  const { user } = useAuth()
  const {
    wallets,
    summary,
    isLoading,
    createWallet,
    updateWallet,
    deleteWallet,
    canCreateWallet,
    walletLimit,
    refetch,
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) {
      setError('Nama wallet wajib diisi')
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
      setError((err as { error?: { message?: string } })?.error?.message || 'Gagal membuat wallet')
    }
  }

  const handleUpdate = async (id: string, name: string, balance: number) => {
    setError('')
    try {
      await updateWallet(id, { name, balance })
      setEditingId(null)
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message || 'Gagal update wallet')
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
      setError((err as { error?: { message?: string } })?.error?.message || 'Gagal menghapus wallet')
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
        <div className="text-gray-500">Loading wallets...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Wallets</h1>
        <p className="text-gray-600 mt-1">
          Kelola wallet Anda. {tier === SubscriptionTier.FREE && (
            <span>
              Limit: {walletLimit.current}/{walletLimit.max}
              {' '}
              <Link to="/billing" className="text-blue-600 hover:underline">
                Upgrade ke Pro
              </Link>
              {' '}
              untuk unlimited.
            </span>
          )}
        </p>
      </div>

      {/* Summary Card */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
            <CardDescription>
              Jumlah total dari {wallets.length} wallet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(summary.totalBalance, 'USD')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Wallet - Show button or form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Wallet</CardTitle>
            <CardDescription>
              {canCreateWallet
                ? 'Buat wallet baru untuk memulai tracking'
                : 'Limit tercapai. Upgrade ke Pro untuk wallet unlimited.'}
            </CardDescription>
          </div>
          {canCreateWallet && !isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              + Tambah Wallet
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
                placeholder="Nama wallet (min 3 karakter)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <div className="flex gap-3">
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="Saldo awal"
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
                <Button type="submit">Simpan</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Batal
                </Button>
              </div>
            </form>
          )}

          {/* Wallet List */}
          <div className="space-y-3">
            {wallets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-2">💰</p>
                <p>Belum ada wallet. Buat wallet pertama Anda.</p>
              </div>
            ) : (
              wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  {editingId === wallet.id ? (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(wallet.id)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(wallet.id)}
                        >
                          Hapus
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
        title="Hapus Wallet"
        message="Hapus wallet ini? Semua transaksi di dalamnya akan ikut terhapus permanen."
        confirmLabel="Hapus"
        cancelLabel="Batal"
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
        Simpan
      </Button>
      <Button size="sm" variant="outline" onClick={onCancel}>
        Batal
      </Button>
    </div>
  )
}
