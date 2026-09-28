import { notFound } from 'next/navigation'
import { getPackageManifest } from '@/features/manifests/actions'
import { ManifestEditor } from '@/features/manifests/components/ManifestEditor'

interface ManifestDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Atur Manifest Paket | Sistem Manajemen Umroh & Haji',
  description: 'Alokasi nomor kamar, tipe kamar, nomor bus, dan kursi jamaah.',
}

export default async function ManifestDetailPage({ params }: ManifestDetailPageProps) {
  const { id } = await params
  const packageId = parseInt(id, 10)

  if (isNaN(packageId)) {
    notFound()
  }

  const { packageData, registrations, error } = await getPackageManifest(packageId)

  if (!packageData || error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManifestEditor pkg={packageData} registrations={registrations} />
    </div>
  )
}
