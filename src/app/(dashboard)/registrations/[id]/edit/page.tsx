import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRegistrationDetail, getBookingFormOptions } from '@/features/registrations/actions'
import { EditRegistrationForm } from '@/features/registrations/components/EditRegistrationForm'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface EditRegistrationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditRegistrationPage({ params }: EditRegistrationPageProps) {
  const resolvedParams = await params
  const id = Number(resolvedParams.id)

  if (isNaN(id) || id <= 0) {
    notFound()
  }

  const [{ data: registration }, { guides }] = await Promise.all([
    getRegistrationDetail(id),
    getBookingFormOptions(),
  ])

  if (!registration) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-foreground">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/registrations" className="hover:text-foreground">
            Pendaftaran
          </Link>
          <span>/</span>
          <Link href={`/registrations/${registration.id}`} className="hover:text-foreground">
            {registration.code}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Edit</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href={`/registrations/${registration.id}`}
            className="p-1.5 border border-border hover:bg-muted text-muted-foreground rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Pendaftaran</h1>
            <p className="text-sm text-muted-foreground">
              Perbarui pembimbing, status, atau catatan khusus pendaftaran {registration.code}.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <EditRegistrationForm registration={registration} guides={guides} />
    </div>
  )
}
