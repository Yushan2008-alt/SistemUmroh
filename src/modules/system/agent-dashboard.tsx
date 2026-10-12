'use client'

import { useState } from 'react'
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

const COMMISSION_MONTHLY_DATA = [
  { month: 'Mei', komisi: 2500000 },
  { month: 'Jun', komisi: 3500000 },
  { month: 'Jul', komisi: 4000000 },
  { month: 'Agu', komisi: 6500000 },
  { month: 'Sep', komisi: 8000000 },
]

const REFERRAL_PAYMENT_STATUS = [
  { name: 'Lunas', value: 8, color: '#059669' },
  { name: 'Cicilan Berjalan', value: 3, color: '#d97706' },
  { name: 'Belum Bayar', value: 1, color: '#ef4444' },
]

const RECENT_REFERRALS = [
  {
    id: 1,
    name: 'Budi Santoso',
    packageName: 'Umroh Syawal 1447H VIP',
    registeredAt: '12 Sep 2026',
    paymentStatus: 'paid',
    commission: 1500000,
    statusText: 'Lunas (Komisi Cair)',
  },
  {
    id: 2,
    name: 'Siti Aminah',
    packageName: 'Umroh Reguler Hemat 12H',
    registeredAt: '18 Sep 2026',
    paymentStatus: 'partial',
    commission: 1000000,
    statusText: 'DP Masuk (Komisi Menunggu)',
  },
  {
    id: 3,
    name: 'H. Bambang Gunawan',
    packageName: 'Haji Khusus Furoda VIP',
    registeredAt: '24 Sep 2026',
    paymentStatus: 'paid',
    commission: 4000000,
    statusText: 'Lunas (Siap Klaim)',
  },
]

export function AgentDashboard() {
  const [copied, setCopied] = useState(false)
  const agentCode = 'AGN-001'
  const referralLink = `https://travel-umroh.id/register?ref=${agentCode}`

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
            Selamat Datang, Hasan Basri
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Pantau perolehan komisi referral jamaah Anda, riwayat pencairan, dan status pembayaran jamaah bimbingan Anda.
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
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors shrink-0 shadow-xs"
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

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Komisi Diperoleh"
          value="Rp 24.500.000"
          description="Akumulasi seluruh referral"
          icon={Coins}
          trend={{ value: '+Rp 8 Jt bln ini', isPositive: true }}
        />
        <StatCard
          title="Komisi Sudah Dicairkan"
          value="Rp 18.000.000"
          description="Ditransfer ke rekening mitra"
          icon={CheckCircle2}
        />
        <StatCard
          title="Komisi Siap Klaim"
          value="Rp 6.500.000"
          description="Jamaah telah lunas"
          icon={Clock}
          trend={{ value: 'Dapat dicairkan', isPositive: true }}
        />
        <StatCard
          title="Total Jamaah Referral"
          value="12 Jamaah"
          description="Terdaftar via kode AGN-001"
          icon={Users}
          trend={{ value: '+3 jamaah baru', isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Tren Komisi */}
        <Card className="lg:col-span-2 border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Tren Perolehan Komisi Bulanan
                </CardTitle>
                <CardDescription className="text-xs">
                  Pertumbuhan komisi referral Anda 5 bulan terakhir
                </CardDescription>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+23% MoM</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COMMISSION_MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickFormatter={(val) => `Rp${val / 1000000}Jt`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Komisi']}
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
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Status Bayar Jamaah Referral */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-foreground">
              Status Bayar Jamaah
            </CardTitle>
            <CardDescription className="text-xs">
              Status pelunasan dari 12 referral Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={REFERRAL_PAYMENT_STATUS}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {REFERRAL_PAYMENT_STATUS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} Orang`, 'Jumlah']}
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
              {REFERRAL_PAYMENT_STATUS.map((item) => (
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

      {/* Table: Jamaah Referral Terbaru */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Jamaah Referral Terbaru
            </CardTitle>
            <CardDescription className="text-xs">
              Daftar calon jamaah yang mendaftar melalui tautan &amp; kode agen Anda
            </CardDescription>
          </div>
          <Link href="/commissions" className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center">
            Klaim Komisi <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="py-2.5">Nama Jamaah</TableHead>
                <TableHead className="py-2.5">Paket Ibadah</TableHead>
                <TableHead className="py-2.5">Tgl Pendaftaran</TableHead>
                <TableHead className="py-2.5">Estimasi Komisi</TableHead>
                <TableHead className="py-2.5">Status Pencairan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_REFERRALS.map((item) => (
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
                  <TableCell className="py-3 font-bold text-emerald-700 dark:text-emerald-400">
                    Rp {item.commission.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200'
                      }`}
                    >
                      {item.statusText}
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
