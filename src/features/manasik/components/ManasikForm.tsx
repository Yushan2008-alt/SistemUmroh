'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarDays,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import type {
  ManasikScheduleItem,
  ManasikFormData,
  ManasikFormDataOptions,
} from '../types'
import { createManasikSchedule, updateManasikSchedule } from '../actions'

interface ManasikFormProps {
  schedule?: ManasikScheduleItem
  options: ManasikFormDataOptions
  isEdit?: boolean
}

export function ManasikForm({ schedule, options, isEdit = false }: ManasikFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<ManasikFormData>({
    branch_id: schedule?.branch_id || options.branches[0]?.id || 1,
    package_id: schedule?.package_id || options.packages[0]?.id || 1,
    guide_id: schedule?.guide_id || null,
    title: schedule?.title || '',
    date: schedule?.date ? schedule.date.split('T')[0] : '',
    time: schedule?.time ? schedule.time.substring(0, 5) : '08:30',
    location: schedule?.location || '',
    description: schedule?.description || '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formData.title.trim()) {
      setErrorMessage('Judul sesi manasik wajib diisi.')
      setIsLoading(false)
      return
    }

    if (!formData.date) {
      setErrorMessage('Tanggal sesi bimbingan wajib diisi.')
      setIsLoading(false)
      return
    }

    if (!formData.location.trim()) {
      setErrorMessage('Lokasi pertemuan wajib diisi.')
      setIsLoading(false)
      return
    }

    let res
    if (isEdit && schedule) {
      res = await updateManasikSchedule(schedule.id, formData)
    } else {
      res = await createManasikSchedule(formData)
    }

    setIsLoading(false)

    if (res.success) {
      setSuccessMessage(
        isEdit ? 'Jadwal manasik berhasil diperbarui!' : 'Jadwal manasik berhasil dibuat!'
      )
      setTimeout(() => {
        router.push('/manasik')
        router.refresh()
      }, 1000)
    } else {
      setErrorMessage(res.error || 'Terjadi kesalahan saat menyimpan jadwal manasik.')
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/manasik"
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {isEdit ? `Edit Jadwal: ${schedule?.title}` : 'Buat Jadwal Manasik Baru'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Jadwalkan sesi bimbingan ibadah Umroh atau Haji dan tentukan pembimbing muthawif.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Judul Sesi Manasik <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Bimbingan Tata Cara Tawaf, Sa'i dan Tahallul"
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Paket Terkait <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.package_id}
              onChange={(e) => setFormData({ ...formData, package_id: Number(e.target.value) })}
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              {options.packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Ustadz Pembimbing (Muthawif)
            </label>
            <select
              value={formData.guide_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  guide_id: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="">-- Pilih Pembimbing --</option>
              {options.guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tanggal Pelaksanaan <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Waktu Mulai <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Lokasi Pertemuan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Contoh: Ballroom Hotel Grand Mercure Kemayoran, Lt. 2"
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Materi &amp; Catatan Khusus
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Rincian materi yang akan disampaikan atau perlengkapan yang wajib dibawa jamaah..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border/60 flex items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Simpan Perubahan' : 'Buat Jadwal Manasik'}
              </>
            )}
          </button>
          <Link
            href="/manasik"
            className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted font-medium text-sm transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
