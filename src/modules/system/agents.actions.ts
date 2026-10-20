'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getActionCaller } from '@/lib/auth-guard'
import type { Agent, AgentFormData } from './types'

export async function getAgents(search?: string, branchId?: number): Promise<{ data: Agent[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    let query = supabase
      .from('agents')
      .select('*, branch:branches(id, name, code), profile:profiles(id, email, role, is_active)')
      .order('name', { ascending: true })

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`
      query = query.or(`name.ilike.${term},code.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching agents:', error)
      return { data: [], error: error.message }
    }

    return { data: (data as Agent[]) || [] }
  } catch (err: any) {
    console.error('Unexpected error fetching agents:', err)
    return { data: [], error: err.message || 'Gagal mengambil data agen' }
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
      console.error('Error fetching branches for agent:', error)
      return []
    }

    return data || []
  } catch (err) {
    return []
  }
}

export async function createAgent(
  data: AgentFormData
): Promise<{ success: boolean; data?: Agent; temporaryPassword?: string; error?: string }> {
  try {
    const caller = await getActionCaller()
    if (!caller || !['super_admin', 'admin'].includes(caller.role)) {
      return { success: false, error: 'Akses ditolak: Hanya staf resmi yang berwenang mendaftarkan mitra agen.' }
    }

    const supabase = createAdminClient() as any

    if (!data.name?.trim() || !data.code?.trim()) {
      return { success: false, error: 'Nama agen dan kode agen wajib diisi' }
    }

    // Branch isolation for branch admin
    const finalBranchId = caller.role === 'admin' && caller.branchId
      ? caller.branchId
      : (data.branch_id ? Number(data.branch_id) : null)

    // Check unique code
    const { data: existing } = await supabase
      .from('agents')
      .select('id')
      .eq('code', data.code.trim().toUpperCase())
      .maybeSingle()

    if (existing) {
      return { success: false, error: `Kode agen "${data.code}" sudah digunakan` }
    }

    let createdProfileId: string | null = null
    let temporaryPassword: string | undefined = undefined

    // 1. Account Provisioning (optional)
    if (data.create_account) {
      const email = data.account_email?.trim() || data.email?.trim()
      if (!email) {
        return { success: false, error: 'Alamat email wajib diisi untuk membuat akun login agen' }
      }

      temporaryPassword =
        data.account_password?.trim() ||
        `Agen${Math.floor(100000 + Math.random() * 900000)}!`

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          name: data.name.trim(),
          role: 'agent',
          phone: data.phone?.trim() || '',
        },
      })

      if (authError) {
        console.error('Error creating auth user for agent:', authError)
        return {
          success: false,
          error: `Gagal membuat akun login agen: ${authError.message}`,
        }
      }

      if (authUser?.user) {
        createdProfileId = authUser.user.id

        await supabase.from('profiles').upsert({
          id: createdProfileId,
          branch_id: finalBranchId,
          name: data.name.trim(),
          email,
          phone: data.phone?.trim() || null,
          role: 'agent',
          is_active: data.is_active ?? true,
        })
      }
    }

    // 2. Insert into agents table
    const { data: created, error } = await supabase
      .from('agents')
      .insert({
        branch_id: finalBranchId,
        profile_id: createdProfileId,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        commission_rate: Number(data.commission_rate) || 5,
        is_active: data.is_active ?? true,
      })
      .select('*, branch:branches(id, name, code), profile:profiles(id, email, role, is_active)')
      .single()

    if (error) {
      console.error('Error creating agent:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/agents')
    return { success: true, data: created as Agent, temporaryPassword }
  } catch (err: any) {
    console.error('Unexpected error creating agent:', err)
    return { success: false, error: err.message || 'Gagal menambahkan mitra agen' }
  }
}

