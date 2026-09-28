import { notFound } from 'next/navigation'
import { getManasikScheduleById } from '@/features/manasik/actions'
import { ManasikAttendanceView } from '@/features/manasik/components/ManasikAttendanceView'

interface ManasikDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Presensi Manasik | Sistem Manajemen Umroh & Haji',
  description: 'Pencatatan kehadiran dan rincian bimbingan manasik jamaah.',
}

export default async function ManasikDetailPage({ params }: ManasikDetailPageProps) {
  const { id } = await params
  const scheduleId = parseInt(id, 10)

  if (isNaN(scheduleId)) {
    notFound()
  }

  const { schedule, pilgrims, rekap, error } = await getManasikScheduleById(scheduleId)

  if (!schedule || error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManasikAttendanceView
        schedule={schedule}
        initialPilgrims={pilgrims}
        initialRekap={rekap}
      />
    </div>
  )
}
