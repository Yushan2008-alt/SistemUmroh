export interface ActivityLogWithRelations {
  id: number
  user_id: string | null
  branch_id: number | null
  action: string
  subject_type: string | null
  subject_id: string | null
  description: string | null
  properties: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: {
    id: string
    name: string
    email?: string
  } | null
}

export interface ActivityLogFilterParams {
  action?: string
  userId?: string
  q?: string
}