export async function provisionAgentAccount(
  agentId: number,
  targetEmail: string,
  customPassword?: string
): Promise<{ success: boolean; temporaryPassword?: string; error?: string }> {
  try {
    const caller = await getActionCaller()
    if (!caller || !['super_admin', 'admin'].includes(caller.role)) {
      return { success: false, error: 'Akses ditolak: Hanya staf resmi yang berwenang membuat akun agen.' }
    }

    const supabase = createAdminClient() as any

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, name, phone, email, branch_id, profile_id')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      return { success: false, error: 'Data agen tidak ditemukan' }
    }

    if (caller.role === 'admin' && caller.branchId && agent.branch_id !== caller.branchId) {
      return { success: false, error: 'Akses ditolak: Anda hanya dapat membuat akun untuk agen di cabang Anda.' }
    }

    if (agent.profile_id) {
      return { success: false, error: 'Mitra agen ini sudah memiliki akun login portal agen' }
    }

    const temporaryPassword =
      customPassword?.trim() || `Agen${Math.floor(100000 + Math.random() * 900000)}!`

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: targetEmail.trim(),
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name: agent.name,
        role: 'agent',
        phone: agent.phone || '',
      },
    })

    if (authError) {
      console.error('Error creating auth user for agent:', authError)
      return { success: false, error: `Gagal membuat akun login: ${authError.message}` }
    }

    if (authUser?.user) {
      await supabase.from('profiles').upsert({
        id: authUser.user.id,
        branch_id: agent.branch_id,
        name: agent.name,
        email: targetEmail.trim(),
        phone: agent.phone,
        role: 'agent',
        is_active: true,
      })

      await supabase
        .from('agents')
        .update({
          profile_id: authUser.user.id,
          email: targetEmail.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', agentId)
    }

    revalidatePath('/agents')
    return { success: true, temporaryPassword }
  } catch (err: any) {
    console.error('Unexpected error provisioning agent account:', err)
    return { success: false, error: err.message || 'Gagal memproses pembuatan akun' }
  }
}

export async function updateAgent(
  id: number,
  data: Partial<AgentFormData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const caller = await getActionCaller()
    if (!caller || !['super_admin', 'admin'].includes(caller.role)) {
      return { success: false, error: 'Akses ditolak: Hanya staf resmi yang berwenang mengubah mitra agen.' }
    }

    const supabase = createAdminClient() as any

    if (caller.role === 'admin' && caller.branchId) {
      const { data: existingAgent } = await supabase.from('agents').select('branch_id').eq('id', id).single()
      if (existingAgent && existingAgent.branch_id !== caller.branchId) {
        return { success: false, error: 'Akses ditolak: Anda hanya dapat mengubah agen di cabang Anda.' }
      }
    }

    const payload: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.branch_id !== undefined) {
      payload.branch_id = caller.role === 'admin' && caller.branchId ? caller.branchId : (data.branch_id ? Number(data.branch_id) : null)
    }
    if (data.code !== undefined) payload.code = data.code.trim().toUpperCase()
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.phone !== undefined) payload.phone = data.phone?.trim() || null
    if (data.email !== undefined) payload.email = data.email?.trim() || null
    if (data.commission_rate !== undefined) payload.commission_rate = Number(data.commission_rate)
    if (data.is_active !== undefined) payload.is_active = data.is_active

    const { error } = await supabase
      .from('agents')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Error updating agent:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/agents')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating agent:', err)
    return { success: false, error: err.message || 'Gagal memperbarui mitra agen' }
  }
}

export async function deleteAgent(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const caller = await getActionCaller()
    if (!caller || !['super_admin', 'admin'].includes(caller.role)) {
      return { success: false, error: 'Akses ditolak: Hanya staf resmi yang berwenang menghapus mitra agen.' }
    }

    const supabase = createAdminClient() as any

    if (caller.role === 'admin' && caller.branchId) {
      const { data: existingAgent } = await supabase.from('agents').select('branch_id').eq('id', id).single()
      if (existingAgent && existingAgent.branch_id !== caller.branchId) {
        return { success: false, error: 'Akses ditolak: Anda hanya dapat menghapus agen di cabang Anda.' }
      }
    }

    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting agent:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/agents')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting agent:', err)
    return { success: false, error: err.message || 'Gagal menghapus mitra agen' }
  }
}
