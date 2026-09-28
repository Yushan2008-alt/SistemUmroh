import { PageHeader } from '@/components/layout/PageHeader'
import { getSettings } from '@/features/settings/actions'
import { SettingsForm } from '@/features/settings/components/SettingsForm'

export const metadata = {
  title: 'Pengaturan Sistem | Sistem Manajemen Umroh & Haji',
  description: 'Konfigurasi Identitas Travel & Pengaturan White-label',
}

export default async function SettingsPage() {
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
