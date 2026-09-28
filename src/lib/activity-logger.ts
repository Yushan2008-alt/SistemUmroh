import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

export interface LogActivityParams {
  action: string
  subject_type?: string | null
  subject_id?: string | null
  description?: string | null
  properties?: Record<string, any> | null
  user_id?: string | null
  branch_id?: number | null
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const supabase = createAdminClient()
    
    // Attempt to extract IP and user agent if called from request context
    let ip: string | null = null
    let userAgent: string | null = null
    try {
      const headerList = await headers()
      ip = headerList.get('x-forwarded-for') || headerList.get('x-real-ip') || '127.0.0.1'
      userAgent = headerList.get('user-agent') || 'Server Action'
    } catch {
      // outside request context or build time
      ip = '127.0.0.1'
      userAgent = 'System Internal'
    }

    await (supabase.from('activity_logs') as any).insert({
      action: params.action,
      subject_type: params.subject_type ?? null,
      subject_id: params.subject_id ?? null,
      description: params.description ?? null,
      properties: params.properties ?? null,
      ip_address: ip,
      user_agent: userAgent,
      user_id: params.user_id ?? null,
      branch_id: params.branch_id ?? null,
    })
  } catch (error) {
    console.error('[ActivityLogger] Failed to write activity log:', error)
  }
}
