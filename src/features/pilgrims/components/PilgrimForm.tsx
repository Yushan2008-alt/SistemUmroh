'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react'
import type {
  PilgrimItem,
  PilgrimFormData,
  PilgrimFormDataOptions,
} from '../types'
import { createPilgrim, updatePilgrim } from '../actions'

interface PilgrimFormProps {
  pilgrim?: PilgrimItem
  options: PilgrimFormDataOptions
  isEdit?: boolean
}

export function PilgrimForm({ pilgrim, options, isEdit = false }: PilgrimFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<PilgrimFormData>({
    branch_id: pilgrim?.branch_id || options.branches[0]?.id || 1,
    agent_id: pilgrim?.agent_id || null,
    name: pilgrim?.name || '',
    gender: pilgrim?.gender || 'male',
    nik: pilgrim?.nik || '',
    birth_place: pilgrim?.birth_place || '',
    birth_date: pilgrim?.birth_date ? pilgrim.birth_date.split('T')[0] : '',
    phone: pilgrim?.phone || '',
    email: pilgrim?.profiles?.email || '',
    address: pilgrim?.address || '',
    passport_number: pilgrim?.passport_number || '',
    passport_expiry: pilgrim?.passport_expiry ? pilgrim.passport_expiry.split('T')[0] : '',
    emergency_contact_name: pilgrim?.emergency_contact_name || '',
    emergency_contact_phone: pilgrim?.emergency_contact_phone || '',
    mahram_status: pilgrim?.mahram_status || '',
    health_notes: pilgrim?.health_notes || '',
    is_active: pilgrim?.is_active ?? true,
    create_account: false,
    account_email: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [credentialModal, setCredentialModal] = useState<{
    email: string
    password?: string
  } | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    if (!formData.name.trim()) {
      setErrorMessage('Nama lengkap jamaah wajib diisi.')
      setIsLoading(false)
      return
    }

    if (!formData.nik.trim()) {
      setErrorMessage('Nomor Induk Kependudukan (NIK) wajib diisi.')
      setIsLoading(false)
      return
    }

    if (!formData.phone.trim()) {
      setErrorMessage('Nomor Telepon / WhatsApp wajib diisi.')
      setIsLoading(false)
      return
    }

    if (isEdit && pilgrim) {
      const res = await updatePilgrim(pilgrim.id, formData)
      setIsLoading(false)
      if (res.success) {
        router.push('/pilgrims')
        router.refresh()
      } else {
        setErrorMessage(res.error || 'Terjadi kesalahan saat menyimpan data jamaah.')
      }
      return
    }

    const res = await createPilgrim(formData)
    setIsLoading(false)

    if (res.success) {
      if (res.temporaryPassword) {
        setCredentialModal({
          email: formData.account_email?.trim() || formData.email?.trim() || '',
          password: res.temporaryPassword,
        })
      } else {
        router.push('/pilgrims')
        router.refresh()
      }
    } else {
      setErrorMessage(res.error || 'Terjadi kesalahan saat menyimpan data jamaah.')
    }
  }

  const handleCopyCredentials = () => {
    if (!credentialModal) return
    const text = `Akun Jamaah Umroh & Haji:\nEmail: ${credentialModal.email}\nPassword: ${credentialModal.password}\nLogin di: ${window.location.origin}/login`
    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/pilgrims"
          className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {isEdit ? `Edit Data: ${pilgrim?.name}` : 'Tambah Data Jamaah Baru'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Lengkapi data diri, paspor, kontak darurat, dan informasi kesehatan jamaah.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Penempatan */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
            Penempatan Cabang &amp; Referral
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Kantor Cabang <span className="text-rose-500">*</span>
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
                Agen / Referral
              </label>
              <select
                value={formData.agent_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    agent_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="">-- Tanpa Agen (Pendaftaran Langsung) --</option>
                {options.agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Data Pribadi */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
            Data Pribadi Jamaah
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nama Lengkap (Sesuai KTP &amp; Paspor) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Muhammad Ilham"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Jenis Kelamin <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="16 digit angka NIK KTP"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.birth_place || ''}
                onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                placeholder="Kota Kelahiran"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="08123456789"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Email Jamaah
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jamaah@example.com"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Alamat Domisili Lengkap
              </label>
              <textarea
                rows={2}
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat lengkap tempat tinggal saat ini..."
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Paspor */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
            Dokumen Paspor RI
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nomor Paspor
              </label>
              <input
                type="text"
                value={formData.passport_number || ''}
                onChange={(e) =>
                  setFormData({ ...formData, passport_number: e.target.value.toUpperCase() })
                }
                placeholder="Contoh: A 1234567"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:normal-case"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Tanggal Kadaluarsa Paspor
              </label>
              <input
                type="date"
                value={formData.passport_expiry || ''}
                onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Minimal masa berlaku 6 bulan sebelum jadwal keberangkatan.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Mahram & Kontak Darurat */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
            Mahram &amp; Kontak Darurat
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Hubungan Mahram
              </label>
              <input
                type="text"
                value={formData.mahram_status || ''}
                onChange={(e) => setFormData({ ...formData, mahram_status: e.target.value })}
                placeholder="Misal: Suami / Ayah / Saudara Kandung"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nama Kontak Darurat
              </label>
              <input
                type="text"
                value={formData.emergency_contact_name || ''}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                placeholder="Nama keluarga terdekat"
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Nomor Telepon Kontak Darurat
              </label>
              <input
                type="tel"
                value={formData.emergency_contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                placeholder="081234567..."
                className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Card 5: Catatan Kesehatan & Status */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3">
            Kesehatan &amp; Status Jamaah
          </h2>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Catatan Khusus Kesehatan (Riwayat Penyakit / Alergi / Kebutuhan Kursi Roda)
            </label>
            <textarea
              rows={2}
              value={formData.health_notes || ''}
              onChange={(e) => setFormData({ ...formData, health_notes: e.target.value })}
              placeholder="Contoh: Hipertensi, membutuhkan pendampingan kursi roda saat tawaf..."
              className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-border"
            />
            <span className="text-sm font-medium text-foreground">Status Jamaah Aktif</span>
          </label>
        </div>

        {/* Card 6: Akun Login Portal Jamaah (Hanya saat create / belum punya profile) */}
        {!isEdit && (
          <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-foreground">Akses Portal Jamaah</h2>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.create_account}
                  onChange={(e) => setFormData({ ...formData, create_account: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-border"
                />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Buatkan akun login
                </span>
              </label>
            </div>

            {formData.create_account && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-3 animate-fadeIn">
                <p className="text-xs text-muted-foreground">
                  Akun Supabase Auth dengan role <strong>pilgrim</strong> akan otomatis dibuatkan.
                  Password sementara akan digenerate dan dapat langsung diserahkan kepada jamaah.
                </p>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Email Akun Login
                  </label>
                  <input
                    type="email"
                    value={formData.account_email || formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, account_email: e.target.value })}
                    placeholder="Kosongkan untuk memakai email jamaah di atas"
                    className="w-full max-w-md px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
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
                {isEdit ? 'Simpan Perubahan' : 'Simpan Data Jamaah'}
              </>
            )}
          </button>
          <Link
            href="/pilgrims"
            className="px-5 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted font-medium text-sm transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>

      {/* Temporary Password Credential Modal */}
      {credentialModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">Akun Jamaah Berhasil Dibuat!</h3>
              <p className="text-sm text-muted-foreground">
                Salin informasi kredensial di bawah ini untuk diberikan kepada jamaah.
              </p>
            </div>

            <div className="bg-muted/60 p-4 rounded-xl space-y-2 border border-border/80 text-left font-mono text-xs">
              <div>
                <span className="text-muted-foreground">Email:</span>{' '}
                <strong className="text-foreground">{credentialModal.email}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Password Sementara:</span>{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {credentialModal.password}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Salin Info Akun
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCredentialModal(null)
                  router.push('/pilgrims')
                  router.refresh()
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
              >
                Selesai &amp; Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
