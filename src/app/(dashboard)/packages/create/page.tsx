import { getPackageFormData } from '@/features/packages/actions'
import { PackageForm } from '@/features/packages/components/PackageForm'

export const metadata = {
  title: 'Buat Paket Baru | Sistem Manajemen Umroh & Haji',
  description: 'Formulir pembuatan paket perjalanan Umroh & Haji baru.',
}

export default async function CreatePackagePage() {
  const options = await getPackageFormData()

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PackageForm options={options} isEdit={false} />
    </div>
  )
}
