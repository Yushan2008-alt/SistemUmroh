import { notFound, redirect } from 'next/navigation'
import { getPackageById, getPackageFormData } from '@/modules/operations'
import { PackageForm } from '@/modules/operations'
import { createClient } from '@/lib/supabase/server'

interface EditPackagePageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Paket | Sistem Manajemen Umroh & Haji',
  description: 'Perbarui konfigurasi jadwal dan harga paket perjalanan.',
}

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.role === 'agent' || profile?.role === 'pilgrim') {
      redirect('/packages')
    }
  }

  const { id } = await params
  const pkgId = parseInt(id, 10)

  if (isNaN(pkgId)) {
    notFound()
  }

  const [pkgRes, options] = await Promise.all([
    getPackageById(pkgId),
    getPackageFormData(),
  ])

  if (!pkgRes.data || pkgRes.error) {
    notFound()
  }

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PackageForm pkg={pkgRes.data} options={options} isEdit={true} />
    </div>
  )
}
