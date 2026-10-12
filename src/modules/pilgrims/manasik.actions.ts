'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { AttendanceStatus } from '@/types/database.types'
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

    let query = supabase
      .from('manasik_schedules')
      .select(`
        *,
        packages (id, name),
        guides (id, name, phone),
        branches (id, name),
        manasik_attendances (id, pilgrim_id, status)
      `)
      .order('date', { ascending: false })

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
  rekap: { present: number; absent: number; excused: number }
  error?: string
}> {
  try {
    const supabase = createAdminClient() as any

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

    if (schedError) {
      return {
        schedule: null,
        pilgrims: [],
        rekap: { present: 0, absent: 0, excused: 0 },
        error: schedError.message,
      }
    }

    // 2. Ambil seluruh jamaah terdaftar dalam paket ini
    const { data: regs } = await supabase
      .from('registrations')
      .select(`
        id,
        pilgrims (id, name, gender, phone)
      `)
      .eq('package_id', schedule.package_id)
      .neq('status', 'cancelled')

    // 3. Ambil absensi yang sudah ada
    const { data: attendances } = await supabase
      .from('manasik_attendances')
      .select('*')
      .eq('manasik_schedule_id', id)

    const attendanceMap = new Map<number, AttendanceStatus>()
    ;(attendances || []).forEach((att: any) => {
      attendanceMap.set(att.pilgrim_id, att.status as AttendanceStatus)
    })

    const pilgrimsList: PilgrimAttendanceItem[] = []
    const rekap = { present: 0, absent: 0, excused: 0 }

    ;(regs || []).forEach((r: any) => {
      if (r.pilgrims) {
        const pilgrimId = r.pilgrims.id
        const currentStatus = attendanceMap.get(pilgrimId) || 'absent'

        if (currentStatus === 'present') rekap.present += 1
        else if (currentStatus === 'excused') rekap.excused += 1
        else rekap.absent += 1

        pilgrimsList.push({
          pilgrim_id: pilgrimId,
          name: r.pilgrims.name,
          gender: r.pilgrims.gender,
          phone: r.pilgrims.phone,
          status: currentStatus,
        })
      }
    })

    // Sort by name
    pilgrimsList.sort((a, b) => a.name.localeCompare(b.name))

    return { schedule, pilgrims: pilgrimsList, rekap }
  } catch (err: any) {
    console.error('Unexpected error fetching manasik schedule by id:', err)
    return {
      schedule: null,
      pilgrims: [],
      rekap: { present: 0, absent: 0, excused: 0 },
      error: err.message || 'Gagal memuat detail jadwal manasik',
    }
  }
}

export async function createManasikSchedule(
  data: ManasikFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase.from('manasik_schedules').insert({
      branch_id: Number(data.branch_id),
      package_id: Number(data.package_id),
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

    const { error } = await supabase
      .from('manasik_schedules')
      .update({
        branch_id: Number(data.branch_id),
        package_id: Number(data.package_id),
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

    const { error } = await supabase.from('manasik_schedules').delete().eq('id', id)

    if (error) {
      console.error('Error deleting manasik schedule:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/manasik')
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

    const rowsToUpsert = Object.entries(attendances).map(([pilgrimIdStr, status]) => ({
      manasik_schedule_id: scheduleId,
      pilgrim_id: Number(pilgrimIdStr),
      status,
      updated_at: new Date().toISOString(),
    }))

    if (rowsToUpsert.length > 0) {
      const { error } = await supabase
        .from('manasik_attendances')
        .upsert(rowsToUpsert, { onConflict: 'manasik_schedule_id, pilgrim_id' })

      if (error) {
        console.error('Error upserting manasik attendance:', error)
        return { success: false, error: error.message }
      }
    }

    revalidatePath(`/manasik/${scheduleId}`)
    revalidatePath('/manasik')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error saving manasik attendance:', err)
    return { success: false, error: err.message || 'Gagal menyimpan absensi' }
  }
}
