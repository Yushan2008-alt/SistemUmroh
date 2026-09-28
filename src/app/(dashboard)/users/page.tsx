import { PageHeader } from '@/components/layout/PageHeader'
import { getUsers } from '@/features/users/actions'
import { UserList } from '@/features/users/components/UserList'

export const metadata = {
  title: 'Kelola Pengguna | Sistem Manajemen Umroh & Haji',
  description: 'Kelola Akun Login & Hak Akses Pengguna Sistem',
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengguna"
        description="Kelola akun login staf, agen mitra, muthawif, dan jamaah"
      />

      <UserList initialUsers={users} />
    </div>
  )
}
