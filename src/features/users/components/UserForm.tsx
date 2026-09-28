'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUser, updateUser } from '../actions'
import type { UserProfileWithBranch, UserFormData } from '../types'
import type { Role } from '@/types/database.types'
import { Loader2, ArrowLeft, Save } from 'lucide-react'

interface UserFormProps {
  initialData?: UserProfileWithBranch | null
  branches: { id: number; name: string }[]
}

export function UserForm({ initialData, branches }: UserFormProps) {
  const router = useRouter()
  const isEdit = Boolean(initialData?.id)

  const [formData, setFormData] = useState<UserFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'admin',
    branch_id: initialData?.branch_id || null,
    phone: initialData?.phone || '',
    is_active: initialData ? initialData.is_active : true,
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!isEdit && (!formData.password || formData.password.length < 6)) {
      setError('Kata sandi awal wajib diisi minimal 6 karakter.')
      setLoading(false)
      return
    }

    try {
      if (isEdit && initialData?.id) {
        const res = await updateUser(initialData.id, formData)
        if (!res.success) {
          setError(res.message)
          setLoading(false)
          return
        }
      } else {
        const res = await createUser(formData)
        if (!res.success) {
          setError(res.message)
          setLoading(false)
          return
        }
      }

      router.push('/users')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem saat menyimpan data pengguna.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-xs space-y-5">
        <h3 className="text-base font-bold text-foreground border-b pb-3">
          {isEdit ? 'Ubah Data Pengguna' : 'Informasi Akun Pengguna Baru'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Alamat Email (Login) <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ahmad@travel.com"
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Peran / Hak Akses (Role) <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="super_admin">Super Admin Pusat</option>
              <option value="admin">Admin Cabang</option>
              <option value="agent">Mitra Agen</option>
              <option value="guide">Muthawif Pembimbing</option>
              <option value="pilgrim">Jamaah</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Kantor Cabang
            </label>
            <select
              value={formData.branch_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  branch_id: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">Pusat (Seluruh Cabang)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
              className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-semibold text-foreground">
                Akun Aktif (Dapat Login)
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Kata Sandi {isEdit ? '(Kosongkan jika tidak diubah)' : <span className="text-rose-500">*</span>}
          </label>
          <input
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={isEdit ? '••••••••' : 'Minimal 6 karakter'}
            className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs inline-flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{isEdit ? 'Simpan Perubahan' : 'Buat Pengguna'}</span>
        </button>

        <Link
          href="/users"
          className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted text-muted-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Batal</span>
        </Link>
      </div>
    </form>
  )
}
