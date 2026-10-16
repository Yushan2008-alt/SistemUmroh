import { PageHeader } from '@/components/layout/PageHeader'
import { getAnnouncements } from '@/modules/system'
import { AnnouncementList } from '@/modules/system'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'

export const metadata = {
  title: 'Pengumuman | Sistem Manajemen Umroh & Haji',
  description: 'Kelola Pengumuman Internal untuk Staf, Agen, dan Jamaah',
}

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  if (userRole === 'agent') {
    const { redirect } = await import('next/navigation')
    redirect('/dashboard')
  }

  const announcements = await getAnnouncements()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengumuman"
        description={
          userRole === 'pilgrim'
            ? 'Informasi penting dan edaran resmi perjalanan ibadah Anda'
            : 'Kelola pengumuman & edaran resmi untuk staf, agen mitra, dan jamaah'
        }
      />

      <AnnouncementList initialAnnouncements={announcements} userRole={userRole} />
    </div>
  )
}
