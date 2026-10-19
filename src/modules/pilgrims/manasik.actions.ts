'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AttendanceStatus, Role } from '@/types/database.types'
import type {
  ManasikScheduleItem,
  ManasikFormData,
  ManasikFormDataOptions,
  PilgrimAttendanceItem,
} from './types'

export async function getManasikSchedules(
  search?: string
): Promise<{ data: ManasikScheduleItem[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    let userRole: Role = 'super_admin'
    let userBranchId: number | null = null

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, branch_id')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        userRole = profile.role as Role
        userBranchId = profile.branch_id
      }
    }

    let query = supabase
      .from('manasik_schedules')
      .select(`
        *,
        packages (id, name),
        guides (id, name, phone),
        branches (id, name),
        manasik_attendances (id, pilgrim_id, status, recorded_by)
      `)
      .order('date', { ascending: false })

    // Role-based visibility scoping
    if (userRole === 'guide' && user) {
      // Guide: only schedules assigned to this guide
      const { data: guideRecord } = await supabase
        .from('guides')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (guideRecord?.id) {
        query = query.eq('guide_id', guideRecord.id)
      } else {
        // No guide linked, return empty list
        return { data: [] }
      }
    } else if (userRole === 'agent' && user) {
      // Agent: active schedules in agent's branch
      if (userBranchId) {
        query = query.eq('branch_id', userBranchId)
      }
    } else if (userRole === 'pilgrim' && user) {
      // Pilgrim: schedules for packages the pilgrim is registered for
      const { data: pilgrimRecord } = await supabase
        .from('pilgrims')
        .select('id, branch_id')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (pilgrimRecord) {
        const { data: pilgrimRegs } = await supabase
          .from('registrations')
          .select('package_id')
          .eq('pilgrim_id', pilgrimRecord.id)
          .neq('status', 'cancelled')

        const registeredPkgIds = (pilgrimRegs || [])
          .map((r: any) => r.package_id)
          .filter(Boolean)

        if (registeredPkgIds.length > 0) {
          // Allow package schedules or branch-wide schedules for pilgrim's branch
          query = query.or(
            `package_id.in.(${registeredPkgIds.join(',')}),and(package_id.is.null,branch_id.eq.${pilgrimRecord.branch_id})`
          )
        } else {
          // No active packages, show only general branch manasik if any
          query = query.is('package_id', null).eq('branch_id', pilgrimRecord.branch_id)
        }
      } else {
        return { data: [] }
      }
    } else if (userRole === 'admin') {
      // Admin: schedules in admin's branch
      if (userBranchId) {
        query = query.eq('branch_id', userBranchId)
      }
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`
      query = query.or(`title.ilike.${term},location.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching manasik schedules:', error)
      return { data: [], error: error.message }
    }

    const items: ManasikScheduleItem[] = (data || []).map((row: any) => ({
      ...row,
      package: row.packages || null,
      attendances: row.manasik_attendances || [],
      attendances_count: (row.manasik_attendances || []).filter(
        (a: any) => a.status === 'present'
      ).length,
    }))

    return { data: items }
  } catch (err: any) {
    console.error('Unexpected error fetching manasik schedules:', err)
    return { data: [], error: err.message || 'Gagal memuat jadwal manasik' }
  }
}

export async function getManasikFormData(): Promise<ManasikFormDataOptions> {
  const supabase = createAdminClient() as any

  const [packagesRes, guidesRes, branchesRes] = await Promise.all([
    supabase.from('packages').select('id, name, branch_id').order('name'),
    supabase.from('guides').select('id, name, phone').eq('is_active', true).order('name'),
    supabase.from('branches').select('id, name').eq('is_active', true).order('name'),
  ])

  return {
    packages: packagesRes.data || [],
    guides: guidesRes.data || [],
    branches: branchesRes.data || [],
  }
}

