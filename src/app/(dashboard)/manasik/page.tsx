import { getManasikSchedules } from '@/modules/pilgrims'
import { ManasikTable } from '@/modules/pilgrims'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: 'Jadwal Manasik | Sistem Manajemen Umroh & Haji',
  description: 'Daftar jadwal bimbingan manasik ibadah Umroh dan Haji.',
}

export default async function ManasikPage({ searchParams }: PageProps) {
  const { q } = await searchParams
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

  const { data: schedules } = await getManasikSchedules(q)

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManasikTable initialSchedules={schedules} currentSearch={q} userRole={userRole} />
    </div>
  )
}
