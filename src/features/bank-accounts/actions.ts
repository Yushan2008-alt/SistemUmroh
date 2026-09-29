'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { BankAccount, BankAccountFormData } from './types'

export async function getBankAccounts(branchId?: number, search?: string): Promise<{ data: BankAccount[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    let query = supabase
      .from('bank_accounts')
      .select('*, branch:branches(id, name, code)')
      .order('is_active', { ascending: false })
      .order('bank_name', { ascending: true })

    if (branchId) {
      query = query.eq('branch_id', branchId)
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`
      query = query.or(`bank_name.ilike.${term},account_number.ilike.${term},account_holder.ilike.${term},branch_office.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching bank accounts:', error)
      return { data: [], error: error.message }
    }

    return { data: (data as BankAccount[]) || [] }
  } catch (err: any) {
    console.error('Unexpected error fetching bank accounts:', err)
    return { data: [], error: err.message || 'Gagal mengambil rekening bank' }
  }
}

export async function getAvailableBranches(): Promise<{ id: number; name: string; code: string }[]> {
  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('branches')
      .select('id, name, code')
      .eq('is_active', true)
      .order('is_head_office', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching branches for bank account:', error)
      return []
    }

    return data || []
  } catch (err) {
    return []
  }
}

export async function createBankAccount(data: BankAccountFormData): Promise<{ success: boolean; data?: BankAccount; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    if (!data.bank_name?.trim() || !data.account_number?.trim() || !data.account_holder?.trim()) {
      return { success: false, error: 'Nama bank, nomor rekening, dan nama pemilik wajib diisi' }
    }

    const { data: created, error } = await supabase
      .from('bank_accounts')
      .insert({
        branch_id: data.branch_id ? Number(data.branch_id) : null,
        bank_name: data.bank_name.trim(),
        account_number: data.account_number.trim(),
        account_holder: data.account_holder.trim(),
        branch_office: data.branch_office?.trim() || null,
        is_active: data.is_active ?? true,
      })
      .select('*, branch:branches(id, name, code)')
      .single()

    if (error) {
      console.error('Error creating bank account:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/bank-accounts')
    return { success: true, data: created as BankAccount }
  } catch (err: any) {
    console.error('Unexpected error creating bank account:', err)
    return { success: false, error: err.message || 'Gagal menambahkan rekening bank' }
  }
}

export async function updateBankAccount(id: number, data: Partial<BankAccountFormData>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const payload: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.branch_id !== undefined) payload.branch_id = data.branch_id ? Number(data.branch_id) : null
    if (data.bank_name !== undefined) payload.bank_name = data.bank_name.trim()
    if (data.account_number !== undefined) payload.account_number = data.account_number.trim()
    if (data.account_holder !== undefined) payload.account_holder = data.account_holder.trim()
    if (data.branch_office !== undefined) payload.branch_office = data.branch_office?.trim() || null
    if (data.is_active !== undefined) payload.is_active = data.is_active

    const { error } = await supabase
      .from('bank_accounts')
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('Error updating bank account:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/bank-accounts')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error updating bank account:', err)
    return { success: false, error: err.message || 'Gagal memperbarui rekening bank' }
  }
}

export async function deleteBankAccount(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting bank account:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/bank-accounts')
    return { success: true }
  } catch (err: any) {
    console.error('Unexpected error deleting bank account:', err)
    return { success: false, error: err.message || 'Gagal menghapus rekening bank' }
  }
}
