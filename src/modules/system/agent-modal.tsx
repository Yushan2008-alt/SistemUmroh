'use client'

import { useState, useEffect } from 'react'
import {
  Handshake,
  X,
  Loader2,
  UserCheck,
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  Mail,
} from 'lucide-react'
import type { Agent, AgentFormData } from './types'
import { createAgent, updateAgent, provisionAgentAccount } from './agents.actions'

interface AgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  agentToEdit?: Agent | null
  branches: { id: number; name: string; code: string }[]
}

export function AgentModal({
  isOpen,
  onClose,
  onSuccess,
  agentToEdit,
  branches,
}: AgentModalProps) {
  const [formData, setFormData] = useState<AgentFormData>({
    code: '',
    name: '',
    phone: '',
    email: '',
    commission_rate: 5,
    branch_id: null,
    is_active: true,
    create_account: false,
    account_email: '',
    account_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string
    password?: string
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [provisioningNow, setProvisioningNow] = useState(false)

  useEffect(() => {
    if (agentToEdit) {
      setFormData({
        code: agentToEdit.code,
        name: agentToEdit.name,
        phone: agentToEdit.phone || '',
        email: agentToEdit.email || '',
        commission_rate: agentToEdit.commission_rate,
        branch_id: agentToEdit.branch_id,
        is_active: agentToEdit.is_active,
        create_account: false,
        account_email: agentToEdit.email || '',
        account_password: '',
      })
    } else {
      const generatedPass = `Agen${Math.floor(100000 + Math.random() * 900000)}!`
      setFormData({
        code: `AGN-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        phone: '',
        email: '',
        commission_rate: 5,
        branch_id: branches[0]?.id || null,
        is_active: true,
        create_account: false,
        account_email: '',
        account_password: generatedPass,
      })
    }
    setError(null)
    setCreatedCredentials(null)
    setCopied(false)
  }, [agentToEdit, isOpen, branches])

  if (!isOpen) return null

  const handleCopyCredentials = () => {
    if (!createdCredentials) return
    const text = `Kredensial Login Portal Mitra Agen:\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password || '(Sesuai pengaturan)'}\nURL: ${window.location.origin}/login`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleManualProvision = async () => {
    if (!agentToEdit) return
    const targetEmail = formData.email?.trim() || agentToEdit.email?.trim()
    if (!targetEmail) {
      setError('Masukkan alamat email mitra agen terlebih dahulu untuk membuat akun login.')
      return
    }

    setProvisioningNow(true)
    setError(null)

    try {
      const generatedPass = `Agen${Math.floor(100000 + Math.random() * 900000)}!`
      const res = await provisionAgentAccount(agentToEdit.id, targetEmail, generatedPass)
      if (res.success) {
        setCreatedCredentials({
          email: targetEmail,
          password: res.temporaryPassword || generatedPass,
        })
        onSuccess()
      } else {
        setError(res.error || 'Gagal membuat akun login mitra agen')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pembuatan akun')
    } finally {
      setProvisioningNow(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Kode agen dan nama agen wajib diisi')
      setLoading(false)
      return
    }

    if (formData.create_account && !formData.account_email?.trim() && !formData.email?.trim()) {
      setError('Email wajib diisi jika ingin membuatkan akun login portal agen')
      setLoading(false)
      return
    }

    try {
      if (agentToEdit) {
        const res = await updateAgent(agentToEdit.id, formData)
        if (res.success) {
          onSuccess()
          onClose()
        } else {
          setError(res.error || 'Terjadi kesalahan menyimpan data mitra agen')
        }
      } else {
        const res = await createAgent({
          ...formData,
          account_email: formData.account_email?.trim() || formData.email?.trim(),
        })

        if (res.success) {
          if (res.temporaryPassword) {
            setCreatedCredentials({
              email: formData.account_email?.trim() || formData.email?.trim() || '',
              password: res.temporaryPassword,
            })
            onSuccess()
          } else {
            onSuccess()
            onClose()
          }
        } else {
          setError(res.error || 'Terjadi kesalahan menyimpan data mitra agen')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data mitra agen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {agentToEdit ? 'Edit Mitra Agen' : 'Daftarkan Mitra Agen Baru'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Profil agen referral, komisi, dan akun login portal agen
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

        {/* Credentials Success Overlay */}
        {createdCredentials ? (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-base">
                Akun Portal Mitra Agen Berhasil Dibuat
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-200">
                Kredensial login berikut dapat langsung dibagikan kepada mitra agen terkait:
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted-foreground">Alamat Email Login:</span>
                <span className="font-mono font-semibold text-foreground">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted-foreground">Kata Sandi Sementara:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {createdCredentials.password}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Peran Hak Akses:</span>
                <span className="font-semibold text-foreground">Mitra Agen (agent)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Tersalin ke Clipboard' : 'Salin Kredensial'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Kode Agen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="AGN-001"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Komisi Agen (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Nama Lengkap Mitra Agen <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Hasan Basri, SE"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="text"
                  placeholder="0812XXXXXXXX"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  placeholder="agen@example.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Kantor Cabang Terkait
              </label>
              <select
                value={formData.branch_id || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    branch_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">Semua Cabang (Global)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Account Provisioning Section */}
            {!agentToEdit ? (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="create_account_agent"
                    checked={formData.create_account}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        create_account: e.target.checked,
                        account_email: formData.account_email || formData.email || '',
                      })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-input focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="create_account_agent"
                    className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    Buatkan akun login portal mitra agen sekarang
                  </label>
                </div>

                {formData.create_account && (
                  <div className="space-y-3 pt-2 border-t border-emerald-500/20 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                        Email Login Agen <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required={formData.create_account}
                        placeholder="agen@example.com"
                        value={formData.account_email || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, account_email: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground uppercase mb-1">
                        Kata Sandi Awal (Sementara)
                      </label>
                      <input
                        type="text"
                        value={formData.account_password || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, account_password: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Role akun akan otomatis diatur sebagai <b>agent</b> dan dapat langsung login di /login.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="font-semibold text-foreground">Status Akun Portal: </span>
                    {agentToEdit.profile_id ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Sudah Terhubung ({agentToEdit.email || 'Aktif'})
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Belum Memiliki Akun Login
                      </span>
                    )}
                  </div>
                </div>

                {!agentToEdit.profile_id && (
                  <button
                    type="button"
                    onClick={handleManualProvision}
                    disabled={provisioningNow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors disabled:opacity-50"
                  >
                    {provisioningNow ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    Buat Akun Portal
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="agent_is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-input focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="agent_is_active" className="text-sm font-medium text-foreground cursor-pointer">
                Mitra Agen Aktif (Dapat mereferensikan jamaah &amp; klaim komisi)
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
                {agentToEdit ? 'Simpan Perubahan' : 'Tambah Mitra'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
