'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log unexpected errors to console for telemetry
    console.error('Unhandled Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-background to-background flex items-center justify-center p-6 text-foreground">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 shadow-sm border border-rose-200/50 dark:border-rose-800/40">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
            Terjadi Kesalahan Sistem
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Permintaan Gagal Diproses
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Terjadi kendala sementara pada sistem. Silakan coba muat ulang halaman atau kembali ke dashboard.
          </p>
        </div>

        {error?.digest && (
          <div className="p-2.5 rounded-lg bg-muted text-xs font-mono text-muted-foreground break-all">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Muat Ulang
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Ke Dashboard
          </Link>
        </div>

        <div className="pt-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Jika kendala berlanjut, hubungi tim dukungan teknis operasional.
          </p>
        </div>
      </div>
    </div>
  )
}
