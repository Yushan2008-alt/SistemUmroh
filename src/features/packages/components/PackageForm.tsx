'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package as PackageIcon,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  Plane,
  Coins,
  Users,
} from 'lucide-react'
import type {
  PackageItem,
  PackageFormData,
  PackageFormDataOptions,
} from '../types'
import { createPackage, updatePackage } from '../actions'

interface PackageFormProps {
  pkg?: PackageItem
  options: PackageFormDataOptions
  isEdit?: boolean
}

export function PackageForm({ pkg, options, isEdit = false }: PackageFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<PackageFormData>({
    branch_id: pkg?.branch_id || options.branches[0]?.id || 1,
    name: pkg?.name || '',
    type: pkg?.type || 'umroh',
    status: pkg?.status || 'draft',
    price: pkg?.price || 30000000,
    quota: pkg?.quota || 45,
    duration_days: pkg?.duration_days || 9,
    departure_date: pkg?.departure_date ? pkg.departure_date.split('T')[0] : '',
    return_date: pkg?.return_date ? pkg.return_date.split('T')[0] : '',
    departure_city: pkg?.departure_city || 'Jakarta',
    hotel_makkah_id: pkg?.hotel_makkah_id || null,
    hotel_madinah_id: pkg?.hotel_madinah_id || null,
    airline_id: pkg?.airline_id || null,
    facility_included: pkg?.facility_included || 'Tiket Pesawat PP\nHotel Makkah & Madinah\nVisa Umroh\nMakan 3x Sehari\nTransportasi Bus AC\nMutawwif Berpengalaman',
    facility_excluded: pkg?.facility_excluded || 'Paspor\nVaksin Meningitis\nPengeluaran Pribadi / Laundry\nKelebihan Bagasi',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formData.name.trim()) {
      setErrorMessage('Nama paket wajib diisi.')
      setIsLoading(false)
      return
    }

    if (!formData.departure_date || !formData.return_date) {
      setErrorMessage('Tanggal keberangkatan dan kepulangan wajib diisi.')
      setIsLoading(false)
      return
    }

    if (new Date(formData.return_date) < new Date(formData.departure_date)) {
      setErrorMessage('Tanggal kepulangan tidak boleh mendahului tanggal keberangkatan.')
      setIsLoading(false)
      return
    }

    let res
    if (isEdit && pkg) {
      res = await updatePackage(pkg.id, formData)
    } else {
      res = await createPackage(formData)
    }

    setIsLoading(false)

    if (res.success) {
      setSuccessMessage(isEdit ? 'Paket berhasil diperbarui!' : 'Paket baru berhasil ditambahkan!')
      setTimeout(() => {
        router.push('/packages')
        router.refresh()
      }, 1000)
    } else {
      setErrorMessage(res.error || 'Terjadi kesalahan saat menyimpan paket.')
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/packages"
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <PackageIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {isEdit ? `Edit Paket: ${pkg?.name}` : 'Buat Paket Perjalanan Baru'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Konfigurasi informasi paket perjalanan Umroh atau Haji, kuota, jadwal, dan fasilitas.
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Informasi Paket */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-border/60 pb-3 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-foreground">Informasi Dasar Paket</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nama Paket Perjalanan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Paket Umroh Syawal Bintang 5 Plus Turki 12 Hari"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Kantor Cabang Pengelola <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                {options.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Jenis Program <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="umroh">Umroh</option>
                <option value="haji">Haji</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Harga Paket (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={500000}
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Status Publikasi <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="draft">Draft (Disimpan Sementara)</option>
                <option value="published">Published (Dibuka untuk Jamaah)</option>
                <option value="closed">Closed (Pendaftaran Ditutup)</option>
                <option value="completed">Completed (Selesai Berangkat)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Kuota Jamaah (Kursi) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.quota}
                  onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Durasi Program (Hari) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Keberangkatan & Akomodasi */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-border/60 pb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-foreground">Keberangkatan &amp; Akomodasi</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Tanggal Berangkat <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Tanggal Kepulangan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.return_date}
                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Kota Keberangkatan (Embarkasi) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.departure_city}
                onChange={(e) => setFormData({ ...formData, departure_city: e.target.value })}
                placeholder="Contoh: Jakarta (CGK), Surabaya (SUB)"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                Hotel Mekah
              </label>
              <select
                value={formData.hotel_makkah_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hotel_makkah_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="">-- Pilih Hotel Mekah --</option>
                {options.hotelsMakkah.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} (★{h.star_rating} • {h.distance_to_masjid}m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-600" />
                Hotel Madinah
              </label>
              <select
                value={formData.hotel_madinah_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hotel_madinah_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="">-- Pilih Hotel Madinah --</option>
                {options.hotelsMadinah.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} (★{h.star_rating} • {h.distance_to_masjid}m)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-emerald-600" />
                Maskapai Penerbangan
              </label>
              <select
                value={formData.airline_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    airline_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="">-- Pilih Maskapai Penerbangan --</option>
                {options.airlines.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.code}) - {a.transit || 'Direct Flight'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Fasilitas Termasuk & Tidak Termasuk */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-border/60 pb-3 flex items-center gap-2">
            <PackageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-foreground">Fasilitas &amp; Catatan Layanan</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Fasilitas Termasuk (Included)
              </label>
              <textarea
                rows={5}
                value={formData.facility_included || ''}
                onChange={(e) => setFormData({ ...formData, facility_included: e.target.value })}
                placeholder="Pisahkan fasilitas dengan baris baru..."
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none font-sans"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Masukkan 1 poin fasilitas per baris.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Fasilitas Tidak Termasuk (Excluded)
              </label>
              <textarea
                rows={5}
                value={formData.facility_excluded || ''}
                onChange={(e) => setFormData({ ...formData, facility_excluded: e.target.value })}
                placeholder="Pisahkan fasilitas dengan baris baru..."
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none font-sans"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Masukkan 1 poin fasilitas per baris.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Simpan Perubahan' : 'Buat Paket Sekarang'}
              </>
            )}
          </button>
          <Link
            href="/packages"
            className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted font-medium text-sm transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
