import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getPackages } from '@/modules/operations'
import { PackagesTable } from '@/modules/operations'
import type { Role } from '@/types/database.types'

interface PageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    status?: string
  }>
}

export const metadata = {
  title: 'Paket Umroh & Haji | Sistem Manajemen Umroh & Haji',
  description: 'Daftar dan konfigurasi paket perjalanan Umroh & Haji.',
}

export default async function PackagesPage({ searchParams }: PageProps) {
  const { q, type, status } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole: Role = 'super_admin'
  let profileBranchId: number | null = null

  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role) {
      userRole = profile.role as Role
    }
    if (profile?.branch_id) {
      profileBranchId = profile.branch_id
    }
  }

  let filterBranchId: number | null = null

  if (userRole === 'admin') {
    const cookieStore = await cookies()
    const cookieBranch = cookieStore.get('branch_focus_id')?.value
    filterBranchId = cookieBranch && cookieBranch !== 'all' ? Number(cookieBranch) : (profileBranchId || 1)
  } else if (userRole === 'agent' && user) {
    const admin = (await import('@/lib/supabase/admin')).createAdminClient() as any
    const { data: ag } = await admin
      .from('agents')
      .select('branch_id')
      .or(`profile_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle()
    if (ag?.branch_id) {
      filterBranchId = ag.branch_id
    }
  }

  const effectiveStatus = (userRole === 'agent' || userRole === 'pilgrim') ? 'published' : status

  const { data: packages } = await getPackages({
    search: q,
    type,
    status: effectiveStatus,
    branchId: filterBranchId,
  })

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PackagesTable
        initialPackages={packages}
        currentSearch={q}
        currentType={type}
        currentStatus={status}
        userRole={userRole}
      />
    </div>
  )
}
