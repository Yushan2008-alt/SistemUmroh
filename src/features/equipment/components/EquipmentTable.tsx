'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Luggage,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Check,
  Package,
} from 'lucide-react'
import type { EquipmentDistributionItem } from '../types'
import { deleteEquipment, quickHandOverEquipment } from '../actions'

interface EquipmentTableProps {
  initialEquipment: EquipmentDistributionItem[]
  currentSearch?: string
  currentStatus?: string
}

export function EquipmentTable({
  initialEquipment,
  currentSearch = '',
  currentStatus = 'all',
}: EquipmentTableProps) {
  const router = useRouter()
  const [equipment, setEquipment] = useState<EquipmentDistributionItem[]>(initialEquipment)
  const [search, setSearch] = useState(currentSearch)
  const [status, setStatus] = useState(currentStatus)
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<EquipmentDistributionItem | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFilter = (newStatus = status, newSearch = search) => {
    const params = new URLSearchParams()
    if (newSearch.trim()) params.set('q', newSearch.trim())
    if (newStatus && newStatus !== 'all') params.set('status', newStatus)
    router.push(`/equipment?${params.toString()}`)
  }

  const handleQuickHandOver = async (id: number) => {
    setLoadingActionId(id)
    setErrorMessage(null)

    const res = await quickHandOverEquipment(id)
    setLoadingActionId(null)

    if (res.success) {
      setEquipment((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: 'handed_over', handed_at: new Date().toISOString() }
            : item
        )
      )
      router.refresh()
    } else {
      setErrorMessage(res.error || 'Gagal mengubah status penyerahan')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmItem) return
    setLoadingActionId(deleteConfirmItem.id)
    setErrorMessage(null)

    const result = await deleteEquipment(deleteConfirmItem.id)
    setLoadingActionId(null)

    if (result.success) {
      setEquipment((prev) => prev.filter((e) => e.id !== deleteConfirmItem.id))
      setDeleteConfirmItem(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus perlengkapan')
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (itemStatus: string) => {
    switch (itemStatus) {
      case 'handed_over':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Sudah Diserahkan
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Belum Diserahkan
          </span>
        )
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Dikembalikan
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            {itemStatus}
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
            <Luggage className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Perlengkapan Jamaah
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manajemen dan rekam distribusi koper, tas paspor, kain ihram, dan seragam batik jamaah.
          </p>
        </div>
        <Link
          href="/equipment/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Perlengkapan
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

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter(status, search)}
            placeholder="Cari item perlengkapan, nama jamaah, kode booking..."
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
          <option value="pending">Belum Diserahkan</option>
          <option value="handed_over">Sudah Diserahkan</option>
          <option value="returned">Dikembalikan</option>
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
              router.push('/equipment')
            }}
            className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {equipment.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Jamaah &amp; Paket</th>
                  <th className="px-5 py-3.5">Item Perlengkapan</th>
                  <th className="px-5 py-3.5">Qty</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Tanggal Serah</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {equipment.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground">
                        {item.registrations?.pilgrims?.name || '-'}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Package className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {item.registrations?.packages?.name || 'Paket'}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{item.registrations?.code}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground text-sm flex items-center gap-2">
                        <Luggage className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{item.item}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-foreground text-sm">
                        {item.quantity} Unit
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-xs text-foreground">
                      {formatDate(item.handed_at)}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleQuickHandOver(item.id)}
                            disabled={loadingActionId === item.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            title="1-Click Konfirmasi Serah Barang"
                          >
                            {loadingActionId === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Serahkan
                          </button>
                        )}
                        <Link
                          href={`/equipment/${item.id}/edit`}
                          className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Perlengkapan"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(item)}
                          className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Hapus Entri"
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
            <Luggage className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">Belum ada data perlengkapan</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Catat distribusi koper, tas paspor, seragam, dan kain ihram untuk setiap jamaah.
            </p>
            <Link
              href="/equipment/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Catat Distribusi Baru
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">Hapus Entri Perlengkapan?</h3>
              <p className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus data perlengkapan{' '}
                <strong className="text-foreground">{deleteConfirmItem.item}</strong> untuk jamaah{' '}
                {deleteConfirmItem.registrations?.pilgrims?.name}?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={Boolean(loadingActionId)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(loadingActionId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {loadingActionId ? (
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