export async function getManasikScheduleById(
  id: number
): Promise<{
  schedule: any | null
  pilgrims: PilgrimAttendanceItem[]
  rekap: { present: number; absent: number; excused: number; sick: number }
  error?: string
}> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    // 1. Ambil detail jadwal
    const { data: schedule, error: schedError } = await supabase
      .from('manasik_schedules')
      .select(`
        *,
        packages (id, name, type, departure_date),
        guides (id, name, phone, email),
        branches (id, name)
      `)
      .eq('id', id)
      .single()

    if (schedError || !schedule) {
      return {
        schedule: null,
        pilgrims: [],
        rekap: { present: 0, absent: 0, excused: 0, sick: 0 },
        error: schedError?.message || 'Jadwal manasik tidak ditemukan',
      }
    }

    // 2. Ambil seluruh jamaah eligible:
    // Eligible = registrasi aktif (status != 'cancelled') pada paket terkait,
    // ATAU seluruh registrasi aktif cabang jika jadwal tanpa paket.
    let regsQuery = supabase
      .from('registrations')
      .select(`
        id,
        status,
        pilgrims (id, name, gender, phone)
      `)
      .neq('status', 'cancelled')

    if (schedule.package_id) {
      regsQuery = regsQuery.eq('package_id', schedule.package_id)
    } else {
      regsQuery = regsQuery.eq('branch_id', schedule.branch_id)
    }

    const { data: regs, error: regsError } = await regsQuery

    if (regsError) {
      console.error('Error fetching eligible registrations:', regsError)
    }

    // Dedup pilgrims by pilgrim_id
    const eligiblePilgrimsMap = new Map<number, { id: number; name: string; gender: any; phone: string }>()
    ;(regs || []).forEach((r: any) => {
      if (r.pilgrims && r.pilgrims.id && !eligiblePilgrimsMap.has(r.pilgrims.id)) {
        eligiblePilgrimsMap.set(r.pilgrims.id, {
          id: r.pilgrims.id,
          name: r.pilgrims.name,
          gender: r.pilgrims.gender,
          phone: r.pilgrims.phone || '-',
        })
      }
    })

    // 3. Ambil absensi yang sudah ada di database
    const { data: attendances } = await supabase
      .from('manasik_attendances')
      .select('pilgrim_id, status, recorded_by, updated_at')
      .eq('manasik_schedule_id', id)

    const attendanceMap = new Map<number, { status: AttendanceStatus; recorded_by?: string; updated_at?: string }>()
    ;(attendances || []).forEach((att: any) => {
      attendanceMap.set(att.pilgrim_id, {
        status: att.status as AttendanceStatus,
        recorded_by: att.recorded_by,
        updated_at: att.updated_at,
      })
    })

    const pilgrimsList: PilgrimAttendanceItem[] = []
    const rekap = { present: 0, absent: 0, excused: 0, sick: 0 }

    // 4. Gabungkan jamaah eligible dengan status kehadiran
    // Default absent bila belum dicatat di database
    eligiblePilgrimsMap.forEach((pilgrim) => {
      const recorded = attendanceMap.get(pilgrim.id)
      const currentStatus: AttendanceStatus = recorded ? recorded.status : 'absent'

      if (currentStatus === 'present') rekap.present += 1
      else if (currentStatus === 'excused') rekap.excused += 1
      else if (currentStatus === 'sick') rekap.sick += 1
      else rekap.absent += 1

      pilgrimsList.push({
        pilgrim_id: pilgrim.id,
        name: pilgrim.name,
        gender: pilgrim.gender,
        phone: pilgrim.phone,
        status: currentStatus,
        recorded_by: recorded?.recorded_by || null,
        updated_at: recorded?.updated_at,
      })
    })

    // Sort by name A-Z
    pilgrimsList.sort((a, b) => a.name.localeCompare(b.name))

    return {
      schedule: {
        ...schedule,
        package: schedule.packages || null,
      },
      pilgrims: pilgrimsList,
      rekap,
    }
  } catch (err: any) {
    console.error('Unexpected error fetching manasik schedule by id:', err)
    return {
      schedule: null,
      pilgrims: [],
      rekap: { present: 0, absent: 0, excused: 0, sick: 0 },
      error: err.message || 'Gagal memuat detail jadwal manasik',
    }
  }
}

export async function createManasikSchedule(
  data: ManasikFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi login tidak valid' }
    }

    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (creatorProfile?.role !== 'super_admin' && creatorProfile?.role !== 'admin') {
      return { success: false, error: 'Akses ditolak: Hanya staf yang dapat membuat jadwal manasik' }
    }

    let finalBranchId = Number(data.branch_id)
    if (creatorProfile.role === 'admin' && creatorProfile.branch_id) {
      finalBranchId = creatorProfile.branch_id
    }

    const { error } = await supabase.from('manasik_schedules').insert({
      branch_id: finalBranchId,
      package_id: data.package_id ? Number(data.package_id) : null,
      guide_id: data.guide_id ? Number(data.guide_id) : null,
      title: data.title.trim(),
      date: data.date,
      time: data.time,
      location: data.location.trim(),
      description: data.description?.trim() || null,
    })

    if (error) {
      console.error('Error creating manasik schedule:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/manasik')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error creating manasik schedule:', err)
    return { success: false, error: err.message || 'Gagal membuat jadwal manasik' }
  }
}

