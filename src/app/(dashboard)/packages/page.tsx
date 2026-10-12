import { getPackages } from '@/modules/operations'
import { PackagesTable } from '@/modules/operations'

interface PageProps {
  searchParams: Promise<{
    q?: string
    type?: string
    status?: string
  }>
}

export const metadata = {
  title: 'Paket Umroh & Haji | Sistem Manajemen Umroh & Haji',
  description: 'Daftar dan konfigurasi paket perjalanan Umroh & Haji.',
}

export default async function PackagesPage({ searchParams }: PageProps) {
  const { q, type, status } = await searchParams
  const { data: packages } = await getPackages({
    search: q,
    type,
    status,
  })

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PackagesTable
        initialPackages={packages}
        currentSearch={q}
        currentType={type}
        currentStatus={status}
      />
    </div>
  )
}
