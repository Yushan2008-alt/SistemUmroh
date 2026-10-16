import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'
import { getRegistrations, getBookingFormOptions, getCurrentPilgrim } from '@/modules/pilgrims'
import { RegistrationFilter } from '@/modules/pilgrims'
import { RegistrationTable } from '@/modules/pilgrims'

export const dynamic = 'force-dynamic'

interface RegistrationsPageProps {
  searchParams: Promise<{
    status?: string
    package_id?: string
    search?: string
  }>
}

export default async function RegistrationsPage({ searchParams }: RegistrationsPageProps) {
  const resolvedParams = await searchParams
  const status = resolvedParams.status || 'all'
  const packageId = resolvedParams.package_id ? Number(resolvedParams.package_id) : undefined
  const search = resolvedParams.search || ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userRole: Role = 'super_admin'
  let currentPilgrimId: number | undefined = undefined

  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role) {
      userRole = profile.role as Role
    }

    if (userRole === 'pilgrim') {
      const pilgrim = await getCurrentPilgrim()
      if (pilgrim) {
        currentPilgrimId = pilgrim.id
      }
    }
  }

  let agentId: number | null = null

  if (userRole === 'agent' && user) {
    const admin = (await import('@/lib/supabase/admin')).createAdminClient() as any
    const { data: ag } = await admin
      .from('agents')
      .select('id')
      .or(`profile_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle()
    if (ag) {
      agentId = ag.id
    } else {
      agentId = -1
    }
  }

  const [{ data: registrations }, { packages }] = await Promise.all([
    getRegistrations({
      status,
      package_id: packageId,
      search,
      pilgrim_id: currentPilgrimId,
      agent_id: agentId,
    }),
    getBookingFormOptions(agentId),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {userRole === 'pilgrim' ? 'Pendaftaran Saya' : userRole === 'agent' ? 'Pendaftaran Jamaah Referral' : 'Pendaftaran'}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {userRole === 'pilgrim'
            ? 'Pantau status booking paket ibadah, jadwal keberangkatan, dan rincian pendaftaran Anda.'
            : userRole === 'agent'
            ? 'Daftarkan calon jamaah referral Anda ke paket Umroh & Haji serta pantau kuota ketersediaan kursi.'
            : 'Booking jamaah ke paket Umroh & Haji, pantau status pendaftaran, dan sisa kuota kursi.'}
        </p>
      </div>

      {/* Filter & Actions Bar */}
      <RegistrationFilter packages={packages.map((p: any) => ({ id: p.id, name: p.name }))} userRole={userRole} />

      {/* Registration Data Table */}
      <RegistrationTable initialData={registrations} userRole={userRole} />
    </div>
  )
}
