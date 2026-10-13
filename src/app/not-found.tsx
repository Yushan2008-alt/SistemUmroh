import Link from 'next/link'
import { Compass, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-background to-background flex items-center justify-center p-6 text-foreground">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-sm border border-emerald-200/50 dark:border-emerald-800/40">
          <Compass className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
            404 — Halaman Tidak Ditemukan
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Arah Tidak Ditemukan
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, dinonaktifkan, atau alamat URL yang dimasukkan kurang tepat.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Ke Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Halaman Utama
          </Link>
        </div>

        <div className="pt-6 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Sistem Manajemen Operasional Umroh & Haji Enterprise
          </p>
        </div>
      </div>
    </div>
  )
}
