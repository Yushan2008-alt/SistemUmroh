'use client'

import { useState, useEffect } from 'react'
import {
  Coins,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Copy,
  Check,
  Percent,
  Gift,
  Share2,
  Loader2,
  RefreshCw,
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
import { getAgentDashboardData, type AgentDashboardData } from './dashboard.actions'
import { formatCurrency } from '@/lib/utils'

export function AgentDashboard() {
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
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
  }, [])

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/login?ref=${data.referralCode}`
    : `https://almadinah-travel.co.id/login?ref=${data.referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageContainer>
      {/* Agent Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-200 bg-white/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
            Portal Kemitraan Mitra Agen
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Selamat Datang, {data.agentName}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Pantau perolehan komisi referral jamaah Anda, riwayat pencairan, dan status pembayaran jamaah bimbingan Anda secara real-time.
          </p>
        </div>

        {/* Quick Referral Link Widget */}
        <div className="mt-5 relative z-10 p-3 bg-black/20 backdrop-blur-md rounded-xl border border-white/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-xl">
          <div className="text-xs">
            <span className="text-amber-200 block text-[10px] uppercase font-bold tracking-wider">
              Tautan Referral Jamaah Anda
            </span>
            <span className="font-mono text-white/90 truncate block max-w-xs sm:max-w-sm">
              {referralLink}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Salin Tautan
              </>
            )}
          </button>
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
          title="Komisi Siap Cair"
          value={loading ? '...' : formatCurrency(data.pendingCommission)}
          description="Dari jamaah pembayaran lunas"
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Jamaah Referral"
          value={loading ? '...' : data.totalReferrals.toString()}
          description="Jamaah mendaftar via kode Anda"
          icon={Users}
        />
        <StatCard
          title="Persentase Bagi Hasil"
          value={`${data.commissionRate}%`}
          description="Skema komisi tier kemitraan"
          icon={Percent}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Perolehan Komisi */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Tren Perolehan Komisi
                </CardTitle>
                <CardDescription className="text-xs">
                  Progres akumulasi pendapatan komisi mitra
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Terverifikasi Real-Time</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[250px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
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
                      stroke="#d97706"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#d97706' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Status Pelunasan Referral */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Status Tagihan Jamaah
            </CardTitle>
            <CardDescription className="text-xs">
              Distribusi status pembayaran jamaah referral
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[200px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
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
              )}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-border">
              {data.referralPaymentStatus.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value} Jamaah</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Referral Terbaru */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Daftar Jamaah Referral Terbaru
            </CardTitle>
            <CardDescription className="text-xs">
              Riwayat pendaftaran jamaah melalui tautan atau kode referral Anda
            </CardDescription>
          </div>
          <Link href="/commissions" className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center">
            Riwayat Komisi Lengkap <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
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
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-amber-600" />
                    Memuat data referral...
                  </TableCell>
                </TableRow>
              ) : data.recentReferrals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                    Belum ada jamaah yang mendaftar melalui kode referral Anda.
                  </TableCell>
                </TableRow>
              ) : (
                data.recentReferrals.map((item) => (
                  <TableRow key={item.id} className="text-xs hover:bg-muted/30">
                    <TableCell className="font-semibold py-3 text-foreground">
                      {item.name}
                    </TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      {item.packageName}
                    </TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      {item.registeredAt}
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(item.commissionAmount)}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
