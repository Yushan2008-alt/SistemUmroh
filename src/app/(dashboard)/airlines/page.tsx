import { getAirlines } from '@/features/airlines/actions'
import { AirlinesTable } from '@/features/airlines/components/AirlinesTable'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: 'Maskapai Penerbangan | Sistem Manajemen Umroh & Haji',
  description: 'Daftar dan manajemen maskapai penerbangan serta rute transit umroh & haji.',
}

export default async function AirlinesPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const { data: airlines } = await getAirlines(q)

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <AirlinesTable initialAirlines={airlines} currentSearch={q} />
    </div>
  )
}
