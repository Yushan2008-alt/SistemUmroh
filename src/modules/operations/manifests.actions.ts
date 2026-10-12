'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type {
  ManifestPackage,
  ManifestRegistrationItem,
  ManifestRowInput,
} from './types'

export async function getManifestPackages(
  search?: string
): Promise<{ data: ManifestPackage[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    let query = supabase
      .from('packages')
      .select(`
        id,
        name,
        type,
        departure_date,
        return_date,
        departure_city,
        quota,
        branches (id, name, code),
        airlines (id, name, code),
        hotel_makkah:hotels!hotel_makkah_id (id, name, star_rating),
        hotel_madinah:hotels!hotel_madinah_id (id, name, star_rating),
        registrations (id, status)
      `)
      .order('departure_date', { ascending: false })

    if (search && search.trim() !== '') {
      query = query.ilike('name', `%${search.trim()}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching manifest packages:', error)
      return { data: [], error: error.message }
    }

    const packages: ManifestPackage[] = (data || []).map((p: any) => {
      const activeRegs = (p.registrations || []).filter((r: any) => r.status !== 'cancelled')
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        departure_date: p.departure_date,
        return_date: p.return_date,
        departure_city: p.departure_city,
        quota: p.quota,
        active_registrations_count: activeRegs.length,
        branches: p.branches,
        airlines: p.airlines,
        hotel_makkah: p.hotel_makkah,
        hotel_madinah: p.hotel_madinah,
      }
    })

    return { data: packages }
  } catch (err: any) {
    console.error('Unexpected error fetching manifest packages:', err)
    return { data: [], error: err.message || 'Gagal mengambil data paket manifest' }
  }
}

export async function getPackageManifest(
  packageId: number
): Promise<{
  packageData: any | null
  registrations: ManifestRegistrationItem[]
  error?: string
}> {
  try {
    const supabase = createAdminClient() as any

    // 1. Ambil detail paket
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select(`
        *,
        branches (*),
        airlines (*),
        hotel_makkah:hotels!hotel_makkah_id (*),
        hotel_madinah:hotels!hotel_madinah_id (*)
      `)
      .eq('id', packageId)
      .single()

    if (pkgError) {
      return { packageData: null, registrations: [], error: pkgError.message }
    }

    // 2. Ambil seluruh registrasi aktif
    const { data: regs, error: regsError } = await supabase
      .from('registrations')
      .select(`
        id,
        code,
        status,
        registered_at,
        pilgrims (
          id,
          name,
          gender,
          nik,
          phone,
          passport_number,
          passport_expiry,
          mahram_status
        )
      `)
      .eq('package_id', packageId)
      .neq('status', 'cancelled')
      .order('registered_at', { ascending: true })

    if (regsError) {
      return { packageData: pkg, registrations: [], error: regsError.message }
    }

    // 3. Ambil data manifest entries yang sudah ada
    const registrationIds = (regs || []).map((r: any) => r.id)
    let manifestMap = new Map<number, any>()

    if (registrationIds.length > 0) {
      const { data: entries } = await supabase
        .from('manifest_entries')
        .select('*')
        .in('registration_id', registrationIds)

      if (entries) {
        entries.forEach((entry: any) => {
          manifestMap.set(entry.registration_id, entry)
        })
      }
    }

    const items: ManifestRegistrationItem[] = (regs || []).map((r: any) => ({
      id: r.id,
      code: r.code,
      status: r.status,
      registered_at: r.registered_at,
      pilgrim: r.pilgrims,
      manifest_entry: manifestMap.get(r.id) || null,
    }))

    // Sort by nama jamaah agar mudah dikelompokkan
    items.sort((a, b) => (a.pilgrim?.name || '').localeCompare(b.pilgrim?.name || ''))

    return { packageData: pkg, registrations: items }
  } catch (err: any) {
    console.error('Unexpected error fetching package manifest:', err)
    return { packageData: null, registrations: [], error: err.message || 'Gagal memuat manifest' }
  }
}

export async function updateManifestEntries(
  packageId: number,
  rows: Record<number, ManifestRowInput>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const entriesToUpsert = Object.entries(rows).map(([regIdStr, row]) => {
      const regId = Number(regIdStr)
      return {
        package_id: packageId,
        registration_id: regId,
        room_number: row.room_number?.trim() || null,
        room_type: row.room_type || 'quad',
        bus_number: row.bus_number?.trim() || null,
        seat_number: row.seat_number?.trim() || null,
        mahram_group: row.mahram_group?.trim() || null,
        updated_at: new Date().toISOString(),
      }
    })

    if (entriesToUpsert.length > 0) {
      const { error } = await supabase
        .from('manifest_entries')
        .upsert(entriesToUpsert, { onConflict: 'registration_id' })

      if (error) {
        console.error('Error upserting manifest entries:', error)
        return { success: false, error: error.message }
      }
    }

    revalidatePath(`/manifests/${packageId}`)
    revalidatePath('/manifests')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating manifest entries:', err)
    return { success: false, error: err.message || 'Gagal menyimpan entri manifest' }
  }
}
