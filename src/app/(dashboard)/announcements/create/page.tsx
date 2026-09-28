import { PageHeader } from '@/components/layout/PageHeader'
import { getAnnouncementFormOptions } from '@/features/announcements/actions'
import { AnnouncementForm } from '@/features/announcements/components/AnnouncementForm'

export const metadata = {
  title: 'Tambah Pengumuman | Sistem Manajemen Umroh & Haji',
  description: 'Buat Pengumuman Baru untuk Pengguna',
}

export default async function CreateAnnouncementPage() {
  const { branches, packages } = await getAnnouncementFormOptions()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Pengumuman Baru"
        description="Terbitkan informasi atau instruksi penting kepada audiens terarah"
      />

      <AnnouncementForm branches={branches} packages={packages} />
    </div>
  )
}
