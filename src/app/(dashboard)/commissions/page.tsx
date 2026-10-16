import { PageHeader } from '@/components/layout/PageHeader'
import { getCommissions, getCommissionRekap, getAgentsList } from '@/modules/finance'
import { CommissionStatsCards } from '@/modules/finance'
import { CommissionTable } from '@/modules/finance'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'

export const metadata = {
  title: 'Komisi Agen | Sistem Manajemen Umroh & Haji',
  description: 'Rekapitulasi & Pembayaran Komisi Agen Mitra Travel',
}

export default async function CommissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole: Role = 'super_admin'
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
    if (userRole === 'agent') {
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

  const [commissions, rekap, agents] = await Promise.all([
    getCommissions(agentId !== null ? { agentId } : undefined),
    getCommissionRekap(agentId),
    userRole === 'agent' ? [] : getAgentsList(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title={userRole === 'agent' ? 'Komisi Saya' : 'Komisi Agen'}
        description={
          userRole === 'agent'
            ? 'Rekapitulasi hak komisi penjualan paket ibadah Anda dan status pencairan oleh travel'
            : 'Rekapitulasi & pelacakan status pembayaran komisi agen mitra travel'
        }
      />

      {/* 4 Stats Cards */}
      <CommissionStatsCards rekap={rekap} />

      {/* Main Table with Filters & Modal */}
      <CommissionTable initialCommissions={commissions} agents={agents} userRole={userRole} />
    </div>
  )
}
