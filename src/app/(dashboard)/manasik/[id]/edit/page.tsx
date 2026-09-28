import { notFound } from 'next/navigation'
import { getManasikScheduleById, getManasikFormData } from '@/features/manasik/actions'
import { ManasikForm } from '@/features/manasik/components/ManasikForm'

interface EditManasikPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Jadwal Manasik | Sistem Manajemen Umroh & Haji',
  description: 'Perbarui rincian jadwal bimbingan ibadah.',
}

export default async function EditManasikPage({ params }: EditManasikPageProps) {
  const { id } = await params
  const scheduleId = parseInt(id, 10)

  if (isNaN(scheduleId)) {
    notFound()
  }

  const [detailRes, options] = await Promise.all([
    getManasikScheduleById(scheduleId),
    getManasikFormData(),
  ])

  if (!detailRes.schedule || detailRes.error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManasikForm schedule={detailRes.schedule} options={options} isEdit={true} />
    </div>
  )
}
