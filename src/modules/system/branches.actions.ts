'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Branch, BranchFormData } from './types'

export async function getBranches(search?: string): Promise<{ data: Branch[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    let query = supabase
      .from('branches')
      .select('*')
      .order('is_head_office', { ascending: false })
      .order('name', { ascending: true })

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`
      query = query.or(`name.ilike.${term},code.ilike.${term},city.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching branches:', error)
      return { data: [], error: error.message }
    }

    return { data: (data as Branch[]) || [] }
  } catch (err: any) {
    console.error('Unexpected error fetching branches:', err)
    return { data: [], error: err.message || 'Gagal mengambil data cabang' }
  }
}

export async function getBranchById(id: number): Promise<{ data: Branch | null; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching branch:', error)
      return { data: null, error: error.message }
    }

    return { data: data as Branch }
  } catch (err: any) {
    console.error('Unexpected error fetching branch by id:', err)
    return { data: null, error: err.message || 'Gagal mengambil detail cabang' }
  }
}

export async function createBranch(data: BranchFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    // Validasi kode unik
    const { data: existing } = await supabase
      .from('branches')
      .select('id')
      .ilike('code', data.code.trim())
      .maybeSingle()

    if (existing) {
      return { success: false, error: `Kode cabang "${data.code}" sudah digunakan.` }
    }

    // Jika cabang baru diset sebagai kantor pusat, nonaktifkan flag kantor pusat lain jika ada
    if (data.is_head_office) {
      await supabase
        .from('branches')
        .update({ is_head_office: false })
        .neq('id', 0)
    }

    const { error } = await supabase.from('branches').insert({
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      is_head_office: Boolean(data.is_head_office),
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    })

    if (error) {
      console.error('Error creating branch:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/branches')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error creating branch:', err)
    return { success: false, error: err.message || 'Gagal menambahkan cabang' }
  }
}

export async function updateBranch(id: number, data: BranchFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    // Validasi kode unik (selain diri sendiri)
    const { data: existing } = await supabase
      .from('branches')
      .select('id')
      .ilike('code', data.code.trim())
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      return { success: false, error: `Kode cabang "${data.code}" sudah digunakan oleh cabang lain.` }
    }

    if (data.is_head_office) {
      await supabase
        .from('branches')
        .update({ is_head_office: false })
        .neq('id', id)
    }

    const { error } = await supabase
      .from('branches')
      .update({
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        is_head_office: Boolean(data.is_head_office),
        is_active: Boolean(data.is_active),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating branch:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/branches')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating branch:', err)
    return { success: false, error: err.message || 'Gagal memperbarui cabang' }
  }
}

export async function deleteBranch(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    // Cek apakah ada pendaftaran aktif atau paket di cabang ini
    const { data: packages } = await supabase
      .from('packages')
      .select('id')
      .eq('branch_id', id)
      .limit(1)

    if (packages && packages.length > 0) {
      return { success: false, error: 'Cabang tidak dapat dihapus karena masih memiliki paket perjalanan aktif.' }
    }

    const { error } = await supabase.from('branches').delete().eq('id', id)

    if (error) {
      console.error('Error deleting branch:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/branches')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting branch:', err)
    return { success: false, error: err.message || 'Gagal menghapus cabang' }
  }
}
