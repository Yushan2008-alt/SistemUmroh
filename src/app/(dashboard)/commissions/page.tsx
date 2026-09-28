import { PageHeader } from '@/components/layout/PageHeader'
import { getCommissions, getCommissionRekap, getAgentsList } from '@/features/commissions/actions'
import { CommissionStatsCards } from '@/features/commissions/components/CommissionStatsCards'
import { CommissionTable } from '@/features/commissions/components/CommissionTable'

export const metadata = {
  title: 'Komisi Agen | Sistem Manajemen Umroh & Haji',
  description: 'Rekapitulasi & Pembayaran Komisi Agen Mitra Travel',
}

export default async function CommissionsPage() {
  const [commissions, rekap, agents] = await Promise.all([
    getCommissions(),
    getCommissionRekap(),
    getAgentsList(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Komisi Agen"
        description="Rekapitulasi & pelacakan status pembayaran komisi agen mitra travel"
      />

      {/* 4 Stats Cards */}
      <CommissionStatsCards rekap={rekap} />

      {/* Main Table with Filters & Modal */}
      <CommissionTable initialCommissions={commissions} agents={agents} />
    </div>
  )
}
