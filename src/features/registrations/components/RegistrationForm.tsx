'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createRegistration } from '../actions'
import { toast } from 'sonner'
import { UserCheck, Calendar, FileText, AlertCircle, ArrowLeft, CheckCircle2, PackageCheck } from 'lucide-react'

interface RegistrationFormProps {
  options: {
    pilgrims: { id: number; name: string; nik: string; phone: string; passport_number: string | null }[]
    packages: { id: number; name: string; type: string; price: number; departure_date: string; quota: number; remaining_quota: number; is_full: boolean }[]
    guides: { id: number; name: string }[]
  }
}

export function RegistrationForm({ options }: RegistrationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [pilgrimId, setPilgrimId] = useState<number | ''>('')
  const [packageId, setPackageId] = useState<number | ''>('')
  const [guideId, setGuideId] = useState<number | ''>('')
  const [registeredAt, setRegisteredAt] = useState<string>(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedPackage = options.packages.find((p) => p.id === Number(packageId))
  const selectedPilgrim = options.pilgrims.find((p) => p.id === Number(pilgrimId))

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!pilgrimId) errs.pilgrim_id = 'Pilih salah satu calon jamaah.'
    if (!packageId) errs.package_id = 'Pilih paket umroh atau haji yang dituju.'
    else if (selectedPackage?.is_full) {
      errs.package_id = 'Paket ini sudah penuh (kuota habis). Silakan pilih paket lain.'
    }
    if (!registeredAt) errs.registered_at = 'Tanggal pendaftaran wajib diisi.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Mohon lengkapi formulir dengan benar.')
      return
    }

    setLoading(true)
    try {
      const res = await createRegistration({
        pilgrim_id: Number(pilgrimId),
        package_id: Number(packageId),
        guide_id: guideId ? Number(guideId) : null,
        registered_at: registeredAt,
        notes: notes.trim() || null,
      })

      if (res.success && res.data) {
        toast.success(`Booking pendaftaran ${res.data.code} berhasil dibuat!`)
        router.push(`/registrations/${res.data.id}`)
      } else {
        toast.error(res.error || 'Gagal membuat pendaftaran.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Informasi Calon Jamaah & Paket
            </h3>

            {/* Pilgrim Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Pilih Jamaah <span className="text-rose-500">*</span>
              </label>
              <select
                value={pilgrimId}
                onChange={(e) => {
                  setPilgrimId(e.target.value ? Number(e.target.value) : '')
                  if (errors.pilgrim_id) setErrors((prev) => ({ ...prev, pilgrim_id: '' }))
                }}
                className={`w-full px-3.5 py-2.5 bg-background border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                  errors.pilgrim_id ? 'border-rose-500' : 'border-border'
                }`}
              >
                <option value="">-- Pilih Jamaah Terdaftar --</option>
                {options.pilgrims.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — NIK: {p.nik} ({p.phone})
                  </option>
                ))}
              </select>
              {errors.pilgrim_id && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.pilgrim_id}
                </p>
              )}
            </div>

            {/* Package Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Pilih Paket Umroh / Haji <span className="text-rose-500">*</span>
              </label>
              <select
                value={packageId}
                onChange={(e) => {
                  setPackageId(e.target.value ? Number(e.target.value) : '')
                  if (errors.package_id) setErrors((prev) => ({ ...prev, package_id: '' }))
                }}
                className={`w-full px-3.5 py-2.5 bg-background border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors ${
                  errors.package_id ? 'border-rose-500' : 'border-border'
                }`}
              >
                <option value="">-- Pilih Paket Keberangkatan --</option>
                {options.packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id} disabled={pkg.is_full}>
                    {pkg.name} | Berangkat: {pkg.departure_date} | Sisa Kuota: {pkg.remaining_quota} pax
                    {pkg.is_full ? ' [PENUH]' : ''}
                  </option>
                ))}
              </select>
              {errors.package_id && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.package_id}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Guide Selection (Optional) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Pembimbing / Muthawif <span className="text-muted-foreground text-xs">(Opsional)</span>
                </label>
                <select
                  value={guideId}
                  onChange={(e) => setGuideId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- Tanpa Pembimbing Khusus --</option>
                  {options.guides.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Registration Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Tanggal Booking <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={registeredAt}
                    onChange={(e) => setRegisteredAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Special Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Catatan Tambahan / Permintaan Khusus</label>
              <textarea
                rows={3}
                placeholder="Contoh: Permintaan satu kamar dengan keluarga, riwayat kursi roda, dsb."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Summary & Pricing Preview */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4 sticky top-24">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PackageCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Ringkasan Booking
            </h4>

            {selectedPackage ? (
              <div className="space-y-3 divide-y divide-border pt-1">
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Paket Terpilih</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{selectedPackage.name}</div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 mt-1">
                    Sisa Kuota: {selectedPackage.remaining_quota} Kursi
                  </div>
                </div>

                <div className="pt-3">
                  <div className="text-xs text-muted-foreground font-medium">Jadwal Keberangkatan</div>
                  <div className="text-sm font-medium text-foreground mt-0.5 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {selectedPackage.departure_date}
                  </div>
                </div>

                <div className="pt-3">
                  <div className="text-xs text-muted-foreground font-medium">Total Harga Paket</div>
                  <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(selectedPackage.price)}
                  </div>
                </div>

                <div className="pt-3 space-y-1 bg-muted/40 -mx-5 -mb-5 p-5 rounded-b-xl border-t border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Uang Muka (DP Otomatis):</span>
                    <span className="font-semibold text-foreground">Rp 5.000.000</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground italic">
                    * Tagihan DP otomatis diterbitkan dengan jatuh tempo 7 hari kalender.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 border border-dashed border-border rounded-xl text-center text-xs text-muted-foreground">
                Pilih paket untuk melihat detail harga, kuota, dan jadwal keberangkatan.
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading || selectedPackage?.is_full}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {loading ? 'Menyimpan Booking...' : 'Daftarkan Jamaah Sekarang'}
              </button>
              <Link
                href="/registrations"
                className="w-full py-2.5 px-4 border border-border hover:bg-muted text-muted-foreground text-center rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Batal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
