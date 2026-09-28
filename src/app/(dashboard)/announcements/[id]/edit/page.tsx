import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { getAnnouncementById, getAnnouncementFormOptions } from '@/features/announcements/actions'
import { AnnouncementForm } from '@/features/announcements/components/AnnouncementForm'

interface EditAnnouncementPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Edit Pengumuman | Sistem Manajemen Umroh & Haji',
  description: 'Ubah Data Pengumuman Pengguna',
}

export default async function EditAnnouncementPage({ params }: EditAnnouncementPageProps) {
  const { id } = await params
  const announcementId = Number(id)

  if (isNaN(announcementId)) {
    notFound()
  }

  const [announcement, { branches, packages }] = await Promise.all([
    getAnnouncementById(announcementId),
    getAnnouncementFormOptions(),
  ])

  if (!announcement) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Pengumuman #${announcement.id}`}
        description={`Memperbarui konten atau target audiens: "${announcement.title}"`}
      />

      <AnnouncementForm
        initialData={announcement}
        branches={branches}
        packages={packages}
      />
    </div>
  )
}
