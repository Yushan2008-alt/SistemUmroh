import { notFound } from 'next/navigation'
import { requireAuthRole } from '@/lib/auth-guard'
import { getBranchById } from '@/modules/system'
import { BranchForm } from '@/modules/system'

interface EditBranchPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Cabang | Sistem Manajemen Umroh & Haji',
  description: 'Perbarui konfigurasi data kantor cabang.',
}

export default async function EditBranchPage({ params }: EditBranchPageProps) {
  await requireAuthRole(['super_admin'])
  const { id } = await params
  const branchId = parseInt(id, 10)

  if (isNaN(branchId)) {
    notFound()
  }

  const { data: branch, error } = await getBranchById(branchId)

  if (!branch || error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <BranchForm branch={branch} isEdit={true} />
    </div>
  )
}
