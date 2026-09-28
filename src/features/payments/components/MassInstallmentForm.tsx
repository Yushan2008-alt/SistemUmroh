'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/navigation'
import {
  Layers,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Info,
  DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'
import { generateMassInstallments } from '../actions'

interface PackageOption {
  id: number
  name: string
  price: number
  departure_date: string
  active_registrations_count: number
}

interface MassInstallmentFormProps {
  packages: PackageOption[]
}

export function MassInstallmentForm({ packages }: MassInstallmentFormProps) {
  const router = useRouter()
  const [selectedPackageId, setSelectedPackageId] = useState<number>(packages[0]?.id || 0)
  const [tenorMonths, setTenorMonths] = useState<number>(3)
  const [firstDueDate, setFirstDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [dayOfMonth, setDayOfMonth] = useState<number>(10)
  const [note, setNote] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const selectedPkg = packages.find((p) => p.id === selectedPackageId)

  // Simulation calculation
  const estPerMonth = selectedPkg
    ? Math.round(selectedPkg.price / (tenorMonths || 1))
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackageId) {
      toast.error('Silakan pilih paket umroh/haji.')
      return
    }

    if (tenorMonths < 1 || tenorMonths > 36) {
      toast.error('Jumlah tenor cicilan harus antara 1 sampai 36 bulan.')
      return
    }

    setLoading(true)
    try {
      const res = await generateMassInstallments({
        package_id: selectedPackageId,
        tenor_months: tenorMonths,
        first_due_date: firstDueDate,
        day_of_month: dayOfMonth,
        note: note.trim() || undefined,
      })

      if (res.success) {
        toast.success(res.message)
        router.push('/payments')
      } else {
        toast.warning(res.message)
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem saat membuat tagihan massal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <a
          href="/payments"
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </a>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Generator Tagihan Cicilan Massal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Terbitkan skema tagihan cicilan berkala secara otomatis untuk seluruh jamaah terdaftar dalam satu paket
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Package Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Pilih Paket Keberangkatan
            </label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — Rp {pkg.price.toLocaleString('id-ID')} ({pkg.active_registrations_count} Jamaah Terdaftar)
                </option>
              ))}
            </select>
          </div>

          {/* Tenor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tenor Cicilan (Berapa Kali Pembayaran)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[3, 6, 10, 12].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTenorMonths(t)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                    tenorMonths === t
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t} Bulan ({t}x)
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Atau masukkan jumlah bulan khusus:</span>
              <input
                type="number"
                min={1}
                max={36}
                value={tenorMonths}
                onChange={(e) => setTenorMonths(Number(e.target.value))}
                className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-center font-bold"
              />
              <span className="text-xs text-slate-500">kali cicilan</span>
            </div>
          </div>

          {/* Due Date Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Jatuh Tempo Cicilan Pertama
              </label>
              <input
                type="date"
                value={firstDueDate}
                onChange={(e) => setFirstDueDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jatuh Tempo Berkala (Setiap Tanggal)
              </label>
              <select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {[5, 10, 15, 20, 25, 28].map((day) => (
                  <option key={day} value={day}>
                    Tanggal {day} setiap bulan
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan Invoice (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Skema cicilan reguler 3 bulan sebelum keberangkatan"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Live Simulation Preview Box */}
        {selectedPkg && (
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Simulasi Penerbitan Invoice Cicilan Massal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-slate-500 block">Total Jamaah Terdaftar</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {selectedPkg.active_registrations_count} Jamaah
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-slate-500 block">Harga Paket</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  Rp {selectedPkg.price.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-slate-500 block">Estimasi per Cicilan</span>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 block">
                  Rp {estPerMonth.toLocaleString('id-ID')} / bln
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              * Sistem akan secara otomatis memeriksa nominal yang sudah dibayar (DP) oleh masing-masing jamaah dan membagi sisa piutang secara merata ke dalam <strong>{tenorMonths} termin cicilan</strong> (`REG-XXXXX-C1`, `REG-XXXXX-C2`, dst).
            </p>
          </div>
        )}

        {/* Submit Toolbar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <a
            href="/payments"
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Batal
          </a>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Menerbitkan Invoice...' : 'Generate Tagihan Cicilan Massal'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
