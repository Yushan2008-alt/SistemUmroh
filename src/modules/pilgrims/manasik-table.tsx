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
  Building2,
  Eye,
} from 'lucide-react'
import type { Role } from '@/types/database.types'
import type { ManasikScheduleItem } from './types'
import { deleteManasikSchedule } from './manasik.actions'

interface ManasikTableProps {
  initialSchedules: ManasikScheduleItem[]
  currentSearch?: string
  userRole?: Role
}

export function ManasikTable({ initialSchedules, currentSearch = '', userRole }: ManasikTableProps) {
  const router = useRouter()
  const [schedules, setSchedules] = useState<ManasikScheduleItem[]>(initialSchedules)
  const [search, setSearch] = useState(currentSearch)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmSchedule, setDeleteConfirmSchedule] = useState<ManasikScheduleItem | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isStaff = userRole === 'super_admin' || userRole === 'admin'
  const canRecordAttendance = isStaff || userRole === 'guide'

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
            Penjadwalan sesi bimbingan ibadah Umroh &amp; Haji, muthawif pembimbing, dan presensi jamaah.
          </p>
        </div>
        {isStaff && (
          <Link
            href="/manasik/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Tambah Jadwal
          </Link>
        )}
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
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-xl transition-colors shrink-0"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Schedule Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {schedules.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-3">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-base font-semibold text-foreground">
              Belum ada jadwal manasik terdaftar
            </h3>
            <p className="text-xs max-w-sm mx-auto">
              {userRole === 'guide'
                ? 'Belum ada jadwal bimbingan manasik yang ditugaskan kepada Anda saat ini.'
                : 'Jadwal bimbingan manasik ibadah belum dibuat atau tidak ditemukan dengan kata kunci ini.'}
            </p>
            {isStaff && (
              <Link
                href="/manasik/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold mt-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Buat Jadwal Baru
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
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
                {schedules.map((schedule) => {
                  const pkgName = schedule.package?.name || schedule.packages?.name

                  return (
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
                          {pkgName ? (
                            <span>{pkgName}</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                              Manasik Akbar Cabang
                            </span>
                          )}
                        </div>
                        {schedule.branches?.name && (
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            <span>{schedule.branches.name}</span>
                          </div>
                        )}
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
                        {schedule.guides?.name ? (
                          <>
                            <div className="text-xs font-semibold text-foreground">
                              👳 {schedule.guides.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {schedule.guides.phone || '-'}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Belum Ditugaskan
                          </span>
                        )}
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
                          {canRecordAttendance ? (
                            <Link
                              href={`/manasik/${schedule.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Absensi
                            </Link>
                          ) : (
                            <Link
                              href={`/manasik/${schedule.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-medium transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Detail
                            </Link>
                          )}

                          {isStaff && (
                            <>
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmSchedule && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-500/10">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Hapus Jadwal Manasik?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus jadwal{' '}
              <strong className="text-foreground">{deleteConfirmSchedule.title}</strong>? Seluruh data
              kehadiran yang terhubung akan ikut terhapus.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSchedule(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center gap-2"
              >
                {deletingId !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Hapus Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
