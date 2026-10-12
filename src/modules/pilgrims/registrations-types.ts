import type { RegistrationStatus, PaymentStatus, PaymentType, PaymentMethod, PackageType } from '@/types/database.types'

export interface RegistrationListItem {
  id: number
  branch_id: number
  pilgrim_id: number
  package_id: number
  agent_id: number | null
  guide_id: number | null
  code: string
  status: RegistrationStatus
  total_price: number
  registered_at: string
  notes: string | null
  created_at: string
  updated_at: string
  pilgrims: {
    id: number
    name: string
    phone: string
    passport_number: string | null
    nik: string
  } | null
  packages: {
    id: number
    name: string
    type: PackageType
    price: number
    departure_date: string
    duration_days: number
    quota: number
  } | null
  branches: {
    id: number
    name: string
    code: string
  } | null
  agents: {
    id: number
    name: string
    code: string
  } | null
  guides: {
    id: number
    name: string
  } | null
  payments?: {
    id: number
    code: string
    type: PaymentType
    amount: number
    paid_amount: number
    status: PaymentStatus
    due_date: string | null
    paid_at: string | null
    method: PaymentMethod | null
  }[]
  computed_payment_status?: 'paid' | 'partial' | 'unpaid'
  total_paid?: number
  remaining_balance?: number
}

export interface RegistrationFormData {
  pilgrim_id: number
  package_id: number
  guide_id?: number | null
  registered_at?: string
  notes?: string | null
}
