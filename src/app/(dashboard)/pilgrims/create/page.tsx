import { getPilgrimFormData } from '@/features/pilgrims/actions'
import { PilgrimForm } from '@/features/pilgrims/components/PilgrimForm'

export const metadata = {
  title: 'Tambah Jamaah Baru | Sistem Manajemen Umroh & Haji',
  description: 'Formulir pendaftaran dan master data profil jamaah baru.',
}

export default async function CreatePilgrimPage() {
  const options = await getPilgrimFormData()

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PilgrimForm options={options} isEdit={false} />
    </div>
  )
}
