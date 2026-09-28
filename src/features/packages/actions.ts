'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type {
  PackageItem,
  PackageFormData,
  PackageFormDataOptions,
  HotelOption,
  AirlineOption,
  BranchOption,
} from './types'

export async function getPackages(params?: {
  search?: string
  type?: string
  status?: string
}): Promise<{ data: PackageItem[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    let query = supabase
      .from('packages')
      .select(`
        *,
        branches (id, name, code),
        airlines (id, name, code, transit),
        hotel_makkah:hotels!hotel_makkah_id (id, name, city, star_rating, distance_to_masjid),
        hotel_madinah:hotels!hotel_madinah_id (id, name, city, star_rating, distance_to_masjid),
        registrations (id, status)
      `)
      .order('departure_date', { ascending: true })

    if (params?.type && params.type !== 'all') {
      query = query.eq('type', params.type)
    }

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    if (params?.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`
      query = query.or(`name.ilike.${term},departure_city.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching packages with joins, falling back:', error)
      // Fallback in case of alias naming
      const fallbackQuery = await supabase.from('packages').select('*').order('departure_date', { ascending: true })
      if (fallbackQuery.error) return { data: [], error: fallbackQuery.error.message }

      const rawPackages = fallbackQuery.data || []
      return {
        data: rawPackages.map((p: any) => ({
          ...p,
          active_registrations_count: 0,
          remaining_quota: p.quota,
        })),
      }
    }

    const items: PackageItem[] = (data || []).map((row: any) => {
      const activeRegs = (row.registrations || []).filter((r: any) => r.status !== 'cancelled')
      const count = activeRegs.length
      const remaining = Math.max(0, (row.quota || 0) - count)

      return {
        ...row,
        active_registrations_count: count,
        remaining_quota: remaining,
      }
    })

    return { data: items }
  } catch (err: any) {
    console.error('Unexpected error fetching packages:', err)
    return { data: [], error: err.message || 'Gagal mengambil data paket' }
  }
}

export async function getPackageFormData(): Promise<PackageFormDataOptions> {
  const supabase = createAdminClient() as any

  const [branchesRes, hotelsRes, airlinesRes] = await Promise.all([
    supabase.from('branches').select('id, name, code').eq('is_active', true).order('name'),
    supabase.from('hotels').select('id, name, city, star_rating, distance_to_masjid').eq('is_active', true).order('name'),
    supabase.from('airlines').select('id, name, code, transit').eq('is_active', true).order('name'),
  ])

  const allHotels = (hotelsRes.data || []) as HotelOption[]
  const hotelsMakkah = allHotels.filter((h) => h.city?.toLowerCase() === 'makkah')
  const hotelsMadinah = allHotels.filter((h) => h.city?.toLowerCase() === 'madinah')

  return {
    branches: (branchesRes.data || []) as BranchOption[],
    hotelsMakkah,
    hotelsMadinah,
    airlines: (airlinesRes.data || []) as AirlineOption[],
  }
}

export async function getPackageById(id: number): Promise<{ data: any | null; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('packages')
      .select(`
        *,
        branches (id, name, code, phone, email),
        airlines (id, name, code, transit),
        hotel_makkah:hotels!hotel_makkah_id (*),
        hotel_madinah:hotels!hotel_madinah_id (*),
        registrations (
          id,
          code,
          status,
          total_price,
          registered_at,
          pilgrims (id, name, phone, passport_number, gender)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching package by id:', error)
      return { data: null, error: error.message }
    }

    const activeRegs = (data.registrations || []).filter((r: any) => r.status !== 'cancelled')
    const enriched = {
      ...data,
      active_registrations_count: activeRegs.length,
      remaining_quota: Math.max(0, data.quota - activeRegs.length),
    }

    return { data: enriched }
  } catch (err: any) {
    console.error('Unexpected error fetching package detail:', err)
    return { data: null, error: err.message || 'Gagal memuat detail paket' }
  }
}

export async function createPackage(data: PackageFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase.from('packages').insert({
      branch_id: Number(data.branch_id),
      name: data.name.trim(),
      type: data.type,
      status: data.status,
      price: Number(data.price),
      quota: Number(data.quota),
      duration_days: Number(data.duration_days),
      departure_date: data.departure_date,
      return_date: data.return_date,
      departure_city: data.departure_city.trim(),
      hotel_makkah_id: data.hotel_makkah_id ? Number(data.hotel_makkah_id) : null,
      hotel_madinah_id: data.hotel_madinah_id ? Number(data.hotel_madinah_id) : null,
      airline_id: data.airline_id ? Number(data.airline_id) : null,
      facility_included: data.facility_included?.trim() || null,
      facility_excluded: data.facility_excluded?.trim() || null,
    })

    if (error) {
      console.error('Error inserting package:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/packages')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error creating package:', err)
    return { success: false, error: err.message || 'Gagal membuat paket perjalanan' }
  }
}

export async function updatePackage(id: number, data: PackageFormData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase
      .from('packages')
      .update({
        branch_id: Number(data.branch_id),
        name: data.name.trim(),
        type: data.type,
        status: data.status,
        price: Number(data.price),
        quota: Number(data.quota),
        duration_days: Number(data.duration_days),
        departure_date: data.departure_date,
        return_date: data.return_date,
        departure_city: data.departure_city.trim(),
        hotel_makkah_id: data.hotel_makkah_id ? Number(data.hotel_makkah_id) : null,
        hotel_madinah_id: data.hotel_madinah_id ? Number(data.hotel_madinah_id) : null,
        airline_id: data.airline_id ? Number(data.airline_id) : null,
        facility_included: data.facility_included?.trim() || null,
        facility_excluded: data.facility_excluded?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating package:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/packages')
    revalidatePath(`/packages/${id}`)
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating package:', err)
    return { success: false, error: err.message || 'Gagal memperbarui paket perjalanan' }
  }
}

export async function deletePackage(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    // Cek apakah ada pendaftaran aktif
    const { data: regs } = await supabase
      .from('registrations')
      .select('id')
      .eq('package_id', id)
      .neq('status', 'cancelled')
      .limit(1)

    if (regs && regs.length > 0) {
      return {
        success: false,
        error: 'Paket tidak dapat dihapus karena masih memiliki pendaftaran jamaah aktif.',
      }
    }

    const { error } = await supabase.from('packages').delete().eq('id', id)

    if (error) {
      console.error('Error deleting package:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/packages')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting package:', err)
    return { success: false, error: err.message || 'Gagal menghapus paket perjalanan' }
  }
}
