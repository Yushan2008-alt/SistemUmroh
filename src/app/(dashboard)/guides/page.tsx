import { getGuides, getAvailableBranches } from '@/features/guides/actions'
import { GuidesTable } from '@/features/guides/components/GuidesTable'

interface PageProps {
  searchParams: Promise<{ q?: string; branch?: string }>
}

export const metadata = {
  title: 'Muthawif & Pembimbing | Sistem Manajemen Umroh & Haji',
  description: 'Pengelolaan data pembimbing ibadah umroh, haji, dan ustadz pemateri manasik.',
}

export default async function GuidesPage({ searchParams }: PageProps) {
  const { q, branch } = await searchParams
  const branchId = branch ? Number(branch) : undefined
  const [{ data: guides }, branches] = await Promise.all([
    getGuides(q, branchId),
    getAvailableBranches(),
  ])

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <GuidesTable initialGuides={guides} branches={branches} currentSearch={q} />
    </div>
  )
}
