'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Search,
  Plus,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  Package,
} from 'lucide-react'
import type { ManasikScheduleItem } from '../types'
import { deleteManasikSchedule } from '../actions'

interface ManasikTableProps {
  initialSchedules: ManasikScheduleItem[]
  currentSearch?: string
}

export function ManasikTable({ initialSchedules, currentSearch = '' }: ManasikTableProps) {
  const router = useRouter()
  const [schedules, setSchedules] = useState<ManasikScheduleItem[]>(initialSchedules)
  const [search, setSearch] = useState(currentSearch)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmSchedule, setDeleteConfirmSchedule] = useState<ManasikScheduleItem | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    router.push(`/manasik?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteConfirmSchedule) return
    setDeletingId(deleteConfirmSchedule.id)
    setErrorMessage(null)

    const result = await deleteManasikSchedule(deleteConfirmSchedule.id)
    setDeletingId(null)

    if (result.success) {
      setSchedules((prev) => prev.filter((s) => s.id !== deleteConfirmSchedule.id))
      setDeleteConfirmSchedule(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus jadwal manasik')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Jadwal Bimbingan Manasik
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Penjadwalan sesi bimbingan ibadah Umroh/Haji, muthawif pembimbing, dan presensi jamaah.
          </p>
        </div>
        <Link
          href="/manasik/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Jadwal
        </Link>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs underline hover:no-underline font-semibold ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul sesi manasik, lokasi pertemuan..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-colors"
          >
            Cari
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                router.push('/manasik')
              }}
              className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {schedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Sesi &amp; Paket Terkait</th>
                  <th className="px-5 py-3.5">Tanggal &amp; Waktu</th>
                  <th className="px-5 py-3.5">Lokasi Pertemuan</th>
                  <th className="px-5 py-3.5">Pembimbing (Muthawif)</th>
                  <th className="px-5 py-3.5">Kehadiran</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {schedules.map((schedule) => (
                  <tr
                    key={schedule.id}
                    className="hover:bg-muted/30 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                        <Link href={`/manasik/${schedule.id}`}>{schedule.title}</Link>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Package className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span>{schedule.packages?.name || 'Umum'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {formatDate(schedule.date)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{schedule.time ? schedule.time.substring(0, 5) : '08:00'} WIB</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-xs text-foreground flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span>{schedule.location}</span>
                      </div>
                      {schedule.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1 max-w-[220px]">
                          {schedule.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-xs font-semibold text-foreground">
                        {schedule.guides?.name || 'Ustadz Pembimbing'}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {schedule.guides?.phone || '-'}
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {schedule.attendances_count || 0} Hadir
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/manasik/${schedule.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Absensi
                        </Link>
                        <Link
                          href={`/manasik/${schedule.id}/edit`}
                          className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Jadwal"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmSchedule(schedule)}
                          className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Hapus Jadwal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <CalendarDays className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">Belum ada jadwal manasik</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Buat jadwal bimbingan ibadah Umroh atau Haji dan catat presensi kehadiran jamaah.
            </p>
            <Link
              href="/manasik/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Buat Jadwal Pertama
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmSchedule && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">Hapus Jadwal Manasik?</h3>
              <p className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus sesi{' '}
                <strong className="text-foreground">{deleteConfirmSchedule.title}</strong>? Seluruh data
                absensi terkait sesi ini akan ikut terhapus.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSchedule(null)}
                disabled={Boolean(deletingId)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
