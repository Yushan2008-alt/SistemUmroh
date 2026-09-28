'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import type { Branch, BranchFormData } from '../types'
import { createBranch, updateBranch } from '../actions'

interface BranchFormProps {
  branch?: Branch
  isEdit?: boolean
}

export function BranchForm({ branch, isEdit = false }: BranchFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<BranchFormData>({
    code: branch?.code || '',
    name: branch?.name || '',
    phone: branch?.phone || '',
    email: branch?.email || '',
    city: branch?.city || '',
    address: branch?.address || '',
    is_head_office: branch?.is_head_office || false,
    is_active: branch?.is_active ?? true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!formData.code.trim()) {
      setErrorMessage('Kode cabang wajib diisi.')
      setIsLoading(false)
      return
    }

    if (!formData.name.trim()) {
      setErrorMessage('Nama cabang wajib diisi.')
      setIsLoading(false)
      return
    }

    let res
    if (isEdit && branch) {
      res = await updateBranch(branch.id, formData)
    } else {
      res = await createBranch(formData)
    }

    setIsLoading(false)

    if (res.success) {
      setSuccessMessage(isEdit ? 'Cabang berhasil diperbarui!' : 'Cabang berhasil ditambahkan!')
      setTimeout(() => {
        router.push('/branches')
        router.refresh()
      }, 1000)
    } else {
      setErrorMessage(res.error || 'Terjadi kesalahan saat menyimpan data.')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/branches"
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {isEdit ? `Edit Cabang: ${branch?.name}` : 'Tambah Cabang Baru'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? 'Perbarui informasi dan konfigurasi operasional kantor cabang.'
              : 'Daftarkan kantor cabang operasional baru ke dalam sistem.'}
          </p>
        </div>
      </div>

      {/* Messages */}
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
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Kode Cabang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Contoh: JKT-01, SBY-02"
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase placeholder:normal-case placeholder:font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Nama Cabang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Kantor Cabang Surabaya"
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Kota Operasional
            </label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Contoh: Jakarta Selatan, Surabaya"
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Telepon Cabang
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="021-1234567 / 0812..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Email Cabang
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="cabang@travelumroh.com"
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Alamat Lengkap
            </label>
            <textarea
              rows={3}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jalan, nomor gedung, kelurahan, kecamatan..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-border/60 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-border"
              />
              <span className="text-sm font-medium text-foreground">Status Aktif</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_head_office}
                onChange={(e) => setFormData({ ...formData, is_head_office: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-border"
              />
              <span className="text-sm font-medium text-foreground">Tandai sebagai Kantor Pusat</span>
            </label>
          </div>
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
                {isEdit ? 'Simpan Perubahan' : 'Simpan Cabang'}
              </>
            )}
          </button>
          <Link
            href="/branches"
            className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted font-medium text-sm transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}
