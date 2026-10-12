export interface Branch {
  id: number
  code: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  is_head_office: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BranchFormData {
  code: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  is_head_office?: boolean
  is_active?: boolean
}
