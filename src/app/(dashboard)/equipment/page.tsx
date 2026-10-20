import { getEquipmentDistributions } from '@/modules/operations'
import { EquipmentTable } from '@/modules/operations'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { Role } from '@/types/database.types'

interface PageProps {
  searchParams: Promise<{
    q?: string
    status?: string
  }>
}

export const metadata = {
  title: 'Perlengkapan Jamaah | Sistem Manajemen Umroh & Haji',
  description: 'Distribusi logistik koper, seragam batik, tas paspor, dan kain ihram.',
}

export default async function EquipmentPage({ searchParams }: PageProps) {
  const { q, status } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient() as any
  const { data: profile } = await admin
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user.id)
    .maybeSingle()

  const userRole: Role = (profile?.role as Role) || 'pilgrim'

  // Agent & guide have no access to equipment module per README.md matrix
  if (userRole === 'agent' || userRole === 'guide') {
    redirect('/dashboard')
  }

  let pilgrimId: number | undefined = undefined
  let branchId: number | undefined = undefined

  if (userRole === 'pilgrim') {
    const { data: pilgrim } = await admin
      .from('pilgrims')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (pilgrim?.id) {
      pilgrimId = pilgrim.id
    } else {
      return (
        <div className="container mx-auto py-2 sm:py-4">
          <EquipmentTable
            initialEquipment={[]}
            currentSearch={q}
            currentStatus={status}
            userRole={userRole}
          />
        </div>
      )
    }
  } else if (userRole === 'admin') {
    branchId = profile?.branch_id || undefined
  }

  const { data: equipment } = await getEquipmentDistributions({
    search: q,
    status,
    pilgrimId,
    branchId,
  })

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <EquipmentTable
        initialEquipment={equipment}
        currentSearch={q}
        currentStatus={status}
        userRole={userRole}
      />
    </div>
  )
}
