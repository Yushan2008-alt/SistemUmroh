'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Luggage,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import type {
  EquipmentDistributionItem,
  EquipmentFormData,
  EquipmentFormDataOptions,
} from '../types'
import { createEquipment, updateEquipment } from '../actions'

interface EquipmentFormProps {
  equipment?: EquipmentDistributionItem
  options: EquipmentFormDataOptions
  isEdit?: boolean
}

const COMMON_ITEMS = [
  'Koper Utama 24" (Fiber TSA Lock)',
  'Tas Paspor & Selempang Travel',
  'Seragam Batik Travel Resmi',
  'Kain Ihram (2 Lembar) / Mukena Atasan',
  'Buku Panduan Doa & Tata Cara Manasik',
  'Tanda Pengenal Jamaah (ID Card & Lanyard)',
  'Jaket / Baju Koko Travel',
]

export function EquipmentForm({
  equipment,
  options,
  isEdit = false,
}: EquipmentFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<EquipmentFormData>({
    registration_id: equipment?.registration_id || options.registrations[0]?.id || 1,
    item: equipment?.item || COMMON_ITEMS[0],
    quantity: equipment?.quantity || 1,
    status: equipment?.status || 'pending',
    handed_at: equipment?.handed_at ? equipment.handed_at.split('T')[0] : '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formData.item.trim()) {
      setErrorMessage('Item perlengkapan wajib diisi.')
      setIsLoading(false)
      return
    }

    let res
    if (isEdit && equipment) {
      res = await updateEquipment(equipment.id, formData)
    } else {
      res = await createEquipment(formData)
    }

    setIsLoading(false)

    if (res.success) {
      setSuccessMessage(
        isEdit
          ? 'Data perlengkapan berhasil diperbarui!'
          : 'Distribusi perlengkapan berhasil dicatat!'
      )
      setTimeout(() => {
        router.push('/equipment')
        router.refresh()
      }, 1000)
    } else {
      setErrorMessage(res.error || 'Terjadi kesalahan saat menyimpan data perlengkapan.')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/equipment"
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Luggage className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {isEdit ? 'Edit Distribusi Perlengkapan' : 'Catat Perlengkapan Baru'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pilih jamaah terdaftar dan catat status penyerahan barang logistik perjalanan.
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

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Jamaah Penerima <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.registration_id}
              onChange={(e) =>
                setFormData({ ...formData, registration_id: Number(e.target.value) })
              }
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            >
              {options.registrations.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.pilgrim_name} — {r.package_name} ({r.code})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Item Perlengkapan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              list="common-items"
              required
              value={formData.item}
              onChange={(e) => setFormData({ ...formData, item: e.target.value })}
              placeholder="Pilih atau ketik item perlengkapan..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
            <datalist id="common-items">
              {COMMON_ITEMS.map((item, idx) => (
                <option key={idx} value={item} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Jumlah (Qty) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              required
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: Math.max(1, Number(e.target.value)) })
              }
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Status Penyerahan <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                const newStatus = e.target.value as any
                setFormData({
                  ...formData,
                  status: newStatus,
                  handed_at:
                    newStatus === 'handed_over' && !formData.handed_at
                      ? new Date().toISOString().split('T')[0]
                      : formData.handed_at,
                })
              }}
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            >
              <option value="pending">Belum Diserahkan (Pending)</option>
              <option value="handed_over">Sudah Diserahkan (Handed Over)</option>
              <option value="returned">Dikembalikan (Returned)</option>
            </select>
          </div>

          {formData.status === 'handed_over' && (
            <div className="sm:col-span-2 animate-fadeIn">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Tanggal Penyerahan Fisik
              </label>
              <input
                type="date"
                value={formData.handed_at || ''}
                onChange={(e) => setFormData({ ...formData, handed_at: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border/60 flex items-center gap-3">
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
                {isEdit ? 'Simpan Perubahan' : 'Catat Penyerahan'}
              </>
            )}
          </button>
          <Link
            href="/equipment"
            className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted font-medium text-sm transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
