'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlaneTakeoff,
  Search,
  Building,
  Plane,
  Calendar,
  Users,
  ChevronRight,
} from 'lucide-react'
import type { ManifestPackage } from '../types'

interface ManifestsPackageTableProps {
  initialPackages: ManifestPackage[]
  currentSearch?: string
}

export function ManifestsPackageTable({
  initialPackages,
  currentSearch = '',
}: ManifestsPackageTableProps) {
  const router = useRouter()
  const [packages] = useState<ManifestPackage[]>(initialPackages)
  const [search, setSearch] = useState(currentSearch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    router.push(`/manifests?${params.toString()}`)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <PlaneTakeoff className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          Manifest &amp; Rooming Hotel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih paket keberangkatan untuk mengatur penempatan kamar hotel, bus jemputan, dan nomor kursi jamaah.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama paket keberangkatan..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-colors"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {packages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Paket Perjalanan</th>
                  <th className="px-5 py-3.5">Keberangkatan</th>
                  <th className="px-5 py-3.5">Akomodasi Hotel</th>
                  <th className="px-5 py-3.5">Maskapai</th>
                  <th className="px-5 py-3.5">Jamaah Terdaftar</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-muted/30 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                        <Link href={`/manifests/${pkg.id}`}>{pkg.name}</Link>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {pkg.branches?.name || 'Kantor Pusat'} •{' '}
                        <span className="capitalize">{pkg.type}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-foreground text-xs">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {formatDate(pkg.departure_date)}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Dari: {pkg.departure_city || 'Jakarta'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5 text-xs text-foreground max-w-[220px]">
                        {pkg.hotel_makkah && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Building className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{pkg.hotel_makkah.name}</span>
                          </div>
                        )}
                        {pkg.hotel_madinah && (
                          <div className="flex items-center gap-1.5 truncate text-muted-foreground">
                            <Building className="w-3 h-3 text-teal-600 flex-shrink-0" />
                            <span className="truncate">{pkg.hotel_madinah.name}</span>
                          </div>
                        )}
                        {!pkg.hotel_makkah && !pkg.hotel_madinah && <span>-</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {pkg.airlines ? (
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          <Plane className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span>{pkg.airlines.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-foreground text-sm">
                          {pkg.active_registrations_count}
                        </span>
                        <span className="text-xs text-muted-foreground">/ {pkg.quota} Jamaah</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/manifests/${pkg.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Atur Manifest
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <PlaneTakeoff className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">Belum ada paket ditemukan</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Paket perjalanan akan muncul di sini untuk penyusunan kamar hotel dan nomor bus.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
