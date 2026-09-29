import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
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

  const roleTitles: Record<Role, string> = {
    super_admin: 'Dashboard Operasional',
    admin: 'Dashboard Cabang',
    agent: 'Portal Kemitraan Agen',
    pilgrim: 'Portal Perjalanan Saya',
    guide: 'Portal Bimbingan Muthawif',
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar userRole={userRole} appName="Al-Madinah Travel" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header userRole={userRole} title={roleTitles[userRole] || 'Dashboard Operasional'} />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

