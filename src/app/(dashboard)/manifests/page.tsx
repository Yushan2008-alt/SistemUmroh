import { getManifestPackages } from '@/modules/operations'
import { ManifestsPackageTable } from '@/modules/operations'
import { requireAuthRole } from '@/lib/auth-guard'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: 'Manifest & Rooming | Sistem Manajemen Umroh & Haji',
  description: 'Penyusunan manifest keberangkatan dan alokasi kamar hotel jamaah.',
}

export default async function ManifestsPage({ searchParams }: PageProps) {
  const caller = await requireAuthRole(['super_admin', 'admin'])
  const { q } = await searchParams
  const branchId = caller.role === 'admin' ? caller.branchId : null
  const { data: packages } = await getManifestPackages(q, branchId)

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManifestsPackageTable initialPackages={packages} currentSearch={q} />
    </div>
  )
}
