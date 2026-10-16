import { getPayments, getPaymentStats } from '@/modules/finance'
import { PaymentsFilter } from '@/modules/finance'
import { PaymentsTable } from '@/modules/finance'
import { getCurrentPilgrim } from '@/modules/pilgrims'
import {
  CreditCard,
  Banknote,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  Receipt,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'

export const metadata = {
  title: 'Tagihan & Kasir Pembayaran | Travel Umroh & Haji',
  description: 'Manajemen invoice, kasir penerimaan pembayaran, dan gateway Midtrans Sandbox.',
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    type?: string
  }>
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams.search || ''
  const status = resolvedSearchParams.status || 'all'
  const type = resolvedSearchParams.type || 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole: Role = 'super_admin'
  let currentPilgrimId: number | undefined = undefined

  let agentId: number | null = null

  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.role) {
      userRole = profile.role as Role
    }
    if (userRole === 'pilgrim') {
      const pilgrim = await getCurrentPilgrim()
      if (pilgrim) {
        currentPilgrimId = pilgrim.id
      }
    } else if (userRole === 'agent') {
      const admin = (await import('@/lib/supabase/admin')).createAdminClient() as any
      const { data: ag } = await admin
        .from('agents')
        .select('id')
        .or(`profile_id.eq.${user.id},email.eq.${user.email}`)
        .maybeSingle()
      if (ag) {
        agentId = ag.id
      } else {
        agentId = -1
      }
    }
  }

  // Fetch financial summary stats and filtered invoices (scoped to current pilgrim or agent)
  const [stats, { data: payments }] = await Promise.all([
    getPaymentStats(
      currentPilgrimId
        ? { pilgrimId: currentPilgrimId }
        : agentId !== null
        ? { agentId }
        : undefined
    ),
    getPayments({
      search,
      status,
      type,
      pilgrimId: currentPilgrimId,
      agentId,
    }),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {userRole === 'agent' ? 'Tagihan Jamaah Referral' : 'Tagihan & Kasir Pembayaran'}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {userRole === 'agent' ? 'Monitoring Tagihan' : 'Midtrans Sandbox & Kasir'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {userRole === 'pilgrim'
              ? 'Rincian tagihan paket keberangkatan ibadah Anda dan pembayaran online instan.'
              : userRole === 'agent'
              ? 'Pantau status pembayaran DP dan cicilan jamaah referral Anda.'
              : 'Kelola invoice DP & cicilan, pencatatan kasir kantor, dan pembayaran online Midtrans Snap (QRIS, VA Bank).'}
          </p>
        </div>

        {userRole !== 'pilgrim' && userRole !== 'agent' && (
          <div className="flex items-center gap-2">
            <a
              href="/payments/generate-massal"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Layers className="w-4 h-4" />
              <span>Generate Cicilan Massal</span>
            </a>
          </div>
        )}
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tagihan Diterbitkan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {userRole === 'pilgrim' ? 'Total Biaya Paket' : 'Total Tagihan Terbit'}
            </span>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Rp {stats.total_billed.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {userRole === 'pilgrim' ? `${stats.total_invoices} tagihan paket` : `${stats.total_invoices} invoice terdaftar`}
            </div>
          </div>
        </div>

        {/* Card 2: Total Kas Masuk (Diterima) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {userRole === 'pilgrim' ? 'Total Terbayar' : 'Total Kas Diterima'}
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              Rp {stats.total_collected.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-emerald-600/80 mt-0.5">
              {stats.count_paid} invoice lunas
            </div>
          </div>
        </div>

        {/* Card 3: Sisa Piutang */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {userRole === 'pilgrim' ? 'Sisa Tagihan Saya' : 'Sisa Piutang Jamaah'}
            </span>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              Rp {stats.total_remaining.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-rose-600/80 mt-0.5">
              {userRole === 'pilgrim'
                ? stats.total_remaining === 0
                  ? 'Semua tagihan lunas'
                  : `${stats.count_unpaid} invoice belum lunas`
                : `${stats.count_unpaid} invoice belum bayar`}
            </div>
          </div>
        </div>

        {/* Card 4: Kolektibilitas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {userRole === 'pilgrim' ? 'Status Pelunasan' : 'Kolektibilitas Kasir'}
            </span>
            <div className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-0.5">
              {userRole === 'pilgrim'
                ? stats.collection_ratio === 100
                  ? 'Lunas 100%'
                  : `${stats.collection_ratio}%`
                : `${stats.collection_ratio}%`}
            </div>
            <div className="text-xs text-sky-600/80 mt-0.5">
              {userRole === 'pilgrim' ? 'Persentase pembayaran paket' : 'Rasio pelunasan invoice'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <PaymentsFilter
        currentSearch={search}
        currentStatus={status}
        currentType={type}
        userRole={userRole}
        stats={stats}
      />

      {/* Table Component */}
      <PaymentsTable items={payments} userRole={userRole} />
    </div>
  )
}
