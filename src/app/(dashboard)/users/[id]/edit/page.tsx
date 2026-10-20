import { notFound } from 'next/navigation'
import { requireAuthRole } from '@/lib/auth-guard'
import { PageHeader } from '@/components/layout/PageHeader'
import { getUserById, getUserFormOptions } from '@/modules/system'
import { UserForm } from '@/modules/system'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Pengguna | Sistem Manajemen Umroh & Haji',
  description: 'Ubah Data Akun Pengguna',
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireAuthRole(['super_admin', 'admin'])
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
