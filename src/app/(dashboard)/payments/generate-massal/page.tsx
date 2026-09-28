import { createAdminClient } from '@/lib/supabase/admin'
import { MassInstallmentForm } from '@/features/payments/components/MassInstallmentForm'

export const metadata = {
  title: 'Generate Tagihan Massal | Travel Umroh & Haji',
  description: 'Terbitkan skema tagihan cicilan berkala secara otomatis untuk seluruh jamaah terdaftar dalam satu paket.',
}

export default async function GenerateMassalPage() {
  const supabase = createAdminClient() as any

  const { data: packagesData, error } = await supabase
    .from('packages')
    .select(`
      id,
      name,
      price,
      departure_date,
      registrations (
        id,
        status
      )
    `)
    .eq('is_active', true)
    .order('departure_date', { ascending: true })

  const packageOptions = (packagesData || []).map((pkg: any) => {
    const activeRegs = (pkg.registrations || []).filter((r: any) => r.status !== 'cancelled')
    return {
      id: pkg.id,
      name: pkg.name,
      price: Number(pkg.price) || 0,
      departure_date: pkg.departure_date,
      active_registrations_count: activeRegs.length,
    }
  })

  return <MassInstallmentForm packages={packageOptions} />
}
