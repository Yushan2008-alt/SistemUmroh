'use client'

import { useState, useEffect } from 'react'
import { Landmark, X, Loader2 } from 'lucide-react'
import type { BankAccount, BankAccountFormData } from '../types'
import { createBankAccount, updateBankAccount } from '../actions'

interface BankAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  accountToEdit?: BankAccount | null
  branches: { id: number; name: string; code: string }[]
}

export function BankAccountModal({
  isOpen,
  onClose,
  onSuccess,
  accountToEdit,
  branches,
}: BankAccountModalProps) {
  const [formData, setFormData] = useState<BankAccountFormData>({
    bank_name: 'Bank Syariah Indonesia (BSI)',
    account_number: '',
    account_holder: '',
    branch_office: '',
    branch_id: null,
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (accountToEdit) {
      setFormData({
        bank_name: accountToEdit.bank_name,
        account_number: accountToEdit.account_number,
        account_holder: accountToEdit.account_holder,
        branch_office: accountToEdit.branch_office || '',
        branch_id: accountToEdit.branch_id,
        is_active: accountToEdit.is_active,
      })
    } else {
      setFormData({
        bank_name: 'Bank Syariah Indonesia (BSI)',
        account_number: '',
        account_holder: 'PT Al-Madinah Wisata Syariah',
        branch_office: '',
        branch_id: branches[0]?.id || null,
        is_active: true,
      })
    }
    setError(null)
  }, [accountToEdit, isOpen, branches])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.bank_name.trim() || !formData.account_number.trim() || !formData.account_holder.trim()) {
      setError('Nama bank, nomor rekening, dan atas nama wajib diisi')
      setLoading(false)
      return
    }

    try {
      let res
      if (accountToEdit) {
        res = await updateBankAccount(accountToEdit.id, formData)
      } else {
        res = await createBankAccount(formData)
      }

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || 'Terjadi kesalahan menyimpan rekening bank')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan rekening bank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {accountToEdit ? 'Edit Rekening Bank' : 'Tambah Rekening Bank'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Rekening tujuan pembayaran jamaah dan operasional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Nama Bank <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI)</option>
              <option value="Bank Muamalat Indonesia">Bank Muamalat Indonesia</option>
              <option value="Bank Mandiri">Bank Mandiri</option>
              <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
              <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
              <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
              <option value="Bank Mega Syariah">Bank Mega Syariah</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Nomor Rekening <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 7001234567"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Atas Nama Rekening <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: PT Al-Madinah Wisata Syariah"
              value={formData.account_holder}
              onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Kantor Cabang Bank
              </label>
              <input
                type="text"
                placeholder="Contoh: KCP Thamrin Jakarta"
                value={formData.branch_office || ''}
                onChange={(e) => setFormData({ ...formData, branch_office: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Cabang Travel
              </label>
              <select
                value={formData.branch_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    branch_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">Semua Cabang (Global)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="bank_is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-input focus:ring-emerald-500"
            />
            <label htmlFor="bank_is_active" className="text-sm font-medium text-foreground cursor-pointer">
              Rekening Aktif (Ditampilkan pada formulir pembayaran &amp; kwitansi)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {accountToEdit ? 'Simpan Perubahan' : 'Tambah Rekening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
