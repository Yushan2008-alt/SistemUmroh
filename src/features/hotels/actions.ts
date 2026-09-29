'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Hotel, HotelFormData } from './types'

export async function getHotels(search?: string, city?: string): Promise<{ data: Hotel[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    let query = supabase
      .from('hotels')
      .select('*')
      .order('city', { ascending: true })
      .order('star_rating', { ascending: false })
      .order('name', { ascending: true })

    if (city && city !== 'all') {
      query = query.eq('city', city.toLowerCase())
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`
      query = query.or(`name.ilike.${term},address.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching hotels:', error)
      return { data: [], error: error.message }
    }

    return { data: (data as Hotel[]) || [] }
  } catch (err: any) {
    console.error('Unexpected error fetching hotels:', err)
    return { data: [], error: err.message || 'Gagal mengambil data hotel' }
  }
}

export async function getHotelById(id: number): Promise<{ data: Hotel | null; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching hotel:', error)
      return { data: null, error: error.message }
    }

    return { data: data as Hotel }
  } catch (err: any) {
    console.error('Unexpected error fetching hotel:', err)
    return { data: null, error: err.message || 'Gagal mengambil detail hotel' }
  }
}

export async function createHotel(data: HotelFormData): Promise<{ success: boolean; data?: Hotel; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    if (!data.name?.trim()) {
      return { success: false, error: 'Nama hotel wajib diisi' }
    }

    const { data: created, error } = await supabase
      .from('hotels')
      .insert({
        name: data.name.trim(),
        city: data.city.toLowerCase(),
        star_rating: Number(data.star_rating) || 4,
        distance_to_masjid: data.distance_to_masjid ? Number(data.distance_to_masjid) : null,
        address: data.address?.trim() || null,
        is_active: data.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating hotel:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/hotels')
    return { success: true, data: created as Hotel }
  } catch (err: any) {
    console.error('Unexpected error creating hotel:', err)
    return { success: false, error: err.message || 'Gagal menambahkan hotel' }
  }
}

export async function updateHotel(id: number, data: Partial<HotelFormData>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const payload: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.city !== undefined) payload.city = data.city.toLowerCase()
    if (data.star_rating !== undefined) payload.star_rating = Number(data.star_rating)
    if (data.distance_to_masjid !== undefined) {
      payload.distance_to_masjid = data.distance_to_masjid ? Number(data.distance_to_masjid) : null
    }
    if (data.address !== undefined) payload.address = data.address?.trim() || null
    if (data.is_active !== undefined) payload.is_active = data.is_active

    const { error } = await supabase
      .from('hotels')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Error updating hotel:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/hotels')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating hotel:', err)
    return { success: false, error: err.message || 'Gagal memperbarui hotel' }
  }
}

export async function deleteHotel(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting hotel:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/hotels')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting hotel:', err)
    return { success: false, error: err.message || 'Gagal menghapus hotel' }
  }
}
