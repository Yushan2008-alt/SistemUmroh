import { requireAuthRole } from '@/lib/auth-guard'
import { PageHeader } from '@/components/layout/PageHeader'
import { getSettings } from '@/modules/system'
import { SettingsForm } from '@/modules/system'

export const metadata = {
  title: 'Pengaturan Sistem | Sistem Manajemen Umroh & Haji',
  description: 'Konfigurasi Identitas Travel & Pengaturan White-label',
}

export default async function SettingsPage() {
  await requireAuthRole(['super_admin'])
  const settings = await getSettings()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan White-label"
        description="Identitas travel dan skema warna yang tampil di seluruh aplikasi"
      />

      <SettingsForm initialSettings={settings} />
    </div>
  )
}
