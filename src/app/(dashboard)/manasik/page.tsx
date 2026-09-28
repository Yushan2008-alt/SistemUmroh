import { getManasikSchedules } from '@/features/manasik/actions'
import { ManasikTable } from '@/features/manasik/components/ManasikTable'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: 'Jadwal Manasik | Sistem Manajemen Umroh & Haji',
  description: 'Daftar jadwal bimbingan manasik ibadah Umroh dan Haji.',
}

export default async function ManasikPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const { data: schedules } = await getManasikSchedules(q)

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManasikTable initialSchedules={schedules} currentSearch={q} />
    </div>
  )
}
