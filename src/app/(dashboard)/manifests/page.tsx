import { getManifestPackages } from '@/features/manifests/actions'
import { ManifestsPackageTable } from '@/features/manifests/components/ManifestsPackageTable'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: 'Manifest & Rooming | Sistem Manajemen Umroh & Haji',
  description: 'Penyusunan manifest keberangkatan dan alokasi kamar hotel jamaah.',
}

export default async function ManifestsPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const { data: packages } = await getManifestPackages(q)

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManifestsPackageTable initialPackages={packages} currentSearch={q} />
    </div>
  )
}
