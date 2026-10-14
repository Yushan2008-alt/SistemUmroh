'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  Users,
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plane,
  Hotel,
  MapPin,
  ClipboardCheck,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/common/StatCard'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getGuideDashboardData, type GuideDashboardData } from './dashboard.actions'

export function GuideDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<GuideDashboardData>({
    guideName: 'Muthawwif',
    phone: '-',
    totalPilgrims: 0,
    activeSchedulesCount: 0,
    completedSchedulesCount: 0,
    schedules: [],
    pilgrims: [],
  })

  useEffect(() => {
    async function load() {
      try {
        const res = await getGuideDashboardData()
        setData(res)
      } catch (err) {
        console.error('Failed to load guide dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <PageContainer>
      {/* Guide Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
            Portal Bimbingan Ibadah & Muthawif
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Ahlan wa Sahlan, {data.guideName}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 mt-1">
            Akses jadwal manasik teori dan praktik, rekap presensi kehadiran jamaah, dan panduan bimbingan ibadah umroh &amp; haji secara terpadu.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Jamaah Bimbingan"
          value={loading ? '...' : data.totalPilgrims.toString()}
          description="Jamaah aktif dalam grup"
          icon={Users}
        />
        <StatCard
          title="Jadwal Manasik Aktif"
          value={loading ? '...' : data.activeSchedulesCount.toString()}
          description="Sesi bimbingan terjadwal"
          icon={CalendarDays}
        />
        <StatCard
          title="Sesi Selesai"
          value={loading ? '...' : data.completedSchedulesCount.toString()}
          description="Manasik terlaksana"
          icon={CheckCircle2}
        />
        <StatCard
          title="Status Akreditasi"
          value="Bersertifikat"
          description="Muthawwif Kemenag RI"
          icon={BookOpen}
        />
      </div>

      {/* Grid: Jadwal Manasik & Daftar Jamaah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Manasik Mendatang */}
        <Card className="lg:col-span-1 border-border/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Jadwal Manasik
              </CardTitle>
              <CardDescription className="text-xs">
                Sesi bimbingan terdaftar
              </CardDescription>
            </div>
            <Link href="/manasik" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline">
              Semua <ArrowUpRight className="inline w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-teal-600" />
                Memuat jadwal...
              </div>
            ) : data.schedules.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Belum ada jadwal manasik terdaftar.
              </div>
            ) : (
              data.schedules.map((s: any) => (
                <div key={s.id} className="p-3 rounded-xl border border-border bg-card space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>{s.title}</span>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono">
                      {s.time || 'WIB'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
                    <span>{s.date ? new Date(s.date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>{s.location || 'Asrama Haji / Hotel'}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tabel Jamaah Bimbingan */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Daftar Jamaah Grup Bimbingan
              </CardTitle>
              <CardDescription className="text-xs">
                Data jamaah dan status kelengkapan dokumen
              </CardDescription>
            </div>
            <Link href="/pilgrims" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center">
              Lihat Detail <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="py-2.5">Nama Jamaah</TableHead>
                  <TableHead className="py-2.5">Telepon</TableHead>
                  <TableHead className="py-2.5">Asal Kota</TableHead>
                  <TableHead className="py-2.5">Paket</TableHead>
                  <TableHead className="py-2.5">Dokumen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-teal-600" />
                      Memuat data jamaah...
                    </TableCell>
                  </TableRow>
                ) : data.pilgrims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      Belum ada jamaah yang terdaftar dalam grup bimbingan ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.pilgrims.map((item) => (
                    <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                      <TableCell className="font-semibold py-3 text-foreground">
                        {item.name}
                      </TableCell>
                      <TableCell className="py-3 text-muted-foreground font-mono">
                        {item.phone}
                      </TableCell>
                      <TableCell className="py-3 text-muted-foreground">
                        {item.city}
                      </TableCell>
                      <TableCell className="py-3 text-muted-foreground">
                        {item.packageName}
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.passportStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
