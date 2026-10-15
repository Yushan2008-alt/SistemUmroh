import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getPilgrims } from '@/modules/pilgrims'
import { PilgrimsTable } from '@/modules/pilgrims'
import type { Role } from '@/types/database.types'

interface PageProps {
  searchParams: Promise<{
    q?: string
    status?: string
  }>
}

export const metadata = {
  title: 'Data Jamaah | Sistem Manajemen Umroh & Haji',
  description: 'Master data jamaah umroh dan haji, paspor, dan kontak darurat.',
}

export default async function PilgrimsPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams
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

  let activeBranchId: number | null = null
  let activeBranchName: string | null = null

  if (userRole === 'admin') {
    const cookieStore = await cookies()
    const cookieBranch = cookieStore.get('branch_focus_id')?.value
    activeBranchId = cookieBranch && cookieBranch !== 'all' ? Number(cookieBranch) : (profileBranchId || 1)

    // Fetch branch name
    const { data: b } = await (supabase as any)
      .from('branches')
      .select('name')
      .eq('id', activeBranchId)
      .maybeSingle()
    if (b?.name) {
      activeBranchName = b.name
    }
  }

  const { data: pilgrims } = await getPilgrims({
    search: q,
    status,
    branchId: activeBranchId,
  })

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PilgrimsTable
        initialPilgrims={pilgrims}
        currentSearch={q}
        currentStatus={status}
        userRole={userRole}
        activeBranchId={activeBranchId}
        activeBranchName={activeBranchName}
      />
    </div>
  )
}
