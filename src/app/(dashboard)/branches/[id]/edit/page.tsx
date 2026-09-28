import { notFound } from 'next/navigation'
import { getBranchById } from '@/features/branches/actions'
import { BranchForm } from '@/features/branches/components/BranchForm'

interface EditBranchPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Cabang | Sistem Manajemen Umroh & Haji',
  description: 'Perbarui konfigurasi data kantor cabang.',
}

export default async function EditBranchPage({ params }: EditBranchPageProps) {
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
