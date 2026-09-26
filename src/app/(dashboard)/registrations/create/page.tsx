import Link from 'next/link'
import { getBookingFormOptions } from '@/features/registrations/actions'
import { RegistrationForm } from '@/features/registrations/components/RegistrationForm'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CreateRegistrationPage() {
  const options = await getBookingFormOptions()

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
          <span className="text-foreground font-medium">Booking Baru</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/registrations"
            className="p-1.5 border border-border hover:bg-muted text-muted-foreground rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Booking Jamaah Baru</h1>
            <p className="text-sm text-muted-foreground">
              Daftarkan jamaah ke paket umroh atau haji dengan validasi kuota otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Main Registration Form */}
      <RegistrationForm options={options} />
    </div>
  )
}
