import type { CommissionStatus } from '@/types/database.types'

export interface CommissionWithRelations {
  id: number
  branch_id: number
  agent_id: number
  registration_id: number
  base_amount: number
  rate: number
  amount: number
  status: CommissionStatus
  paid_at: string | null
  note: string | null
  created_at: string
  updated_at: string
  agent?: {
    id: number
    name: string
    code?: string
  } | null
  registration?: {
    id: number
    code?: string
    pilgrim?: {
      id: number
      name: string
    } | null
    package?: {
      id: number
      name: string
    } | null
  } | null
}

export interface CommissionRekapItem {
  status: CommissionStatus
  label: string
  totalCount: number
  totalAmount: number
  color: 'amber' | 'blue' | 'green' | 'red'
  icon: string
}

export interface CommissionRekap {
  pending: CommissionRekapItem
  approved: CommissionRekapItem
  paid: CommissionRekapItem
  cancelled: CommissionRekapItem
}

export interface CommissionFilterParams {
  status?: string
  agentId?: number
  q?: string
}
