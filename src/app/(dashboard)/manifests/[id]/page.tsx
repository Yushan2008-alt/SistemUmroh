import { notFound, redirect } from 'next/navigation'
import { getPackageManifest } from '@/modules/operations'
import { ManifestEditor } from '@/modules/operations'
import { requireAuthRole } from '@/lib/auth-guard'

interface ManifestDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Atur Manifest Paket | Sistem Manajemen Umroh & Haji',
  description: 'Alokasi nomor kamar, tipe kamar, nomor bus, dan kursi jamaah.',
}

export default async function ManifestDetailPage({ params }: ManifestDetailPageProps) {
  const caller = await requireAuthRole(['super_admin', 'admin', 'guide'])
  const { id } = await params
  const packageId = parseInt(id, 10)

  if (isNaN(packageId)) {
    notFound()
  }

  const { packageData, registrations, error } = await getPackageManifest(packageId)

  if (!packageData || error) {
    notFound()
  }

  // Branch isolation check for admin
  if (caller.role === 'admin' && caller.branchId && packageData.branch_id !== caller.branchId) {
    redirect('/manifests')
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManifestEditor
        pkg={packageData}
        registrations={registrations}
        readOnly={caller.role === 'guide'}
      />
    </div>
  )
}
