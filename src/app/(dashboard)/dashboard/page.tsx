import { createClient } from '@/lib/supabase/server'
import { StaffDashboard } from '@/features/dashboard/components/StaffDashboard'
import { AgentDashboard } from '@/features/dashboard/components/AgentDashboard'
import { PilgrimDashboard } from '@/features/dashboard/components/PilgrimDashboard'
import { GuideDashboard } from '@/features/dashboard/components/GuideDashboard'
import type { Role } from '@/types/database.types'

export const metadata = {
  title: 'Dashboard | Sistem Manajemen Umroh & Haji',
  description: 'Portal operasional, kemitraan agen, perjalanan jamaah, dan bimbingan ibadah.',
}

export default async function DashboardPage() {
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
    return <AgentDashboard />
  }

  if (userRole === 'pilgrim') {
    return <PilgrimDashboard />
  }

  if (userRole === 'guide') {
    return <GuideDashboard />
  }

  return <StaffDashboard />
}
