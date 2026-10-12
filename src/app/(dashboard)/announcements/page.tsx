import { PageHeader } from '@/components/layout/PageHeader'
import { getAnnouncements } from '@/modules/system'
import { AnnouncementList } from '@/modules/system'

export const metadata = {
  title: 'Pengumuman | Sistem Manajemen Umroh & Haji',
  description: 'Kelola Pengumuman Internal untuk Staf, Agen, dan Jamaah',
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengumuman"
        description="Kelola pengumuman & edaran resmi untuk staf, agen mitra, dan jamaah"
      />

      <AnnouncementList initialAnnouncements={announcements} />
    </div>
  )
}
