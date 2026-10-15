import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getPackageFormData } from '@/modules/operations'
import { PackageForm } from '@/modules/operations'
import type { Role } from '@/types/database.types'

export const metadata = {
  title: 'Buat Paket Baru | Sistem Manajemen Umroh & Haji',
  description: 'Formulir pembuatan paket perjalanan Umroh & Haji baru.',
}

export default async function CreatePackagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userRole: Role = 'super_admin'
  let userBranchId: number | null = null

  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role) {
      userRole = profile.role as Role
    }
    if (profile?.branch_id) {
      userBranchId = profile.branch_id
    }
  }

  const cookieStore = await cookies()
  const cookieBranch = cookieStore.get('branch_focus_id')?.value
  const activeBranchId = cookieBranch && cookieBranch !== 'all' ? Number(cookieBranch) : (userBranchId || 1)

  const options = await getPackageFormData()

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <PackageForm
        options={options}
        isEdit={false}
        userRole={userRole}
        activeBranchId={activeBranchId}
      />
    </div>
  )
}
