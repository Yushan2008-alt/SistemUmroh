/**
 * FINANCE DOMAIN TYPES
 * Unified type definitions for Finance: Payments, Midtrans Snap, Commissions, and Bank Accounts.
 *
 * @module @/modules/finance/types
 */

import type { CommissionStatus, PaymentMethod, PaymentStatus, PaymentType } from '@/types/database.types'

// ============================================================================
// Payments & Transactions
// ============================================================================

export type { PaymentType, PaymentStatus, PaymentMethod }

export interface PaymentListItem {
  id: number
  branch_id: number
  registration_id: number
  code: string
  type: PaymentType
  amount: number
  paid_amount: number
  status: PaymentStatus
  due_date: string | null
  paid_at: string | null
  method: PaymentMethod | null
  bank_account_id?: number | null
  recorded_by?: string | null
  proof_path: string | null
  note: string | null
  created_at: string
  updated_at: string
  remaining_balance: number
  registrations?: {
    id: number
    code: string
    status: string
    total_price: number
    registered_at: string
    pilgrims?: {
      id: number
      code: string
      name: string
      phone: string
      nik: string
      passport_number: string | null
    } | null
    packages?: {
      id: number
      name: string
      departure_date: string
      price: number
    } | null
  } | null
  branches?: {
    id: number
    name: string
    code: string
  } | null
}

export interface PaymentStats {
  total_billed: number
  total_collected: number
  total_remaining: number
  collection_ratio: number
  total_invoices: number
  count_paid: number
  count_partial: number
  count_unpaid: number
}

export interface PaymentFilterParams {
  search?: string
  status?: string
  type?: string
}

export interface RecordManualPaymentData {
  amount: number
  method: PaymentMethod
  paid_at: string
  reference_number?: string
  note?: string
}

export interface MassInstallmentParams {
  package_id: number
  tenor_months: number
  first_due_date: string
  day_of_month: number
  note?: string
}

export interface MidtransSnapResult {
  token: string
  redirect_url: string
  order_id: string
  is_mock?: boolean
  selected_channel?: string
  deeplink_url?: string
}

// ============================================================================
// Agent Commissions
// ============================================================================

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

// ============================================================================
// Bank Accounts
// ============================================================================

export interface BankAccount {
  id: number
  branch_id: number | null
  bank_name: string
  account_number: string
  account_holder: string
  branch_office: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  branch?: {
    id: number
    name: string
    code: string
  } | null
}

export interface BankAccountFormData {
  branch_id?: number | null
  bank_name: string
  account_number: string
  account_holder: string
  branch_office?: string | null
  is_active?: boolean
}
