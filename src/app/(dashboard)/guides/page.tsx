import { getGuides, getAvailableBranches } from '@/modules/system'
import { GuidesTable } from '@/modules/system'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'

interface PageProps {
  searchParams: Promise<{ q?: string; branch?: string }>
}

export const metadata = {
  title: 'Muthawif & Pembimbing | Sistem Manajemen Umroh & Haji',
  description: 'Pengelolaan data pembimbing ibadah umroh, haji, dan ustadz pemateri manasik.',
}

export default async function GuidesPage({ searchParams }: PageProps) {
  const { q, branch } = await searchParams
  const branchId = branch ? Number(branch) : undefined

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

  const [{ data: guides }, branches] = await Promise.all([
    getGuides(q, branchId),
    getAvailableBranches(),
  ])

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <GuidesTable
        initialGuides={guides}
        branches={branches}
        currentSearch={q}
        userRole={userRole}
      />
    </div>
  )
}
