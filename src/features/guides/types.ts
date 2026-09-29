export interface Guide {
  id: number
  branch_id: number | null
  profile_id: string | null
  name: string
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  branch?: {
    id: number
    name: string
    code: string
  } | null
}

export interface GuideFormData {
  branch_id?: number | null
  name: string
  phone?: string | null
  email?: string | null
  is_active?: boolean
}
