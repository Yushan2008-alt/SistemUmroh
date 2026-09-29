import { getHotels } from '@/features/hotels/actions'
import { HotelsTable } from '@/features/hotels/components/HotelsTable'

interface PageProps {
  searchParams: Promise<{ q?: string; city?: string }>
}

export const metadata = {
  title: 'Hotel Makkah & Madinah | Sistem Manajemen Umroh & Haji',
  description: 'Daftar dan pengelolaan hotel akomodasi jamaah di Makkah dan Madinah.',
}

export default async function HotelsPage({ searchParams }: PageProps) {
  const { q, city } = await searchParams
  const { data: hotels } = await getHotels(q, city)

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <HotelsTable
        initialHotels={hotels}
        currentSearch={q}
        currentCity={city || 'all'}
      />
    </div>
  )
}
