import { getEquipmentDistributions } from '@/features/equipment/actions'
import { EquipmentTable } from '@/features/equipment/components/EquipmentTable'

interface PageProps {
  searchParams: Promise<{
    q?: string
    status?: string
  }>
}

export const metadata = {
  title: 'Perlengkapan Jamaah | Sistem Manajemen Umroh & Haji',
  description: 'Distribusi logistik koper, seragam batik, tas paspor, dan kain ihram.',
}

export default async function EquipmentPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams
  const { data: equipment } = await getEquipmentDistributions({
    search: q,
    status,
  })

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <EquipmentTable
        initialEquipment={equipment}
        currentSearch={q}
        currentStatus={status}
      />
    </div>
  )
}
