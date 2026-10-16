'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  PilgrimItem,
  PilgrimFormData,
  PilgrimFormDataOptions,
} from './types'

export async function getPilgrims(params?: {
  search?: string
  status?: string
  branchId?: number | null
  agentId?: number | null
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

    if (params?.agentId !== undefined && params.agentId !== null) {
      query = query.eq('agent_id', params.agentId)
    }

    if (params?.branchId && params.branchId > 0) {
      query = query.eq('branch_id', params.branchId)
    }

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
  const serverSupabase = await createClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  let userRole = 'super_admin'
  let agentRecord: any = null
  if (user) {
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (prof?.role) userRole = prof.role
    if (userRole === 'agent') {
      const { data: ag } = await supabase.from('agents').select('id, name, code, branch_id').or(`profile_id.eq.${user.id},email.eq.${user.email}`).maybeSingle()
      agentRecord = ag
    }
  }

  const [branchesRes, agentsRes] = await Promise.all([
    supabase.from('branches').select('id, name, code').eq('is_active', true).order('name'),
    supabase.from('agents').select('id, name, code').eq('is_active', true).order('name'),
  ])

  if (userRole === 'agent' && agentRecord) {
    return {
      branches: (branchesRes.data || []).filter((b: any) => b.id === agentRecord.branch_id),
      agents: [agentRecord],
    }
  }

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

    // Identifikasi peran pemanggil (Staff vs Agen)
    const serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    let callerRole = 'super_admin'
    let callerAgentId: number | null = null
    let callerBranchId: number | null = null

    if (user) {
      const { data: prof } = await supabase.from('profiles').select('role, branch_id').eq('id', user.id).maybeSingle()
      if (prof?.role) callerRole = prof.role
      if (prof?.branch_id) callerBranchId = prof.branch_id
      if (callerRole === 'agent') {
        const { data: ag } = await supabase.from('agents').select('id, branch_id').or(`profile_id.eq.${user.id},email.eq.${user.email}`).maybeSingle()
        if (ag) {
          callerAgentId = ag.id
          callerBranchId = ag.branch_id
        }
      }
    }

    let finalBranchId = Number(data.branch_id) || callerBranchId || 1
    let finalAgentId = data.agent_id ? Number(data.agent_id) : null

    if (callerRole === 'agent') {
      if (!callerAgentId) {
        return { success: false, error: 'Profil agen Anda belum terdaftar dalam sistem mitra.' }
      }
      finalAgentId = callerAgentId
      finalBranchId = callerBranchId || 1
    }

    // 2. Generate Kode Jamaah (JM-YYYYMM-XXXX)
    const prefix = `JM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const generatedCode = `${prefix}-${randomSuffix}`

    let createdProfileId: string | null = null
    let temporaryPassword: string | undefined = undefined

    // 3. Akun Login opsional jika dicentang (AccountProvisioner)
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
          branch_id: finalBranchId,
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
      branch_id: finalBranchId,
      agent_id: finalAgentId,
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

    // Identifikasi peran pemanggil
    const serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    let callerRole = 'super_admin'
    let callerAgentId: number | null = null
    let callerBranchId: number | null = null

    if (user) {
      const { data: prof } = await supabase.from('profiles').select('role, branch_id').eq('id', user.id).maybeSingle()
      if (prof?.role) callerRole = prof.role
      if (prof?.branch_id) callerBranchId = prof.branch_id
      if (callerRole === 'agent') {
        const { data: ag } = await supabase.from('agents').select('id, branch_id').or(`profile_id.eq.${user.id},email.eq.${user.email}`).maybeSingle()
        if (ag) {
          callerAgentId = ag.id
          callerBranchId = ag.branch_id
        }
      }
    }

    let finalBranchId = Number(data.branch_id) || callerBranchId || 1
    let finalAgentId = data.agent_id ? Number(data.agent_id) : null

    if (callerRole === 'agent') {
      const { data: existingPilgrim } = await supabase.from('pilgrims').select('agent_id').eq('id', id).maybeSingle()
      if (!existingPilgrim || existingPilgrim.agent_id !== callerAgentId) {
        return { success: false, error: 'Akses ditolak: Anda hanya dapat mengedit jamaah referral Anda sendiri.' }
      }
      finalAgentId = callerAgentId
      finalBranchId = callerBranchId || 1
    }

    const { error } = await supabase
      .from('pilgrims')
      .update({
        branch_id: finalBranchId,
        agent_id: finalAgentId,
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

    // Validasi wewenang: Agen dilarang menghapus jamaah
    const serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (prof?.role === 'agent') {
        return {
          success: false,
          error: 'Akses ditolak: Mitra agen tidak memiliki izin untuk menghapus data jamaah (khusus staf).',
        }
      }
    }

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

export interface CurrentPilgrimSummary {
  id: number
  name: string
  nik: string
  phone: string
  code: string
  branch_id: number
  profile_id?: string
}

/**
 * Get or automatically resolve the pilgrim record linked to the authenticated user.
 */
export async function getCurrentPilgrim(): Promise<CurrentPilgrimSummary | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const admin = createAdminClient() as any
    let { data: pilgrim } = await admin
      .from('pilgrims')
      .select('id, name, nik, phone, code, branch_id, profile_id')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!pilgrim) {
      const { data: profile } = await admin
        .from('profiles')
        .select('name, phone, branch_id')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.phone) {
        const { data: byPhone } = await admin
          .from('pilgrims')
          .select('id, name, nik, phone, code, branch_id, profile_id')
          .eq('phone', profile.phone)
          .maybeSingle()
        if (byPhone) {
          await admin.from('pilgrims').update({ profile_id: user.id }).eq('id', byPhone.id)
          pilgrim = { ...byPhone, profile_id: user.id }
        }
      }

      if (!pilgrim) {
        const defaultName = profile?.name || user.user_metadata?.full_name || 'Ahmad Fauzi'
        const { data: byName } = await admin
          .from('pilgrims')
          .select('id, name, nik, phone, code, branch_id, profile_id')
          .eq('name', defaultName)
          .maybeSingle()

        if (byName) {
          await admin.from('pilgrims').update({ profile_id: user.id }).eq('id', byName.id)
          pilgrim = { ...byName, profile_id: user.id }
        } else {
          // Provision pilgrim record for this user
          const pilgrimCode = `PLG-${Date.now().toString().slice(-6)}`
          const { data: created } = await admin
            .from('pilgrims')
            .insert({
              profile_id: user.id,
              branch_id: profile?.branch_id || 1,
              name: defaultName,
              phone: profile?.phone || '08123456789',
              gender: 'male',
              nik: '320101' + Date.now().toString().slice(-10),
              code: pilgrimCode,
              is_active: true,
            })
            .select('id, name, nik, phone, code, branch_id, profile_id')
            .single()

          pilgrim = created
        }
      }
    }

    return pilgrim || null
  } catch (err) {
    console.error('getCurrentPilgrim error:', err)
    return null
  }
}

