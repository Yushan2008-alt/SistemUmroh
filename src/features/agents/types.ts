export interface Agent {
  id: number
  branch_id: number | null
  profile_id: string | null
  code: string
  name: string
  phone: string | null
  email: string | null
  commission_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
  branch?: {
    id: number
    name: string
    code: string
  } | null
}

export interface AgentFormData {
  branch_id?: number | null
  code: string
  name: string
  phone?: string | null
  email?: string | null
  commission_rate: number
  is_active?: boolean
}
