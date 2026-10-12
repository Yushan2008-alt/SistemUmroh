'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, UserPlus, Filter, X } from 'lucide-react'
import { useState, useTransition } from 'react'

interface RegistrationFilterProps {
  packages: { id: number; name: string }[]
}

export function RegistrationFilter({ packages }: RegistrationFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [packageId, setPackageId] = useState(searchParams.get('package_id') || 'all')

  const applyFilters = (newSearch?: string, newStatus?: string, newPkg?: string) => {
    const params = new URLSearchParams(searchParams.toString())

    const s = newSearch !== undefined ? newSearch : search
    const st = newStatus !== undefined ? newStatus : status
    const p = newPkg !== undefined ? newPkg : packageId

    if (s.trim()) params.set('search', s.trim())
    else params.delete('search')

    if (st && st !== 'all') params.set('status', st)
    else params.delete('status')

    if (p && p !== 'all') params.set('package_id', p)
    else params.delete('package_id')

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setPackageId('all')
    startTransition(() => {
      router.push(pathname)
    })
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari kode booking atau nama jamaah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value)
            applyFilters(undefined, e.target.value, undefined)
          }}
          className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
        >
          <option value="all">Semua Status</option>
          <option value="confirmed">Dikonfirmasi</option>
          <option value="pending">Pending</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>

        {/* Package Dropdown */}
        <select
          value={packageId}
          onChange={(e) => {
            setPackageId(e.target.value)
            applyFilters(undefined, undefined, e.target.value)
          }}
          className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors max-w-[200px] truncate"
        >
          <option value="all">Semua Paket</option>
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name}
            </option>
          ))}
        </select>

        {/* Filter Action Button */}
        <button
          type="button"
          onClick={() => applyFilters()}
          disabled={isPending}
          className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </button>

        {/* Clear Filters if active */}
        {(search || status !== 'all' || packageId !== 'all') && (
          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Reset Filter"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Primary CTA */}
      <Link
        href="/registrations/create"
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-xs shrink-0"
      >
        <UserPlus className="h-4 w-4" />
        <span>Daftarkan Jamaah</span>
      </Link>
    </div>
  )
}
