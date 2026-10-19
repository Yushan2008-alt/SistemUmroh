import { redirect } from 'next/navigation'
import { getManasikFormData } from '@/modules/pilgrims'
import { ManasikForm } from '@/modules/pilgrims'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Tambah Jadwal Manasik | Sistem Manajemen Umroh & Haji',
  description: 'Jadwalkan sesi bimbingan ibadah Umroh dan Haji baru.',
}

export default async function CreateManasikPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'super_admin' && profile?.role !== 'admin') {
      redirect('/manasik')
    }
  }

  const options = await getManasikFormData()

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManasikForm options={options} isEdit={false} />
    </div>
  )
}
