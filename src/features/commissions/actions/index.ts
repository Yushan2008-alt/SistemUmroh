'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity-logger'
import type { CommissionWithRelations, CommissionRekap, CommissionFilterParams } from '../types'
import type { CommissionStatus } from '@/types/database.types'

export async function getCommissions(filters?: CommissionFilterParams): Promise<CommissionWithRelations[]> {
  const supabase = createAdminClient()

  let query = (supabase.from('commissions') as any)
    .select(`
      id,
      branch_id,
      agent_id,
      registration_id,
      base_amount,
      rate,
      amount,
      status,
      paid_at,
      note,
      created_at,
      updated_at,
      agent:agents(id, name, code),
      registration:registrations(
        id,
        code,
        pilgrim:pilgrims(id, name),
        package:packages(id, name)
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.agentId) {
    query = query.eq('agent_id', filters.agentId)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getCommissions] Error fetching commissions:', error)
    return []
  }

  return (data || []) as CommissionWithRelations[]
}

export async function getCommissionRekap(): Promise<CommissionRekap> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('commissions') as any)
    .select('status, amount')

  const rekap: CommissionRekap = {
    pending: {
      status: 'pending',
      label: 'Menunggu Persetujuan',
      totalCount: 0,
      totalAmount: 0,
      color: 'amber',
      icon: 'percent',
    },
    approved: {
      status: 'approved',
      label: 'Disetujui',
      totalCount: 0,
      totalAmount: 0,
      color: 'blue',
      icon: 'check',
    },
    paid: {
      status: 'paid',
      label: 'Sudah Dibayarkan',
      totalCount: 0,
      totalAmount: 0,
      color: 'green',
      icon: 'cash',
    },
    cancelled: {
      status: 'cancelled',
      label: 'Dibatalkan',
      totalCount: 0,
      totalAmount: 0,
      color: 'red',
      icon: 'history',
    },
  }

  if (error || !data) {
    return rekap
  }

  data.forEach((row: { status: CommissionStatus; amount: number }) => {
    const key = row.status as keyof CommissionRekap
    if (rekap[key]) {
      rekap[key].totalCount += 1
      rekap[key].totalAmount += Number(row.amount) || 0
    }
  })

  return rekap
}

export async function getAgentsList(): Promise<{ id: number; name: string }[]> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('agents') as any)
    .select('id, name')
    .order('name', { ascending: true })

  if (error || !data) {
    return []
  }

  return data
}

export async function updateCommissionStatus(
  id: number,
  status: CommissionStatus,
  note?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()

    const updatePayload: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'paid') {
      updatePayload.paid_at = new Date().toISOString()
    } else {
      updatePayload.paid_at = null
    }

    if (note !== undefined) {
      updatePayload.note = note
    }

    const { error } = await (supabase.from('commissions') as any)
      .update(updatePayload)
      .eq('id', id)

    if (error) {
      console.error('[updateCommissionStatus] Error:', error)
      return { success: false, message: 'Gagal memperbarui status komisi: ' + error.message }
    }

    const statusLabels: Record<CommissionStatus, string> = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      paid: 'Dibayar',
      cancelled: 'Dibatalkan',
    }

    await logActivity({
      action: 'updated',
      subject_type: 'commission',
      subject_id: String(id),
      description: `Mengubah status komisi #${id} menjadi ${statusLabels[status] || status}`,
      properties: { commission_id: id, status, note },
    })

    revalidatePath('/commissions')
    return { success: true, message: 'Status komisi berhasil diperbarui.' }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}
