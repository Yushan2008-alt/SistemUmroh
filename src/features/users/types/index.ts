import type { Role } from '@/types/database.types'

export interface UserProfileWithBranch {
  id: string
  branch_id: number | null
  name: string
  email: string
  phone: string | null
  role: Role
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  last_sign_in_at?: string | null
  branch?: {
    id: number
    name: string
  } | null
}

export interface UserFormData {
  name: string
  email: string
  role: Role
  branch_id?: number | null
  phone?: string | null
  is_active: boolean
  password?: string
}

export interface UserFilterParams {
  role?: string
  q?: string
}
