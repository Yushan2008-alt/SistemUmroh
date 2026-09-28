'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  ArrowLeft,
  Edit,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  MapPin,
  Calendar,
  Package,
  Loader2,
  AlertCircle,
  Phone,
} from 'lucide-react'
import type { AttendanceStatus } from '@/types/database.types'
import type { PilgrimAttendanceItem } from '../types'
import { recordAttendance } from '../actions'

interface ManasikAttendanceViewProps {
  schedule: any
  initialPilgrims: PilgrimAttendanceItem[]
  initialRekap: { present: number; absent: number; excused: number }
}

export function ManasikAttendanceView({
  schedule,
  initialPilgrims,
  initialRekap,
}: ManasikAttendanceViewProps) {
  const router = useRouter()
  const [attendances, setAttendances] = useState<Record<number, AttendanceStatus>>(() => {
    const map: Record<number, AttendanceStatus> = {}
    initialPilgrims.forEach((p) => {
      map[p.pilgrim_id] = p.status
    })
    return map
  })

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Hitung rekap dinamis berdasarkan pilihan di form
  const computedRekap = {
    present: Object.values(attendances).filter((s) => s === 'present').length,
    excused: Object.values(attendances).filter((s) => s === 'excused').length,
    absent: Object.values(attendances).filter((s) => s === 'absent').length,
  }

  const handleStatusChange = (pilgrimId: number, status: AttendanceStatus) => {
    setAttendances((prev) => ({
      ...prev,
      [pilgrimId]: status,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const res = await recordAttendance(schedule.id, attendances)
    setIsLoading(false)

    if (res.success) {
      setSuccessMessage('Presensi kehadiran jamaah berhasil disimpan!')
      router.refresh()
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      setErrorMessage(res.error || 'Gagal menyimpan absensi.')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/manasik"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-wider">
                Sesi Manasik
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{schedule.packages?.name || 'Umum'}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {schedule.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/manasik/${schedule.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
            Edit Jadwal
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || initialPilgrims.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-medium transition-all shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Presensi
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stats Cards: Hadir, Izin, Tidak Hadir */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Hadir</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {computedRekap.present} Jamaah
          </div>
          <p className="text-xs text-muted-foreground">Telah mengikuti bimbingan</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Izin</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {computedRekap.excused} Jamaah
          </div>
          <p className="text-xs text-muted-foreground">Konfirmasi berhalangan</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Belum / Tidak Hadir</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {computedRekap.absent} Jamaah
          </div>
          <p className="text-xs text-muted-foreground">Belum tercatat hadir</p>
        </div>
      </div>

      {/* Sesi Info Card */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2.5">
          <CalendarDays className="w-4 h-4 text-emerald-600" />
          Rincian Jadwal &amp; Lokasi Pertemuan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs">
          <div>
            <span className="text-muted-foreground block">Hari &amp; Tanggal:</span>
            <span className="font-semibold text-foreground">{formatDate(schedule.date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Waktu Pertemuan:</span>
            <span className="font-semibold text-foreground">
              {schedule.time ? schedule.time.substring(0, 5) : '08:00'} WIB s/d Selesai
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block">Lokasi:</span>
            <span className="font-medium text-foreground">{schedule.location}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Ustadz Pembimbing:</span>
            <span className="font-semibold text-foreground">
              {schedule.guides?.name || 'Muthawif Travel'} ({schedule.guides?.phone || '-'})
            </span>
          </div>
          {schedule.description && (
            <div className="sm:col-span-2 pt-1 border-t border-border/40">
              <span className="text-muted-foreground block">Catatan / Materi:</span>
              <p className="text-foreground mt-0.5">{schedule.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Absensi Jamaah Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Presensi Kehadiran Jamaah ({initialPilgrims.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tentukan status kehadiran masing-masing jamaah yang terdaftar dalam paket ini.
            </p>
          </div>
        </div>

        {initialPilgrims.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 w-10 text-center">No</th>
                  <th className="px-5 py-3">Nama Jamaah</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">Kontak</th>
                  <th className="px-5 py-3 min-w-[160px] text-right">Status Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {initialPilgrims.map((pilgrim, idx) => {
                  const currentStatus = attendances[pilgrim.pilgrim_id] || 'absent'

                  return (
                    <tr
                      key={pilgrim.pilgrim_id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-center text-xs text-muted-foreground font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-foreground">
                        {pilgrim.name}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground capitalize">
                        {pilgrim.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-foreground">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {pilgrim.phone}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              pilgrim.pilgrim_id,
                              e.target.value as AttendanceStatus
                            )
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all focus:outline-none focus:ring-2 ${
                            currentStatus === 'present'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 focus:ring-emerald-500/20'
                              : currentStatus === 'excused'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 focus:ring-amber-500/20'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/30 focus:ring-rose-500/20'
                          }`}
                        >
                          <option value="present">Hadir</option>
                          <option value="excused">Izin</option>
                          <option value="absent">Tidak Hadir</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Belum ada jamaah yang terdaftar dalam paket bimbingan ini.
          </div>
        )}
      </div>
    </div>
  )
}
