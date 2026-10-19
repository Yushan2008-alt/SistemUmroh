'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Guide, GuideFormData } from './types'

export async function getGuides(
  search?: string,
  branchId?: number
): Promise<{ data: Guide[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    let userRole: string = 'super_admin'
    let userBranchId: number | null = null

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, branch_id')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        userRole = profile.role
        userBranchId = profile.branch_id
      }
    }

    let query = supabase
      .from('guides')
      .select('*, branch:branches(id, name, code), profile:profiles(id, email, role, is_active)')
      .order('name', { ascending: true })

    // Role-based scoping
    if (userRole === 'guide' && user) {
      // Guide can only view their own profile
      query = query.eq('profile_id', user.id)
    } else if (userRole === 'admin') {
      // Branch-scoped for admin
      if (userBranchId) {
        query = query.eq('branch_id', userBranchId)
      }
    } else if (branchId) {
      // Explicit branch filter for super_admin
      query = query.eq('branch_id', branchId)
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`
      query = query.or(`name.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching guides:', error)
      return { data: [], error: error.message }
    }

    return { data: (data as Guide[]) || [] }
  } catch (err: any) {
    console.error('Unexpected error fetching guides:', err)
    return { data: [], error: err.message || 'Gagal mengambil data muthawif' }
  }
}

export async function getAvailableBranches(): Promise<{ id: number; name: string; code: string }[]> {
  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('branches')
      .select('id, name, code')
      .eq('is_active', true)
      .order('is_head_office', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching branches for guide:', error)
      return []
    }

    return data || []
  } catch (err) {
    return []
  }
}

export async function createGuide(
  data: GuideFormData
): Promise<{ success: boolean; data?: Guide; error?: string; temporaryPassword?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi login tidak valid' }
    }

    // Check staff permissions
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (creatorProfile?.role !== 'super_admin' && creatorProfile?.role !== 'admin') {
      return { success: false, error: 'Akses ditolak: Hanya staf yang dapat menambah data muthawif' }
    }

    let finalBranchId = data.branch_id ? Number(data.branch_id) : null
    if (creatorProfile.role === 'admin' && creatorProfile.branch_id) {
      finalBranchId = creatorProfile.branch_id
    }

    if (!data.name?.trim()) {
      return { success: false, error: 'Nama muthawif pembimbing wajib diisi' }
    }

    let createdProfileId: string | null = null
    let temporaryPassword: string | undefined = undefined

    // 1. Akun Login opsional jika dicentang (AccountProvisioner)
    if (data.create_account) {
      const email = data.account_email?.trim() || data.email?.trim()
      if (!email) {
        return { success: false, error: 'Email wajib diisi untuk membuat akun login muthawif.' }
      }

      temporaryPassword =
        data.account_password?.trim() ||
        `Muthawif${Math.floor(100000 + Math.random() * 900000)}!`

      // Buat akun di auth.users via Admin API
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          name: data.name.trim(),
          role: 'guide',
          phone: data.phone?.trim() || '',
        },
      })

      if (authError) {
        console.error('Error creating auth user for guide:', authError)
        return {
          success: false,
          error: `Gagal membuat akun login muthawif: ${authError.message}`,
        }
      }

      if (authUser?.user) {
        createdProfileId = authUser.user.id

        // Upsert ke public.profiles
        await supabase.from('profiles').upsert({
          id: createdProfileId,
          branch_id: finalBranchId,
          name: data.name.trim(),
          email,
          phone: data.phone?.trim() || null,
          role: 'guide',
          is_active: data.is_active ?? true,
        })
      }
    }

    // 2. Insert ke tabel guides
    const { data: created, error } = await supabase
      .from('guides')
      .insert({
        branch_id: finalBranchId,
        profile_id: createdProfileId,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        is_active: data.is_active ?? true,
      })
      .select('*, branch:branches(id, name, code), profile:profiles(id, email, role, is_active)')
      .single()

    if (error) {
      console.error('Error creating guide:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/guides')
    revalidatePath('/manasik')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: created as Guide,
      temporaryPassword,
    }
  } catch (err: any) {
    console.error('Unexpected error creating guide:', err)
    return { success: false, error: err.message || 'Gagal menambahkan muthawif' }
  }
}

