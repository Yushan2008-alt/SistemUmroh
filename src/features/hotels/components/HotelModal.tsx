'use client'

import { useState, useEffect } from 'react'
import { Hotel as HotelIcon, Star, MapPin, X, Loader2 } from 'lucide-react'
import type { Hotel, HotelFormData } from '../types'
import { createHotel, updateHotel } from '../actions'

interface HotelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  hotelToEdit?: Hotel | null
}

export function HotelModal({ isOpen, onClose, onSuccess, hotelToEdit }: HotelModalProps) {
  const [formData, setFormData] = useState<HotelFormData>({
    name: '',
    city: 'makkah',
    star_rating: 4,
    distance_to_masjid: 100,
    address: '',
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (hotelToEdit) {
      setFormData({
        name: hotelToEdit.name,
        city: hotelToEdit.city.toLowerCase(),
        star_rating: hotelToEdit.star_rating,
        distance_to_masjid: hotelToEdit.distance_to_masjid || 0,
        address: hotelToEdit.address || '',
        is_active: hotelToEdit.is_active,
      })
    } else {
      setFormData({
        name: '',
        city: 'makkah',
        star_rating: 4,
        distance_to_masjid: 100,
        address: '',
        is_active: true,
      })
    }
    setError(null)
  }, [hotelToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.name.trim()) {
      setError('Nama hotel wajib diisi')
      setLoading(false)
      return
    }

    try {
      let res
      if (hotelToEdit) {
        res = await updateHotel(hotelToEdit.id, formData)
      } else {
        res = await createHotel(formData)
      }

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || 'Terjadi kesalahan menyimpan data hotel')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data hotel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <HotelIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {hotelToEdit ? 'Edit Data Hotel' : 'Tambah Hotel Baru'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Informasi akomodasi hotel di Makkah atau Madinah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Nama Hotel <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Swissôtel Al Maqam Makkah"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Kota <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="makkah">Makkah (Haram)</option>
                <option value="madinah">Madinah (Nabawi)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Rating Bintang
              </label>
              <select
                value={formData.star_rating}
                onChange={(e) => setFormData({ ...formData, star_rating: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (Bintang 5)</option>
                <option value={4}>⭐⭐⭐⭐ (Bintang 4)</option>
                <option value={3}>⭐⭐⭐ (Bintang 3)</option>
                <option value={2}>⭐⭐ (Bintang 2)</option>
                <option value={1}>⭐ (Bintang 1)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Jarak ke Masjid (Meter)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10"
                placeholder="50"
                value={formData.distance_to_masjid ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    distance_to_masjid: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                meter
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Jarak jalan kaki ke pelataran Masjidil Haram atau Masjid Nabawi.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Alamat Lengkap / Kawasan
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Abraj Al Bait Complex, King Abdul Aziz Endowment, Makkah"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="hotel_is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-input focus:ring-emerald-500"
            />
            <label htmlFor="hotel_is_active" className="text-sm font-medium text-foreground cursor-pointer">
              Hotel Aktif (Tersedia untuk paket umroh/haji)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {hotelToEdit ? 'Simpan Perubahan' : 'Tambah Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
