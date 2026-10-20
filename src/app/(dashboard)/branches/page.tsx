import { requireAuthRole } from '@/lib/auth-guard'
import { getBranches } from '@/modules/system'
import { BranchesTable } from '@/modules/system'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: 'Kelola Cabang | Sistem Manajemen Umroh & Haji',
  description: 'Daftar kantor cabang dan kantor pusat operasional.',
}

export default async function BranchesPage({ searchParams }: PageProps) {
  await requireAuthRole(['super_admin'])
  const { q } = await searchParams
  const { data: branches } = await getBranches(q)

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <BranchesTable initialBranches={branches} currentSearch={q} />
    </div>
  )
}
