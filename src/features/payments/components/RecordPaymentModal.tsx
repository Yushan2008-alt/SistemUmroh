'use client'

import { useState } from 'react'
import {
  X,
  CreditCard,
  Banknote,
  Building,
  CheckCircle2,
  Loader2,
  Calendar,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { recordManualPayment } from '../actions'
import type { PaymentListItem, PaymentMethod } from '../types'

interface RecordPaymentModalProps {
  payment: PaymentListItem | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RecordPaymentModal({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<number>(payment?.remaining_balance || 0)
  const [method, setMethod] = useState<PaymentMethod>('transfer')
  const [paidAt, setPaidAt] = useState<string>(new Date().toISOString().split('T')[0])
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !payment) return null

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value.replace(/\D/g, ''))
    setAmount(val)
  }

  const handleSetFull = () => {
    setAmount(payment.remaining_balance)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount <= 0) {
      toast.error('Nominal pembayaran harus lebih dari Rp 0.')
      return
    }

    setLoading(true)
    try {
      const res = await recordManualPayment(payment.id, {
        amount,
        method,
        paid_at: new Date(paidAt).toISOString(),
        reference_number: referenceNumber.trim() || undefined,
        note: notes.trim() || undefined,
      })

      if (res.success) {
        toast.success(res.message)
        onSuccess()
        onClose()
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Catat Pembayaran Kasir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan pembayaran manual Tunai, Transfer, atau Mesin EDC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Invoice Summary Box */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Invoice:</span>
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                {payment.code}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Jamaah:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {payment.registrations?.pilgrims?.name}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Invoice:</span>
              <span>Rp {payment.amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Sudah Dibayar:</span>
              <span className="text-emerald-600 font-medium">
                Rp {payment.paid_amount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Sisa Tagihan Saat Ini:
              </span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                Rp {payment.remaining_balance.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nominal Pembayaran Diterima (Rp)
              </label>
              <button
                type="button"
                onClick={handleSetFull}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 underline"
              >
                Bayar Lunas (Rp {payment.remaining_balance.toLocaleString('id-ID')})
              </button>
            </div>
            <input
              type="text"
              value={amount ? amount.toLocaleString('id-ID') : ''}
              onChange={handleAmountChange}
              placeholder="0"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Method Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`p-2.5 rounded-lg border text-center transition-all text-xs font-medium flex flex-col items-center gap-1 ${
                  method === 'transfer'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Transfer Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`p-2.5 rounded-lg border text-center transition-all text-xs font-medium flex flex-col items-center gap-1 ${
                  method === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Tunai / Kasir</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('edc')}
                className={`p-2.5 rounded-lg border text-center transition-all text-xs font-medium flex flex-col items-center gap-1 ${
                  method === 'edc'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Mesin EDC</span>
              </button>
            </div>
          </div>

          {/* Date & Reference Number Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Tanggal Pembayaran
              </label>
              <input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                No. Referensi / Resi Bank
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Contoh: BSI-987654"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Catatan Kasir (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pelunasan langsung di kantor cabang"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Menyimpan...' : 'Simpan Pembayaran'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
