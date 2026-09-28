import { getPilgrims } from '@/features/pilgrims/actions'
import { PilgrimsTable } from '@/features/pilgrims/components/PilgrimsTable'

interface PageProps {
  searchParams: Promise<{
    q?: string
    status?: string
  }>
}

export const metadata = {
  title: 'Data Jamaah | Sistem Manajemen Umroh & Haji',
  description: 'Master data jamaah umroh dan haji, paspor, dan kontak darurat.',
}

export default async function PilgrimsPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams
  const { data: pilgrims } = await getPilgrims({
    search: q,
    status,
  })

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PilgrimsTable
        initialPilgrims={pilgrims}
        currentSearch={q}
        currentStatus={status}
      />
    </div>
  )
}
