import type { Gender } from '@/types/database.types'

export interface PilgrimItem {
  id: number
  branch_id: number
  agent_id: number | null
  profile_id: string | null
  code: string
  nik: string
  passport_number: string | null
  passport_expiry: string | null
  name: string
  gender: Gender
  birth_place: string | null
  birth_date: string | null
  phone: string
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  health_notes: string | null
  mahram_id: number | null
  mahram_status: string | null
  is_active: boolean
  created_at: string
  updated_at: string

  // Joined relations
  branches?: {
    id: number
    name: string
    code: string
  } | null
  agents?: {
    id: number
    name: string
    code: string
    phone?: string
  } | null
  profiles?: {
    id: string
    name: string
    email: string
    role: string
  } | null
  registrations?: any[]
  documents_count?: number
}

export interface PilgrimFormData {
  branch_id: number
  agent_id?: number | null
  name: string
  gender: Gender
  nik: string
  birth_place?: string | null
  birth_date?: string | null
  phone: string
  email?: string | null
  address?: string | null
  passport_number?: string | null
  passport_expiry?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  mahram_status?: string | null
  health_notes?: string | null
  is_active?: boolean
  create_account?: boolean
  account_email?: string | null
}

export interface PilgrimFormDataOptions {
  branches: {
    id: number
    name: string
    code: string
  }[]
  agents: {
    id: number
    name: string
    code: string
  }[]
}
