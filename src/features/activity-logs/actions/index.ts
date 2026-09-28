'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { ActivityLogWithRelations, ActivityLogFilterParams } from '../types'

export async function getActivityLogs(
  filters?: ActivityLogFilterParams
): Promise<ActivityLogWithRelations[]> {
  const supabase = createAdminClient()

  let query = (supabase.from('activity_logs') as any)
    .select(`
      id,
      user_id,
      branch_id,
      action,
      subject_type,
      subject_id,
      description,
      properties,
      ip_address,
      user_agent,
      created_at,
      user:profiles(id, name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (filters?.action && filters.action !== 'all') {
    query = query.eq('action', filters.action)
  }

  if (filters?.userId && filters.userId !== 'all') {
    query = query.eq('user_id', filters.userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getActivityLogs] Error:', error)
    return []
  }

  return (data || []) as ActivityLogWithRelations[]
}

export async function getActivityLogFilters(): Promise<{
  actions: string[]
  users: { id: string; name: string }[]
}> {
  const supabase = createAdminClient()

  const [logsRes, usersRes] = await Promise.all([
    (supabase.from('activity_logs') as any).select('action'),
    (supabase.from('profiles') as any).select('id, name').order('name'),
  ])

  const actionSet = new Set<string>()
  if (logsRes.data) {
    logsRes.data.forEach((row: { action: string }) => {
      if (row.action) actionSet.add(row.action)
    })
  }

  return {
    actions: Array.from(actionSet).sort(),
    users: usersRes.data || [],
  }
}
