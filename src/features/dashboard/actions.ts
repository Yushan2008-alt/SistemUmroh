'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface PilgrimDashboardData {
  authenticated: boolean
  user: {
    id: string
    email: string
    name: string
  } | null
  profile: any | null
  pilgrim: any | null
  registration: any | null
  payments: any[]
  documents: any[]
  manasikSchedules: any[]
  availablePackages: any[]
}

export async function getPilgrimDashboardData(): Promise<PilgrimDashboardData> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        authenticated: false,
        user: null,
        profile: null,
        pilgrim: null,
        registration: null,
        payments: [],
        documents: [],
        manasikSchedules: [],
        availablePackages: [],
      }
    }

    const admin = createAdminClient() as any

    // 1. Fetch Profile and Pilgrim record for current user
    const [profileRes, pilgrimRes] = await Promise.all([
      admin.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      admin.from('pilgrims').select('*').eq('profile_id', user.id).maybeSingle(),
    ])

    const profile = profileRes.data || null
    let pilgrim = pilgrimRes.data || null

    // If pilgrim record doesn't exist yet but profile exists, try to match by email/phone or create one
    if (!pilgrim && profile) {
      const { data: existingByPhone } = await admin
        .from('pilgrims')
        .select('*')
        .eq('phone', profile.phone || '')
        .maybeSingle()

      if (existingByPhone) {
        // Link to user profile
        await admin.from('pilgrims').update({ profile_id: user.id }).eq('id', existingByPhone.id)
        pilgrim = { ...existingByPhone, profile_id: user.id }
      }
    }

    const userName =
      pilgrim?.name ||
      profile?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Jamaah'

    // 2. Fetch Active Registration for this pilgrim
    let registration: any = null
    let payments: any[] = []
    let documents: any[] = []
    let manasikSchedules: any[] = []

    if (pilgrim?.id) {
      // Fetch latest active registration with package details
      const { data: reg } = await admin
        .from('registrations')
        .select(`
          *,
          packages (
            id,
            name,
            type,
            departure_date,
            return_date,
            duration_days,
            departure_city,
            price,
            airlines (id, name, code, transit),
            hotel_makkah:hotels!hotel_makkah_id (id, name, city, star_rating, distance_to_masjid),
            hotel_madinah:hotels!hotel_madinah_id (id, name, city, star_rating, distance_to_masjid)
          )
        `)
        .eq('pilgrim_id', pilgrim.id)
        .order('registered_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (reg) {
        registration = reg

        // Fetch payments for this registration
        const { data: payList } = await admin
          .from('payments')
          .select('*')
          .eq('registration_id', reg.id)
          .order('created_at', { ascending: true })

        payments = (payList || []).map((p: any) => ({
          ...p,
          amount: Number(p.amount) || 0,
          paid_amount: Number(p.paid_amount) || 0,
          remaining_balance: Math.max(0, (Number(p.amount) || 0) - (Number(p.paid_amount) || 0)),
        }))

        // Fetch manasik schedules for this package
        if (reg.package_id) {
          const { data: schedules } = await admin
            .from('manasik_schedules')
            .select('*')
            .eq('package_id', reg.package_id)
            .order('date', { ascending: true })

          manasikSchedules = schedules || []
        }
      }

      // Fetch documents for this pilgrim
      const { data: docs } = await admin
        .from('documents')
        .select('*')
        .eq('pilgrim_id', pilgrim.id)
        .order('id', { ascending: true })

      documents = docs || []
    }

    // 3. Fetch Available Published Packages for Package Selection
    const { data: pkgs } = await admin
      .from('packages')
      .select(`
        id,
        name,
        type,
        status,
        price,
        quota,
        duration_days,
        departure_date,
        return_date,
        departure_city,
        facility_included,
        airlines (name, code),
        hotel_makkah:hotels!hotel_makkah_id (name, city),
        hotel_madinah:hotels!hotel_madinah_id (name, city)
      `)
      .eq('status', 'published')
      .order('departure_date', { ascending: true })

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email || '',
        name: userName,
      },
      profile,
      pilgrim,
      registration,
      payments,
      documents,
      manasikSchedules,
      availablePackages: pkgs || [],
    }
  } catch (err: any) {
    console.error('getPilgrimDashboardData error:', err)
    return {
      authenticated: false,
      user: null,
      profile: null,
      pilgrim: null,
      registration: null,
      payments: [],
      documents: [],
      manasikSchedules: [],
      availablePackages: [],
    }
  }
}

