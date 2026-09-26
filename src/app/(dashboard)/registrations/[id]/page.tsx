import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRegistrationDetail } from '@/features/registrations/actions'
import { RegistrationDetailView } from '@/features/registrations/components/RegistrationDetailView'

export const dynamic = 'force-dynamic'

interface RegistrationDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function RegistrationDetailPage({ params }: RegistrationDetailPageProps) {
  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  if (isNaN(id) || id <= 0) {
    notFound()
  }

  const { data: registration, error } = await getRegistrationDetail(id)

  if (error || !registration) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/registrations" className="hover:text-foreground">
          Pendaftaran
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{registration.code}</span>
      </nav>

      {/* Main Detail View */}
      <RegistrationDetailView registration={registration} />
    </div>
  )
}