export async function updateGuide(
  id: number,
  data: Partial<GuideFormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi login tidak valid' }
    }

    // Check staff permissions
    const { data: updaterProfile } = await supabase
      .from('profiles')
      .select('role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (updaterProfile?.role !== 'super_admin' && updaterProfile?.role !== 'admin') {
      return { success: false, error: 'Akses ditolak: Hanya staf yang dapat mengubah data muthawif' }
    }

    // Fetch existing guide record
    const { data: existingGuide } = await supabase
      .from('guides')
      .select('*, profile_id')
      .eq('id', id)
      .maybeSingle()

    if (!existingGuide) {
      return { success: false, error: 'Data muthawif tidak ditemukan' }
    }

    // Branch authorization check
    if (
      updaterProfile.role === 'admin' &&
      updaterProfile.branch_id &&
      existingGuide.branch_id !== updaterProfile.branch_id
    ) {
      return { success: false, error: 'Anda hanya dapat mengubah data muthawif di cabang Anda' }
    }

    const payload: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.branch_id !== undefined) {
      payload.branch_id =
        updaterProfile.role === 'admin'
          ? updaterProfile.branch_id
          : data.branch_id
          ? Number(data.branch_id)
          : null
    }
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.phone !== undefined) payload.phone = data.phone?.trim() || null
    if (data.email !== undefined) payload.email = data.email?.trim() || null
    if (data.is_active !== undefined) payload.is_active = data.is_active

    const { error } = await supabase.from('guides').update(payload).eq('id', id)

    if (error) {
      console.error('Error updating guide:', error)
      return { success: false, error: error.message }
    }

    // If guide has an associated profile, sync is_active, name, email, phone
    if (existingGuide.profile_id) {
      const profileUpdates: any = {}
      if (data.is_active !== undefined) profileUpdates.is_active = data.is_active
      if (data.name !== undefined) profileUpdates.name = data.name.trim()
      if (data.phone !== undefined) profileUpdates.phone = data.phone?.trim() || null
      if (data.email !== undefined) profileUpdates.email = data.email?.trim() || null

      if (Object.keys(profileUpdates).length > 0) {
        await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', existingGuide.profile_id)
      }
    }

    revalidatePath('/guides')
    revalidatePath('/manasik')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating guide:', err)
    return { success: false, error: err.message || 'Gagal memperbarui muthawif' }
  }
}

export async function provisionGuideAccount(
  guideId: number,
  email: string,
  customPassword?: string
): Promise<{ success: boolean; error?: string; temporaryPassword?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi login tidak valid' }
    }

    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (creatorProfile?.role !== 'super_admin' && creatorProfile?.role !== 'admin') {
      return { success: false, error: 'Akses ditolak: Hanya staf yang dapat membuatkan akun login' }
    }

    const { data: guide } = await supabase
      .from('guides')
      .select('*')
      .eq('id', guideId)
      .maybeSingle()

    if (!guide) {
      return { success: false, error: 'Data muthawif tidak ditemukan' }
    }

    if (guide.profile_id) {
      return { success: false, error: 'Muthawif ini sudah memiliki akun login terhubung' }
    }

    const targetEmail = email.trim() || guide.email?.trim()
    if (!targetEmail) {
      return { success: false, error: 'Alamat email wajib diisi untuk membuat akun login' }
    }

    const temporaryPassword =
      customPassword?.trim() || `Muthawif${Math.floor(100000 + Math.random() * 900000)}!`

    // Create Auth User
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name: guide.name,
        role: 'guide',
        phone: guide.phone || '',
      },
    })

    if (authError) {
      console.error('Error creating auth user for guide:', authError)
      return { success: false, error: `Gagal membuat akun login: ${authError.message}` }
    }

    if (authUser?.user) {
      // Upsert to profiles
      await supabase.from('profiles').upsert({
        id: authUser.user.id,
        branch_id: guide.branch_id,
        name: guide.name,
        email: targetEmail,
        phone: guide.phone,
        role: 'guide',
        is_active: guide.is_active ?? true,
      })

      // Link to guides table
      await supabase
        .from('guides')
        .update({
          profile_id: authUser.user.id,
          email: targetEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guideId)
    }

    revalidatePath('/guides')
    return { success: true, temporaryPassword }
  } catch (err: any) {
    console.error('Unexpected error provisioning guide account:', err)
    return { success: false, error: err.message || 'Gagal memproses pembuatan akun' }
  }
}

export async function deleteGuide(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi login tidak valid' }
    }

    const { data: deleterProfile } = await supabase
      .from('profiles')
      .select('role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (deleterProfile?.role !== 'super_admin' && deleterProfile?.role !== 'admin') {
      return { success: false, error: 'Akses ditolak: Hanya staf yang dapat menghapus muthawif' }
    }

    // Check guide exists
    const { data: guide } = await supabase
      .from('guides')
      .select('id, branch_id, profile_id')
      .eq('id', id)
      .maybeSingle()

    if (!guide) {
      return { success: false, error: 'Data muthawif tidak ditemukan' }
    }

    if (
      deleterProfile.role === 'admin' &&
      deleterProfile.branch_id &&
      guide.branch_id !== deleterProfile.branch_id
    ) {
      return { success: false, error: 'Anda hanya dapat menghapus muthawif di cabang Anda' }
    }

    // Nullify references in manasik_schedules and registrations explicitly if needed
    await supabase.from('manasik_schedules').update({ guide_id: null }).eq('guide_id', id)
    await supabase.from('registrations').update({ guide_id: null }).eq('guide_id', id)

    // Delete guide record
    const { error } = await supabase.from('guides').delete().eq('id', id)

    if (error) {
      console.error('Error deleting guide:', error)
      return { success: false, error: error.message }
    }

    // If guide had a profile, optionally mark as inactive or delete auth user
    if (guide.profile_id) {
      await supabase.from('profiles').update({ is_active: false }).eq('id', guide.profile_id)
    }

    revalidatePath('/guides')
    revalidatePath('/manasik')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting guide:', err)
    return { success: false, error: err.message || 'Gagal menghapus muthawif' }
  }
}
