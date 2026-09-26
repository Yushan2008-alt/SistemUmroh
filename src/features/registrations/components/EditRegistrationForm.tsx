'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { RegistrationListItem } from '../types'
import { updateRegistration } from '../actions'
import type { RegistrationStatus } from '@/types/database.types'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, UserCheck, Package } from 'lucide-react'

interface EditRegistrationFormProps {
  registration: RegistrationListItem
  guides: { id: number; name: string }[]
}

export function EditRegistrationForm({ registration, guides }: EditRegistrationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [guideId, setGuideId] = useState<number | ''>(registration.guide_id || '')
  const [registeredAt, setRegisteredAt] = useState<string>(registration.registered_at)
  const [status, setStatus] = useState<RegistrationStatus>(registration.status)
  const [notes, setNotes] = useState<string>(registration.notes || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await updateRegistration(registration.id, {
        guide_id: guideId ? Number(guideId) : null,
        registered_at: registeredAt,
        status,
        notes: notes.trim() || null,
      })

      if (res.success) {
        toast.success(`Data pendaftaran ${registration.code} berhasil diperbarui.`)
        router.push(`/registrations/${registration.id}`)
      } else {
        toast.error(res.error || 'Gagal memperbarui data.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-5">
        <h3 className="text-base font-semibold text-foreground border-b border-border pb-3">
          Informasi Utama
        </h3>

        {/* Readonly Pilgrim & Package Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Nama Calon Jamaah
            </div>
            <div className="text-sm font-bold text-foreground">{registration.pilgrims?.name}</div>
            <div className="text-xs text-muted-foreground">{registration.pilgrims?.phone || '-'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Paket Keberangkatan
            </div>
            <div className="text-sm font-bold text-foreground">{registration.packages?.name}</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
                registration.total_price
              )}
            </div>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Status Pendaftaran</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RegistrationStatus)}
            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Guide Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Pembimbing / Muthawif</label>
            <select
              value={guideId}
              onChange={(e) => setGuideId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            >
              <option value="">-- Tanpa Pembimbing Khusus --</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Registration Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tanggal Booking</label>
            <input
              type="date"
              value={registeredAt}
              onChange={(e) => setRegisteredAt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Special Notes */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Catatan Khusus</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
          <Link
            href={`/registrations/${registration.id}`}
            className="px-4 py-2 border border-border hover:bg-muted text-muted-foreground rounded-lg font-medium text-sm transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors shadow-xs flex items-center gap-2"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </form>
  )
}
