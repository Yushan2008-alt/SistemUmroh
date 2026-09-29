'use client'

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
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const ATTENDANCE_DATA = [
  { name: 'Hadir', value: 42, color: '#059669' },
  { name: 'Izin', value: 2, color: '#d97706' },
  { name: 'Sakit', value: 1, color: '#0284c7' },
  { name: 'Alpa', value: 0, color: '#ef4444' },
]

const MENTORED_PILGRIMS = [
  {
    id: 1,
    name: 'Ahmad Fauzi',
    phone: '081312345678',
    city: 'Jakarta',
    roomType: 'Quad (Kamar 4)',
    passportStatus: 'Lengkap',
    attendance: '3/3 Selesai',
  },
  {
    id: 2,
    name: 'Siti Rahmawati',
    phone: '081298765432',
    city: 'Depok',
    roomType: 'Double (Kamar 2)',
    passportStatus: 'Lengkap',
    attendance: '3/3 Selesai',
  },
  {
    id: 3,
    name: 'H. Bambang Gunawan',
    phone: '081298761234',
    city: 'Surabaya',
    roomType: 'Triple (Kamar 3)',
    passportStatus: 'Lengkap',
    attendance: '2/3 Selesai',
  },
]

export function GuideDashboard() {
  return (
    <PageContainer>
      {/* Muthawif Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
            Portal Bimbingan Ibadah &amp; Muthawif
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Ahlan Wa Sahlan, Ustadz Abdullah
          </h2>
          <p className="text-xs sm:text-sm text-teal-100 mt-1">
            Kelola presensi manasik jamaah, koordinasi rombongan penerbangan, dan pantau data kesehatan jamaah bimbingan Anda.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Jamaah Bimbingan"
          value="45 Jamaah"
          description="Grup Syawal 1447H Kloter 1"
          icon={Users}
        />
        <StatCard
          title="Sesi Manasik Selesai"
          value="3 dari 4 Sesi"
          description="1 sesi pemantapan tersisa"
          icon={BookOpen}
        />
        <StatCard
          title="Rata-rata Kehadiran"
          value="94%"
          description="Presensi manasik aktif"
          icon={CheckCircle2}
          trend={{ value: 'Tinggi', isPositive: true }}
        />
        <StatCard
          title="Keberangkatan Terdekat"
          value="15 Okt 2026"
          description="Saudia Airlines (SV-816)"
          icon={Plane}
        />
      </div>

      {/* Grid: Upcoming Manasik & Attendance Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Manasik Action Card */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Sesi Manasik Mendatang
              </CardTitle>
              <CardDescription className="text-xs">
                Jadwal bimbingan teori &amp; praktik yang Anda pimpin
              </CardDescription>
            </div>
            <Link
              href="/manasik"
              className="inline-flex items-center px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <ClipboardCheck className="w-3.5 h-3.5 mr-1" />
              Catat Presensi
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                    Sesi Ke-4: Pemantapan Fiqih Safar &amp; Praktik Umroh
                  </span>
                  <h4 className="text-base font-bold text-foreground mt-0.5">
                    Simulasi Tawaf, Sa’i, Tahallul &amp; Larangan Ihram
                  </h4>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-600 text-white shrink-0">
                  Sabtu Ini
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>05 Okt 2026 • 08:30 - 12:00 WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Grand Ballroom Hotel Aston Jakarta</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground p-3 rounded-xl bg-muted/40 border border-border">
              <span>Rombongan terbagi dalam 11 kamar hotel di Swissôtel Al Maqam Makkah.</span>
              <Link href="/manifests" className="text-emerald-600 font-semibold hover:underline">
                Lihat Rooming List →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Donut Chart */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Presensi Kehadiran Jamaah
            </CardTitle>
            <CardDescription className="text-xs">
              Rekap kehadiran sesi manasik terakhir
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ATTENDANCE_DATA}
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {ATTENDANCE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} Jamaah`, 'Jumlah']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 pt-2 border-t border-border">
              {ATTENDANCE_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentored Pilgrims Table */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Daftar Jamaah Bimbingan
            </CardTitle>
            <CardDescription className="text-xs">
              Jamaah kloter binaan Ustadz Abdullah
            </CardDescription>
          </div>
          <Link href="/pilgrims" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center">
            Semua Jamaah <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="py-2.5">Nama Jamaah</TableHead>
                <TableHead className="py-2.5">Kota Asal</TableHead>
                <TableHead className="py-2.5">WhatsApp</TableHead>
                <TableHead className="py-2.5">Tipe Kamar</TableHead>
                <TableHead className="py-2.5">Progres Manasik</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MENTORED_PILGRIMS.map((item) => (
                <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-semibold py-3 text-foreground">
                    {item.name}
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    {item.city}
                  </TableCell>
                  <TableCell className="py-3 font-mono text-emerald-700 dark:text-emerald-400">
                    <a
                      href={`https://wa.me/${item.phone.replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.phone}
                    </a>
                  </TableCell>
                  <TableCell className="py-3 text-muted-foreground">
                    {item.roomType}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {item.attendance}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
