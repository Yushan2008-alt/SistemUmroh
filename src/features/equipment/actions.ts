'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type {
  EquipmentDistributionItem,
  EquipmentFormData,
  EquipmentFormDataOptions,
  RegistrationOption,
} from './types'

export async function getEquipmentDistributions(params?: {
  search?: string
  status?: string
}): Promise<{ data: EquipmentDistributionItem[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    let query = supabase
      .from('equipment_distributions')
      .select(`
        *,
        registrations (
          id,
          code,
          pilgrims (id, name, phone),
          packages (id, name)
        )
      `)
      .order('created_at', { ascending: false })

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    if (params?.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`
      query = query.ilike('item', term)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching equipment distributions:', error)
      return { data: [], error: error.message }
    }

    // Client search filter for pilgrim name if needed
    let items = (data as EquipmentDistributionItem[]) || []
    if (params?.search && params.search.trim() !== '') {
      const term = params.search.toLowerCase()
      items = items.filter(
        (i) =>
          i.item.toLowerCase().includes(term) ||
          i.registrations?.pilgrims?.name.toLowerCase().includes(term) ||
          i.registrations?.code.toLowerCase().includes(term)
      )
    }

    return { data: items }
  } catch (err: any) {
    console.error('Unexpected error fetching equipment:', err)
    return { data: [], error: err.message || 'Gagal mengambil data perlengkapan' }
  }
}

export async function getEquipmentFormData(): Promise<EquipmentFormDataOptions> {
  const supabase = createAdminClient() as any

  const { data: regs } = await supabase
    .from('registrations')
    .select(`
      id,
      code,
      pilgrims (name),
      packages (name)
    `)
    .neq('status', 'cancelled')
    .order('registered_at', { ascending: false })

  const registrationOptions: RegistrationOption[] = (regs || []).map((r: any) => ({
    id: r.id,
    code: r.code,
    pilgrim_name: r.pilgrims?.name || 'Jamaah',
    package_name: r.packages?.name || 'Paket',
  }))

  return {
    registrations: registrationOptions,
  }
}

export async function getEquipmentById(
  id: number
): Promise<{ data: any | null; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { data, error } = await supabase
      .from('equipment_distributions')
      .select(`
        *,
        registrations (
          id,
          code,
          pilgrims (id, name, phone),
          packages (id, name)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching equipment by id:', error)
      return { data: null, error: error.message }
    }

    return { data }
  } catch (err: any) {
    console.error('Unexpected error fetching equipment detail:', err)
    return { data: null, error: err.message || 'Gagal memuat detail perlengkapan' }
  }
}

export async function createEquipment(
  data: EquipmentFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const handedAt =
      data.status === 'handed_over'
        ? data.handed_at || new Date().toISOString()
        : null

    const { error } = await supabase.from('equipment_distributions').insert({
      registration_id: Number(data.registration_id),
      item: data.item.trim(),
      quantity: Number(data.quantity) || 1,
      status: data.status,
      handed_at: handedAt,
    })

    if (error) {
      console.error('Error creating equipment:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/equipment')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error creating equipment:', err)
    return { success: false, error: err.message || 'Gagal mencatat distribusi perlengkapan' }
  }
}

export async function updateEquipment(
  id: number,
  data: EquipmentFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const handedAt =
      data.status === 'handed_over'
        ? data.handed_at || new Date().toISOString()
        : null

    const { error } = await supabase
      .from('equipment_distributions')
      .update({
        registration_id: Number(data.registration_id),
        item: data.item.trim(),
        quantity: Number(data.quantity) || 1,
        status: data.status,
        handed_at: handedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating equipment:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/equipment')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating equipment:', err)
    return { success: false, error: err.message || 'Gagal memperbarui data perlengkapan' }
  }
}

export async function quickHandOverEquipment(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase
      .from('equipment_distributions')
      .update({
        status: 'handed_over',
        handed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error in quickHandOverEquipment:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/equipment')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error handing over equipment:', err)
    return { success: false, error: err.message || 'Gagal memperbarui status penyerahan' }
  }
}

export async function deleteEquipment(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase.from('equipment_distributions').delete().eq('id', id)

    if (error) {
      console.error('Error deleting equipment:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/equipment')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting equipment:', err)
    return { success: false, error: err.message || 'Gagal menghapus entri perlengkapan' }
  }
}
