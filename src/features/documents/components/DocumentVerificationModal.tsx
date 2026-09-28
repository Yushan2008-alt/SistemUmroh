'use client'

import { useState } from 'react'
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Check,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { verifyDocument, rejectDocument } from '../actions'
import type { DocumentItem } from '../types'

interface DocumentVerificationModalProps {
  document: DocumentItem | null
  pilgrimId: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DocumentVerificationModal({
  document,
  pilgrimId,
  isOpen,
  onClose,
  onSuccess,
}: DocumentVerificationModalProps) {
  const [actionType, setActionType] = useState<'verify' | 'reject'>('verify')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !document) return null

  const quickRejectReasons = [
    'Foto/scan buram atau tidak terbaca dengan jelas.',
    'Masa berlaku paspor kurang dari 7 bulan sebelum keberangkatan.',
    'Latar belakang pas foto bukan putih polos (80% wajah).',
    'Nama di paspor tidak sesuai dengan data identitas jamaah.',
    'Berkas terpotong, silakan unggah scan utuh.',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (actionType === 'verify') {
        const res = await verifyDocument(document.id, pilgrimId, note)
        if (res.success) {
          toast.success(res.message || 'Dokumen berhasil disetujui.')
          onSuccess()
          onClose()
        } else {
          toast.error(res.message || 'Gagal memverifikasi dokumen.')
        }
      } else {
        if (!note.trim()) {
          toast.error('Alasan penolakan wajib diisi.')
          setLoading(false)
          return
        }
        const res = await rejectDocument(document.id, pilgrimId, note)
        if (res.success) {
          toast.warning(res.message || 'Dokumen telah ditolak dengan catatan.')
          onSuccess()
          onClose()
        } else {
          toast.error(res.message || 'Gagal menolak dokumen.')
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      toast.error(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Verifikasi {document.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Berkas: {document.original_name || 'Dokumen Terunggah'}
            </p>
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
          {/* Action Toggle Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setActionType('verify')
                setNote('Dokumen telah diverifikasi dan dinyatakan valid.')
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                actionType === 'verify'
                  ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  actionType === 'verify'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Setujui Dokumen</div>
                <div className="text-[11px] opacity-80 mt-0.5">Dokumen valid & sesuai</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActionType('reject')
                setNote('')
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                actionType === 'reject'
                  ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  actionType === 'reject'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Tolak Dokumen</div>
                <div className="text-[11px] opacity-80 mt-0.5">Minta upload ulang</div>
              </div>
            </button>
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              {actionType === 'verify'
                ? 'Catatan Verifikasi (Opsional)'
                : 'Alasan Penolakan (Wajib Diisi)'}
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                actionType === 'verify'
                  ? 'Contoh: Dokumen lengkap dan sesuai ketentuan...'
                  : 'Jelaskan alasan dokumen ditolak agar jamaah mengetahui apa yang perlu diperbaiki...'
              }
              className={`w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-colors ${
                actionType === 'reject'
                  ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Quick Reasons when Rejecting */}
          {actionType === 'reject' && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Pilih Alasan Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickRejectReasons.map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNote(reason)}
                    className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors text-left"
                  >
                    + {reason}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 ${
                actionType === 'verify'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {loading
                  ? 'Menyimpan...'
                  : actionType === 'verify'
                  ? 'Setujui Dokumen'
                  : 'Tolak Dokumen'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
