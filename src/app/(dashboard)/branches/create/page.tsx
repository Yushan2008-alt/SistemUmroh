import { BranchForm } from '@/features/branches/components/BranchForm'

export const metadata = {
  title: 'Tambah Cabang | Sistem Manajemen Umroh & Haji',
  description: 'Daftarkan kantor cabang operasional baru.',
}

export default function CreateBranchPage() {
  return (
    <div className="container mx-auto py-2 sm:py-4">
      <BranchForm isEdit={false} />
    </div>
  )
}
