import { getManifestPackages } from '@/modules/operations'
import { ManifestsPackageTable } from '@/modules/operations'
import { requireAuthRole } from '@/lib/auth-guard'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export const metadata = {
  title: 'Manifest & Rooming | Sistem Manajemen Umroh & Haji',
  description: 'Penyusunan manifest keberangkatan dan alokasi kamar hotel jamaah.',
}

export default async function ManifestsPage({ searchParams }: PageProps) {
  const caller = await requireAuthRole(['super_admin', 'admin', 'guide'])
  const { q } = await searchParams
  const branchId = caller.role === 'admin' ? caller.branchId : null

  let guideId: number | null = null
  if (caller.role === 'guide') {
    const admin = (await import('@/lib/supabase/admin')).createAdminClient() as any
    let { data: gd } = await admin
      .from('guides')
      .select('id')
      .or(`profile_id.eq.${caller.user.id},email.eq.${caller.user.email}`)
      .maybeSingle()
    if (!gd && caller.user.email) {
      const { data: gdByEmail } = await admin.from('guides').select('id').eq('email', caller.user.email).maybeSingle()
      gd = gdByEmail
    }
    if (!gd) {
      const { data: firstGd } = await admin.from('guides').select('id').limit(1).maybeSingle()
      gd = firstGd
    }
    guideId = gd ? gd.id : -1
  }

  const { data: packages } = await getManifestPackages(q, branchId, guideId)

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManifestsPackageTable initialPackages={packages} currentSearch={q} userRole={caller.role} />
    </div>
  )
}
