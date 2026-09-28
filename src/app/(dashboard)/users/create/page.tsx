import { PageHeader } from '@/components/layout/PageHeader'
import { getUserFormOptions } from '@/features/users/actions'
import { UserForm } from '@/features/users/components/UserForm'

export const metadata = {
  title: 'Tambah Pengguna | Sistem Manajemen Umroh & Haji',
  description: 'Tambah Akun Pengguna Baru',
}

export default async function CreateUserPage() {
  const { branches } = await getUserFormOptions()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Pengguna Baru"
        description="Buat akun login baru dan tentukan hak akses peran serta penempatan cabang"
      />

      <UserForm branches={branches} />
    </div>
  )
}
