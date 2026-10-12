import { PageHeader } from '@/components/layout/PageHeader'
import { getActivityLogs, getActivityLogFilters } from '@/modules/system'
import { ActivityLogTable } from '@/modules/system'

export const metadata = {
  title: 'Log Aktivitas | Sistem Manajemen Umroh & Haji',
  description: 'Audit Trail Riwayat Aktivitas Pengguna Sistem',
}

export default async function ActivityLogsPage() {
  const [logs, { actions, users }] = await Promise.all([
    getActivityLogs(),
    getActivityLogFilters(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log Aktivitas"
        description="Audit trail riwayat aktivitas dan operasi pengguna dalam sistem"
      />

      <ActivityLogTable initialLogs={logs} actions={actions} users={users} />
    </div>
  )
}
