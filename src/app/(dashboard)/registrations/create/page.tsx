import Link from 'next/link'
import { getBookingFormOptions } from '@/modules/pilgrims'
import { RegistrationForm } from '@/modules/pilgrims'
import { ArrowLeft } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CreateRegistrationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let agentId: number | null = null

  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role === 'pilgrim') {
      redirect('/packages')
    }

    if (profile?.role === 'agent') {
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
  }

  const options = await getBookingFormOptions(agentId)

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