export async function updateManasikSchedule(
  id: number,
  data: ManasikFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi login tidak valid' }
    }

    const { data: updaterProfile } = await supabase
      .from('profiles')
      .select('role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (updaterProfile?.role !== 'super_admin' && updaterProfile?.role !== 'admin') {
      return { success: false, error: 'Akses ditolak: Hanya staf yang dapat mengedit jadwal manasik' }
    }

    let finalBranchId = Number(data.branch_id)
    if (updaterProfile.role === 'admin' && updaterProfile.branch_id) {
      finalBranchId = updaterProfile.branch_id
    }

    const { error } = await supabase
      .from('manasik_schedules')
      .update({
        branch_id: finalBranchId,
        package_id: data.package_id ? Number(data.package_id) : null,
        guide_id: data.guide_id ? Number(data.guide_id) : null,
        title: data.title.trim(),
        date: data.date,
        time: data.time,
        location: data.location.trim(),
        description: data.description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating manasik schedule:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/manasik')
    revalidatePath(`/manasik/${id}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating manasik schedule:', err)
    return { success: false, error: err.message || 'Gagal memperbarui jadwal manasik' }
  }
}

export async function deleteManasikSchedule(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi login tidak valid' }
    }

    const { data: deleterProfile } = await supabase
      .from('profiles')
      .select('role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    if (deleterProfile?.role !== 'super_admin' && deleterProfile?.role !== 'admin') {
      return { success: false, error: 'Akses ditolak: Hanya staf yang dapat menghapus jadwal manasik' }
    }

    const { error } = await supabase.from('manasik_schedules').delete().eq('id', id)

    if (error) {
      console.error('Error deleting manasik schedule:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/manasik')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting manasik schedule:', err)
    return { success: false, error: err.message || 'Gagal menghapus jadwal manasik' }
  }
}

export async function recordAttendance(
  scheduleId: number,
  attendances: Record<number, AttendanceStatus>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverClient = await createClient()
    const {
      data: { user },
    } = await serverClient.auth.getUser()

    if (!user) {
      return { success: false, error: 'Sesi login telah berakhir' }
    }

    // 1. Fetch user profile for name and role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('name, email, role, branch_id')
      .eq('id', user.id)
      .maybeSingle()

    const recorderName = userProfile?.name || userProfile?.email || user.email || 'Petugas'

    // 2. Fetch the schedule details to verify permissions
    const { data: schedule } = await supabase
      .from('manasik_schedules')
      .select('id, branch_id, package_id, guide_id')
      .eq('id', scheduleId)
      .maybeSingle()

    if (!schedule) {
      return { success: false, error: 'Jadwal manasik tidak ditemukan' }
    }

    // Permission check: super_admin, admin of branch, or assigned guide
    let isAuthorized = false
    if (userProfile?.role === 'super_admin') {
      isAuthorized = true
    } else if (userProfile?.role === 'admin' && userProfile.branch_id === schedule.branch_id) {
      isAuthorized = true
    } else if (userProfile?.role === 'guide') {
      const { data: guideRecord } = await supabase
        .from('guides')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle()

      if (guideRecord && schedule.guide_id === guideRecord.id) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return {
        success: false,
        error: 'Akses ditolak: Anda tidak memiliki wewenang untuk mencatat absensi pada jadwal ini',
      }
    }

    // 3. Ambil daftar jamaah eligible saat ini
    let regsQuery = supabase
      .from('registrations')
      .select('pilgrim_id')
      .neq('status', 'cancelled')

    if (schedule.package_id) {
      regsQuery = regsQuery.eq('package_id', schedule.package_id)
    } else {
      regsQuery = regsQuery.eq('branch_id', schedule.branch_id)
    }

    const { data: eligibleRegs } = await regsQuery
    const eligiblePilgrimIds = Array.from(
      new Set((eligibleRegs || []).map((r: any) => r.pilgrim_id).filter(Boolean))
    ) as number[]

    if (eligiblePilgrimIds.length === 0) {
      return { success: false, error: 'Tidak ada jamaah eligible terdaftar untuk jadwal ini' }
    }

    // 4. Batch Upsert: seluruh jamaah eligible disimpan (default absent jika belum dipilih)
    const nowIso = new Date().toISOString()
    const rowsToUpsert = eligiblePilgrimIds.map((pilgrimId) => {
      const status = attendances[pilgrimId] || 'absent'
      return {
        manasik_schedule_id: scheduleId,
        pilgrim_id: pilgrimId,
        status,
        recorded_by: recorderName,
        updated_at: nowIso,
      }
    })

    const { error: upsertError } = await supabase
      .from('manasik_attendances')
      .upsert(rowsToUpsert, { onConflict: 'manasik_schedule_id, pilgrim_id' })

    if (upsertError) {
      console.error('Error upserting manasik attendance:', upsertError)
      return { success: false, error: upsertError.message }
    }

    revalidatePath(`/manasik/${scheduleId}`)
    revalidatePath('/manasik')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error saving manasik attendance:', err)
    return { success: false, error: err.message || 'Gagal menyimpan absensi' }
  }
}
