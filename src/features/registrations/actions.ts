'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RegistrationStatus } from '@/types/database.types'
import type { RegistrationListItem, RegistrationFormData } from './types'

export async function getRegistrations(params?: {
  status?: string
  package_id?: number
  search?: string
}): Promise<{ data: RegistrationListItem[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    let query = supabase
      .from('registrations')
      .select(`
        *,
        pilgrims (id, name, phone, passport_number, nik),
        packages (id, name, type, price, departure_date, duration_days, quota),
        branches (id, name, code),
        agents (id, name, code),
        guides (id, name),
        payments (id, code, type, amount, paid_amount, status, due_date, paid_at, method)
      `)
      .order('registered_at', { ascending: false })

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    if (params?.package_id && params.package_id > 0) {
      query = query.eq('package_id', params.package_id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching registrations:', error)
      return { data: [], error: error.message }
    }

    // Process payment summaries
    const items: RegistrationListItem[] = (data || []).map((row: any) => {
      const payments = row.payments || []
      const totalPaid = payments.reduce((acc: number, p: any) => acc + (Number(p.paid_amount) || 0), 0)
      const totalPrice = Number(row.total_price) || 0
      const remainingBalance = Math.max(0, totalPrice - totalPaid)

      let computedStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid'
      if (totalPaid >= totalPrice && totalPrice > 0) {
        computedStatus = 'paid'
      } else if (totalPaid > 0) {
        computedStatus = 'partial'
      }

      return {
        ...row,
        total_paid: totalPaid,
        remaining_balance: remainingBalance,
        computed_payment_status: computedStatus,
      }
    })

    // Filter by search query on client-side if provided
    let filteredItems = items
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim()
      filteredItems = items.filter(
        (item) =>
          item.code.toLowerCase().includes(q) ||
          item.pilgrims?.name.toLowerCase().includes(q) ||
          item.packages?.name.toLowerCase().includes(q)
      )
    }

    return { data: filteredItems }
  } catch (err: any) {
    console.error('Fatal getRegistrations error:', err)
    return { data: [], error: err.message }
  }
}

export async function getRegistrationDetail(id: number): Promise<{ data: RegistrationListItem | null; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        pilgrims (id, name, phone, passport_number, nik),
        packages (id, name, type, price, departure_date, duration_days, quota),
        branches (id, name, code),
        agents (id, name, code),
        guides (id, name),
        payments (id, code, type, amount, paid_amount, status, due_date, paid_at, method)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return { data: null, error: error?.message || 'Pendaftaran tidak ditemukan.' }
    }

    const row = data as any
    const payments = row.payments || []
    payments.sort((a: any, b: any) => new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime())

    const totalPaid = payments.reduce((acc: number, p: any) => acc + (Number(p.paid_amount) || 0), 0)
    const totalPrice = Number(row.total_price) || 0
    const remainingBalance = Math.max(0, totalPrice - totalPaid)

    let computedStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid'
    if (totalPaid >= totalPrice && totalPrice > 0) {
      computedStatus = 'paid'
    } else if (totalPaid > 0) {
      computedStatus = 'partial'
    }

    return {
      data: {
        ...row,
        payments,
        total_paid: totalPaid,
        remaining_balance: remainingBalance,
        computed_payment_status: computedStatus,
      },
    }
  } catch (err: any) {
    return { data: null, error: err.message }
  }
}

export async function getBookingFormOptions(): Promise<{
  pilgrims: any[]
  packages: any[]
  guides: any[]
}> {
  try {
    const supabase = createAdminClient() as any

    const [pilgrimsRes, packagesRes, guidesRes] = await Promise.all([
      supabase.from('pilgrims').select('id, name, nik, phone, passport_number, agent_id').eq('is_active', true).order('name'),
      supabase.from('packages').select('id, name, type, price, departure_date, quota, branch_id').eq('status', 'published').order('departure_date'),
      supabase.from('guides').select('id, name').eq('is_active', true).order('name'),
    ])

    const packagesList = (packagesRes.data || []) as any[]

    // Calculate remaining quota per package
    const packagesWithQuota = await Promise.all(
      packagesList.map(async (pkg: any) => {
        const { count } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('package_id', pkg.id)
          .neq('status', 'cancelled')

        const registeredCount = count || 0
        const remainingQuota = Math.max(0, (pkg.quota || 0) - registeredCount)

        return {
          ...pkg,
          remaining_quota: remainingQuota,
          is_full: remainingQuota <= 0,
        }
      })
    )

    return {
      pilgrims: (pilgrimsRes.data || []) as any[],
      packages: packagesWithQuota,
      guides: (guidesRes.data || []) as any[],
    }
  } catch (err) {
    console.error('Error fetching booking options:', err)
    return { pilgrims: [], packages: [], guides: [] }
  }
}

