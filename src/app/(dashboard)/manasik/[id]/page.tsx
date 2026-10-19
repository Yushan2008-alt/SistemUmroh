import { notFound } from 'next/navigation'
import { getManasikScheduleById } from '@/modules/pilgrims'
import { ManasikAttendanceView } from '@/modules/pilgrims'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'

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

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userRole: Role = 'super_admin'
  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.role) {
      userRole = profile.role as Role
    }
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
        userRole={userRole}
      />
    </div>
  )
}
