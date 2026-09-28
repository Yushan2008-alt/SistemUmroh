import { getManasikFormData } from '@/features/manasik/actions'
import { ManasikForm } from '@/features/manasik/components/ManasikForm'

export const metadata = {
  title: 'Tambah Jadwal Manasik | Sistem Manajemen Umroh & Haji',
  description: 'Jadwalkan sesi bimbingan ibadah Umroh dan Haji baru.',
}

export default async function CreateManasikPage() {
  const options = await getManasikFormData()

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <ManasikForm options={options} isEdit={false} />
    </div>
  )
}
