import { getAgents, getAvailableBranches } from '@/features/agents/actions'
import { AgentsTable } from '@/features/agents/components/AgentsTable'

interface PageProps {
  searchParams: Promise<{ q?: string; branch?: string }>
}

export const metadata = {
  title: 'Mitra Agen | Sistem Manajemen Umroh & Haji',
  description: 'Pengelolaan data agen kemitraan, komisi referral, dan performa pendaftaran.',
}

export default async function AgentsPage({ searchParams }: PageProps) {
  const { q, branch } = await searchParams
  const branchId = branch ? Number(branch) : undefined
  const [{ data: agents }, branches] = await Promise.all([
    getAgents(q, branchId),
    getAvailableBranches(),
  ])

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <AgentsTable initialAgents={agents} branches={branches} currentSearch={q} />
    </div>
  )
}
