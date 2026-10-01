'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Gender } from '@/types/database.types'

export interface CompleteProfileInput {
  name: string
  phone: string
  gender: Gender
  nik: string
  birth_place?: string | null
  birth_date?: string | null
  address: string
  branch_id: number
  passport_number?: string | null
  passport_expiry?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
}

export async function getCompleteProfileInitialData(): Promise<{
  user: {
    id: string
    email: string
    name: string
    avatar_url: string | null
  } | null
  branches: Array<{ id: number; name: string; code: string; city: string | null }>
  existingPilgrim: any | null
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { user: null, branches: [], existingPilgrim: null, error: 'Belum terautentikasi' }
    }

    const adminSupabase = createAdminClient() as any

    const [branchesRes, profileRes, pilgrimRes] = await Promise.all([
      adminSupabase
        .from('branches')
        .select('id, name, code, city')
        .eq('is_active', true)
        .order('id', { ascending: true }),
      adminSupabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      adminSupabase.from('pilgrims').select('*').eq('profile_id', user.id).maybeSingle(),
    ])

    const userName =
      profileRes.data?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      ''

    const avatarUrl =
      profileRes.data?.avatar_url || user.user_metadata?.avatar_url || null

    return {
      user: {
        id: user.id,
        email: user.email || '',
        name: userName,
        avatar_url: avatarUrl,
      },
      branches: branchesRes.data || [],
      existingPilgrim: pilgrimRes.data || null,
    }
  } catch (err: any) {
    console.error('Error fetching initial profile completion data:', err)
    return { user: null, branches: [], existingPilgrim: null, error: err.message }
  }
}

export async function completePilgrimProfile(
  data: CompleteProfileInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' }
    }

    // Validasi NIK 16 digit
    const cleanNik = data.nik.replace(/\D/g, '')
    if (cleanNik.length !== 16) {
      return { success: false, error: 'Nomor NIK KTP harus tepat 16 digit angka.' }
    }

    // Validasi No Telepon
    const cleanPhone = data.phone.trim()
    if (cleanPhone.length < 10) {
      return { success: false, error: 'Nomor WhatsApp / Telepon tidak valid.' }
    }

    const adminSupabase = createAdminClient() as any

    // 1. Cek apakah NIK sudah digunakan oleh jamaah lain
    const { data: existingNik } = await adminSupabase
      .from('pilgrims')
      .select('id, profile_id')
      .eq('nik', cleanNik)
      .maybeSingle()

    if (existingNik && existingNik.profile_id && existingNik.profile_id !== user.id) {
      return {
        success: false,
        error: `NIK "${cleanNik}" telah terdaftar atas akun jamaah lain. Hubungi kantor cabang jika ini keliru.`,
      }
    }

    const branchId = Number(data.branch_id)

    // 2. Perbarui tabel profiles
    const { error: profileError } = await adminSupabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      name: data.name.trim(),
      phone: cleanPhone,
      branch_id: branchId,
      role: 'pilgrim',
      is_active: true,
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Error updating profiles:', profileError)
      return { success: false, error: `Gagal memperbarui profil: ${profileError.message}` }
    }

    // 3. Cek atau generate data jamaah di tabel pilgrims
    const { data: existingPilgrim } = await adminSupabase
      .from('pilgrims')
      .select('id, code')
      .eq('profile_id', user.id)
      .maybeSingle()

    const pilgrimPayload = {
      branch_id: branchId,
      profile_id: user.id,
      name: data.name.trim(),
      gender: data.gender,
      nik: cleanNik,
      birth_place: data.birth_place?.trim() || null,
      birth_date: data.birth_date || null,
      phone: cleanPhone,
      address: data.address.trim(),
      passport_number: data.passport_number?.trim() || null,
      passport_expiry: data.passport_expiry || null,
      emergency_contact_name: data.emergency_contact_name?.trim() || null,
      emergency_contact_phone: data.emergency_contact_phone?.trim() || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    if (existingPilgrim) {
      // Update data jamaah yang sudah ada
      const { error: updatePilgrimError } = await adminSupabase
        .from('pilgrims')
        .update(pilgrimPayload)
        .eq('id', existingPilgrim.id)

      if (updatePilgrimError) {
        return { success: false, error: updatePilgrimError.message }
      }
    } else {
      // Buat data jamaah baru dengan kode unik
      const prefix = `JM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const generatedCode = `${prefix}-${randomSuffix}`

      const { error: insertPilgrimError } = await adminSupabase.from('pilgrims').insert({
        ...pilgrimPayload,
        code: generatedCode,
      })

      if (insertPilgrimError) {
        console.error('Error inserting pilgrim:', insertPilgrimError)
        return { success: false, error: insertPilgrimError.message }
      }
    }

    // 4. Catat ke activity_logs
    try {
      await adminSupabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'complete_profile',
        description: `Jamaah ${data.name.trim()} berhasil melengkapi data profil akun.`,
        properties: { nik: cleanNik, phone: cleanPhone, branch_id: branchId },
        created_at: new Date().toISOString(),
      })
    } catch (logErr) {
      console.warn('Non-blocking activity log error:', logErr)
    }

    revalidatePath('/dashboard')
    revalidatePath('/pilgrims')

    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error in completePilgrimProfile:', err)
    return { success: false, error: err.message || 'Terjadi kesalahan sistem saat menyimpan profil.' }
  }
}
