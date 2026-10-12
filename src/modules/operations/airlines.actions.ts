'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Airline, AirlineFormData } from './types'

export async function getAirlines(search?: string): Promise<{ data: Airline[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    let query = supabase
      .from('airlines')
      .select('*')
      .order('name', { ascending: true })

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`
      query = query.or(`name.ilike.${term},code.ilike.${term},transit.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching airlines:', error)
      return { data: [], error: error.message }
    }

    return { data: (data as Airline[]) || [] }
  } catch (err: any) {
    console.error('Unexpected error fetching airlines:', err)
    return { data: [], error: err.message || 'Gagal mengambil data maskapai' }
  }
}

export async function getAirlineById(id: number): Promise<{ data: Airline | null; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('airlines')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching airline:', error)
      return { data: null, error: error.message }
    }

    return { data: data as Airline }
  } catch (err: any) {
    console.error('Unexpected error fetching airline:', err)
    return { data: null, error: err.message || 'Gagal mengambil detail maskapai' }
  }
}

export async function createAirline(data: AirlineFormData): Promise<{ success: boolean; data?: Airline; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    if (!data.name?.trim() || !data.code?.trim()) {
      return { success: false, error: 'Nama maskapai dan kode penerbangan wajib diisi' }
    }

    const { data: created, error } = await supabase
      .from('airlines')
      .insert({
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        transit: data.transit?.trim() || null,
        is_active: data.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating airline:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/airlines')
    return { success: true, data: created as Airline }
  } catch (err: any) {
    console.error('Unexpected error creating airline:', err)
    return { success: false, error: err.message || 'Gagal menambahkan maskapai' }
  }
}

export async function updateAirline(id: number, data: Partial<AirlineFormData>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const payload: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.code !== undefined) payload.code = data.code.trim().toUpperCase()
    if (data.transit !== undefined) payload.transit = data.transit?.trim() || null
    if (data.is_active !== undefined) payload.is_active = data.is_active

    const { error } = await supabase
      .from('airlines')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Error updating airline:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/airlines')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating airline:', err)
    return { success: false, error: err.message || 'Gagal memperbarui maskapai' }
  }
}

export async function deleteAirline(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase
      .from('airlines')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting airline:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/airlines')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting airline:', err)
    return { success: false, error: err.message || 'Gagal menghapus maskapai' }
  }
}
