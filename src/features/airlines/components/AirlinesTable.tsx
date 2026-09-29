'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plane,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import type { Airline } from '../types'
import { deleteAirline } from '../actions'
import { AirlineModal } from './AirlineModal'

interface AirlinesTableProps {
  initialAirlines: Airline[]
  currentSearch?: string
}

export function AirlinesTable({ initialAirlines, currentSearch = '' }: AirlinesTableProps) {
  const router = useRouter()
  const [airlines, setAirlines] = useState<Airline[]>(initialAirlines)
  const [search, setSearch] = useState(currentSearch)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [airlineToEdit, setAirlineToEdit] = useState<Airline | null>(null)
  const [deleteConfirmAirline, setDeleteConfirmAirline] = useState<Airline | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    router.push(`/airlines?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteConfirmAirline) return
    setDeletingId(deleteConfirmAirline.id)
    setErrorMessage(null)

    const result = await deleteAirline(deleteConfirmAirline.id)
    setDeletingId(null)

    if (result.success) {
      setAirlines((prev) => prev.filter((a) => a.id !== deleteConfirmAirline.id))
      setDeleteConfirmAirline(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus maskapai')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Plane className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            Maskapai Penerbangan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manajemen maskapai penerbangan, kode IATA, dan rute transit keberangkatan umroh &amp; haji.
          </p>
        </div>
        <button
          onClick={() => {
            setAirlineToEdit(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Maskapai
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-xs">
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari maskapai atau kode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-xl transition-colors shrink-0"
          >
            Cari
          </button>
        </form>

        <div className="text-xs text-muted-foreground font-medium">
          Total: <span className="text-foreground font-bold">{airlines.length}</span> maskapai terdaftar
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs underline ml-2">
            Tutup
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Nama Maskapai</th>
                <th className="px-5 py-3.5">Kode Penerbangan</th>
                <th className="px-5 py-3.5">Tipe Rute / Transit</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {airlines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    <Plane className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Tidak ada data maskapai ditemukan</p>
                    <p className="text-xs mt-1">Coba ubah kata kunci pencarian atau tambah maskapai baru.</p>
                  </td>
                </tr>
              ) : (
                airlines.map((airline) => {
                  const isDirect = airline.transit?.toLowerCase().includes('direct')
                  return (
                    <tr key={airline.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <Plane className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                          <span>{airline.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-muted text-foreground border border-border">
                          {airline.code}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {airline.transit ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isDirect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {airline.transit}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {airline.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            <XCircle className="w-3.5 h-3.5" />
                            Non-aktif
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAirlineToEdit(airline)
                              setIsModalOpen(true)
                            }}
                            className="p-1.5 text-muted-foreground hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition-colors"
                            title="Edit Maskapai"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmAirline(airline)}
                            className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Hapus Maskapai"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Airline Create/Edit Modal */}
      <AirlineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        airlineToEdit={airlineToEdit}
        onSuccess={() => {
          router.refresh()
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmAirline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Maskapai</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-sm text-foreground">
              Apakah Anda yakin ingin menghapus maskapai{' '}
              <span className="font-semibold text-rose-600">{deleteConfirmAirline.name}</span> (
              {deleteConfirmAirline.code})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAirline(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
              >
                {deletingId !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
