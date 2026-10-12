import type { EquipmentStatus } from '@/types/database.types'

export interface EquipmentDistributionItem {
  id: number
  registration_id: number
  item: string
  quantity: number
  status: EquipmentStatus
  handed_at: string | null
  handed_by: string | null
  created_at: string
  updated_at: string

  // Joined relations
  registrations?: {
    id: number
    code: string
    pilgrims?: {
      id: number
      name: string
      phone: string
    } | null
    packages?: {
      id: number
      name: string
    } | null
  } | null
}

export interface EquipmentFormData {
  registration_id: number
  item: string
  quantity: number
  status: EquipmentStatus
  handed_at?: string | null
}

export interface RegistrationOption {
  id: number
  code: string
  pilgrim_name: string
  package_name: string
}

export interface EquipmentFormDataOptions {
  registrations: RegistrationOption[]
}
