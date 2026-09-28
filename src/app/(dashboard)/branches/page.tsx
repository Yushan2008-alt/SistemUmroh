import { getBranches } from '@/features/branches/actions'
import { BranchesTable } from '@/features/branches/components/BranchesTable'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: 'Kelola Cabang | Sistem Manajemen Umroh & Haji',
  description: 'Daftar kantor cabang dan kantor pusat operasional.',
}

export default async function BranchesPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const { data: branches } = await getBranches(q)

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <BranchesTable initialBranches={branches} currentSearch={q} />
    </div>
  )
}
