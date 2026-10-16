import { getEquipmentDistributions } from '@/modules/operations'
import { EquipmentTable } from '@/modules/operations'
import { createClient } from '@/lib/supabase/server'
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

  const { data: equipment } = await getEquipmentDistributions({
    search: q,
    status,
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
