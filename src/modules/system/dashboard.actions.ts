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

/**
 * Register current pilgrim to a package via 5-step wizard with room surcharge,
 * personal & emergency details, document uploads, and payment invoice generation.
 */
export async function registerPilgrimWithSteps(formData: FormData): Promise<{
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

    const packageId = Number(formData.get('packageId'))
    if (!packageId) {
      return { success: false, message: 'ID Paket tidak valid.' }
    }

    const roomType = (formData.get('roomType') as 'quad' | 'triple' | 'double') || 'quad'
    const name = String(formData.get('name') || '').trim()
    const nik = String(formData.get('nik') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const address = String(formData.get('address') || '').trim()
    const emergencyName = String(formData.get('emergencyName') || '').trim()
    const emergencyRelation = String(formData.get('emergencyRelation') || '').trim()
    const emergencyPhone = String(formData.get('emergencyPhone') || '').trim()
    const paymentScheme = (formData.get('paymentScheme') as 'dp_50' | 'full') || 'dp_50'
    const termsAccepted = formData.get('termsAccepted') === 'true'

    if (!termsAccepted) {
      return { success: false, message: 'Anda harus menyetujui Syarat & Ketentuan Keberangkatan.' }
    }

    const passportFile = formData.get('passportFile') as File | null
    const healthCertFile = formData.get('healthCertFile') as File | null

    if (!passportFile || passportFile.size === 0) {
      return { success: false, message: 'Berkas scan/foto Paspor wajib diunggah.' }
    }
    if (!healthCertFile || healthCertFile.size === 0) {
      return { success: false, message: 'Berkas Surat Kesehatan / Kartu Vaksin wajib diunggah.' }
    }

    const admin = createAdminClient() as any

    // 1. Get or create pilgrim record
    let { data: pilgrim } = await admin
      .from('pilgrims')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle()

    const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).maybeSingle()

    if (!pilgrim) {
      const pilgrimCode = `PLG-${Date.now().toString().slice(-6)}`
      const { data: newPilgrim, error: pErr } = await admin
        .from('pilgrims')
        .insert({
          branch_id: profile?.branch_id || 1,
          profile_id: user.id,
          name: name || profile?.name || user.email?.split('@')[0],
          phone: phone || profile?.phone || '08123456789',
          gender: 'male',
          nik: nik || '320101' + Date.now().toString().slice(-10),
          address: address || null,
          emergency_contact_name: emergencyName ? `${emergencyName} (${emergencyRelation})` : null,
          emergency_contact_phone: emergencyPhone || null,
          code: pilgrimCode,
          is_active: true,
        })
        .select()
        .single()

      if (pErr || !newPilgrim) {
        return { success: false, message: 'Gagal membuat data jamaah: ' + (pErr?.message || '') }
      }
      pilgrim = newPilgrim
    } else {
      // Update pilgrim details with submitted wizard data
      await admin
        .from('pilgrims')
        .update({
          name: name || pilgrim.name,
          nik: nik || pilgrim.nik,
          phone: phone || pilgrim.phone,
          address: address || pilgrim.address,
          emergency_contact_name: emergencyName ? `${emergencyName} (${emergencyRelation})` : pilgrim.emergency_contact_name,
          emergency_contact_phone: emergencyPhone || pilgrim.emergency_contact_phone,
        })
        .eq('id', pilgrim.id)
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

    // 3. Compute price with room upgrade
    const roomSurcharge = roomType === 'triple' ? 1500000 : roomType === 'double' ? 3000000 : 0
    const totalPrice = Number(pkg.price) + roomSurcharge

    // 4. Create or update registration
    const regCode = `REG-${Date.now().toString().slice(-6)}`
    const { data: newReg, error: regErr } = await admin
      .from('registrations')
      .insert({
        branch_id: pilgrim.branch_id || pkg.branch_id || 1,
        pilgrim_id: pilgrim.id,
        package_id: pkg.id,
        code: regCode,
        status: 'confirmed',
        total_price: totalPrice,
        notes: `Tipe Kamar: ${roomType.toUpperCase()} (+Rp ${roomSurcharge.toLocaleString('id-ID')}) | Skema Pembayaran: ${paymentScheme === 'dp_50' ? 'Uang Muka 50%' : 'Langsung Lunas 100%'}`,
        registered_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (regErr || !newReg) {
      return { success: false, message: 'Gagal membuat pendaftaran: ' + (regErr?.message || '') }
    }

    // 5. Generate Invoices
    if (paymentScheme === 'dp_50') {
      const dpAmount = Math.round(totalPrice * 0.5)
      const settlementAmount = totalPrice - dpAmount

      // DP Invoice
      await admin.from('payments').insert({
        branch_id: newReg.branch_id,
        registration_id: newReg.id,
        code: `INV-DP-${newReg.code}`,
        type: 'down_payment',
        amount: dpAmount,
        paid_amount: 0,
        status: 'unpaid',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })

      // Settlement Invoice
      await admin.from('payments').insert({
        branch_id: newReg.branch_id,
        registration_id: newReg.id,
        code: `INV-PELUNASAN-${newReg.code}`,
        type: 'installment',
        amount: settlementAmount,
        paid_amount: 0,
        status: 'unpaid',
        due_date: pkg.departure_date
          ? new Date(new Date(pkg.departure_date).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    } else {
      // Full Payment Invoice (100%)
      await admin.from('payments').insert({
        branch_id: newReg.branch_id,
        registration_id: newReg.id,
        code: `INV-LUNAS-${newReg.code}`,
        type: 'full_payment',
        amount: totalPrice,
        paid_amount: 0,
        status: 'unpaid',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    }

    // 6. Pre-seed 6 Standard Documents and attach uploaded files
    const mandatoryDocs = [
      { type: 'passport', label: 'Paspor Asli (Masa berlaku > 8 bulan)' },
      { type: 'ktp', label: 'KTP Elektronik' },
      { type: 'kk', label: 'Kartu Keluarga (KK)' },
      { type: 'yellow_card', label: 'Buku Vaksin Meningitis / Surat Kesehatan' },
      { type: 'photo', label: 'Pasfoto 4x6 Latar Belakang Putih' },
      { type: 'marriage_certificate', label: 'Buku Nikah / Akta Kelahiran' },
    ]

    const { data: existingDocs } = await admin
      .from('documents')
      .select('id, type')
      .eq('pilgrim_id', pilgrim.id)

    const existingTypes = new Set((existingDocs || []).map((d: any) => d.type))
    const docsToInsert = mandatoryDocs
      .filter((d) => !existingTypes.has(d.type))
      .map((doc) => ({
        pilgrim_id: pilgrim.id,
        type: doc.type,
        label: doc.label,
        status: 'pending',
        note: 'Belum diunggah',
      }))

    if (docsToInsert.length > 0) {
      await admin.from('documents').insert(docsToInsert)
    }

    // Upload Passport file
    if (passportFile && passportFile.size > 0) {
      try {
        const ext = passportFile.name.split('.').pop() || 'jpg'
        const path = `pilgrims/${pilgrim.id}/passport_${Date.now()}.${ext}`
        const buf = Buffer.from(await passportFile.arrayBuffer())
        await admin.storage.from('documents-vault').upload(path, buf, {
          contentType: passportFile.type,
          upsert: true,
        })
        await admin
          .from('documents')
          .update({
            file_path: path,
            original_name: passportFile.name,
            file_size: passportFile.size,
            status: 'uploaded',
            uploaded_at: new Date().toISOString(),
            note: 'Diunggah saat pendaftaran paket',
          })
          .eq('pilgrim_id', pilgrim.id)
          .eq('type', 'passport')
      } catch (uploadErr) {
        console.error('Error uploading passport during wizard:', uploadErr)
      }
    }

    // Upload Health/Vaccine Certificate file
    if (healthCertFile && healthCertFile.size > 0) {
      try {
        const ext = healthCertFile.name.split('.').pop() || 'jpg'
        const path = `pilgrims/${pilgrim.id}/yellow_card_${Date.now()}.${ext}`
        const buf = Buffer.from(await healthCertFile.arrayBuffer())
        await admin.storage.from('documents-vault').upload(path, buf, {
          contentType: healthCertFile.type,
          upsert: true,
        })
        await admin
          .from('documents')
          .update({
            file_path: path,
            original_name: healthCertFile.name,
            file_size: healthCertFile.size,
            status: 'uploaded',
            uploaded_at: new Date().toISOString(),
            note: 'Diunggah saat pendaftaran paket',
          })
          .eq('pilgrim_id', pilgrim.id)
          .eq('type', 'yellow_card')
      } catch (uploadErr) {
        console.error('Error uploading health certificate during wizard:', uploadErr)
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/payments')
    revalidatePath('/documents')
    revalidatePath('/registrations')

    return {
      success: true,
      message: `Alhamdulillah! Pendaftaran paket ${pkg.name} berhasil diverifikasi dan dikonfirmasi.`,
      registrationId: newReg.id,
    }
  } catch (err: any) {
    console.error('registerPilgrimWithSteps error:', err)
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat memproses pendaftaran paket.' }
  }
}


// ============================================================================
// STAFF DASHBOARD REAL-TIME DATA (SUPER ADMIN & ADMIN CABANG)
// ============================================================================

export interface StaffDashboardData {
  branchId: number | null
  branchName: string
  totalPilgrims: number
  activeRegistrations: number
  totalRevenue: number
  outstandingBalance: number
  paymentStatusData: Array<{ name: string; value: number; color: string; count: number }>
  monthlyRegistrations: Array<{ month: string; jamaah: number }>
  packageDistribution: Array<{ name: string; fullName: string; terisi: number; kuota: number; percent: number }>
  upcomingDepartures: Array<{
    id: number
    name: string
    departureDate: string
    daysLeft: number
    airline: string
    booked: number
    quota: number
    status: string
  }>
  lastUpdated: string
}

export async function getStaffDashboardData(branchId?: number | null): Promise<StaffDashboardData> {
  try {
    const admin = createAdminClient() as any
    const activeBranchId = (branchId && branchId > 0) ? branchId : null

    // Fetch branch name if filtered
    let branchName = 'Semua Cabang (Global)'
    if (activeBranchId) {
      const { data: b } = await admin.from('branches').select('name').eq('id', activeBranchId).maybeSingle()
      if (b?.name) branchName = b.name
    }

    // 1. Total Pilgrims
    let pilgrimsQuery = admin.from('pilgrims').select('id, branch_id', { count: 'exact' })
    if (activeBranchId) pilgrimsQuery = pilgrimsQuery.eq('branch_id', activeBranchId)
    const { count: totalPilgrimsCount } = await pilgrimsQuery

    // 2. Active Registrations & Monthly Trend
    let regQuery = admin.from('registrations').select('id, branch_id, registered_at, status, total_price')
    if (activeBranchId) regQuery = regQuery.eq('branch_id', activeBranchId)
    const { data: regList } = await regQuery

    const activeRegs = (regList || []).filter((r: any) => r.status !== 'cancelled')
    const activeRegistrationsCount = activeRegs.length

    // Calculate monthly registrations (12 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const monthCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 };
    
    (regList || []).forEach((r: any) => {
      if (r.registered_at) {
        const d = new Date(r.registered_at)
        const m = d.getMonth()
        monthCounts[m] = (monthCounts[m] || 0) + 1
      }
    })

    const monthlyRegistrations = monthNames.map((name, idx) => ({
      month: name,
      jamaah: monthCounts[idx] || 0,
    }))

    // 3. Payments (Revenue, Outstanding, and Status Breakdown)
    let payQuery = admin.from('payments').select('id, branch_id, amount, paid_amount, status')
    if (activeBranchId) payQuery = payQuery.eq('branch_id', activeBranchId)
    const { data: payList } = await payQuery

    let totalRevenue = 0
    let outstandingBalance = 0
    let paidCount = 0
    let partialCount = 0
    let unpaidCount = 0

    ;(payList || []).forEach((p: any) => {
      const amt = Number(p.amount) || 0
      const paid = Number(p.paid_amount) || 0
      totalRevenue += paid

      if (p.status === 'paid') {
        paidCount++
      } else if (p.status === 'partial') {
        partialCount++
        outstandingBalance += Math.max(0, amt - paid)
      } else {
        unpaidCount++
        outstandingBalance += Math.max(0, amt - paid)
      }
    })

    const totalPayDocs = (payList || []).length || 1
    const paymentStatusData = [
      { name: 'Lunas', value: Math.round((paidCount / totalPayDocs) * 100), color: '#059669', count: paidCount },
      { name: 'Sebagian (Cicil)', value: Math.round((partialCount / totalPayDocs) * 100), color: '#d97706', count: partialCount },
      { name: 'Belum Bayar', value: Math.round((unpaidCount / totalPayDocs) * 100), color: '#ef4444', count: unpaidCount },
    ]

    // 4. Packages with Quota Occupancy & Upcoming Departures
    let pkgQuery = admin
      .from('packages')
      .select(`
        id,
        branch_id,
        name,
        type,
        status,
        quota,
        departure_date,
        airlines (name, code),
        hotel_makkah:hotels!hotel_makkah_id (name, city),
        registrations (id, status)
      `)
      .order('departure_date', { ascending: true })

    if (activeBranchId) pkgQuery = pkgQuery.eq('branch_id', activeBranchId)
    const { data: pkgList } = await pkgQuery

    const packageDistribution = (pkgList || []).map((p: any) => {
      const activeRegsForPkg = (p.registrations || []).filter((r: any) => r.status !== 'cancelled').length
      const q = Number(p.quota) || 1
      const shortName = p.name.length > 16 ? p.name.slice(0, 14) + '...' : p.name
      return {
        name: shortName,
        fullName: p.name,
        terisi: activeRegsForPkg,
        kuota: q,
        percent: Math.min(100, Math.round((activeRegsForPkg / q) * 100)),
      }
    })

    const now = Date.now()
    const upcomingDepartures = (pkgList || []).map((p: any) => {
      const depTime = new Date(p.departure_date).getTime()
      const daysLeft = Math.ceil((depTime - now) / (1000 * 60 * 60 * 24))
      const activeRegsForPkg = (p.registrations || []).filter((r: any) => r.status !== 'cancelled').length

      return {
        id: p.id,
        name: p.name,
        departureDate: p.departure_date ? new Date(p.departure_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        daysLeft: Math.max(0, daysLeft),
        airline: p.airlines?.name || 'Saudia Airlines',
        booked: activeRegsForPkg,
        quota: Number(p.quota) || 0,
        status: p.status === 'published' ? 'confirmed' : 'pending',
      }
    })

    return {
      branchId: activeBranchId,
      branchName,
      totalPilgrims: totalPilgrimsCount || 0,
      activeRegistrations: activeRegistrationsCount,
      totalRevenue,
      outstandingBalance,
      paymentStatusData,
      monthlyRegistrations,
      packageDistribution,
      upcomingDepartures,
      lastUpdated: new Date().toISOString(),
    }
  } catch (err: any) {
    console.error('getStaffDashboardData error:', err)
    return {
      branchId: branchId || null,
      branchName: 'Semua Cabang',
      totalPilgrims: 0,
      activeRegistrations: 0,
      totalRevenue: 0,
      outstandingBalance: 0,
      paymentStatusData: [
        { name: 'Lunas', value: 0, color: '#059669', count: 0 },
        { name: 'Sebagian (Cicil)', value: 0, color: '#d97706', count: 0 },
        { name: 'Belum Bayar', value: 0, color: '#ef4444', count: 0 },
      ],
      monthlyRegistrations: [],
      packageDistribution: [],
      upcomingDepartures: [],
      lastUpdated: new Date().toISOString(),
    }
  }
}

// ============================================================================
// AGENT DASHBOARD REAL-TIME DATA
// ============================================================================

export interface AgentDashboardData {
  agentName: string
  referralCode: string
  commissionRate: number
  totalCommissionEarned: number
  paidCommission: number
  pendingCommission: number
  totalReferrals: number
  activeReferrals: number
  commissionMonthly: Array<{ month: string; komisi: number }>
  referralPaymentStatus: Array<{ name: string; value: number; color: string }>
  recentReferrals: Array<{
    id: number
    name: string
    packageName: string
    registeredAt: string
    totalPrice: number
    commissionAmount: number
    status: string
  }>
  announcements: Array<{
    id: number
    title: string
    body: string
    publishAt: string
    audience: string
  }>
}

export async function getAgentDashboardData(): Promise<AgentDashboardData> {
  try {
    const admin = createAdminClient() as any
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Find agent record (by profile_id, email, or demo fallback)
    let agent: any = null
    if (user) {
      const { data: a } = await admin.from('agents').select('*').eq('profile_id', user.id).maybeSingle()
      if (a) {
        agent = a
      } else if (user.email) {
        const { data: byEmail } = await admin.from('agents').select('*').eq('email', user.email).maybeSingle()
        agent = byEmail
      }
    }

    if (!agent) {
      const { data: firstAgent } = await admin.from('agents').select('*').order('id', { ascending: true }).limit(1).maybeSingle()
      agent = firstAgent || { id: 1, name: 'Mitra Agen', code: 'AGN-001', commission_rate: 5, branch_id: 1 }
    }

    const agentId = agent.id || 1
    const commissionRate = Number(agent.commission_rate) || 5

    // 2. Fetch real commissions from Supabase
    const { data: comms } = await admin
      .from('commissions')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true })

    let totalCommissionEarned = 0
    let paidCommission = 0
    let pendingCommission = 0

    const monthlyMap: Record<string, number> = {}
    const monthsList: string[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const mLabel = d.toLocaleDateString('id-ID', { month: 'short' })
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyMap[mKey] = 0
      monthsList.push(mKey)
    }

    ;(comms || []).forEach((c: any) => {
      const amt = Number(c.amount) || 0
      totalCommissionEarned += amt
      if (c.status === 'paid') {
        paidCommission += amt
      } else if (c.status !== 'cancelled') {
        pendingCommission += amt
      }

      if (c.created_at) {
        const dateKey = c.created_at.substring(0, 7)
        if (monthlyMap[dateKey] !== undefined) {
          monthlyMap[dateKey] += amt
        }
      }
    })

    const commissionMonthly = monthsList.map((key) => {
      const [year, month] = key.split('-')
      const d = new Date(Number(year), Number(month) - 1, 1)
      const label = d.toLocaleDateString('id-ID', { month: 'short' })
      return {
        month: label,
        komisi: monthlyMap[key] || 0,
      }
    })

    // If commissionMonthly has all 0s, show at least current total on latest month
    if (totalCommissionEarned > 0 && commissionMonthly.every((m) => m.komisi === 0)) {
      commissionMonthly[commissionMonthly.length - 1].komisi = totalCommissionEarned
    }

    // 3. Fetch referred pilgrims & registrations
    const [pilgrimsRes, regsRes, announcementsRes] = await Promise.all([
      admin.from('pilgrims').select('id, name, created_at').eq('agent_id', agentId),
      admin
        .from('registrations')
        .select(`
          id,
          code,
          status,
          total_price,
          registered_at,
          pilgrim_id,
          pilgrims (id, name),
          packages (id, name, price),
          payments (id, status, amount, paid_amount)
        `)
        .eq('agent_id', agentId)
        .order('registered_at', { ascending: false }),
      admin
        .from('announcements')
        .select('id, title, body, publish_at, audience, branch_id')
        .eq('is_published', true)
        .order('publish_at', { ascending: false })
        .limit(6),
    ])

    const totalReferrals = (pilgrimsRes.data || []).length
    const registrations = regsRes.data || []

    let activeReferrals = 0
    let countPaidInvoices = 0
    let countPartialInvoices = 0
    let countUnpaidInvoices = 0

    const recentReferrals: any[] = []

    registrations.forEach((r: any) => {
      if (r.status !== 'cancelled') activeReferrals++

      const price = Number(r.total_price) || Number(r.packages?.price) || 0
      const calculatedComm = Math.round((price * commissionRate) / 100)

      recentReferrals.push({
        id: r.id,
        name: r.pilgrims?.name || 'Jamaah',
        packageName: r.packages?.name || 'Paket Umroh',
        registeredAt: r.registered_at
          ? new Date(r.registered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          : '-',
        totalPrice: price,
        commissionAmount: calculatedComm,
        status: r.status,
      })

      // Aggregate payment statuses from real payments
      const payments = r.payments || []
      payments.forEach((pay: any) => {
        if (pay.status === 'paid') countPaidInvoices++
        else if (pay.status === 'partial') countPartialInvoices++
        else countUnpaidInvoices++
      })
    })

    const referralPaymentStatus = [
      { name: 'Lunas', value: countPaidInvoices, color: '#059669' },
      { name: 'Cicilan Berjalan', value: countPartialInvoices, color: '#d97706' },
      { name: 'Belum Bayar', value: countUnpaidInvoices, color: '#ef4444' },
    ]

    // Filter announcements for agents (all or agents/agent, and matching branch or global)
    const announcements = (announcementsRes.data || [])
      .filter((a: any) => {
        const aud = a.audience
        const isAudienceMatch = aud === 'all' || aud === 'agents' || aud === 'agent'
        const isBranchMatch = !a.branch_id || !agent.branch_id || a.branch_id === agent.branch_id
        return isAudienceMatch && isBranchMatch
      })
      .map((a: any) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        publishAt: a.publish_at
          ? new Date(a.publish_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          : '-',
        audience: a.audience,
      }))

    return {
      agentName: agent.name || 'Mitra Agen',
      referralCode: agent.code || 'AGN-001',
      commissionRate,
      totalCommissionEarned,
      paidCommission,
      pendingCommission,
      totalReferrals,
      activeReferrals,
      commissionMonthly,
      referralPaymentStatus,
      recentReferrals: recentReferrals.slice(0, 10),
      announcements,
    }
  } catch (err: any) {
    console.error('getAgentDashboardData error:', err)
    return {
      agentName: 'Mitra Agen',
      referralCode: 'AGN-001',
      commissionRate: 5,
      totalCommissionEarned: 0,
      paidCommission: 0,
      pendingCommission: 0,
      totalReferrals: 0,
      activeReferrals: 0,
      commissionMonthly: [],
      referralPaymentStatus: [],
      recentReferrals: [],
      announcements: [],
    }
  }
}

// ============================================================================
// GUIDE DASHBOARD REAL-TIME DATA
// ============================================================================

export interface GuideDashboardData {
  guideName: string
  phone: string
  totalPilgrims: number
  activeSchedulesCount: number
  completedSchedulesCount: number
  schedules: any[]
  pilgrims: Array<{
    id: number
    name: string
    phone: string
    city: string
    packageName: string
    passportStatus: string
  }>
}

export async function getGuideDashboardData(): Promise<GuideDashboardData> {
  try {
    const admin = createAdminClient() as any
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let guide: any = null
    if (user) {
      const { data: g } = await admin.from('guides').select('*').eq('profile_id', user.id).maybeSingle()
      guide = g
    }

    if (!guide) {
      const { data: firstGuide } = await admin.from('guides').select('*').limit(1).maybeSingle()
      guide = firstGuide || { name: 'Muthawwif Pembimbing', phone: '08123456789' }
    }

    // Fetch schedules assigned to this guide
    let schedQuery = admin
      .from('manasik_schedules')
      .select(`
        *,
        packages (name, departure_date)
      `)
      .order('date', { ascending: true })

    if (guide?.id) {
      schedQuery = schedQuery.eq('guide_id', guide.id)
    } else {
      // If no guide record exists, empty list
      schedQuery = schedQuery.eq('id', -1)
    }
    const { data: schedList } = await schedQuery

    const todayStr = new Date().toISOString().split('T')[0]
    const activeSchedules = (schedList || []).filter((s: any) => !s.date || s.date >= todayStr)
    const completedSchedules = (schedList || []).filter((s: any) => s.date && s.date < todayStr)

    // Fetch pilgrims under guidance (registrations where guide_id = guide.id)
    let formattedPilgrims: any[] = []
    let totalGuidedPilgrims = 0

    if (guide?.id) {
      const { data: guidedRegs } = await admin
        .from('registrations')
        .select(`
          id,
          status,
          packages (name),
          pilgrims (
            id,
            name,
            phone,
            birth_place,
            documents (type, status)
          )
        `)
        .eq('guide_id', guide.id)
        .neq('status', 'cancelled')
        .limit(30)

      totalGuidedPilgrims = (guidedRegs || []).length

      // Fallback: if no registrations have explicit guide_id, check registrations in guide's scheduled packages
      if (totalGuidedPilgrims === 0 && schedList && schedList.length > 0) {
        const packageIds = schedList.map((s: any) => s.package_id).filter(Boolean)
        if (packageIds.length > 0) {
          const { data: pkgRegs } = await admin
            .from('registrations')
            .select(`
              id,
              status,
              packages (name),
              pilgrims (
                id,
                name,
                phone,
                birth_place,
                documents (type, status)
              )
            `)
            .in('package_id', packageIds)
            .neq('status', 'cancelled')
            .limit(30)

          if (pkgRegs && pkgRegs.length > 0) {
            totalGuidedPilgrims = pkgRegs.length
            formattedPilgrims = pkgRegs.map((r: any) => {
              const p = r.pilgrims
              if (!p) return null
              const hasPassport = (p.documents || []).some(
                (d: any) => d.type === 'passport' && d.status === 'verified'
              )
              return {
                id: p.id,
                name: p.name,
                phone: p.phone || '-',
                city: p.birth_place || 'Indonesia',
                packageName: r.packages?.name || 'Paket Umroh',
                passportStatus: hasPassport ? 'Terverifikasi' : 'Proses Berkas',
              }
            }).filter(Boolean)
          }
        }
      } else {
        formattedPilgrims = (guidedRegs || []).map((r: any) => {
          const p = r.pilgrims
          if (!p) return null
          const hasPassport = (p.documents || []).some(
            (d: any) => d.type === 'passport' && d.status === 'verified'
          )
          return {
            id: p.id,
            name: p.name,
            phone: p.phone || '-',
            city: p.birth_place || 'Indonesia',
            packageName: r.packages?.name || 'Paket Umroh',
            passportStatus: hasPassport ? 'Terverifikasi' : 'Proses Berkas',
          }
        }).filter(Boolean)
      }
    }

    return {
      guideName: guide.name || 'Muthawwif',
      phone: guide.phone || '-',
      totalPilgrims: totalGuidedPilgrims,
      activeSchedulesCount: activeSchedules.length,
      completedSchedulesCount: completedSchedules.length,
      schedules: schedList || [],
      pilgrims: formattedPilgrims,
    }
  } catch (err: any) {
    console.error('getGuideDashboardData error:', err)
    return {
      guideName: 'Muthawwif',
      phone: '-',
      totalPilgrims: 0,
      activeSchedulesCount: 0,
      completedSchedulesCount: 0,
      schedules: [],
      pilgrims: [],
    }
  }
}
