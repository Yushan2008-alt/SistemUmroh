'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Hotel as HotelIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Star,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Building,
} from 'lucide-react'
import type { Hotel } from '../types'
import { deleteHotel } from '../actions'
import { HotelModal } from './HotelModal'
import { cn } from '@/lib/utils'

interface HotelsTableProps {
  initialHotels: Hotel[]
  currentSearch?: string
  currentCity?: string
}

export function HotelsTable({
  initialHotels,
  currentSearch = '',
  currentCity = 'all',
}: HotelsTableProps) {
  const router = useRouter()
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels)
  const [search, setSearch] = useState(currentSearch)
  const [cityFilter, setCityFilter] = useState(currentCity)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hotelToEdit, setHotelToEdit] = useState<Hotel | null>(null)
  const [deleteConfirmHotel, setDeleteConfirmHotel] = useState<Hotel | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (cityFilter !== 'all') params.set('city', cityFilter)
    router.push(`/hotels?${params.toString()}`)
  }

  const handleCityChange = (city: string) => {
    setCityFilter(city)
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (city !== 'all') params.set('city', city)
    router.push(`/hotels?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteConfirmHotel) return
    setDeletingId(deleteConfirmHotel.id)
    setErrorMessage(null)

    const result = await deleteHotel(deleteConfirmHotel.id)
    setDeletingId(null)

    if (result.success) {
      setHotels((prev) => prev.filter((h) => h.id !== deleteConfirmHotel.id))
      setDeleteConfirmHotel(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus hotel')
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <HotelIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Hotel Makkah &amp; Madinah
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manajemen akomodasi hotel di kota suci, rating bintang, dan jarak ke masjid.
          </p>
        </div>
        <button
          onClick={() => {
            setHotelToEdit(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Hotel
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-xs">
        {/* City Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl">
          <button
            onClick={() => handleCityChange('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              cityFilter === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Semua Kota
          </button>
          <button
            onClick={() => handleCityChange('makkah')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              cityFilter === 'makkah'
                ? 'bg-card text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            🕋 Makkah
          </button>
          <button
            onClick={() => handleCityChange('madinah')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              cityFilter === 'madinah'
                ? 'bg-card text-teal-700 dark:text-teal-400 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            🕌 Madinah
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama hotel atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
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

      {/* Table / List */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Hotel &amp; Rating</th>
                <th className="px-5 py-3.5">Kota</th>
                <th className="px-5 py-3.5">Jarak ke Masjid</th>
                <th className="px-5 py-3.5">Alamat</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {hotels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <HotelIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Tidak ada data hotel ditemukan</p>
                    <p className="text-xs mt-1">Coba ubah kata kunci pencarian atau tambah hotel baru.</p>
                  </td>
                </tr>
              ) : (
                hotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{hotel.name}</span>
                      </div>
                      <div className="mt-1">{renderStars(hotel.star_rating)}</div>
                    </td>
                    <td className="px-5 py-4">
                      {hotel.city.toLowerCase() === 'makkah' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          🕋 Makkah
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                          🕌 Madinah
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {hotel.distance_to_masjid ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-muted px-2.5 py-1 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {hotel.distance_to_masjid} meter
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate text-muted-foreground text-xs">
                      {hotel.address || '-'}
                    </td>
                    <td className="px-5 py-4">
                      {hotel.is_active ? (
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
                            setHotelToEdit(hotel)
                            setIsModalOpen(true)
                          }}
                          className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                          title="Edit Hotel"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmHotel(hotel)}
                          className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Hapus Hotel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hotel Create/Edit Modal */}
      <HotelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hotelToEdit={hotelToEdit}
        onSuccess={() => {
          router.refresh()
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Data Hotel</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-sm text-foreground">
              Apakah Anda yakin ingin menghapus hotel{' '}
              <span className="font-semibold text-rose-600">{deleteConfirmHotel.name}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmHotel(null)}
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
