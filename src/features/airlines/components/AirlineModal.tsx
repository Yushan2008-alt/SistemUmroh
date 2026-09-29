'use client'

import { useState, useEffect } from 'react'
import { Plane, X, Loader2 } from 'lucide-react'
import type { Airline, AirlineFormData } from '../types'
import { createAirline, updateAirline } from '../actions'

interface AirlineModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  airlineToEdit?: Airline | null
}

export function AirlineModal({ isOpen, onClose, onSuccess, airlineToEdit }: AirlineModalProps) {
  const [formData, setFormData] = useState<AirlineFormData>({
    name: '',
    code: '',
    transit: '',
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (airlineToEdit) {
      setFormData({
        name: airlineToEdit.name,
        code: airlineToEdit.code,
        transit: airlineToEdit.transit || '',
        is_active: airlineToEdit.is_active,
      })
    } else {
      setFormData({
        name: '',
        code: '',
        transit: 'Direct CGK - JED',
        is_active: true,
      })
    }
    setError(null)
  }, [airlineToEdit, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Nama maskapai dan kode penerbangan wajib diisi')
      setLoading(false)
      return
    }

    try {
      let res
      if (airlineToEdit) {
        res = await updateAirline(airlineToEdit.id, formData)
      } else {
        res = await createAirline(formData)
      }

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError(res.error || 'Terjadi kesalahan menyimpan data maskapai')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data maskapai')
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
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {airlineToEdit ? 'Edit Data Maskapai' : 'Tambah Maskapai Baru'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Informasi penerbangan mitra maskapai umroh &amp; haji
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
              Nama Maskapai <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Garuda Indonesia, Saudia Airlines, Qatar Airways"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Kode Penerbangan / IATA <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: GA-980, SV-816, QR-958"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Tipe Penerbangan / Rute Transit
            </label>
            <input
              type="text"
              placeholder="Contoh: Direct CGK - JED, Transit Doha (QR), Transit Dubai (EK)"
              value={formData.transit || ''}
              onChange={(e) => setFormData({ ...formData, transit: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="airline_is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-input focus:ring-emerald-500"
            />
            <label htmlFor="airline_is_active" className="text-sm font-medium text-foreground cursor-pointer">
              Maskapai Aktif (Tersedia untuk paket umroh/haji)
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
              {airlineToEdit ? 'Simpan Perubahan' : 'Tambah Maskapai'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
