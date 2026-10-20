import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Role } from '@/types/database.types'

/**
 * Route protection for Server Components.
 * Redirects to /login if unauthenticated, or /dashboard if role not permitted.
 */
export async function requireAuthRole(allowedRoles: Role[]): Promise<{
  user: any
  role: Role
  branchId: number | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient() as any
  const { data: profile } = await admin
    .from('profiles')
    .select('role, branch_id')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profile?.role as Role) || 'pilgrim'
  if (!allowedRoles.includes(role)) {
    redirect('/dashboard')
  }

  return {
    user,
    role,
    branchId: (profile?.branch_id as number | null) || null,
  }
}

/**
 * Caller authentication & role resolver for Server Actions.
 * Returns null if not authenticated.
 */
export async function getActionCaller(): Promise<{
  user: any
  role: Role
  branchId: number | null
} | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const admin = createAdminClient() as any
    const { data: profile } = await admin
      .from('profiles')
      .select('role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    return {
      user,
      role: (profile?.role as Role) || 'pilgrim',
      branchId: (profile?.branch_id as number | null) || null,
    }
  } catch (err) {
    console.error('getActionCaller error:', err)
    return null
  }
}
