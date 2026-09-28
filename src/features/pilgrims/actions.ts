'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type {
  PilgrimItem,
  PilgrimFormData,
  PilgrimFormDataOptions,
} from './types'

export async function getPilgrims(params?: {
  search?: string
  status?: string
}): Promise<{ data: PilgrimItem[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    let query = supabase
      .from('pilgrims')
      .select(`
        *,
        branches (id, name, code),
        agents (id, name, code, phone),
        profiles (id, name, email, role),
        registrations (id, code, status, packages (name, departure_date)),
        documents (id, type, status)
      `)
      .order('name', { ascending: true })

    if (params?.status === 'active') {
      query = query.eq('is_active', true)
    } else if (params?.status === 'inactive') {
      query = query.eq('is_active', false)
    }

    if (params?.search && params.search.trim() !== '') {
      const term = `%${params.search.trim()}%`
      query = query.or(`name.ilike.${term},nik.ilike.${term},passport_number.ilike.${term},code.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching pilgrims with relations, fallback:', error)
      const fallback = await supabase.from('pilgrims').select('*').order('name', { ascending: true })
      if (fallback.error) return { data: [], error: fallback.error.message }
      return { data: (fallback.data as PilgrimItem[]) || [] }
    }

    const items: PilgrimItem[] = (data || []).map((row: any) => ({
      ...row,
      documents_count: (row.documents || []).length,
    }))

    return { data: items }
  } catch (err: any) {
    console.error('Unexpected error fetching pilgrims:', err)
    return { data: [], error: err.message || 'Gagal mengambil data jamaah' }
  }
}

export async function getPilgrimFormData(): Promise<PilgrimFormDataOptions> {
  const supabase = createAdminClient() as any

  const [branchesRes, agentsRes] = await Promise.all([
    supabase.from('branches').select('id, name, code').eq('is_active', true).order('name'),
    supabase.from('agents').select('id, name, code').eq('is_active', true).order('name'),
  ])

  return {
    branches: branchesRes.data || [],
    agents: agentsRes.data || [],
  }
}

export async function getPilgrimById(id: number): Promise<{ data: any | null; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { data, error } = await supabase
      .from('pilgrims')
      .select(`
        *,
        branches (id, name, code, phone, email, city),
        agents (id, name, code, phone, email),
        profiles (id, name, email, role),
        registrations (
          id,
          code,
          status,
          total_price,
          registered_at,
          packages (id, name, type, price, departure_date, return_date, duration_days)
        ),
        documents (
          id,
          type,
          status,
          file_path,
          file_name,
          notes,
          created_at,
          verified_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching pilgrim by id:', error)
      return { data: null, error: error.message }
    }

    return { data }
  } catch (err: any) {
    console.error('Unexpected error fetching pilgrim detail:', err)
    return { data: null, error: err.message || 'Gagal memuat detail data jamaah' }
  }
}

export async function createPilgrim(
  data: PilgrimFormData
): Promise<{ success: boolean; error?: string; temporaryPassword?: string }> {
  try {
    const supabase = createAdminClient() as any

    // 1. Cek NIK unik
    const { data: existingNik } = await supabase
      .from('pilgrims')
      .select('id')
      .eq('nik', data.nik.trim())
      .maybeSingle()

    if (existingNik) {
      return { success: false, error: `NIK "${data.nik}" sudah terdaftar pada jamaah lain.` }
    }

    // 2. Generate Kode Jamaah (JM-YYYYMM-XXXX)
    const prefix = `JM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const generatedCode = `${prefix}-${randomSuffix}`

    let createdProfileId: string | null = null
    let temporaryPassword: string | undefined = undefined

    // 3. Akun Login opsional jika dicentang
    if (data.create_account) {
      const email = data.account_email?.trim() || data.email?.trim()
      if (!email) {
        return { success: false, error: 'Email wajib diisi untuk membuat akun login jamaah.' }
      }

      temporaryPassword = `Jamaah${Math.floor(100000 + Math.random() * 900000)}!`

      // Buat akun di auth.users via Admin API
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          name: data.name.trim(),
          role: 'pilgrim',
          phone: data.phone.trim(),
        },
      })

      if (authError) {
        console.error('Error creating auth user for pilgrim:', authError)
        return {
          success: false,
          error: `Gagal membuat akun login: ${authError.message}`,
        }
      }

      if (authUser?.user) {
        createdProfileId = authUser.user.id

        // Upsert ke public.profiles
        await supabase.from('profiles').upsert({
          id: createdProfileId,
          branch_id: Number(data.branch_id),
          name: data.name.trim(),
          email,
          phone: data.phone.trim(),
          role: 'pilgrim',
          is_active: true,
        })
      }
    }

    // 4. Insert data jamaah
    const { error: insertError } = await supabase.from('pilgrims').insert({
      branch_id: Number(data.branch_id),
      agent_id: data.agent_id ? Number(data.agent_id) : null,
      profile_id: createdProfileId,
      code: generatedCode,
      nik: data.nik.trim(),
      passport_number: data.passport_number?.trim() || null,
      passport_expiry: data.passport_expiry || null,
      name: data.name.trim(),
      gender: data.gender,
      birth_place: data.birth_place?.trim() || null,
      birth_date: data.birth_date || null,
      phone: data.phone.trim(),
      address: data.address?.trim() || null,
      emergency_contact_name: data.emergency_contact_name?.trim() || null,
      emergency_contact_phone: data.emergency_contact_phone?.trim() || null,
      mahram_status: data.mahram_status?.trim() || null,
      health_notes: data.health_notes?.trim() || null,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
    })

    if (insertError) {
      console.error('Error inserting pilgrim:', insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath('/pilgrims')
    return { success: true, temporaryPassword }
  } catch (err: any) {
    console.error('Unexpected error creating pilgrim:', err)
    return { success: false, error: err.message || 'Gagal menambahkan data jamaah' }
  }
}

export async function updatePilgrim(
  id: number,
  data: PilgrimFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    // Validasi NIK unik selain diri sendiri
    const { data: existingNik } = await supabase
      .from('pilgrims')
      .select('id')
      .eq('nik', data.nik.trim())
      .neq('id', id)
      .maybeSingle()

    if (existingNik) {
      return { success: false, error: `NIK "${data.nik}" sudah terdaftar pada jamaah lain.` }
    }

    const { error } = await supabase
      .from('pilgrims')
      .update({
        branch_id: Number(data.branch_id),
        agent_id: data.agent_id ? Number(data.agent_id) : null,
        nik: data.nik.trim(),
        passport_number: data.passport_number?.trim() || null,
        passport_expiry: data.passport_expiry || null,
        name: data.name.trim(),
        gender: data.gender,
        birth_place: data.birth_place?.trim() || null,
        birth_date: data.birth_date || null,
        phone: data.phone.trim(),
        address: data.address?.trim() || null,
        emergency_contact_name: data.emergency_contact_name?.trim() || null,
        emergency_contact_phone: data.emergency_contact_phone?.trim() || null,
        mahram_status: data.mahram_status?.trim() || null,
        health_notes: data.health_notes?.trim() || null,
        is_active: Boolean(data.is_active),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating pilgrim:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/pilgrims')
    revalidatePath(`/pilgrims/${id}`)
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating pilgrim:', err)
    return { success: false, error: err.message || 'Gagal memperbarui data jamaah' }
  }
}

export async function deletePilgrim(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    // Cek apakah ada pendaftaran aktif
    const { data: regs } = await supabase
      .from('registrations')
      .select('id')
      .eq('pilgrim_id', id)
      .neq('status', 'cancelled')
      .limit(1)

    if (regs && regs.length > 0) {
      return {
        success: false,
        error: 'Data jamaah tidak dapat dihapus karena masih memiliki riwayat pendaftaran paket aktif.',
      }
    }

    const { error } = await supabase.from('pilgrims').delete().eq('id', id)

    if (error) {
      console.error('Error deleting pilgrim:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/pilgrims')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting pilgrim:', err)
    return { success: false, error: err.message || 'Gagal menghapus data jamaah' }
  }
}
