'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Agent, AgentFormData } from './types'

export async function getAgents(search?: string, branchId?: number): Promise<{ data: Agent[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    let query = supabase
      .from('agents')
      .select('*, branch:branches(id, name, code)')
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

export async function createAgent(data: AgentFormData): Promise<{ success: boolean; data?: Agent; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    if (!data.name?.trim() || !data.code?.trim()) {
      return { success: false, error: 'Nama agen dan kode agen wajib diisi' }
    }

    // Check unique code
    const { data: existing } = await supabase
      .from('agents')
      .select('id')
      .eq('code', data.code.trim().toUpperCase())
      .maybeSingle()

    if (existing) {
      return { success: false, error: `Kode agen "${data.code}" sudah digunakan` }
    }

    const { data: created, error } = await supabase
      .from('agents')
      .insert({
        branch_id: data.branch_id ? Number(data.branch_id) : null,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        commission_rate: Number(data.commission_rate) || 5,
        is_active: data.is_active ?? true,
      })
      .select('*, branch:branches(id, name, code)')
      .single()

    if (error) {
      console.error('Error creating agent:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/agents')
    return { success: true, data: created as Agent }
  } catch (err: any) {
    console.error('Unexpected error creating agent:', err)
    return { success: false, error: err.message || 'Gagal menambahkan mitra agen' }
  }
}

export async function updateAgent(id: number, data: Partial<AgentFormData>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const payload: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.branch_id !== undefined) payload.branch_id = data.branch_id ? Number(data.branch_id) : null
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
    const supabase = createAdminClient() as any

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
