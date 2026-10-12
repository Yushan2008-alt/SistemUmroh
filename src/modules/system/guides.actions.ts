'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Guide, GuideFormData } from './types'

export async function getGuides(search?: string, branchId?: number): Promise<{ data: Guide[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    let query = supabase
      .from('guides')
      .select('*, branch:branches(id, name, code)')
      .order('name', { ascending: true })

    if (branchId) {
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

export async function createGuide(data: GuideFormData): Promise<{ success: boolean; data?: Guide; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    if (!data.name?.trim()) {
      return { success: false, error: 'Nama muthawif pembimbing wajib diisi' }
    }

    const { data: created, error } = await supabase
      .from('guides')
      .insert({
        branch_id: data.branch_id ? Number(data.branch_id) : null,
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        is_active: data.is_active ?? true,
      })
      .select('*, branch:branches(id, name, code)')
      .single()

    if (error) {
      console.error('Error creating guide:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/guides')
    return { success: true, data: created as Guide }
  } catch (err: any) {
    console.error('Unexpected error creating guide:', err)
    return { success: false, error: err.message || 'Gagal menambahkan muthawif' }
  }
}

export async function updateGuide(id: number, data: Partial<GuideFormData>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const payload: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.branch_id !== undefined) payload.branch_id = data.branch_id ? Number(data.branch_id) : null
    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.phone !== undefined) payload.phone = data.phone?.trim() || null
    if (data.email !== undefined) payload.email = data.email?.trim() || null
    if (data.is_active !== undefined) payload.is_active = data.is_active

    const { error } = await supabase
      .from('guides')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Error updating guide:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/guides')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating guide:', err)
    return { success: false, error: err.message || 'Gagal memperbarui muthawif' }
  }
}

export async function deleteGuide(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase
      .from('guides')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting guide:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/guides')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting guide:', err)
    return { success: false, error: err.message || 'Gagal menghapus muthawif' }
  }
}
