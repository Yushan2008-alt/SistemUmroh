import { getEquipmentFormData } from '@/features/equipment/actions'
import { EquipmentForm } from '@/features/equipment/components/EquipmentForm'

export const metadata = {
  title: 'Catat Perlengkapan Baru | Sistem Manajemen Umroh & Haji',
  description: 'Catat penyerahan koper, tas paspor, dan seragam kepada jamaah.',
}

export default async function CreateEquipmentPage() {
  const options = await getEquipmentFormData()

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <EquipmentForm options={options} isEdit={false} />
    </div>
  )
}
