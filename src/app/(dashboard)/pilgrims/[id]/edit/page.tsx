import { notFound } from 'next/navigation'
import { getPilgrimById, getPilgrimFormData } from '@/modules/pilgrims'
import { PilgrimForm } from '@/modules/pilgrims'

interface EditPilgrimPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Data Jamaah | Sistem Manajemen Umroh & Haji',
  description: 'Perbarui data diri, nomor paspor, dan kontak darurat jamaah.',
}

export default async function EditPilgrimPage({ params }: EditPilgrimPageProps) {
  const { id } = await params
  const pilgrimId = parseInt(id, 10)

  if (isNaN(pilgrimId)) {
    notFound()
  }

  const [pilgrimRes, options] = await Promise.all([
    getPilgrimById(pilgrimId),
    getPilgrimFormData(),
  ])

  if (!pilgrimRes.data || pilgrimRes.error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PilgrimForm pilgrim={pilgrimRes.data} options={options} isEdit={true} />
    </div>
  )
}
