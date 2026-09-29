'use client'

import {
  Users,
  UserCheck,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const PAYMENT_STATUS_DATA = [
  { name: 'Lunas', value: 72, color: '#059669' },
  { name: 'Sebagian (Cicil)', value: 18, color: '#d97706' },
  { name: 'Belum Bayar', value: 10, color: '#ef4444' },
]

const MONTHLY_REGISTRATIONS_DATA = [
  { month: 'Jan', jamaah: 28 },
  { month: 'Feb', jamaah: 35 },
  { month: 'Mar', jamaah: 48 },
  { month: 'Apr', jamaah: 62 },
  { month: 'Mei', jamaah: 54 },
  { month: 'Jun', jamaah: 41 },
  { month: 'Jul', jamaah: 68 },
  { month: 'Agu', jamaah: 75 },
  { month: 'Sep', jamaah: 92 },
]

const PACKAGE_DISTRIBUTION_DATA = [
  { name: 'Umroh Syawal', terisi: 33, kuota: 45 },
  { name: 'Ramadhan I’tikaf', terisi: 32, kuota: 40 },
  { name: 'Haji Furoda VIP', terisi: 16, kuota: 20 },
  { name: 'Plus Turki 12H', terisi: 28, kuota: 35 },
]

const UPCOMING_DEPARTURES = [
  {
    id: 1,
    name: 'Umroh Reguler Syawal 1447H',
    departureDate: '15 Okt 2026',
    daysLeft: 19,
    airline: 'Saudia Airlines',
    booked: 33,
    quota: 45,
    status: 'confirmed',
  },
  {
    id: 2,
    name: 'Umroh Ramadhan Berkah I’tikaf',
    departureDate: '05 Nov 2026',
    daysLeft: 40,
    airline: 'Garuda Indonesia',
    booked: 32,
    quota: 40,
    status: 'confirmed',
  },
  {
    id: 3,
    name: 'Umroh Plus Turki Musim Gugur',
    departureDate: '20 Nov 2026',
    daysLeft: 55,
    airline: 'Emirates',
    booked: 28,
    quota: 35,
    status: 'pending',
  },
  {
    id: 4,
    name: 'Haji Khusus Furoda VIP',
    departureDate: '20 Mei 2027',
    daysLeft: 236,
    airline: 'Garuda Indonesia',
    booked: 16,
    quota: 20,
    status: 'pending',
  },
]

export function StaffDashboard() {
  return (
    <PageContainer>
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
            Ringkasan Operasional Multi-Cabang
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Selamat Datang di Portal Manajemen Travel
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Pantau pertumbuhan jamaah, sisa kuota paket umroh &amp; haji, status pembayaran, dan manifest keberangkatan secara real-time.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Jamaah Terdaftar"
          value="1,248"
          description="Jamaah aktif di seluruh cabang"
          icon={Users}
          trend={{ value: '+14% bln ini', isPositive: true }}
        />
        <StatCard
          title="Pendaftaran Aktif"
          value="109"
          description="Musim 1447H / 1448H"
          icon={UserCheck}
          trend={{ value: '+22 pendaftar', isPositive: true }}
        />
        <StatCard
          title="Omzet Kas Masuk"
          value="Rp 3.42 M"
          description="Total pembayaran terverifikasi"
          icon={CreditCard}
          trend={{ value: '+8.5% MoM', isPositive: true }}
        />
        <StatCard
          title="Sisa Tagihan Outstanding"
          value="Rp 845 Jt"
          description="Cicilan jatuh tempo H-14"
          icon={AlertCircle}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Tren Pendaftaran Bulanan */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Tren Pendaftaran Jamaah
                </CardTitle>
                <CardDescription className="text-xs">
                  Pertumbuhan pendaftaran bulanan tahun berjalan
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+18.4%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_REGISTRATIONS_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="jamaah"
                    name="Jamaah"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#059669' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Status Pembayaran */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Status Pembayaran Tagihan
            </CardTitle>
            <CardDescription className="text-xs">
              Distribusi pelunasan jamaah aktif
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PAYMENT_STATUS_DATA}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PAYMENT_STATUS_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Persentase']}
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
            <div className="space-y-1.5 pt-2 border-t border-border">
              {PAYMENT_STATUS_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Bar Chart Paket Terpopuler & Tabel Keberangkatan Terdekat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Okupansi Paket */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Okupansi Kuota Paket
            </CardTitle>
            <CardDescription className="text-xs">
              Perbandingan jamaah terdaftar vs kuota
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PACKAGE_DISTRIBUTION_DATA} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.6} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="terisi" name="Terisi" fill="#0d9488" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="kuota" name="Total Kuota" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabel Keberangkatan Terdekat */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Jadwal Keberangkatan Terdekat
              </CardTitle>
              <CardDescription className="text-xs">
                Grup penerbangan umroh &amp; haji siap berangkat
              </CardDescription>
            </div>
            <Link href="/manifests" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center">
              Lihat Semua <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="py-2.5">Nama Paket</TableHead>
                  <TableHead className="py-2.5">Keberangkatan</TableHead>
                  <TableHead className="py-2.5">Maskapai</TableHead>
                  <TableHead className="py-2.5">Terisi</TableHead>
                  <TableHead className="py-2.5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {UPCOMING_DEPARTURES.map((item) => (
                  <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="font-semibold py-3 text-foreground">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>{item.departureDate}</span>
                        <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-1.5 py-0.2 rounded font-semibold ml-1">
                          H-{item.daysLeft}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      {item.airline}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1 font-medium">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">{item.booked}</span>
                        <span className="text-muted-foreground">/ {item.quota}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
