import { notFound } from 'next/navigation'
import { getPackageById } from '@/modules/operations'
import { PackageDetailView } from '@/modules/operations'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'

interface PackageDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Detail Paket | Sistem Manajemen Umroh & Haji',
  description: 'Informasi lengkap dan daftar jamaah pada paket perjalanan.',
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
  const { id } = await params
  const pkgId = parseInt(id, 10)

  if (isNaN(pkgId)) {
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

  const { data: pkg, error } = await getPackageById(pkgId)

  if (!pkg || error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PackageDetailView pkg={pkg} userRole={userRole} />
    </div>
  )
}
