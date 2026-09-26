import { getRegistrations, getBookingFormOptions } from '@/features/registrations/actions'
import { RegistrationFilter } from '@/features/registrations/components/RegistrationFilter'
import { RegistrationTable } from '@/features/registrations/components/RegistrationTable'

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

  const [{ data: registrations }, { packages }] = await Promise.all([
    getRegistrations({
      status,
      package_id: packageId,
      search,
    }),
    getBookingFormOptions(),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pendaftaran</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Booking jamaah ke paket Umroh &amp; Haji, pantau status pendaftaran, dan sisa kuota kursi.
        </p>
      </div>

      {/* Filter & Actions Bar */}
      <RegistrationFilter packages={packages.map((p: any) => ({ id: p.id, name: p.name }))} />

      {/* Registration Data Table */}
      <RegistrationTable initialData={registrations} />
    </div>
  )
}
