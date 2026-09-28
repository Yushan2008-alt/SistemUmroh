import { notFound } from 'next/navigation'
import { getPackageById } from '@/features/packages/actions'
import { PackageDetailView } from '@/features/packages/components/PackageDetailView'

interface PackageDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Detail Paket | Sistem Manajemen Umroh & Haji',
  description: 'Informasi lengkap dan daftar jamaah pada paket perjalanan.',
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { id } = await params
  const pkgId = parseInt(id, 10)

  if (isNaN(pkgId)) {
    notFound()
  }

  const { data: pkg, error } = await getPackageById(pkgId)

  if (!pkg || error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PackageDetailView pkg={pkg} />
    </div>
  )
}
