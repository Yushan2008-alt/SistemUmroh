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
  Printer,
  Copy,
  Check,
  Search,
  Building2,
  UserCheck,
} from 'lucide-react'
import type { AttendanceStatus } from '@/types/database.types'
import type { PilgrimAttendanceItem } from './types'
import { recordAttendance } from './manasik.actions'

interface ManasikAttendanceViewProps {
  schedule: any
  initialPilgrims: PilgrimAttendanceItem[]
  initialRekap: { present: number; absent: number; excused: number; sick?: number }
  userRole?: string
}

export function ManasikAttendanceView({
  schedule,
  initialPilgrims,
  initialRekap,
  userRole = 'super_admin',
}: ManasikAttendanceViewProps) {
  const router = useRouter()
  const isStaff = userRole === 'super_admin' || userRole === 'admin'
  const canEditAttendance = isStaff || userRole === 'guide'

  const [attendances, setAttendances] = useState<Record<number, AttendanceStatus>>(() => {
    const map: Record<number, AttendanceStatus> = {}
    initialPilgrims.forEach((p) => {
      map[p.pilgrim_id] = p.status || 'absent'
    })
    return map
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedWa, setCopiedWa] = useState(false)

  // Computed summary
  const computedRekap = {
    present: Object.values(attendances).filter((s) => s === 'present').length,
    excused: Object.values(attendances).filter((s) => s === 'excused').length,
    sick: Object.values(attendances).filter((s) => s === 'sick').length,
    absent: Object.values(attendances).filter((s) => s === 'absent').length,
  }

  const handleStatusChange = (pilgrimId: number, status: AttendanceStatus) => {
    if (!canEditAttendance) return
    setAttendances((prev) => ({
      ...prev,
      [pilgrimId]: status,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canEditAttendance) return

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const res = await recordAttendance(schedule.id, attendances)
    setIsLoading(false)

    if (res.success) {
      setSuccessMessage('Presensi kehadiran jamaah berhasil disimpan secara massal!')
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

  const handleCopyWhatsApp = () => {
    const pkgName = schedule.package?.name || schedule.packages?.name || 'Manasik Akbar Cabang'
    const guideName = schedule.guides?.name || 'Muthawif Pembimbing'

    const waText = `*REKAPITULASI PRESENSI BIMBINGAN MANASIK*
━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *Sesi:* ${schedule.title}
📦 *Paket:* ${pkgName}
📅 *Hari/Tanggal:* ${formatDate(schedule.date)}
⏰ *Waktu:* ${schedule.time ? schedule.time.substring(0, 5) : '08:00'} WIB
📍 *Lokasi:* ${schedule.location}
👳 *Pembimbing:* ${guideName}

📊 *Ringkasan Kehadiran:*
• Hadir: ${computedRekap.present} jamaah
• Izin: ${computedRekap.excused} jamaah
• Sakit: ${computedRekap.sick} jamaah
• Tidak Hadir (Alpa): ${computedRekap.absent} jamaah
• Total Jamaah Eligible: ${initialPilgrims.length} orang
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Laporan resmi kehadiran bimbingan ibadah Umroh & Haji._`

    navigator.clipboard.writeText(waText)
    setCopiedWa(true)
    setTimeout(() => setCopiedWa(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  // Filtered list
  const filteredPilgrims = initialPilgrims.filter((p) => {
    const matchesSearch =
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)

    const currentStatus = attendances[p.pilgrim_id] || 'absent'
    const matchesFilter = statusFilter === 'all' || currentStatus === statusFilter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:max-w-none print:m-0 print:p-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
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
              <span className="text-xs font-medium text-muted-foreground">
                {schedule.package?.name || schedule.packages?.name || 'Manasik Akbar Cabang'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {schedule.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* WhatsApp share */}
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-xs font-semibold transition-colors shadow-xs"
            title="Salin Ringkasan Format WhatsApp"
          >
            {copiedWa ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedWa ? 'Tersalin' : 'Salin Rekap WA'}</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-xs font-semibold transition-colors shadow-xs"
            title="Cetak Lembar Presensi"
          >
            <Printer className="w-4 h-4 text-muted-foreground" />
            <span>Cetak Rekap</span>
          </button>

          {/* Edit schedule (staff only) */}
          {isStaff && (
            <Link
              href={`/manasik/${schedule.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <Edit className="w-4 h-4 text-muted-foreground" />
              <span>Edit</span>
            </Link>
          )}

          {/* Save button (guide or staff) */}
          {canEditAttendance && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || initialPilgrims.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md disabled:opacity-50"
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
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between animate-fadeIn print:hidden">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
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

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2.5 animate-fadeIn print:hidden">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Info Card Pelaksanaan */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3 print:border-none print:p-0">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
          <CalendarDays className="w-4 h-4 text-emerald-600" />
          Rincian Jadwal &amp; Lokasi Pertemuan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block font-medium">Hari &amp; Tanggal:</span>
            <span className="font-semibold text-foreground">{formatDate(schedule.date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Waktu Pertemuan:</span>
            <span className="font-semibold text-foreground">
              {schedule.time ? schedule.time.substring(0, 5) : '08:00'} WIB s/d Selesai
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Lokasi:</span>
            <span className="font-semibold text-foreground">{schedule.location}</span>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Ustadz Pembimbing:</span>
            <span className="font-semibold text-foreground">
              {schedule.guides?.name ? `👳 ${schedule.guides.name}` : 'Belum Ditugaskan'}
            </span>
          </div>
          {schedule.description && (
            <div className="sm:col-span-2 md:col-span-4 pt-2 border-t border-border/40">
              <span className="text-muted-foreground block font-medium">Catatan / Materi:</span>
              <p className="text-foreground mt-0.5">{schedule.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Rekapitulasi Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>HADIR</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{computedRekap.present}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Jamaah mengikuti sesi</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>IZIN</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{computedRekap.excused}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Izin berhalangan</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>SAKIT</span>
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{computedRekap.sick}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Kondisi kesehatan</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
            <span>TIDAK HADIR</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{computedRekap.absent}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Alpa / Belum diabsen</p>
        </div>
      </div>

      {/* Absensi Jamaah Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden space-y-4">
        {/* Table Filter & Search Header */}
        <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Presensi Kehadiran Jamaah ({initialPilgrims.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Eligible: registrasi aktif (status != cancelled) pada paket atau seluruh cabang.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama / no HP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="present">Hadir</option>
              <option value="excused">Izin</option>
              <option value="sick">Sakit</option>
              <option value="absent">Tidak Hadir / Alpa</option>
            </select>
          </div>
        </div>

        {initialPilgrims.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 w-10 text-center">No</th>
                  <th className="px-5 py-3">Nama Jamaah</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">Kontak</th>
                  <th className="px-5 py-3">Catatan Petugas</th>
                  <th className="px-5 py-3 min-w-[160px] text-right">Status Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredPilgrims.map((pilgrim, idx) => {
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
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {pilgrim.recorded_by ? (
                          <span className="text-[11px] font-mono bg-muted px-2 py-0.5 rounded">
                            Oleh: {pilgrim.recorded_by}
                          </span>
                        ) : (
                          <span className="text-[11px] italic text-muted-foreground/60">
                            Belum tercatat
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {canEditAttendance ? (
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
                                : currentStatus === 'sick'
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/30 focus:ring-blue-500/20'
                                : 'bg-rose-500/10 text-rose-600 border-rose-500/30 focus:ring-rose-500/20'
                            }`}
                          >
                            <option value="present">Hadir</option>
                            <option value="excused">Izin</option>
                            <option value="sick">Sakit</option>
                            <option value="absent">Tidak Hadir (Alpa)</option>
                          </select>
                        ) : (
                          /* Read-only status badge */
                          <span
                            className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${
                              currentStatus === 'present'
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                : currentStatus === 'excused'
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                : currentStatus === 'sick'
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                            }`}
                          >
                            {currentStatus === 'present'
                              ? 'Hadir'
                              : currentStatus === 'excused'
                              ? 'Izin'
                              : currentStatus === 'sick'
                              ? 'Sakit'
                              : 'Tidak Hadir'}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Tidak ada jamaah eligible yang terdaftar untuk jadwal bimbingan ini.
          </div>
        )}
      </div>
    </div>
  )
}
