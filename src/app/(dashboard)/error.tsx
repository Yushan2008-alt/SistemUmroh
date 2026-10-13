'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardModuleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Module Error:', error)
  }, [error])

  return (
    <div className="p-6 md:p-8">
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-8 text-center space-y-4 max-w-lg mx-auto">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">
            Gagal Memuat Modul Ini
          </h2>
          <p className="text-sm text-muted-foreground">
            Terjadi masalah saat mengambil data atau merender tampilan modul operasional ini.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  )
}