export async function createRegistration(formData: RegistrationFormData): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const admin = createAdminClient() as any

    // 1. Validasi keberadaan paket & kuota
    const { data: pkg, error: pkgErr } = await admin
      .from('packages')
      .select('id, name, price, quota, branch_id')
      .eq('id', formData.package_id)
      .single()

    if (pkgErr || !pkg) {
      return { success: false, error: 'Paket tidak ditemukan.' }
    }

    // Hitung kuota aktif yang sudah terdaftar
    const { count: activeCount } = await admin
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('package_id', pkg.id)
      .neq('status', 'cancelled')

    const remaining = (pkg.quota || 0) - (activeCount || 0)
    if (remaining <= 0) {
      return { success: false, error: 'Maaf, kuota untuk paket ini telah penuh.' }
    }

    // 2. Cek apakah jamaah sudah terdaftar pada paket ini
    const { data: existingReg } = await admin
      .from('registrations')
      .select('id')
      .eq('pilgrim_id', formData.pilgrim_id)
      .eq('package_id', formData.package_id)
      .maybeSingle()

    if (existingReg) {
      return { success: false, error: 'Jamaah ini sudah pernah didaftarkan pada paket yang sama.' }
    }

    // 3. Ambil data jamaah untuk afiliasi agen
    const { data: pilgrim } = await admin
      .from('pilgrims')
      .select('agent_id')
      .eq('id', formData.pilgrim_id)
      .single()

    // 4. Generate Kode Registrasi Unik
    const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString()
    const regCode = `REG-${randomSuffix}`

    const registrationPayload: any = {
      branch_id: pkg.branch_id,
      pilgrim_id: formData.pilgrim_id,
      package_id: formData.package_id,
      agent_id: pilgrim?.agent_id || null,
      guide_id: formData.guide_id || null,
      code: regCode,
      status: 'pending',
      total_price: pkg.price,
      registered_at: formData.registered_at || new Date().toISOString().split('T')[0],
      notes: formData.notes || null,
    }

    const { data: newReg, error: insertErr } = await admin
      .from('registrations')
      .insert(registrationPayload)
      .select()
      .single()

    if (insertErr || !newReg) {
      return { success: false, error: insertErr?.message || 'Gagal menyimpan pendaftaran.' }
    }

    // 5. Inisialisasi Tagihan Uang Muka (DP) default
    const dpAmount = Math.min(5000000, Number(pkg.price))
    await admin.from('payments').insert({
      branch_id: pkg.branch_id,
      registration_id: newReg.id,
      code: `${regCode}-DP`,
      type: 'down_payment',
      amount: dpAmount,
      paid_amount: 0,
      status: 'unpaid',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })

    // 6. Inisialisasi Komisi Agen (jika ada agen)
    if (pilgrim?.agent_id) {
      const { data: agent } = await admin.from('agents').select('commission_rate').eq('id', pilgrim.agent_id).single()
      if (agent) {
        const rate = Number(agent.commission_rate) || 0
        const commissionAmount = Math.round((Number(pkg.price) * rate) / 100)
        await admin.from('commissions').insert({
          branch_id: pkg.branch_id,
          agent_id: pilgrim.agent_id,
          registration_id: newReg.id,
          base_amount: pkg.price,
          rate: rate,
          amount: commissionAmount,
          status: 'pending',
        })
      }
    }

    revalidatePath('/registrations')
    revalidatePath('/dashboard')

    return { success: true, data: newReg }
  } catch (err: any) {
    console.error('Fatal createRegistration error:', err)
    return { success: false, error: err.message }
  }
}

export async function updateRegistration(
  id: number,
  payload: {
    guide_id?: number | null
    registered_at?: string
    notes?: string | null
    status?: RegistrationStatus
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient() as any

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }
    if (payload.guide_id !== undefined) updateData.guide_id = payload.guide_id
    if (payload.registered_at !== undefined) updateData.registered_at = payload.registered_at
    if (payload.notes !== undefined) updateData.notes = payload.notes
    if (payload.status !== undefined) updateData.status = payload.status

    const { error } = await admin.from('registrations').update(updateData).eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/registrations')
    revalidatePath(`/registrations/${id}`)
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateRegistrationStatus(
  id: number,
  status: RegistrationStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient() as any

    const { error } = await admin
      .from('registrations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/registrations')
    revalidatePath(`/registrations/${id}`)
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteRegistration(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient() as any

    const { error } = await admin.from('registrations').delete().eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/registrations')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
