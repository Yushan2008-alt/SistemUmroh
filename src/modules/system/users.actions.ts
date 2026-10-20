'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity-logger'
import { getActionCaller } from '@/lib/auth-guard'
import type { UserProfileWithBranch, UserFormData, UserFilterParams } from './types'

export async function getUsers(filters?: UserFilterParams): Promise<UserProfileWithBranch[]> {
  const supabase = createAdminClient()

  let query = (supabase.from('profiles') as any)
    .select(`
      id,
      branch_id,
      name,
      email,
      phone,
      role,
      avatar_url,
      is_active,
      created_at,
      updated_at,
      branch:branches(id, name)
    `)
    .order('name', { ascending: true })

  if (filters?.role && filters.role !== 'all') {
    query = query.eq('role', filters.role)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getUsers] Error:', error)
    return []
  }

  return (data || []) as UserProfileWithBranch[]
}

export async function getUserById(id: string): Promise<UserProfileWithBranch | null> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('profiles') as any)
    .select(`
      id,
      branch_id,
      name,
      email,
      phone,
      role,
      avatar_url,
      is_active,
      created_at,
      updated_at,
      branch:branches(id, name)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('[getUserById] Error:', error)
    return null
  }

  return data as UserProfileWithBranch
}

export async function getUserFormOptions(): Promise<{
  branches: { id: number; name: string }[]
}> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('branches') as any)
    .select('id, name')
    .order('name', { ascending: true })

  return {
    branches: data || [],
  }
}

export async function createUser(
  data: UserFormData
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const caller = await getActionCaller()
    if (!caller || !['super_admin', 'admin'].includes(caller.role)) {
      return { success: false, message: 'Akses ditolak: Hanya staf resmi yang berwenang menambah pengguna.' }
    }

    if (caller.role === 'admin') {
      if (data.role === 'super_admin') {
        return { success: false, message: 'Admin cabang tidak berwenang membuat akun Super Admin.' }
      }
      if (caller.branchId && data.branch_id && Number(data.branch_id) !== Number(caller.branchId)) {
        return { success: false, message: 'Admin cabang hanya dapat mendaftarkan pengguna di cabangnya sendiri.' }
      }
    }

    const supabase = createAdminClient()

    if (!data.password || data.password.length < 6) {
      return { success: false, message: 'Kata sandi minimal 6 karakter.' }
    }

    const assignedBranchId = caller.role === 'admin' && caller.branchId ? caller.branchId : (data.branch_id || null)

    // 1. Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        name: data.name,
        role: data.role,
        branch_id: assignedBranchId,
      },
    })

    if (authError || !authData.user) {
      console.error('[createUser] Auth error:', authError)
      return { success: false, message: 'Gagal membuat user auth: ' + (authError?.message || 'Unknown error') }
    }

    const userId = authData.user.id

    // 2. Upsert profile in public.profiles
    const { error: profileError } = await (supabase.from('profiles') as any).upsert({
      id: userId,
      name: data.name,
      email: data.email,
      role: data.role,
      branch_id: assignedBranchId,
      phone: data.phone || null,
      is_active: data.is_active,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('[createUser] Profile error:', profileError)
      return { success: false, message: 'User dibuat tapi profil gagal disimpan: ' + profileError.message }
    }

    await logActivity({
      action: 'created',
      subject_type: 'user',
      subject_id: userId,
      description: `Menambah pengguna baru: ${data.name} (${data.role})`,
      properties: { email: data.email, role: data.role, branch_id: assignedBranchId },
    })

    revalidatePath('/users')
    return { success: true, message: 'Pengguna berhasil ditambahkan.', id: userId }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}

export async function updateUser(
  id: string,
  data: UserFormData
): Promise<{ success: boolean; message: string }> {
  try {
    const caller = await getActionCaller()
    if (!caller || !['super_admin', 'admin'].includes(caller.role)) {
      return { success: false, message: 'Akses ditolak: Hanya staf resmi yang berwenang mengubah pengguna.' }
    }

    const supabase = createAdminClient()

    if (caller.role === 'admin') {
      if (data.role === 'super_admin') {
        return { success: false, message: 'Admin cabang tidak berwenang menetapkan role Super Admin.' }
      }
      const { data: targetProfile } = await (supabase.from('profiles') as any)
        .select('role, branch_id')
        .eq('id', id)
        .single()

      if (targetProfile?.role === 'super_admin') {
        return { success: false, message: 'Admin cabang tidak berwenang mengubah akun Super Admin.' }
      }
      if (caller.branchId && targetProfile?.branch_id && Number(targetProfile.branch_id) !== Number(caller.branchId)) {
        return { success: false, message: 'Admin cabang hanya dapat mengubah pengguna di cabangnya sendiri.' }
      }
    }

    const assignedBranchId = caller.role === 'admin' && caller.branchId ? caller.branchId : (data.branch_id || null)

    // 1. Update Auth user if password or email is changed
    const authUpdates: Record<string, any> = {
      email: data.email,
      user_metadata: {
        name: data.name,
        role: data.role,
        branch_id: assignedBranchId,
      },
    }

    if (data.password && data.password.trim().length >= 6) {
      authUpdates.password = data.password.trim()
    }

    await supabase.auth.admin.updateUserById(id, authUpdates)

    // 2. Update profile
    const { error: profileError } = await (supabase.from('profiles') as any)
      .update({
        name: data.name,
        email: data.email,
        role: data.role,
        branch_id: assignedBranchId,
        phone: data.phone || null,
        is_active: data.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (profileError) {
      console.error('[updateUser] Profile error:', profileError)
      return { success: false, message: 'Gagal memperbarui profil: ' + profileError.message }
    }

    await logActivity({
      action: 'updated',
      subject_type: 'user',
      subject_id: id,
      description: `Memperbarui profil pengguna: ${data.name}`,
      properties: { email: data.email, role: data.role, branch_id: assignedBranchId },
    })

    revalidatePath('/users')
    return { success: true, message: 'Pengguna berhasil diperbarui.' }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const caller = await getActionCaller()
    if (!caller || !['super_admin', 'admin'].includes(caller.role)) {
      return { success: false, message: 'Akses ditolak: Hanya staf resmi yang berwenang menghapus pengguna.' }
    }

    const supabase = createAdminClient()

    if (caller.role === 'admin') {
      const { data: targetProfile } = await (supabase.from('profiles') as any)
        .select('role, branch_id')
        .eq('id', id)
        .single()

      if (targetProfile?.role === 'super_admin') {
        return { success: false, message: 'Admin cabang tidak berwenang menghapus akun Super Admin.' }
      }
      if (caller.branchId && targetProfile?.branch_id && Number(targetProfile.branch_id) !== Number(caller.branchId)) {
        return { success: false, message: 'Admin cabang hanya dapat menghapus pengguna di cabangnya sendiri.' }
      }
    }

    // 1. Delete from profiles
    await (supabase.from('profiles') as any).delete().eq('id', id)

    // 2. Delete from auth
    await supabase.auth.admin.deleteUser(id)

    await logActivity({
      action: 'deleted',
      subject_type: 'user',
      subject_id: id,
      description: `Menghapus akun pengguna ID: ${id}`,
    })

    revalidatePath('/users')
    return { success: true, message: 'Pengguna berhasil dihapus.' }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}

export async function resetUserPassword(
  userId: string,
  userName: string
): Promise<{ success: boolean; temporaryPassword?: string; message: string }> {
  try {
    const caller = await getActionCaller()
    if (!caller || !['super_admin', 'admin'].includes(caller.role)) {
      return { success: false, message: 'Akses ditolak: Hanya staf resmi yang berwenang mereset kata sandi.' }
    }

    const supabase = createAdminClient()

    if (caller.role === 'admin') {
      const { data: targetProfile } = await (supabase.from('profiles') as any)
        .select('role, branch_id')
        .eq('id', userId)
        .single()

      if (targetProfile?.role === 'super_admin') {
        return { success: false, message: 'Admin cabang tidak berwenang mereset sandi akun Super Admin.' }
      }
      if (caller.branchId && targetProfile?.branch_id && Number(targetProfile.branch_id) !== Number(caller.branchId)) {
        return { success: false, message: 'Admin cabang hanya dapat mereset sandi pengguna di cabangnya sendiri.' }
      }
    }

    // Generate random secure 10-char alphanumeric string
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
    let temporaryPassword = ''
    for (let i = 0; i < 10; i++) {
      temporaryPassword += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: temporaryPassword,
    })

    if (error) {
      console.error('[resetUserPassword] Error:', error)
      return { success: false, message: 'Gagal mereset kata sandi: ' + error.message }
    }

    await logActivity({
      action: 'reset_password',
      subject_type: 'user',
      subject_id: userId,
      description: `Mereset kata sandi akun pengguna ${userName}`,
    })

    return {
      success: true,
      temporaryPassword,
      message: 'Kata sandi berhasil direset ke sandi sementara.',
    }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}
