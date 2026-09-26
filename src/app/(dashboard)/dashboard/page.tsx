'use client'

import { useState } from 'react'
import {
  Users,
  UserCheck,
  CreditCard,
  AlertCircle,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
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
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { formatRupiah } from '@/features/payments/utils/terbilang'

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

export default function DashboardPage() {
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
            Pantau pertumbuhan jamaah, sisa kuota paket umroh & haji, status pembayaran, dan manifest keberangkatan secara real-time.
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
                  <span className="font-bold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Upcoming Departures Table */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Jadwal Keberangkatan Terdekat
            </CardTitle>
            <CardDescription className="text-xs">
              Monitor sisa kuota dan kesiapan dokumen paket yang akan terbang
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-emerald-700 border-emerald-300">
            <span>Lihat Semua Paket</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Nama Paket</TableHead>
                  <TableHead className="text-xs">Tanggal Berangkat</TableHead>
                  <TableHead className="text-xs">Maskapai</TableHead>
                  <TableHead className="text-xs">Keterisian Kursi</TableHead>
                  <TableHead className="text-xs">Countdown</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {UPCOMING_DEPARTURES.map((p) => {
                  const percent = Math.round((p.booked / p.quota) * 100)
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-xs text-foreground">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{p.departureDate}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.airline}</TableCell>
                      <TableCell className="text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-medium">
                            <span>{p.booked}/{p.quota} Kursi</span>
                            <span className="text-emerald-600 font-bold">{percent}%</span>
                          </div>
                          <div className="h-1.5 w-28 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full text-[11px]">
                          <Clock className="h-3 w-3" />
                          H-{p.daysLeft} Hari
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <StatusBadge status={p.status} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
