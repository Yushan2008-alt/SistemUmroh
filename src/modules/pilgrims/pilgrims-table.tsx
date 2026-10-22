'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  Phone,
  MessageCircle,
  FileText,
  Building2,
  ShieldAlert,
  Info,
} from 'lucide-react'
import type { PilgrimItem } from './types'
import { deletePilgrim } from './pilgrims.actions'
import type { Role } from '@/types/database.types'

interface PilgrimsTableProps {
  initialPilgrims: PilgrimItem[]
  currentSearch?: string
  currentStatus?: string
  userRole?: Role
  activeBranchId?: number | null
  activeBranchName?: string | null
}

export function PilgrimsTable({
  initialPilgrims,
  currentSearch = '',
  currentStatus = 'all',
  userRole = 'super_admin',
  activeBranchId,
  activeBranchName,
}: PilgrimsTableProps) {
  const router = useRouter()
  const [pilgrims, setPilgrims] = useState<PilgrimItem[]>(initialPilgrims)

  // Keep state in sync with server component re-fetches (e.g. when branch focus changes)
  useEffect(() => {
    setPilgrims(initialPilgrims)
  }, [initialPilgrims])

  // Listen to branch change event to revalidate
  useEffect(() => {
    const handleBranchChange = () => {
      router.refresh()
    }
    window.addEventListener('branch_focus_changed', handleBranchChange)
    return () => window.removeEventListener('branch_focus_changed', handleBranchChange)
  }, [router])
  const [search, setSearch] = useState(currentSearch)
  const [status, setStatus] = useState(currentStatus)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmPilgrim, setDeleteConfirmPilgrim] = useState<PilgrimItem | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFilter = (newStatus = status, newSearch = search) => {
    const params = new URLSearchParams()
    if (newSearch.trim()) params.set('q', newSearch.trim())
    if (newStatus && newStatus !== 'all') params.set('status', newStatus)
    router.push(`/pilgrims?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteConfirmPilgrim) return
    setDeletingId(deleteConfirmPilgrim.id)
    setErrorMessage(null)

    const result = await deletePilgrim(deleteConfirmPilgrim.id)
    setDeletingId(null)

    if (result.success) {
      setPilgrims((prev) => prev.filter((p) => p.id !== deleteConfirmPilgrim.id))
      setDeleteConfirmPilgrim(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus data jamaah')
    }
  }

  // Format WhatsApp Link (e.g. 08123... -> 628123...)
  const getWhatsAppLink = (phone: string, name: string) => {
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1)
    }
    const message = encodeURIComponent(`Assalamu'alaikum Wr. Wb. Bpk/Ibu ${name}, kami dari Travel Umroh & Haji ingin mengonfirmasi data keberangkatan Anda.`)
    return `https://wa.me/${clean}?text=${message}`
  }

  // Check if passport expires within 6 months
  const checkPassportExpiring = (expiryDate?: string | null) => {
    if (!expiryDate) return { isExpiring: false, label: '-' }
    const exp = new Date(expiryDate)
    const now = new Date()
    const diffMonths = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44)

    const formatted = exp.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    if (diffMonths <= 0) {
      return { isExpiring: true, isExpired: true, label: `Kadaluarsa (${formatted})` }
    }
    if (diffMonths < 6) {
      return { isExpiring: true, isExpired: false, label: `Exp ${formatted}` }
    }
    return { isExpiring: false, label: formatted }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            {userRole === 'guide' ? 'Data Jamaah Bimbingan' : 'Data Jamaah'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {userRole === 'guide'
              ? 'Daftar seluruh jamaah umroh & haji yang berada dalam rombongan bimbingan Anda.'
              : 'Master database jamaah Umroh & Haji, rekam paspor, dan kontak darurat.'}
          </p>

          {userRole === 'guide' ? (
            <div className="flex items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Rombongan Bimbingan Muthawif
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                • Menampilkan jamaah yang Anda bimbing (Khusus Lihat / Read-Only)
              </span>
            </div>
          ) : userRole === 'agent' ? (
            <div className="flex items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Jamaah Referral Agen
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                • Menampilkan jamaah hasil rekomendasi / pendaftaran Anda
              </span>
            </div>
          ) : userRole === 'admin' ? (
            <div className="flex items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Cabang Operasional: {activeBranchName || 'Cabang Aktif'}
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                • Menampilkan jamaah yang terdaftar di cabang ini
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Semua Cabang (Global View)
              </span>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                • Konsolidasi seluruh data jamaah nasional
              </span>
            </div>
          )}
        </div>
        {userRole !== 'guide' && (
          <Link
            href="/pilgrims/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Tambah Jamaah
          </Link>
        )}
      </div>

      {/* Info Banner Khusus Muthawif / Guide */}
      {userRole === 'guide' && (
        <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-900 dark:text-teal-200 text-sm flex items-start gap-3.5 shadow-xs animate-fadeIn">
          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/60 flex items-center justify-center shrink-0 text-teal-700 dark:text-teal-300">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-teal-950 dark:text-teal-100">
              Peran Pembimbing Ibadah (Muthawif / Guide)
            </h4>
            <p className="text-xs text-teal-800/80 dark:text-teal-300/80 leading-relaxed">
              Anda berfokus pada pembimbingan ibadah, pendampingan manasik, dan pemantauan kondisi jamaah pada rombongan paket yang ditugaskan kepada Anda. Pendaftaran jamaah baru dilakukan oleh Kantor Cabang atau Mitra Agen Resmi.
            </p>
          </div>
        </div>
      )}

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

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter(status, search)}
            placeholder="Cari nama jamaah, NIK, nomor paspor, kode..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            handleFilter(e.target.value, search)
          }}
          className="px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        >
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>

        <button
          type="button"
          onClick={() => handleFilter(status, search)}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-colors"
        >
          Cari
        </button>

        {(search || status !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setStatus('all')
              router.push('/pilgrims')
            }}
            className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {pilgrims.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Kode &amp; Nama Jamaah</th>
                  <th className="px-5 py-3.5">Gender</th>
                  <th className="px-5 py-3.5">NIK (KTP)</th>
                  <th className="px-5 py-3.5">Kontak &amp; WhatsApp</th>
                  <th className="px-5 py-3.5">Paspor &amp; Kadaluarsa</th>
                  <th className="px-5 py-3.5">Cabang / Agen</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pilgrims.map((pilgrim) => {
                  const passInfo = checkPassportExpiring(pilgrim.passport_expiry)

                  return (
                    <tr
                      key={pilgrim.id}
                      className="hover:bg-muted/30 transition-colors duration-150 group"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/pilgrims/${pilgrim.id}`}
                          className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors"
                        >
                          {pilgrim.name}
                        </Link>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {pilgrim.code || '-'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {pilgrim.gender === 'male' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            Laki-laki
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Perempuan
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                        {pilgrim.nik}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-xs font-medium">{pilgrim.phone}</span>
                          {pilgrim.phone && (
                            <a
                              href={getWhatsAppLink(pilgrim.phone, pilgrim.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                              title="Chat WhatsApp langsung"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-mono font-medium text-foreground">
                          {pilgrim.passport_number || '-'}
                        </div>
                        {pilgrim.passport_expiry && (
                          <div className="mt-1">
                            {passInfo.isExpiring ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                <ShieldAlert className="w-3 h-3" />
                                {passInfo.label}
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                Exp: {passInfo.label}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-medium text-foreground">
                          {pilgrim.branches?.name || 'Pusat'}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {pilgrim.agents ? `Agen: ${pilgrim.agents.name}` : 'Langsung'}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/pilgrims/${pilgrim.id}`}
                            className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Lihat Detail Profil"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {userRole !== 'guide' && (
                            <Link
                              href={`/pilgrims/${pilgrim.id}/edit`}
                              className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Edit Data Jamaah"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}
                          {userRole !== 'agent' && userRole !== 'guide' && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmPilgrim(pilgrim)}
                              className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Hapus Jamaah"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              {userRole === 'guide'
                ? 'Belum ada jamaah bimbingan aktif'
                : 'Belum ada jamaah terdaftar'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {userRole === 'guide'
                ? 'Jamaah akan muncul otomatis di sini saat nama Anda ditugaskan sebagai Muthawif pembimbing pada paket pendaftaran jamaah aktif.'
                : 'Daftarkan data jamaah baru untuk memudahkan pengorganisasian paspor, dokumen, dan invoice perjalanan.'}
            </p>
            {userRole !== 'guide' && (
              <Link
                href="/pilgrims/create"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Tambah Jamaah Pertama
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteConfirmPilgrim && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">Hapus Data Jamaah?</h3>
              <p className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus data jamaah{' '}
                <strong className="text-foreground">{deleteConfirmPilgrim.name}</strong> (NIK:{' '}
                {deleteConfirmPilgrim.nik})? Data yang masih memiliki transaksi atau pendaftaran aktif tidak dapat dihapus.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPilgrim(null)}
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
