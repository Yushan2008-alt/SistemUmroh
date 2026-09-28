import { notFound } from 'next/navigation'
import { getPilgrimById } from '@/features/pilgrims/actions'
import { PilgrimDetailView } from '@/features/pilgrims/components/PilgrimDetailView'

interface PilgrimDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Detail Profil Jamaah | Sistem Manajemen Umroh & Haji',
  description: 'Informasi biodata, dokumen paspor, dan riwayat paket jamaah.',
}

export default async function PilgrimDetailPage({ params }: PilgrimDetailPageProps) {
  const { id } = await params
  const pilgrimId = parseInt(id, 10)

  if (isNaN(pilgrimId)) {
    notFound()
  }

  const { data: pilgrim, error } = await getPilgrimById(pilgrimId)

  if (!pilgrim || error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PilgrimDetailView pilgrim={pilgrim} />
    </div>
  )
}
