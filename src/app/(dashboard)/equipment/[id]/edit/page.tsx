import { notFound } from 'next/navigation'
import { getEquipmentById, getEquipmentFormData } from '@/features/equipment/actions'
import { EquipmentForm } from '@/features/equipment/components/EquipmentForm'

interface EditEquipmentPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Perlengkapan | Sistem Manajemen Umroh & Haji',
  description: 'Perbarui status distribusi perlengkapan jamaah.',
}

export default async function EditEquipmentPage({ params }: EditEquipmentPageProps) {
  const { id } = await params
  const equipId = parseInt(id, 10)

  if (isNaN(equipId)) {
    notFound()
  }

  const [detailRes, options] = await Promise.all([
    getEquipmentById(equipId),
    getEquipmentFormData(),
  ])

  if (!detailRes.data || detailRes.error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <EquipmentForm equipment={detailRes.data} options={options} isEdit={true} />
    </div>
  )
}
