'use client'

import { useState } from 'react'
import { updateSettings } from '../actions'
import type { SystemSettings } from '../types'
import { Save, Loader2, CheckCircle2, Building, Palette, Sparkles } from 'lucide-react'

interface SettingsFormProps {
  initialSettings: SystemSettings
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [formData, setFormData] = useState<SystemSettings>(initialSettings)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await updateSettings(formData)
      if (res.success) {
        setMessage({ type: 'success', text: res.message })
      } else {
        setMessage({ type: 'error', text: res.message })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Terjadi kesalahan sistem.' })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (text: string) => {
    if (!text) return 'TR'
    const words = text.trim().split(/\s+/)
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Form Inputs */}
      <div className="lg:col-span-2 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center gap-2.5 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}
          >
            {message.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Card Identitas */}
        <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Building className="h-4 w-4 text-emerald-600" />
            <h3 className="text-base font-bold text-foreground">Identitas Travel & Perusahaan</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nama Aplikasi / Travel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.app_name}
                onChange={(e) => setFormData({ ...formData, app_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Subjudul / Tagline
              </label>
              <input
                type="text"
                value={formData.app_tagline}
                onChange={(e) => setFormData({ ...formData, app_tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Telepon Kantor / CS
              </label>
              <input
                type="text"
                value={formData.company_phone}
                onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Alamat Email Resmi
              </label>
              <input
                type="email"
                value={formData.company_email}
                onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Alamat Kantor Pusat
              </label>
              <textarea
                rows={2}
                value={formData.company_address}
                onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Teks Footer / Hak Cipta
              </label>
              <input
                type="text"
                value={formData.footer_copyright}
                onChange={(e) => setFormData({ ...formData, footer_copyright: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Card Warna & Branding */}
        <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Palette className="h-4 w-4 text-emerald-600" />
            <h3 className="text-base font-bold text-foreground">Palet Warna & Branding Tema</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Warna Utama (Brand Primary)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="h-10 w-12 rounded border p-0.5 cursor-pointer bg-background"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Warna Sekunder (Brand Accent)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="h-10 w-12 rounded border p-0.5 cursor-pointer bg-background"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border bg-background text-foreground text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right 1 Col: Live Preview & Save Button */}
      <div className="space-y-6">
        <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-xs space-y-5 sticky top-20">
          <div className="flex items-center gap-2 border-b pb-3">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h3 className="text-base font-bold text-foreground">Pratinjau Live</h3>
          </div>

          <p className="text-xs text-muted-foreground">
            Tampilan identitas dan warna logo sistem yang tampil di aplikasi:
          </p>

          <div className="p-4 rounded-xl border bg-muted/40 flex items-center gap-3.5">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 transition-colors"
              style={{ backgroundColor: formData.primary_color || '#059669' }}
            >
              {getInitials(formData.app_name)}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-foreground text-sm truncate">
                {formData.app_name || 'Travel Umroh & Haji'}
              </h4>
              <p className="text-[11px] text-muted-foreground truncate">
                {formData.app_tagline || 'Sistem Informasi Manajemen'}
              </p>
            </div>
          </div>

          {/* Accent Line Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Aksen Sekunder
            </span>
            <div
              className="h-2 rounded-full w-full transition-colors"
              style={{ backgroundColor: formData.secondary_color || '#d97706' }}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
