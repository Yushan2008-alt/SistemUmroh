import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPilgrimById } from '@/modules/pilgrims'
import { PilgrimDetailView } from '@/modules/pilgrims'
import type { Role } from '@/types/database.types'

interface PilgrimDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Detail Profil Jamaah | Sistem Manajemen Umroh & Haji',
  description: 'Informasi biodata, dokumen paspor, dan riwayat paket jamaah.',
}

export default async function PilgrimDetailPage({ params }: PilgrimDetailPageProps) {
  const { id } = await params
  const pilgrimId = parseInt(id, 10)

  if (isNaN(pilgrimId)) {
    notFound()
  }

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

  const { data: pilgrim, error } = await getPilgrimById(pilgrimId)

  if (!pilgrim || error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PilgrimDetailView pilgrim={pilgrim} userRole={userRole} />
    </div>
  )
}
