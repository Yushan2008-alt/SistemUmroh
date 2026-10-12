'use client'

import { Search, Filter, RotateCcw, CheckCircle2, Clock, AlertCircle, FileX2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface DocumentsFilterProps {
  currentSearch?: string
  currentStatus?: string
  stats?: {
    total: number
    complete: number
    in_review: number
    rejected: number
    incomplete: number
  }
}

export function DocumentsFilter({
  currentSearch = '',
  currentStatus = 'all',
  stats,
}: DocumentsFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  const handleApplyFilter = (newStatus?: string, newSearch?: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      const statusToSet = newStatus !== undefined ? newStatus : currentStatus
      if (statusToSet && statusToSet !== 'all') {
        params.set('status', statusToSet)
      } else {
        params.delete('status')
      }

      const searchToSet = newSearch !== undefined ? newSearch : search
      if (searchToSet && searchToSet.trim()) {
        params.set('search', searchToSet.trim())
      } else {
        params.delete('search')
      }

      router.push(`/documents?${params.toString()}`)
    })
  }

  const handleReset = () => {
    setSearch('')
    startTransition(() => {
      router.push('/documents')
    })
  }

  const statusTabs = [
    { id: 'all', label: 'Semua Jamaah', count: stats?.total, icon: null },
    {
      id: 'complete',
      label: 'Lengkap (6/6)',
      count: stats?.complete,
      icon: CheckCircle2,
      activeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'in_review',
      label: 'Menunggu Verifikasi',
      count: stats?.in_review,
      icon: Clock,
      activeColor: 'bg-sky-600 text-white',
    },
    {
      id: 'rejected',
      label: 'Ada Ditolak',
      count: stats?.rejected,
      icon: AlertCircle,
      activeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'incomplete',
      label: 'Belum Lengkap',
      count: stats?.incomplete,
      icon: FileX2,
      activeColor: 'bg-amber-600 text-white',
    },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleApplyFilter(undefined, search)
          }}
          className="relative w-full sm:max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama jamaah, NIK, nomor HP, atau kode..."
            className="w-full pl-10 pr-24 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {isPending ? 'Mencari...' : 'Cari'}
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {(currentStatus !== 'all' || currentSearch !== '') && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Status Badges Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {statusTabs.map((tab) => {
          const isActive = currentStatus === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => handleApplyFilter(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
                isActive
                  ? tab.activeColor || 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
