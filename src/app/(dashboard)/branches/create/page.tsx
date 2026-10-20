import { requireAuthRole } from '@/lib/auth-guard'
import { BranchForm } from '@/modules/system'

export const metadata = {
  title: 'Tambah Cabang | Sistem Manajemen Umroh & Haji',
  description: 'Daftarkan kantor cabang operasional baru.',
}

export default async function CreateBranchPage() {
  await requireAuthRole(['super_admin'])
  return (
    <div className="container mx-auto py-2 sm:py-4">
      <BranchForm isEdit={false} />
    </div>
  )
}
