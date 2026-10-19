'use client'

import { useState, useEffect } from 'react'
import {
  Coins,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Percent,
  Loader2,
  Megaphone,
  Calendar,
  Layers,
} from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/common/StatCard'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { getAgentDashboardData, type AgentDashboardData } from './dashboard.actions'
import { formatCurrency } from '@/lib/utils'

export function AgentDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AgentDashboardData>({
    agentName: 'Mitra Agen',
    referralCode: 'AGN-001',
    commissionRate: 5,
    totalCommissionEarned: 0,
    paidCommission: 0,
    pendingCommission: 0,
    totalReferrals: 0,
    activeReferrals: 0,
    commissionMonthly: [],
    referralPaymentStatus: [],
    recentReferrals: [],
    announcements: [],
  })

  const loadData = async () => {
    try {
      const res = await getAgentDashboardData()
      setData(res)
    } catch (err) {
      console.error('Failed to load agent dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Setup Supabase Realtime Auto-Sync on public tables
    const supabase = createClient()
    const channel = supabase
      .channel('agent-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commissions' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pilgrims' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        loadData()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        loadData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <PageContainer>
      {/* Agent Banner - Flat Minimalist & Deep Emerald */}
      <div className="rounded-xl bg-[#064e3b] dark:bg-[#022318] p-6 text-white border border-emerald-800 shadow-none relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-2xl space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-white font-heading">
            Selamat Datang, {data.agentName}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Pantau perolehan komisi referral jamaah Anda, riwayat pencairan, dan status tagihan paket bimbingan Anda secara real-time langsung dari database.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/registrations/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftarkan Jamaah</span>
          </Link>
          <Link
            href="/commissions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold border border-emerald-600/60 transition-colors"
          >
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span>Komisi Saya</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Komisi Diperoleh"
          value={loading ? '...' : formatCurrency(data.totalCommissionEarned)}
          description="Akumulasi komisi referral"
          icon={Coins}
        />
        <StatCard
          title="Komisi Menunggu Pencairan"
          value={loading ? '...' : formatCurrency(data.pendingCommission)}
          description="Dari tagihan referral aktif"
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Jamaah Referral"
          value={loading ? '...' : data.totalReferrals.toString()}
          description="Jamaah bimbingan terdaftar"
          icon={Users}
        />
        <StatCard
          title="Bagi Hasil Kemitraan"
          value={`${data.commissionRate}%`}
          description="Persentase komisi per paket"
          icon={Percent}
        />
      </div>

      {/* Pengumuman & Edaran Travel untuk Mitra Agen */}
      {data.announcements && data.announcements.length > 0 && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-none">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Megaphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    Pengumuman & Edaran Resmi Travel
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Informasi penting keberangkatan dan operasional jamaah dari kantor pusat & cabang
                  </CardDescription>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded">
                Khusus Mitra Agen
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.announcements.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">{item.title}</h4>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {item.publishAt}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {item.body}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Perolehan Komisi Real */}
        <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-none">
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Tren Perolehan Komisi
              </CardTitle>
              <CardDescription className="text-xs">
                Progres akumulasi pendapatan komisi mitra dari database
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[250px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.commissionMonthly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickFormatter={(val) => `${val / 1000000} Jt`}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(Number(val)), 'Komisi']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="komisi"
                      name="Komisi"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#059669' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Status Tagihan Referral */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Status Tagihan Jamaah
            </CardTitle>
            <CardDescription className="text-xs">
              Distribusi status pembayaran invoice referral
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[200px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              ) : data.referralPaymentStatus.every((s) => s.value === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-muted-foreground">
                  <Layers className="w-6 h-6 mb-1 text-slate-300" />
                  Belum ada invoice referral aktif
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.referralPaymentStatus}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.referralPaymentStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val} Invoice`, 'Jumlah']}
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
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {data.referralPaymentStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{item.value} Invoice</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Referral Terbaru */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl shadow-none">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Daftar Jamaah Referral Terbaru
            </CardTitle>
            <CardDescription className="text-xs">
              Riwayat pendaftaran jamaah binaan yang terdaftar pada akun Anda
            </CardDescription>
          </div>
          <Link href="/commissions" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center">
            Riwayat Komisi Lengkap <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/40 text-xs">
                <TableHead className="py-2.5">Nama Jamaah</TableHead>
                <TableHead className="py-2.5">Paket Ibadah</TableHead>
                <TableHead className="py-2.5">Tgl Daftar</TableHead>
                <TableHead className="py-2.5">Estimasi Komisi</TableHead>
                <TableHead className="py-2.5">Status Pendaftaran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-600" />
                    Memuat data referral...
                  </TableCell>
                </TableRow>
              ) : data.recentReferrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                    Belum ada jamaah yang terdaftar melalui kemitraan Anda.
                  </TableCell>
                </TableRow>
              ) : (
                data.recentReferrals.map((item) => (
                  <TableRow key={item.id} className="text-xs hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <TableCell className="font-semibold py-3 text-slate-900 dark:text-white">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-3 text-slate-600 dark:text-slate-400">
                      {item.packageName}
                    </TableCell>
                    <TableCell className="py-3 text-slate-600 dark:text-slate-400">
                      {item.registeredAt}
                    </TableCell>
                    <TableCell className="py-3 font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(item.commissionAmount)}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {item.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
