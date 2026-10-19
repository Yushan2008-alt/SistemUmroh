import { notFound, redirect } from 'next/navigation'
import { getManasikScheduleById, getManasikFormData } from '@/modules/pilgrims'
import { ManasikForm } from '@/modules/pilgrims'
import { createClient } from '@/lib/supabase/server'

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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'super_admin' && profile?.role !== 'admin') {
      redirect('/manasik')
    }
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
