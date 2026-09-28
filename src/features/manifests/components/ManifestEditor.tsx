'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Printer,
  PlaneTakeoff,
  Building,
  Plane,
  Calendar,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react'
import type { ManifestRegistrationItem, ManifestRowInput } from '../types'
import { updateManifestEntries } from '../actions'

interface ManifestEditorProps {
  pkg: any
  registrations: ManifestRegistrationItem[]
}

export function ManifestEditor({ pkg, registrations }: ManifestEditorProps) {
  const router = useRouter()

  // Inisialisasi state baris manifest dari data yang ada
  const [rows, setRows] = useState<Record<number, ManifestRowInput>>(() => {
    const map: Record<number, ManifestRowInput> = {}
    registrations.forEach((r) => {
      const entry = r.manifest_entry
      map[r.id] = {
        room_number: entry?.room_number || '',
        room_type: (entry?.room_type as any) || 'quad',
        bus_number: entry?.bus_number || '',
        seat_number: entry?.seat_number || '',
        mahram_group: entry?.mahram_group || '',
      }
    })
    return map
  })

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)

  const handleRowChange = (
    regId: number,
    field: keyof ManifestRowInput,
    value: string
  ) => {
    setRows((prev) => ({
      ...prev,
      [regId]: {
        ...prev[regId],
        [field]: value,
      },
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const res = await updateManifestEntries(pkg.id, rows)
    setIsLoading(false)

    if (res.success) {
      setSuccessMessage('Data manifest dan rooming berhasil disimpan!')
      router.refresh()
      setTimeout(() => setSuccessMessage(null), 3000)
    } else {
      setErrorMessage(res.error || 'Gagal menyimpan entri manifest.')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/manifests"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 uppercase tracking-wider">
                Manifest Keberangkatan
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{pkg.name}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              Alokasi Kamar &amp; Transportasi
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-muted-foreground" />
            Cetak Manifest Resmi
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || registrations.length === 0}
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
                Simpan Manifest
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

      {/* Package Specs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
            Jadwal Keberangkatan
          </span>
          <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            {formatDate(pkg.departure_date)}
          </div>
          <p className="text-xs text-muted-foreground">Embarkasi: {pkg.departure_city || 'Jakarta'}</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
            Penerbangan
          </span>
          <div className="text-sm font-bold text-foreground flex items-center gap-1.5 truncate">
            <Plane className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="truncate">{pkg.airlines?.name || '-'}</span>
          </div>
          <p className="text-xs text-muted-foreground">Rute: {pkg.airlines?.transit || 'Direct Flight'}</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
            Hotel Makkah
          </span>
          <div className="text-sm font-bold text-foreground flex items-center gap-1.5 truncate">
            <Building className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{pkg.hotel_makkah?.name || '-'}</span>
          </div>
          <p className="text-xs text-muted-foreground">Bintang {pkg.hotel_makkah?.star_rating || 4}</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-1">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">
            Total Jamaah
          </span>
          <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>{registrations.length} Jamaah</span>
          </div>
          <p className="text-xs text-muted-foreground">Siap dialokasikan</p>
        </div>
      </div>

      {/* Manifest Editable Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 min-w-[200px]">Jamaah</th>
                  <th className="px-4 py-3.5 min-w-[130px]">No. Kamar</th>
                  <th className="px-4 py-3.5 min-w-[130px]">Tipe Kamar</th>
                  <th className="px-4 py-3.5 min-w-[110px]">No. Bus</th>
                  <th className="px-4 py-3.5 min-w-[110px]">No. Kursi</th>
                  <th className="px-4 py-3.5 min-w-[140px]">Grup Mahram</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {registrations.map((r) => {
                  const row = rows[r.id] || {
                    room_number: '',
                    room_type: 'quad',
                    bus_number: '',
                    seat_number: '',
                    mahram_group: '',
                  }

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-muted/20 transition-colors duration-150"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-foreground">{r.pilgrim?.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{r.pilgrim?.gender === 'male' ? 'L' : 'P'}</span>
                          <span>•</span>
                          <span className="font-mono">Paspor: {r.pilgrim?.passport_number || '-'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          value={row.room_number}
                          onChange={(e) => handleRowChange(r.id, 'room_number', e.target.value)}
                          placeholder="Mis. 402"
                          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <select
                          value={row.room_type}
                          onChange={(e) =>
                            handleRowChange(r.id, 'room_type', e.target.value as any)
                          }
                          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                        >
                          <option value="quad">Quad (4 org)</option>
                          <option value="triple">Triple (3 org)</option>
                          <option value="double">Double (2 org)</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          value={row.bus_number}
                          onChange={(e) => handleRowChange(r.id, 'bus_number', e.target.value)}
                          placeholder="Bus 1"
                          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          value={row.seat_number}
                          onChange={(e) => handleRowChange(r.id, 'seat_number', e.target.value)}
                          placeholder="12A"
                          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <input
                          type="text"
                          value={row.mahram_group}
                          onChange={(e) => handleRowChange(r.id, 'mahram_group', e.target.value)}
                          placeholder="Keluarga Budi"
                          className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Belum ada jamaah yang terdaftar dalam paket ini.
          </div>
        )}
      </div>

      {/* Printable A4 Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-4 border-b border-border/80 flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-foreground">
                  Pratinjau Dokumen Manifest Resmi (Format A4)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Area */}
            <div className="p-8 bg-white text-slate-900 font-sans space-y-6 max-h-[75vh] overflow-y-auto" id="printable-manifest">
              {/* Kop Surat */}
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <h2 className="text-xl font-black uppercase tracking-wider text-emerald-800">
                  TRAVEL MANAJEMEN UMROH &amp; HAJI
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Surat Izin Kemenag RI No. 412/2021 • Jl. Jenderal Sudirman No. 45, Jakarta Selatan
                </p>
                <div className="inline-block mt-3 px-3 py-1 bg-slate-100 rounded text-xs font-bold uppercase tracking-widest text-slate-800 border border-slate-300">
                  MANIFEST PENUMPANG &amp; ROOMING LIST HOTEL
                </div>
              </div>

              {/* Rincian Paket */}
              <div className="grid grid-cols-2 text-xs gap-y-1.5 text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900">Nama Paket:</span> {pkg.name}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Tanggal Berangkat:</span>{' '}
                  {formatDate(pkg.departure_date)}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Penerbangan:</span>{' '}
                  {pkg.airlines?.name || '-'} ({pkg.departure_city || 'Jakarta'} - Jeddah)
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Hotel Makkah:</span>{' '}
                  {pkg.hotel_makkah?.name || '-'}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Hotel Madinah:</span>{' '}
                  {pkg.hotel_madinah?.name || '-'}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Total Jamaah:</span>{' '}
                  {registrations.length} Orang
                </div>
              </div>

              {/* Tabel Cetak */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                    <th className="p-2 border-r border-slate-300">Nama Jamaah</th>
                    <th className="p-2 border-r border-slate-300">Gender</th>
                    <th className="p-2 border-r border-slate-300">No. Paspor</th>
                    <th className="p-2 border-r border-slate-300">Kamar</th>
                    <th className="p-2 border-r border-slate-300">Tipe</th>
                    <th className="p-2 border-r border-slate-300">Bus</th>
                    <th className="p-2 border-r border-slate-300">Kursi</th>
                    <th className="p-2">Grup Mahram</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {registrations.map((r, idx) => {
                    const row = rows[r.id] || {
                      room_number: '',
                      room_type: 'quad',
                      bus_number: '',
                      seat_number: '',
                      mahram_group: '',
                    }

                    return (
                      <tr key={r.id}>
                        <td className="p-2 border-r border-slate-300 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-semibold">
                          {r.pilgrim?.name}
                        </td>
                        <td className="p-2 border-r border-slate-300 uppercase">
                          {r.pilgrim?.gender === 'male' ? 'L' : 'P'}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono font-medium">
                          {r.pilgrim?.passport_number || '-'}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-bold">
                          {row.room_number || '-'}
                        </td>
                        <td className="p-2 border-r border-slate-300 capitalize">
                          {row.room_type || 'Quad'}
                        </td>
                        <td className="p-2 border-r border-slate-300">
                          {row.bus_number || '-'}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono">
                          {row.seat_number || '-'}
                        </td>
                        <td className="p-2">{row.mahram_group || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Tanda Tangan */}
              <div className="pt-6 grid grid-cols-2 text-xs text-center text-slate-800">
                <div>
                  <p>Petugas Operasional &amp; Handling</p>
                  <div className="h-16" />
                  <p className="font-bold underline">Staff Operasional Bandara</p>
                </div>
                <div>
                  <p>Mengetahui, Tour Leader / Muthawif</p>
                  <div className="h-16" />
                  <p className="font-bold underline">Ustadz Pembimbing</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-muted/40 border-t border-border/80 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-sm font-medium"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Cetak Dokumen Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
