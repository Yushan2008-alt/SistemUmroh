'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Plane,
  Building,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PackageItem } from '@/modules/operations/types'

export interface UnifiedPackage {
  id: number
  name: string
  type: string
  duration_days: number
  departure_date: string
  price: number
  departure_city: string
  hotel_makkah_name: string
  hotel_madinah_name: string
  airline_name: string
  quota: number
  remainingQuota: number
  quotaPercent: number
  badge: string
  facilities?: string[]
}

interface PackageCatalogProps {
  initialPackages: PackageItem[]
  fallbackPackages: Array<{
    id: number
    name: string
    type: string
    duration_days: number
    departure_date: string
    price: number
    departure_city: string
    hotel_makkah_name: string
    hotel_madinah_name: string
    airline_name: string
    quota: number
    remainingQuota: number
    badge: string
    facilities: string[]
  }>
}

export function PackageCatalog({ initialPackages, fallbackPackages }: PackageCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Determine packages list (prefer database packages if available)
  const packagesList: UnifiedPackage[] = useMemo(() => {
    if (initialPackages && initialPackages.length > 0) {
      return initialPackages.map((pkg) => {
        const activeCount = pkg.active_registrations_count ?? 0
        const remaining = pkg.remaining_quota ?? Math.max(0, (pkg.quota || 0) - activeCount)
        const percent = Math.min(100, Math.round((activeCount / (pkg.quota || 1)) * 100))

        return {
          id: pkg.id,
          name: pkg.name,
          type: String(pkg.type),
          duration_days: pkg.duration_days,
          departure_date: pkg.departure_date,
          price: Number(pkg.price),
          departure_city: pkg.departure_city || 'Jakarta (CGK)',
          hotel_makkah_name: pkg.hotel_makkah?.name || 'Hotel Bintang 5 Dekat Masjidil Haram',
          hotel_madinah_name: pkg.hotel_madinah?.name || 'Hotel Bintang 5 Dekat Masjid Nabawi',
          airline_name: pkg.airlines?.name || 'Saudia Airlines / Garuda Indonesia',
          quota: pkg.quota,
          remainingQuota: remaining,
          quotaPercent: percent,
          badge: pkg.type === 'haji_khusus' ? 'Haji Khusus' : 'Paling Diminati',
        }
      })
    }

    return fallbackPackages.map((p) => ({
      ...p,
      quotaPercent: Math.min(100, Math.round(((p.quota - p.remainingQuota) / (p.quota || 1)) * 100)),
    }))
  }, [initialPackages, fallbackPackages])

  // Filter packages based on active category & query
  const filteredPackages = useMemo(() => {
    return packagesList.filter((pkg) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const typeLower = pkg.type.toLowerCase()
        if (selectedCategory === 'reguler' && !typeLower.includes('reguler')) return false
        if (selectedCategory === 'ramadhan' && !typeLower.includes('ramadhan')) return false
        if (selectedCategory === 'plus' && !typeLower.includes('plus')) return false
        if (selectedCategory === 'haji' && !typeLower.includes('haji')) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = pkg.name.toLowerCase().includes(q)
        const matchCity = pkg.departure_city.toLowerCase().includes(q)
        const matchAirline = pkg.airline_name.toLowerCase().includes(q)
        if (!matchName && !matchCity && !matchAirline) return false
      }

      return true
    })
  }, [packagesList, selectedCategory, searchQuery])

  // ==========================================================================
  // WebMCP Registration (build-webmcp-tools skill standard)
  // Exposes client-side search tools on document.modelContext for in-browser AI agents
  // ==========================================================================
  useEffect(() => {
    if (typeof window === 'undefined') return
    const modelContext = (window.document as any)?.modelContext
    if (!modelContext || typeof modelContext.registerTool !== 'function') return

    const controller = new AbortController()

    try {
      // 1. Tool: search_packages
      modelContext.registerTool(
        {
          name: 'search_packages',
          description:
            'Search active Umroh & Haji packages by keyword, package type, and budget. Use when the user asks for available packages, prices, or schedules.',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search keyword matching package name, airline, or departure city.',
              },
              type: {
                type: 'string',
                description: 'Package category: all, reguler, ramadhan, plus, or haji.',
              },
              max_budget: {
                type: 'number',
                description: 'Maximum package price in Indonesian Rupiah (IDR).',
              },
            },
          },
          readOnlyHint: true,
          execute: async ({ query, type, max_budget }: any) => {
            let results = packagesList
            if (type && type !== 'all') {
              const t = type.toLowerCase()
              results = results.filter((p) => p.type.toLowerCase().includes(t))
            }
            if (max_budget && max_budget > 0) {
              results = results.filter((p) => p.price <= max_budget)
            }
            if (query && query.trim()) {
              const q = query.toLowerCase().trim()
              results = results.filter(
                (p) =>
                  p.name.toLowerCase().includes(q) ||
                  p.departure_city.toLowerCase().includes(q) ||
                  p.airline_name.toLowerCase().includes(q)
              )
            }
            const paginated = results.slice(0, 5).map((p) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              price: p.price,
              departure_date: p.departure_date,
              seats_available: p.remainingQuota,
            }))

            return {
              total_count: results.length,
              page_size: 5,
              packages: paginated,
            }
          },
        },
        { signal: controller.signal }
      )

      // 2. Tool: get_package_details
      modelContext.registerTool(
        {
          name: 'get_package_details',
          description:
            'Get full details of a specific Umroh or Haji package including hotels, flight, and price. Use when the user requests complete details for a package.',
          inputSchema: {
            type: 'object',
            properties: {
              package_id: {
                type: 'number',
                description: 'Unique numeric ID of the package.',
              },
            },
            required: ['package_id'],
          },
          readOnlyHint: true,
          execute: async ({ package_id }: any) => {
            const found = packagesList.find((p) => p.id === Number(package_id))
            if (!found) {
              return { error: 'Paket tidak ditemukan.', code: 'NOT_FOUND', retryable: false }
            }
            return {
              id: found.id,
              name: found.name,
              type: found.type,
              price: found.price,
              duration_days: found.duration_days,
              departure_date: found.departure_date,
              departure_city: found.departure_city,
              airline: found.airline_name,
              hotel_makkah: found.hotel_makkah_name,
              hotel_madinah: found.hotel_madinah_name,
              seats_available: found.remainingQuota,
            }
          },
        },
        { signal: controller.signal }
      )
    } catch (err) {
      console.warn('WebMCP registration skipped:', err)
    }

    return () => {
      controller.abort()
    }
  }, [packagesList])

  const categories = [
    { id: 'all', label: 'Semua Paket' },
    { id: 'reguler', label: 'Umroh Reguler' },
    { id: 'ramadhan', label: 'Umroh Ramadhan' },
    { id: 'plus', label: 'Umroh Plus Wisata' },
    { id: 'haji', label: 'Haji Khusus' },
  ]

  return (
    <section id="katalog" className="py-14 sm:py-20 bg-slate-50 dark:bg-slate-950 border-b border-border scroll-mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#064e3b] dark:text-emerald-300 text-xs font-bold border border-emerald-300/40">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Katalog Keberangkatan Terjadwal</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            Pilihan Paket Perjalanan Umroh &amp; Haji
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Transparansi fasilitas hotel pelataran Masjidil Haram &amp; Nabawi, penerbangan direct tanpa transit, dan kepastian kuota kursi.
          </p>
        </div>

        {/* Search & Category Filter Bar (Mobile-First Scrolling Tabs) */}
        <div className="space-y-3 max-w-4xl mx-auto">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari paket, kota keberangkatan, atau maskapai..."
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-colors shadow-xs min-h-[44px]"
            />
          </div>

          {/* Category Pill Tabs with smooth mobile horizontal scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[40px] cursor-pointer border ${
                    isActive
                      ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Packages Grid (1 Col Mobile, 2 Col Tablet, 3 Col Desktop) */}
        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200"
              >
                {/* Top Banner Header */}
                <div className="bg-[#064e3b] p-4 text-white flex items-center justify-between border-b border-emerald-800">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold block">
                      {pkg.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-300" />
                      {pkg.duration_days} Hari Perjalanan
                    </span>
                  </div>
                  <Badge className="bg-amber-400 text-slate-950 font-bold text-xs border-0 px-2.5 py-0.5 rounded-md">
                    {pkg.departure_city}
                  </Badge>
                </div>

                {/* Card Content */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 font-heading">
                      {pkg.name}
                    </h3>

                    {/* All-in Price Box */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 space-y-0.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium uppercase tracking-wider">
                        Biaya Paket All-In:
                      </span>
                      <div className="text-xl font-extrabold text-[#064e3b] dark:text-emerald-400">
                        {formatCurrency(pkg.price)}
                      </div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block">
                        Dapat diangsur bertahap hingga H-30
                      </span>
                    </div>

                    {/* Logistics Specification */}
                    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Keberangkatan: <strong>{formatDate(pkg.departure_date)}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plane className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">Maskapai: <strong>{pkg.airline_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">Makkah: <strong>{pkg.hotel_makkah_name}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">Madinah: <strong>{pkg.hotel_madinah_name}</strong></span>
                      </div>
                    </div>

                    {/* Quota Progress */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Sisa Kuota Kursi:</span>
                        <span className="font-bold text-[#064e3b] dark:text-emerald-400">
                          {pkg.remainingQuota > 0 ? `Tersisa ${pkg.remainingQuota} Seat` : 'Penuh'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${pkg.quotaPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA Button (44px min touch target) */}
                  <Link href="/login" className="w-full pt-1 block">
                    <button
                      type="button"
                      className="w-full rounded-xl bg-[#064e3b] hover:bg-[#053f30] text-white font-bold py-2.5 text-xs border border-emerald-700/50 flex items-center justify-center gap-2 transition-colors min-h-[44px] cursor-pointer shadow-xs"
                    >
                      <span>Pilih Paket &amp; Daftar</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Tidak ada paket yang cocok</h3>
            <p className="text-xs text-slate-500">Coba atur ulang kata kunci pencarian atau ganti kategori paket.</p>
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSearchQuery('')
              }}
              className="px-4 py-2 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
