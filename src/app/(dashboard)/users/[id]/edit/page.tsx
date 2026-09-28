import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { getUserById, getUserFormOptions } from '@/features/users/actions'
import { UserForm } from '@/features/users/components/UserForm'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Pengguna | Sistem Manajemen Umroh & Haji',
  description: 'Ubah Data Akun Pengguna',
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params

  const [user, { branches }] = await Promise.all([
    getUserById(id),
    getUserFormOptions(),
  ])

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Pengguna: ${user.name}`}
        description={`Memperbarui profil, peran, atau status aktif pengguna ${user.email}`}
      />

      <UserForm initialData={user} branches={branches} />
    </div>
  )
}
