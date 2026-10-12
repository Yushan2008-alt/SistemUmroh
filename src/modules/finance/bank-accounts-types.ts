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
