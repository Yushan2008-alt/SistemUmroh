'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Package as PackageIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Building,
  Plane,
  AlertTriangle,
  Loader2,
  Users,
} from 'lucide-react'
import type { PackageItem } from '../types'
import { deletePackage } from '../actions'

interface PackagesTableProps {
  initialPackages: PackageItem[]
  currentSearch?: string
  currentType?: string
  currentStatus?: string
}

export function PackagesTable({
  initialPackages,
  currentSearch = '',
  currentType = 'all',
  currentStatus = 'all',
}: PackagesTableProps) {
  const router = useRouter()
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages)
  const [search, setSearch] = useState(currentSearch)
  const [type, setType] = useState(currentType)
  const [status, setStatus] = useState(currentStatus)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmPackage, setDeleteConfirmPackage] = useState<PackageItem | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFilter = (newType = type, newStatus = status, newSearch = search) => {
    const params = new URLSearchParams()
    if (newSearch.trim()) params.set('q', newSearch.trim())
    if (newType && newType !== 'all') params.set('type', newType)
    if (newStatus && newStatus !== 'all') params.set('status', newStatus)
    router.push(`/packages?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteConfirmPackage) return
    setDeletingId(deleteConfirmPackage.id)
    setErrorMessage(null)

    const result = await deletePackage(deleteConfirmPackage.id)
    setDeletingId(null)

    if (result.success) {
      setPackages((prev) => prev.filter((p) => p.id !== deleteConfirmPackage.id))
      setDeleteConfirmPackage(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus paket perjalanan')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getTypeBadge = (pkgType: string) => {
    if (pkgType === 'haji') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          Haji
        </span>
      )
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        Umroh
      </span>
    )
  }

  const getStatusBadge = (pkgStatus: string) => {
    switch (pkgStatus) {
      case 'published':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Published
          </span>
        )
      case 'draft':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Draft
          </span>
        )
      case 'closed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Ditutup
          </span>
        )
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Selesai
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {pkgStatus}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <PackageIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Paket Umroh &amp; Haji
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Katalog dan konfigurasi jadwal keberangkatan, akomodasi, dan kuota jamaah.
          </p>
        </div>
        <Link
          href="/packages/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Paket
        </Link>
      </div>

      {/* Error Message if any */}
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

      {/* Search & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter(type, status, search)}
            placeholder="Cari nama paket, kota keberangkatan..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            handleFilter(e.target.value, status, search)
          }}
          className="px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        >
          <option value="all">Semua Jenis</option>
          <option value="umroh">Umroh</option>
          <option value="haji">Haji</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            handleFilter(type, e.target.value, search)
          }}
          className="px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        >
          <option value="all">Semua Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="closed">Ditutup</option>
          <option value="completed">Selesai</option>
        </select>

        <button
          type="button"
          onClick={() => handleFilter(type, status, search)}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-colors"
        >
          Terapkan
        </button>

        {(search || type !== 'all' || status !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setType('all')
              setStatus('all')
              router.push('/packages')
            }}
            className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Packages Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {packages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Nama &amp; Durasi Paket</th>
                  <th className="px-5 py-3.5">Jenis</th>
                  <th className="px-5 py-3.5">Harga</th>
                  <th className="px-5 py-3.5">Sisa Kuota</th>
                  <th className="px-5 py-3.5">Keberangkatan</th>
                  <th className="px-5 py-3.5">Akomodasi</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {packages.map((pkg) => {
                  const remaining = pkg.remaining_quota ?? pkg.quota
                  const isFull = remaining <= 0

                  return (
                    <tr
                      key={pkg.id}
                      className="hover:bg-muted/30 transition-colors duration-150 group"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                          <Link href={`/packages/${pkg.id}`}>{pkg.name}</Link>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{pkg.duration_days} Hari</span>
                          {pkg.branches && (
                            <>
                              <span>•</span>
                              <span>{pkg.branches.name}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">{getTypeBadge(pkg.type)}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-foreground">{formatCurrency(pkg.price)}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span
                            className={`font-semibold ${
                              isFull
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {remaining}
                          </span>
                          <span className="text-xs text-muted-foreground">/ {pkg.quota} Kursi</span>
                        </div>
                        <div className="w-24 bg-muted rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFull ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (((pkg.quota - remaining) / pkg.quota) * 100) || 0
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-foreground font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {formatDate(pkg.departure_date)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Dari: {pkg.departure_city || 'Jakarta'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5 max-w-[200px]">
                          {pkg.hotel_makkah && (
                            <div className="text-xs text-foreground flex items-center gap-1 truncate" title={pkg.hotel_makkah.name}>
                              <Building className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{pkg.hotel_makkah.name}</span>
                            </div>
                          )}
                          {pkg.airlines && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 truncate" title={pkg.airlines.name}>
                              <Plane className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{pkg.airlines.name}</span>
                            </div>
                          )}
                          {!pkg.hotel_makkah && !pkg.airlines && (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(pkg.status)}</td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/packages/${pkg.id}`}
                            className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Lihat Detail Paket"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/packages/${pkg.id}/edit`}
                            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit Paket"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmPackage(pkg)}
                            className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Hapus Paket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
            <PackageIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">Belum ada paket ditemukan</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Tambahkan paket perjalanan Umroh atau Haji untuk mulai membuka pendaftaran jamaah.
            </p>
            <Link
              href="/packages/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Buat Paket Pertama
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmPackage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">Hapus Paket Perjalanan?</h3>
              <p className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus paket{' '}
                <strong className="text-foreground">{deleteConfirmPackage.name}</strong>? Paket yang
                memiliki pendaftaran aktif tidak dapat dihapus.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPackage(null)}
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
