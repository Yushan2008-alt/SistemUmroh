'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity-logger'
import type { UserProfileWithBranch, UserFormData, UserFilterParams } from '../types'

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
    const supabase = createAdminClient()

    if (!data.password || data.password.length < 6) {
      return { success: false, message: 'Kata sandi minimal 6 karakter.' }
    }

    // 1. Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        name: data.name,
        role: data.role,
        branch_id: data.branch_id || null,
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
      branch_id: data.branch_id || null,
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
      properties: { email: data.email, role: data.role, branch_id: data.branch_id },
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
    const supabase = createAdminClient()

    // 1. Update Auth user if password or email is changed
    const authUpdates: Record<string, any> = {
      email: data.email,
      user_metadata: {
        name: data.name,
        role: data.role,
        branch_id: data.branch_id || null,
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
        branch_id: data.branch_id || null,
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
      properties: { email: data.email, role: data.role, branch_id: data.branch_id },
    })

    revalidatePath('/users')
    return { success: true, message: 'Pengguna berhasil diperbarui.' }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()

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
    const supabase = createAdminClient()

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
