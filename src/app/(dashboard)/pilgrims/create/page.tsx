import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPilgrimFormData } from '@/modules/pilgrims'
import { PilgrimForm } from '@/modules/pilgrims'

export const metadata = {
  title: 'Tambah Jamaah Baru | Sistem Manajemen Umroh & Haji',
  description: 'Formulir pendaftaran dan master data profil jamaah baru.',
}

export default async function CreatePilgrimPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.role === 'guide') {
      redirect('/pilgrims')
    }
  }

  const options = await getPilgrimFormData()

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PilgrimForm options={options} isEdit={false} />
    </div>
  )
}
