'use client'

import { useState } from 'react'
import { X, Copy, Check, KeyRound } from 'lucide-react'

interface ResetPasswordModalProps {
  userName: string
  temporaryPassword: string | null
  isOpen: boolean
  onClose: () => void
}

export function ResetPasswordModal({
  userName,
  temporaryPassword,
  isOpen,
  onClose,
}: ResetPasswordModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !temporaryPassword) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(temporaryPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Kata Sandi Berhasil Direset</h3>
              <p className="text-xs text-muted-foreground">Akun: {userName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kata sandi lama telah digantikan dengan kata sandi sementara berikut. Salin dan serahkan langsung kepada pengguna:
          </p>

          <div className="flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20">
            <span className="font-mono text-lg font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
              {temporaryPassword}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Sandi'}</span>
            </button>
          </div>

          <div className="p-3 rounded-lg bg-muted text-[11px] text-muted-foreground">
            <strong>Catatan:</strong> Sandi ini hanya dimunculkan satu kali ini. Pengguna disarankan mengganti kata sandi setelah berhasil login ke sistem.
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