/**
 * Register current pilgrim to a selected package directly from the dashboard
 */
export async function registerPilgrimToPackage(packageId: number): Promise<{
  success: boolean
  message: string
  registrationId?: number
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Sesi Anda telah berakhir. Silakan login kembali.' }
    }

    const admin = createAdminClient() as any

    // 1. Get or create pilgrim record
    let { data: pilgrim } = await admin
      .from('pilgrims')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!pilgrim) {
      const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
      if (!profile) {
        return { success: false, message: 'Data profil belum ditemukan. Lengkapi profil terlebih dahulu.' }
      }

      // Create new pilgrim
      const pilgrimCode = `PLG-${Date.now().toString().slice(-6)}`
      const { data: newPilgrim, error: pErr } = await admin
        .from('pilgrims')
        .insert({
          branch_id: profile.branch_id || 1,
          profile_id: user.id,
          name: profile.name || user.email?.split('@')[0],
          phone: profile.phone || '08123456789',
          gender: 'male',
          nik: '320101' + Date.now().toString().slice(-10),
          code: pilgrimCode,
          is_active: true,
        })
        .select()
        .single()

      if (pErr || !newPilgrim) {
        return { success: false, message: 'Gagal membuat akun jamaah: ' + (pErr?.message || '') }
      }
      pilgrim = newPilgrim
    }

    // 2. Fetch package info
    const { data: pkg, error: pkgErr } = await admin
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (pkgErr || !pkg) {
      return { success: false, message: 'Paket yang dipilih tidak ditemukan.' }
    }

    // 3. Create Registration
    const regCode = `REG-${Date.now().toString().slice(-6)}`
    const { data: newReg, error: regErr } = await admin
      .from('registrations')
      .insert({
        branch_id: pilgrim.branch_id || pkg.branch_id || 1,
        pilgrim_id: pilgrim.id,
        package_id: pkg.id,
        code: regCode,
        status: 'pending',
        total_price: pkg.price,
        registered_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (regErr || !newReg) {
      return { success: false, message: 'Gagal membuat pendaftaran: ' + (regErr?.message || '') }
    }

    // 4. Generate Initial DP Payment Invoice
    const dpAmount = Math.min(5000000, Number(pkg.price))
    const invoiceCode = `INV-DP-${newReg.code}`
    await admin.from('payments').insert({
      branch_id: newReg.branch_id,
      registration_id: newReg.id,
      code: invoiceCode,
      type: 'down_payment',
      amount: dpAmount,
      paid_amount: 0,
      status: 'unpaid',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })

    // If there is remaining balance, generate Pelunasan invoice
    const remainingBalance = Number(pkg.price) - dpAmount
    if (remainingBalance > 0) {
      const pelunasanCode = `INV-PELUNASAN-${newReg.code}`
      await admin.from('payments').insert({
        branch_id: newReg.branch_id,
        registration_id: newReg.id,
        code: pelunasanCode,
        type: 'settlement',
        amount: remainingBalance,
        paid_amount: 0,
        status: 'unpaid',
        due_date: pkg.departure_date
          ? new Date(new Date(pkg.departure_date).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null,
      })
    }

    // 5. Pre-seed 6 Required Document Checklist Slots
    const mandatoryDocs = [
      { type: 'passport', label: 'Paspor Asli (Masa berlaku > 8 bulan)' },
      { type: 'ktp', label: 'KTP Elektronik' },
      { type: 'kk', label: 'Kartu Keluarga (KK)' },
      { type: 'yellow_card', label: 'Buku Vaksin Meningitis (Buku Kuning)' },
      { type: 'photo', label: 'Pasfoto 4x6 Latar Belakang Putih' },
      { type: 'marriage_certificate', label: 'Buku Nikah / Akta Kelahiran' },
    ]

    const docInserts = mandatoryDocs.map((doc) => ({
      pilgrim_id: pilgrim.id,
      type: doc.type,
      label: doc.label,
      status: 'pending',
      note: 'Belum diunggah',
    }))

    await admin.from('documents').insert(docInserts)

    revalidatePath('/dashboard')
    revalidatePath('/payments')
    revalidatePath('/documents')
    revalidatePath('/registrations')

    return {
      success: true,
      message: `Alhamdulillah! Pendaftaran paket ${pkg.name} berhasil dibuat.`,
      registrationId: newReg.id,
    }
  } catch (err: any) {
    console.error('registerPilgrimToPackage error:', err)
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat mendaftar paket.' }
  }
}
