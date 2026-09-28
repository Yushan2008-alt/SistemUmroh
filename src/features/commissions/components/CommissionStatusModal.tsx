'use client'

import { useState } from 'react'
import { updateCommissionStatus } from '../actions'
import type { CommissionWithRelations } from '../types'
import type { CommissionStatus } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface CommissionStatusModalProps {
  commission: CommissionWithRelations | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CommissionStatusModal({
  commission,
  isOpen,
  onClose,
  onSuccess,
}: CommissionStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<CommissionStatus>('approved')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !commission) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await updateCommissionStatus(commission.id, selectedStatus, note)
      if (!res.success) {
        setError(res.message)
      } else {
        onSuccess()
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="text-base font-semibold text-foreground">Ubah Status Komisi</h3>
            <p className="text-xs text-muted-foreground">Komisi #{commission.id} — {commission.agent?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-muted/50 border text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jamaah:</span>
              <span className="font-semibold text-foreground">{commission.registration?.pilgrim?.name ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paket:</span>
              <span className="font-medium text-foreground">{commission.registration?.package?.name ?? '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Komisi:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(commission.amount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Pilih Status Baru <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as CommissionStatus)}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            >
              <option value="approved">Setujui Komisi (Approved)</option>
              <option value="paid">Tandai Sudah Dibayarkan (Paid)</option>
              <option value="cancelled">Batalkan Komisi (Cancelled)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Catatan Pembayaran / Keterangan (Opsional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Ditransfer via BCA No. Ref 982348"
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted text-muted-foreground transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-xs inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Simpan Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
