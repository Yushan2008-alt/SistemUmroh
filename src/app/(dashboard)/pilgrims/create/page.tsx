import { getPilgrimFormData } from '@/modules/pilgrims'
import { PilgrimForm } from '@/modules/pilgrims'

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
