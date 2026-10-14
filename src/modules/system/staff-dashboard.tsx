'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserCheck,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Calendar,
  Loader2,
  CheckCircle2,
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
import { getStaffDashboardData, type StaffDashboardData } from './dashboard.actions'
import { formatCurrency } from '@/lib/utils'

export function StaffDashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDateStr, setCurrentDateStr] = useState<string>('')
  const [data, setData] = useState<StaffDashboardData>({
    branchId: null,
    branchName: 'Semua Cabang (Global)',
    totalPilgrims: 0,
    activeRegistrations: 0,
    totalRevenue: 0,
    outstandingBalance: 0,
    paymentStatusData: [],
    monthlyRegistrations: [],
    packageDistribution: [],
    upcomingDepartures: [],
    lastUpdated: new Date().toISOString(),
  })

  // 1. Live real-time clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      )
      setCurrentDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // 2. Fetch staff dashboard data from Supabase
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    try {
      const savedBranchId = localStorage.getItem('branch_focus_id')
      const branchId = savedBranchId && savedBranchId !== 'all' ? Number(savedBranchId) : null
      const res = await getStaffDashboardData(branchId)
      setData(res)
    } catch (err) {
      console.error('Failed to load staff dashboard data:', err)
    } finally {
      setLoading(false)
      if (isManualRefresh) setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // Listen to branch change from Header switcher (Fast Navigasi Cabang)
    const handleBranchChange = () => {
      fetchData()
    }

    window.addEventListener('branch_focus_changed', handleBranchChange)
    return () => {
      window.removeEventListener('branch_focus_changed', handleBranchChange)
    }
  }, [fetchData])

  return (
    <PageContainer>
      {/* Real-time Status Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground">
                {data.branchName}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Real-Time
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentDateStr ? `${currentDateStr} • ${currentTime}` : 'Sinkronisasi Supabase...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="h-8 gap-1.5 text-xs border-border hover:bg-muted font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Jamaah Terdaftar"
          value={loading ? '...' : data.totalPilgrims.toLocaleString('id-ID')}
          description={data.branchId ? `Jamaah terdaftar di ${data.branchName}` : 'Seluruh cabang operasional'}
          icon={Users}
        />
        <StatCard
          title="Pendaftaran Aktif"
          value={loading ? '...' : data.activeRegistrations.toLocaleString('id-ID')}
          description="Pendaftaran dalam proses dan berjalan"
          icon={UserCheck}
        />
        <StatCard
          title="Omzet Kas Masuk"
          value={loading ? '...' : formatCurrency(data.totalRevenue)}
          description="Total pembayaran telah terverifikasi"
          icon={CreditCard}
        />
        <StatCard
          title="Sisa Tagihan Outstanding"
          value={loading ? '...' : formatCurrency(data.outstandingBalance)}
          description="Sisa tagihan belum lunas / jatuh tempo"
          icon={AlertCircle}
        />
      </div>

      {/* Charts Grid Row 1: Line Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Tren Pendaftaran Bulanan Real-Time */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Tren Pendaftaran Jamaah
                </CardTitle>
                <CardDescription className="text-xs">
                  Jumlah registrasi riil per bulan berdasarkan data pendaftaran
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{data.activeRegistrations} Total Aktif</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[260px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyRegistrations} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      formatter={(val) => [`${val} Jamaah`, 'Pendaftaran']}
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Status Pembayaran Tagihan Real-Time */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Status Pembayaran Tagihan
            </CardTitle>
            <CardDescription className="text-xs">
              Distribusi pelunasan invoice pembayaran riil
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[210px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.paymentStatusData}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, item) => [`${val}% (${(item as any)?.payload?.count || 0} invoice)`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-border">
              {data.paymentStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {item.count} invoice ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: GRAFIK BAR OKUPANSI KUOTA PAKET VERTIKAL (KE ATAS) & TABEL KEBERANGKATAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BAR CHART VERTIKAL (BATANG MENGARAH KE ATAS) */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Okupansi Kuota Paket
                </CardTitle>
                <CardDescription className="text-xs">
                  Grafik bar vertikal: Jamaah terdaftar vs total kuota (ke atas)
                </CardDescription>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {currentTime || 'Real-time'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : data.packageDistribution.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-muted-foreground">
                  <span>Belum ada data paket aktif.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {/* Standard Recharts without layout="vertical" makes bars grow VERTICALLY (UPWARDS) */}
                  <BarChart
                    data={data.packageDistribution}
                    margin={{ top: 20, right: 10, left: -10, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.6} />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      type="number"
                      stroke="#64748b"
                      fontSize={11}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(val, name) => [`${val} Seat`, name]}
                      labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="terisi"
                      name="Terisi"
                      fill="#059669"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="kuota"
                      name="Total Kuota"
                      fill="#cbd5e1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#059669]" />
                <span className="text-muted-foreground font-medium">Terisi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#cbd5e1]" />
                <span className="text-muted-foreground font-medium">Total Kuota</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabel Jadwal Keberangkatan Terdekat Real-Time */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Jadwal Keberangkatan Terdekat
              </CardTitle>
              <CardDescription className="text-xs">
                Grup penerbangan umroh &amp; haji dari database aktif
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-600" />
                      Memuat jadwal keberangkatan...
                    </TableCell>
                  </TableRow>
                ) : data.upcomingDepartures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      Belum ada paket terjadwal untuk cabang ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.upcomingDepartures.map((item) => (
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
