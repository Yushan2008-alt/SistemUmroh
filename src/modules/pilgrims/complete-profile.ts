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
  input: FormData | CompleteProfileInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' }
    }

    // Extract fields whether passed as FormData or plain object
    const isFormData = typeof (input as any)?.get === 'function'
    const name = String(isFormData ? (input as FormData).get('name') || '' : (input as CompleteProfileInput).name || '').trim()
    const rawPhone = String(isFormData ? (input as FormData).get('phone') || '' : (input as CompleteProfileInput).phone || '').trim()
    const gender = (isFormData ? ((input as FormData).get('gender') as Gender) : (input as CompleteProfileInput).gender) || 'male'
    const rawNik = String(isFormData ? (input as FormData).get('nik') || '' : (input as CompleteProfileInput).nik || '').trim()
    const birthPlace = String(isFormData ? (input as FormData).get('birth_place') || '' : (input as CompleteProfileInput).birth_place || '').trim()
    const birthDate = String(isFormData ? (input as FormData).get('birth_date') || '' : (input as CompleteProfileInput).birth_date || '').trim()
    const address = String(isFormData ? (input as FormData).get('address') || '' : (input as CompleteProfileInput).address || '').trim()
    const branchId = Number(isFormData ? (input as FormData).get('branch_id') : (input as CompleteProfileInput).branch_id) || 1
    const passportNumber = String(isFormData ? (input as FormData).get('passport_number') || '' : (input as CompleteProfileInput).passport_number || '').trim().toUpperCase()
    const passportExpiry = String(isFormData ? (input as FormData).get('passport_expiry') || '' : (input as CompleteProfileInput).passport_expiry || '').trim()
    const emergencyContactName = String(isFormData ? (input as FormData).get('emergency_contact_name') || '' : (input as CompleteProfileInput).emergency_contact_name || '').trim()
    const emergencyContactPhone = String(isFormData ? (input as FormData).get('emergency_contact_phone') || '' : (input as CompleteProfileInput).emergency_contact_phone || '').trim()

    const passportFile = isFormData ? ((input as FormData).get('passportFile') as File | null) : null
    const ktpFile = isFormData ? ((input as FormData).get('ktpFile') as File | null) : null

    // STRICT VALIDATION
    if (!name) {
      return { success: false, error: 'Nama Lengkap sesuai KTP wajib diisi.' }
    }

    const cleanPhone = rawPhone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: 'Nomor WhatsApp / Handphone wajib diisi minimal 10 digit.' }
    }

    const cleanNik = rawNik.replace(/\D/g, '')
    if (cleanNik.length !== 16) {
      return { success: false, error: 'Nomor NIK KTP wajib tepat 16 digit angka.' }
    }

    if (!birthPlace) {
      return { success: false, error: 'Tempat Lahir wajib diisi.' }
    }

    if (!birthDate) {
      return { success: false, error: 'Tanggal Lahir wajib diisi.' }
    }

    if (!address) {
      return { success: false, error: 'Alamat domisili lengkap wajib diisi.' }
    }

    if (!branchId) {
      return { success: false, error: 'Pilih salah satu kantor cabang pendaftaran.' }
    }

    if (!passportNumber) {
      return { success: false, error: 'Nomor Paspor wajib diisi.' }
    }

    if (!passportExpiry) {
      return { success: false, error: 'Masa berlaku paspor wajib diisi.' }
    }

    if (!emergencyContactName) {
      return { success: false, error: 'Nama kontak darurat keluarga wajib diisi.' }
    }

    const cleanEmerPhone = emergencyContactPhone.replace(/\D/g, '')
    if (!cleanEmerPhone || cleanEmerPhone.length < 10) {
      return { success: false, error: 'Nomor telepon kontak darurat wajib diisi minimal 10 digit.' }
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

    const userEmail = user.email || user.user_metadata?.email || ''

    // 2. Perbarui tabel profiles
    const { error: profileError } = await adminSupabase.from('profiles').upsert({
      id: user.id,
      email: userEmail,
      name,
      phone: rawPhone,
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

    const targetPilgrimId = existingPilgrim?.id || (existingNik && !existingNik.profile_id ? existingNik.id : null)

    const pilgrimPayload = {
      branch_id: branchId,
      profile_id: user.id,
      name,
      gender,
      nik: cleanNik,
      birth_place: birthPlace || null,
      birth_date: birthDate || null,
      phone: rawPhone,
      address,
      passport_number: passportNumber || null,
      passport_expiry: passportExpiry || null,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    let finalPilgrimId: number

    if (targetPilgrimId) {
      // Update data jamaah yang sudah ada (menghindari duplikasi NIK)
      const { error: updatePilgrimError } = await adminSupabase
        .from('pilgrims')
        .update(pilgrimPayload)
        .eq('id', targetPilgrimId)

      if (updatePilgrimError) {
        return { success: false, error: updatePilgrimError.message }
      }
      finalPilgrimId = targetPilgrimId
    } else {
      // Buat data jamaah baru dengan kode unik
      const prefix = `JM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`
      const randomSuffix = Math.floor(1000 + Math.random() * 9000)
      const generatedCode = `${prefix}-${randomSuffix}`

      const { data: insertedPilgrim, error: insertPilgrimError } = await adminSupabase
        .from('pilgrims')
        .insert({
          ...pilgrimPayload,
          code: generatedCode,
        })
        .select('id')
        .single()

      if (insertPilgrimError || !insertedPilgrim) {
        console.error('Error inserting pilgrim:', insertPilgrimError)
        return { success: false, error: insertPilgrimError?.message || 'Gagal menyimpan data jamaah.' }
      }
      finalPilgrimId = insertedPilgrim.id
    }

    // 4. Upload berkas Paspor & KTP jika dilampirkan
    const bucket = process.env.NEXT_PUBLIC_STORAGE_VAULT_BUCKET || 'documents'

    if (passportFile && passportFile.size > 0) {
      try {
        const ext = passportFile.name.split('.').pop() || 'jpg'
        const path = `pilgrims/${finalPilgrimId}/passport_${Date.now()}.${ext}`
        const buf = Buffer.from(await passportFile.arrayBuffer())
        await adminSupabase.storage.from(bucket).upload(path, buf, {
          contentType: passportFile.type,
          upsert: true,
        })

        const { data: existingDoc } = await adminSupabase
          .from('documents')
          .select('id')
          .eq('pilgrim_id', finalPilgrimId)
          .eq('type', 'passport')
          .maybeSingle()

        const docData = {
          pilgrim_id: finalPilgrimId,
          type: 'passport',
          label: 'Paspor Asli (Masa berlaku > 8 bulan)',
          file_path: path,
          original_name: passportFile.name,
          file_size: passportFile.size,
          status: 'uploaded',
          uploaded_at: new Date().toISOString(),
          note: 'Diunggah saat melengkapi profil jamaah',
        }

        if (existingDoc) {
          await adminSupabase.from('documents').update(docData).eq('id', existingDoc.id)
        } else {
          await adminSupabase.from('documents').insert(docData)
        }
      } catch (err: any) {
        console.error('Error saving passport document file:', err)
      }
    }

    if (ktpFile && ktpFile.size > 0) {
      try {
        const ext = ktpFile.name.split('.').pop() || 'jpg'
        const path = `pilgrims/${finalPilgrimId}/ktp_${Date.now()}.${ext}`
        const buf = Buffer.from(await ktpFile.arrayBuffer())
        await adminSupabase.storage.from(bucket).upload(path, buf, {
          contentType: ktpFile.type,
          upsert: true,
        })

        const { data: existingDoc } = await adminSupabase
          .from('documents')
          .select('id')
          .eq('pilgrim_id', finalPilgrimId)
          .eq('type', 'ktp')
          .maybeSingle()

        const docData = {
          pilgrim_id: finalPilgrimId,
          type: 'ktp',
          label: 'KTP Elektronik',
          file_path: path,
          original_name: ktpFile.name,
          file_size: ktpFile.size,
          status: 'uploaded',
          uploaded_at: new Date().toISOString(),
          note: 'Diunggah saat melengkapi profil jamaah',
        }

        if (existingDoc) {
          await adminSupabase.from('documents').update(docData).eq('id', existingDoc.id)
        } else {
          await adminSupabase.from('documents').insert(docData)
        }
      } catch (err: any) {
        console.error('Error saving KTP document file:', err)
      }
    }

    // 5. Catat ke activity_logs
    try {
      await adminSupabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'complete_profile',
        description: `Jamaah ${name} berhasil melengkapi data profil akun & dokumen.`,
        properties: { nik: cleanNik, phone: rawPhone, branch_id: branchId },
        created_at: new Date().toISOString(),
      })
    } catch (logErr) {
      console.warn('Non-blocking activity log error:', logErr)
    }

    revalidatePath('/dashboard')
    revalidatePath('/pilgrims')
    revalidatePath('/documents')

    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error in completePilgrimProfile:', err)
    return { success: false, error: err.message || 'Terjadi kesalahan sistem saat menyimpan profil.' }
  }
}
