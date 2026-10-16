'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getMidtransSnap, getMidtransCoreApi, isMidtransConfigured } from '@/lib/midtrans'
import { logActivity } from '@/lib/activity-logger'
import type {
  PaymentListItem,
  PaymentStats,
  PaymentFilterParams,
  RecordManualPaymentData,
  MassInstallmentParams,
  MidtransSnapResult,
  MidtransPaymentDetails,
} from './types'

/**
 * Get all payment invoices with joined registrations, pilgrims, packages, and branches
 */
export async function getPayments(
  params?: PaymentFilterParams
): Promise<{ data: PaymentListItem[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    let query = supabase
      .from('payments')
      .select(`
        *,
        registrations (
          id,
          code,
          status,
          total_price,
          registered_at,
          pilgrims (
            id,
            code,
            name,
            phone,
            nik,
            passport_number
          ),
          packages (
            id,
            name,
            departure_date,
            price
          )
        ),
        branches (
          id,
          name,
          code
        )
      `)
      .order('created_at', { ascending: false })

    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    if (params?.type && params.type !== 'all') {
      query = query.eq('type', params.type)
    }

    if (params?.agentId === -1) {
      return { data: [] }
    }

    if (params?.agentId && params.agentId > 0) {
      const { data: regRows } = await supabase
        .from('registrations')
        .select('id')
        .eq('agent_id', params.agentId)
      const regIds = (regRows || []).map((r: any) => r.id)
      if (regIds.length === 0) {
        return { data: [] }
      }
      query = query.in('registration_id', regIds)
    }

    if (params?.pilgrimId) {
      const { data: regRows } = await supabase
        .from('registrations')
        .select('id')
        .eq('pilgrim_id', params.pilgrimId)
      const regIds = (regRows || []).map((r: any) => r.id)
      if (regIds.length === 0) {
        return { data: [] }
      }
      query = query.in('registration_id', regIds)
    }

    const { data, error } = await query

    if (error) {
      console.error('getPayments error:', error)
      return { data: [], error: error.message }
    }

    const items: PaymentListItem[] = (data || []).map((row: any) => {
      const amount = Number(row.amount) || 0
      const paidAmount = Number(row.paid_amount) || 0
      const remainingBalance = Math.max(0, amount - paidAmount)

      return {
        ...row,
        amount,
        paid_amount: paidAmount,
        remaining_balance: remainingBalance,
      }
    })

    // Apply Client Filter Search if provided
    let filtered = items
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim()
      filtered = filtered.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          (p.registrations?.code && p.registrations.code.toLowerCase().includes(q)) ||
          (p.registrations?.pilgrims?.name &&
            p.registrations.pilgrims.name.toLowerCase().includes(q)) ||
          (p.registrations?.pilgrims?.nik && p.registrations.pilgrims.nik.includes(q)) ||
          (p.registrations?.pilgrims?.phone && p.registrations.pilgrims.phone.includes(q))
      )
    }

    return { data: filtered }
  } catch (err: any) {
    console.error('getPayments unexpected error:', err)
    return { data: [], error: err.message || 'Terjadi kesalahan sistem' }
  }
}

/**
 * Get single payment by ID with full relations
 */
export async function getPaymentById(
  paymentId: number
): Promise<{ data: PaymentListItem | null; error?: string }> {
  try {
    const supabase = createAdminClient() as any
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        registrations (
          id,
          code,
          status,
          total_price,
          registered_at,
          pilgrims (
            id,
            code,
            name,
            phone,
            nik,
            passport_number
          ),
          packages (
            id,
            name,
            departure_date,
            price
          )
        ),
        branches (
          id,
          name,
          code
        )
      `)
      .eq('id', paymentId)
      .maybeSingle()

    if (error || !data) {
      return { data: null, error: error?.message || 'Data tagihan tidak ditemukan' }
    }

    const amount = Number(data.amount) || 0
    const paidAmount = Number(data.paid_amount) || 0
    const remainingBalance = Math.max(0, amount - paidAmount)

    return {
      data: {
        ...data,
        amount,
        paid_amount: paidAmount,
        remaining_balance: remainingBalance,
      },
    }
  } catch (err: any) {
    console.error('getPaymentById error:', err)
    return { data: null, error: err.message || 'Terjadi kesalahan sistem' }
  }
}

/**
 * Get aggregate cashier financial statistics
 */
export async function getPaymentStats(params?: { pilgrimId?: number; agentId?: number | null }): Promise<PaymentStats> {
  try {
    const supabase = createAdminClient() as any

    if (params?.agentId === -1) {
      return {
        total_billed: 0,
        total_collected: 0,
        total_remaining: 0,
        collection_ratio: 0,
        total_invoices: 0,
        count_paid: 0,
        count_partial: 0,
        count_unpaid: 0,
      }
    }

    let query = supabase.from('payments').select('amount, paid_amount, status, registration_id')

    if (params?.agentId && params.agentId > 0) {
      const { data: regRows } = await supabase
        .from('registrations')
        .select('id')
        .eq('agent_id', params.agentId)
      const regIds = (regRows || []).map((r: any) => r.id)
      if (regIds.length === 0) {
        return {
          total_billed: 0,
          total_collected: 0,
          total_remaining: 0,
          collection_ratio: 0,
          total_invoices: 0,
          count_paid: 0,
          count_partial: 0,
          count_unpaid: 0,
        }
      }
      query = query.in('registration_id', regIds)
    }

    if (params?.pilgrimId) {
      const { data: regRows } = await supabase
        .from('registrations')
        .select('id')
        .eq('pilgrim_id', params.pilgrimId)
      const regIds = (regRows || []).map((r: any) => r.id)
      if (regIds.length === 0) {
        return {
          total_billed: 0,
          total_collected: 0,
          total_remaining: 0,
          collection_ratio: 0,
          total_invoices: 0,
          count_paid: 0,
          count_partial: 0,
          count_unpaid: 0,
        }
      }
      query = query.in('registration_id', regIds)
    }

    const { data, error } = await query

    if (error || !data) {
      return {
        total_billed: 0,
        total_collected: 0,
        total_remaining: 0,
        collection_ratio: 0,
        total_invoices: 0,
        count_paid: 0,
        count_partial: 0,
        count_unpaid: 0,
      }
    }

    let totalBilled = 0
    let totalCollected = 0
    let countPaid = 0
    let countPartial = 0
    let countUnpaid = 0

    data.forEach((p: any) => {
      const amt = Number(p.amount) || 0
      const paid = Number(p.paid_amount) || 0
      totalBilled += amt
      totalCollected += paid

      if (p.status === 'paid') countPaid++
      else if (p.status === 'partial') countPartial++
      else countUnpaid++
    })

    const totalRemaining = Math.max(0, totalBilled - totalCollected)
    const collectionRatio = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0

    return {
      total_billed: totalBilled,
      total_collected: totalCollected,
      total_remaining: totalRemaining,
      collection_ratio: collectionRatio,
      total_invoices: data.length,
      count_paid: countPaid,
      count_partial: countPartial,
      count_unpaid: countUnpaid,
    }
  } catch (err) {
    console.error('getPaymentStats error:', err)
    return {
      total_billed: 0,
      total_collected: 0,
      total_remaining: 0,
      collection_ratio: 0,
      total_invoices: 0,
      count_paid: 0,
      count_partial: 0,
      count_unpaid: 0,
    }
  }
}

/**
 * Create Midtrans Snap Token for a Payment Invoice
 */
export async function createMidtransSnapToken(
  paymentId: number,
  channel?: string
): Promise<{ success: boolean; snap?: MidtransSnapResult; message?: string }> {
  try {
    const supabase = createAdminClient() as any

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        registrations (
          code,
          pilgrims (
            name,
            phone,
            nik
          ),
          packages (
            name
          )
        )
      `)
      .eq('id', paymentId)
      .single()

    if (error || !payment) {
      return { success: false, message: 'Data tagihan tidak ditemukan.' }
    }

    const amount = Number(payment.amount) || 0
    const paidAmount = Number(payment.paid_amount) || 0
    const remainingToPay = Math.max(0, amount - paidAmount)

    if (remainingToPay <= 0 || payment.status === 'paid') {
      return { success: false, message: 'Tagihan ini telah lunas.' }
    }

    const cleanCode = (payment.code || '').replace(/[^a-zA-Z0-9]/g, '')
    const orderId = `PAY-${payment.id}-${cleanCode}-${Date.now().toString().slice(-4)}`
    const pilgrim = payment.registrations?.pilgrims
    const packageName = payment.registrations?.packages?.name || 'Paket Umroh'

    // Check if live Sandbox credentials are configured
    if (isMidtransConfigured()) {
      try {
        const snap = getMidtransSnap()
        const parameter: any = {
          transaction_details: {
            order_id: orderId,
            gross_amount: Math.round(remainingToPay),
          },
          customer_details: {
            first_name: pilgrim?.name || 'Jamaah',
            email: pilgrim?.email || 'jamaah@travel.com',
            phone: pilgrim?.phone || '08123456789',
          },
          item_details: [
            {
              id: String(payment.id),
              price: Math.round(remainingToPay),
              quantity: 1,
              name: `${payment.type.toUpperCase()}: ${packageName}`.slice(0, 50),
            },
          ],
        }

        // When channel is specified, filter enabled_payments. Otherwise, show all channels.
        if (channel) {
          const channelMap: Record<string, string[]> = {
            dana: ['dana', 'qris', 'gopay'],
            gopay: ['gopay', 'qris'],
            shopeepay: ['shopeepay', 'qris'],
            bca_va: ['bca_va'],
            mandiri_va: ['echannel'],
            bni_va: ['bni_va'],
            bri_va: ['bri_va'],
            permata_va: ['permata_va'],
            qris: ['qris'],
          }
          if (channelMap[channel]) {
            parameter.enabled_payments = channelMap[channel]
          }
        }

        const transaction = await snap.createTransaction(parameter)

        const deeplinkUrl = channel === 'dana'
          ? `dana://checkout?order_id=${orderId}&amount=${Math.round(remainingToPay)}`
          : channel === 'gopay'
          ? `gojek://gopay/merchanttransfer?order_id=${orderId}&amount=${Math.round(remainingToPay)}`
          : transaction.redirect_url

        return {
          success: true,
          snap: {
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            order_id: orderId,
            is_mock: false,
            selected_channel: channel,
            deeplink_url: deeplinkUrl,
          },
        }
      } catch (midtransErr: any) {
        console.error('Midtrans API error, falling back to Sandbox Simulator:', midtransErr)
      }
    }

    // Fallback Mock Token for Sandbox UI preview if real keys aren't configured yet
    const mockDeeplink = channel === 'dana'
      ? `dana://checkout?order_id=${orderId}&amount=${Math.round(remainingToPay)}`
      : channel === 'gopay'
      ? `gojek://gopay/merchanttransfer?order_id=${orderId}&amount=${Math.round(remainingToPay)}`
      : `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-${orderId}`

    return {
      success: true,
      snap: {
        token: `mock-snap-${orderId}`,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock-${orderId}`,
        order_id: orderId,
        is_mock: true,
        selected_channel: channel,
        deeplink_url: mockDeeplink,
      },
    }
  } catch (err: any) {
    console.error('createMidtransSnapToken error:', err)
    return { success: false, message: err.message || 'Gagal membuat token Midtrans' }
  }
}

/**
 * Handle Midtrans Payment Completion (called via Snap callback or manual sync)
 */
export async function handleMidtransSnapSuccess(
  paymentId: number,
  orderId: string,
  grossAmount?: number,
  paymentType?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient() as any

    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, registrations(*, packages(*))')
      .eq('id', paymentId)
      .single()

    if (error || !payment) {
      return { success: false, message: 'Data tagihan tidak ditemukan.' }
    }

    const totalAmount = Number(payment.amount) || 0
    const paymentLabel = paymentType ? paymentType.toUpperCase() : 'ONLINE'

    const { error: updateErr } = await supabase
      .from('payments')
      .update({
        paid_amount: totalAmount,
        status: 'paid',
        paid_at: new Date().toISOString(),
        method: 'transfer',
        note: `Lunas via Midtrans Sandbox (${paymentLabel}) Ref: ${orderId}`,
      })
      .eq('id', paymentId)

    if (updateErr) {
      return { success: false, message: updateErr.message }
    }

    // Update parent registration status automatically
    if (payment.registration_id) {
      const { data: allPayments } = await supabase
        .from('payments')
        .select('id, amount, paid_amount, status')
        .eq('registration_id', payment.registration_id)

      const registrationPrice = Number(payment.registrations?.total_price) || 0
      const totalPaid = (allPayments || []).reduce((acc: number, curr: any) => {
        if (curr.id === payment.id) return acc + totalAmount
        return acc + (Number(curr.paid_amount) || 0)
      }, 0)

      const allInvoicesPaid = (allPayments || []).every(
        (p: any) => p.id === payment.id || p.status === 'paid'
      )

      const nextStatus = allInvoicesPaid || totalPaid >= registrationPrice ? 'paid' : 'confirmed'

      await supabase
        .from('registrations')
        .update({
          status: nextStatus,
        })
        .eq('id', payment.registration_id)
    }

    // Write to Activity Logs (Audit Trail)
    await logActivity({
      action: 'payment_completed_snap',
      subject_type: 'payment',
      subject_id: String(payment.id),
      description: `Pembayaran tagihan ${payment.code} sebesar Rp ${totalAmount.toLocaleString(
        'id-ID'
      )} via Midtrans ${paymentLabel} dinyatakan Lunas (Ref: ${orderId}).`,
      branch_id: payment.branch_id,
      properties: {
        order_id: orderId,
        payment_type: paymentType,
        gross_amount: grossAmount,
      },
    })

    revalidatePath('/payments')
    revalidatePath('/registrations')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Pembayaran online Midtrans berhasil diselesaikan dan status tagihan otomatis Lunas!',
    }
  } catch (err: any) {
    console.error('handleMidtransSnapSuccess error:', err)
    return { success: false, message: err.message || 'Gagal memproses status pembayaran' }
  }
}

/**
 * Sync status with Midtrans Transaction Status API on-demand
 */
export async function syncMidtransTransactionStatus(
  paymentId: number,
  orderId: string
): Promise<{
  success: boolean
  status?: string
  message: string
  details?: MidtransPaymentDetails
}> {
  try {
    if (!isMidtransConfigured()) {
      return {
        success: false,
        message: 'Midtrans Server Key belum dikonfigurasi di .env.local untuk cek status online.',
      }
    }

    const coreApi = getMidtransCoreApi()
    const statusResponse = await coreApi.transaction.status(orderId)

    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status

    // Extract QR code & actions
    const qrAction = statusResponse.actions?.find(
      (a: any) => a.name === 'generate-qr-code' || a.name === 'generate-qr-code-v2'
    )
    const qrCodeUrl = qrAction?.url || statusResponse.qr_code_url || null
    const deeplinkAction = statusResponse.actions?.find((a: any) => a.name === 'deeplink-redirect')
    const deeplinkUrl = deeplinkAction?.url || null

    const details: MidtransPaymentDetails = {
      payment_type: statusResponse.payment_type,
      gross_amount: statusResponse.gross_amount,
      va_numbers: statusResponse.va_numbers,
      bill_key: statusResponse.bill_key,
      biller_code: statusResponse.biller_code,
      permata_va_number: statusResponse.permata_va_number,
      transaction_time: statusResponse.transaction_time,
      qr_code_url: qrCodeUrl,
      qr_string: statusResponse.qr_string,
      deeplink_url: deeplinkUrl,
      transaction_id: statusResponse.transaction_id,
      actions: statusResponse.actions,
    }

    if (
      transactionStatus === 'settlement' ||
      (transactionStatus === 'capture' && fraudStatus === 'accept')
    ) {
      const res = await handleMidtransSnapSuccess(
        paymentId,
        orderId,
        Number(statusResponse.gross_amount),
        statusResponse.payment_type
      )
      return { success: true, status: 'paid', message: res.message, details }
    } else if (transactionStatus === 'pending') {
      return {
        success: true,
        status: 'pending',
        message: 'Transaksi masih berstatus PENDING di Midtrans (menunggu pembayaran jamaah).',
        details,
      }
    } else if (
      transactionStatus === 'deny' ||
      transactionStatus === 'expire' ||
      transactionStatus === 'cancel'
    ) {
      return {
        success: false,
        status: transactionStatus,
        message: `Transaksi di Midtrans berstatus: ${transactionStatus.toUpperCase()}`,
        details,
      }
    }

    return {
      success: true,
      status: transactionStatus,
      message: `Status transaksi Midtrans: ${transactionStatus}`,
      details,
    }
  } catch (err: any) {
    const is404 =
      err?.ApiResponse?.status_code === '404' ||
      err?.status === 404 ||
      err?.message?.includes('404') ||
      err?.ApiResponse?.status_message?.includes("doesn't exist")

    if (is404) {
      return {
        success: true,
        status: 'awaiting_payment_selection',
        message: 'Menunggu pemilihan metode pembayaran di Midtrans Snap.',
      }
    }

    console.error('syncMidtransTransactionStatus error:', err)
    return { success: false, message: err.message || 'Gagal menyinkronkan status dengan Midtrans' }
  }
}

/**
 * Create a direct Midtrans charge for Sandbox testing (QRIS or Virtual Account)
 */
export async function createDirectMidtransCharge(
  paymentId: number,
  method: 'qris' | 'bca_va' | 'bri_va' | 'bni_va' | 'mandiri_bill'
): Promise<{
  success: boolean
  message: string
  order_id?: string
  details?: MidtransPaymentDetails
}> {
  try {
    if (!isMidtransConfigured()) {
      return {
        success: false,
        message: 'Midtrans Server Key belum dikonfigurasi.',
      }
    }

    const supabase = createAdminClient() as any
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*, registrations(code, pilgrims(name, phone), packages(name))')
      .eq('id', paymentId)
      .single()

    if (error || !payment) {
      return { success: false, message: 'Data tagihan tidak ditemukan.' }
    }

    const amount = Number(payment.amount) || 0
    const paidAmount = Number(payment.paid_amount) || 0
    const remainingToPay = Math.max(0, amount - paidAmount)

    if (remainingToPay <= 0 || payment.status === 'paid') {
      return { success: false, message: 'Tagihan ini telah lunas.' }
    }

    const cleanCode = (payment.code || '').replace(/[^a-zA-Z0-9]/g, '')
    const orderId = `PAY-${payment.id}-${cleanCode}-${Date.now().toString().slice(-4)}`
    const pilgrim = payment.registrations?.pilgrims
    const coreApi = getMidtransCoreApi()

    const chargeParams: any = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(remainingToPay),
      },
      customer_details: {
        first_name: pilgrim?.name || 'Jamaah',
        email: 'jamaah@travel.com',
        phone: pilgrim?.phone || '08123456789',
      },
    }

    if (method === 'qris') {
      chargeParams.payment_type = 'qris'
      chargeParams.qris = { acquirer: 'gopay' }
    } else if (method === 'bca_va') {
      chargeParams.payment_type = 'bank_transfer'
      chargeParams.bank_transfer = { bank: 'bca' }
    } else if (method === 'bri_va') {
      chargeParams.payment_type = 'bank_transfer'
      chargeParams.bank_transfer = { bank: 'bri' }
    } else if (method === 'bni_va') {
      chargeParams.payment_type = 'bank_transfer'
      chargeParams.bank_transfer = { bank: 'bni' }
    } else if (method === 'mandiri_bill') {
      chargeParams.payment_type = 'echannel'
      chargeParams.echannel = {
        bill_info1: 'Pembayaran Tagihan',
        bill_info2: payment.code,
      }
    }

    const chargeRes = await coreApi.charge(chargeParams)

    const qrAction = chargeRes.actions?.find(
      (a: any) => a.name === 'generate-qr-code' || a.name === 'generate-qr-code-v2'
    )
    const qrCodeUrl = qrAction?.url || chargeRes.qr_code_url || null
    const deeplinkAction = chargeRes.actions?.find((a: any) => a.name === 'deeplink-redirect')

    const details: MidtransPaymentDetails = {
      payment_type: chargeRes.payment_type,
      gross_amount: chargeRes.gross_amount,
      va_numbers: chargeRes.va_numbers,
      bill_key: chargeRes.bill_key,
      biller_code: chargeRes.biller_code,
      permata_va_number: chargeRes.permata_va_number,
      transaction_time: chargeRes.transaction_time,
      qr_code_url: qrCodeUrl,
      qr_string: chargeRes.qr_string,
      deeplink_url: deeplinkAction?.url || null,
      transaction_id: chargeRes.transaction_id,
      actions: chargeRes.actions,
    }

    return {
      success: true,
      message: 'Berhasil membuat sesi transaksi Midtrans Sandbox.',
      order_id: orderId,
      details,
    }
  } catch (err: any) {
    console.error('createDirectMidtransCharge error:', err)
    return { success: false, message: err.message || 'Gagal membuat sesi transaksi charge' }
  }
}

/**
 * Record manual cashier payment (Cash, Bank Transfer, EDC)
 */
export async function recordManualPayment(
  paymentId: number,
  data: RecordManualPaymentData
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverSupabase = await (await import('@/lib/supabase/server')).createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (prof?.role === 'agent' || prof?.role === 'pilgrim') {
        return { success: false, message: 'Akses ditolak: Hanya staf kasir yang berhak mencatat pembayaran manual.' }
      }
    }

    if (!data.amount || data.amount <= 0) {
      return { success: false, message: 'Nominal pembayaran harus lebih besar dari 0.' }
    }

    const { data: payment, error: fetchErr } = await supabase
      .from('payments')
      .select('amount, paid_amount, status')
      .eq('id', paymentId)
      .single()

    if (fetchErr || !payment) {
      return { success: false, message: 'Data tagihan tidak ditemukan.' }
    }

    const totalInvoice = Number(payment.amount) || 0
    const currentPaid = Number(payment.paid_amount) || 0
    const newPaidAmount = currentPaid + Number(data.amount)

    const newStatus = newPaidAmount >= totalInvoice ? 'paid' : 'partial'

    const noteText = data.note
      ? data.note
      : `Pembayaran kasir via ${data.method.toUpperCase()}${
          data.reference_number ? ` (Ref: ${data.reference_number})` : ''
        }`

    const { error: updateErr } = await supabase
      .from('payments')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        paid_at: data.paid_at || new Date().toISOString(),
        method: data.method,
        note: noteText,
      })
      .eq('id', paymentId)

    if (updateErr) {
      return { success: false, message: updateErr.message }
    }

    revalidatePath('/payments')
    revalidatePath('/registrations')

    return {
      success: true,
      message: `Pembayaran sebesar Rp ${Number(data.amount).toLocaleString('id-ID')} berhasil dicatat (${
        newStatus === 'paid' ? 'Lunas' : 'Sebagian'
      }).`,
    }
  } catch (err: any) {
    console.error('recordManualPayment error:', err)
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat mencatat pembayaran' }
  }
}

/**
 * Generate Mass Installment Invoices per Package
 */
export async function generateMassInstallments(
  params: MassInstallmentParams
): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const supabase = createAdminClient() as any
    const serverSupabase = await (await import('@/lib/supabase/server')).createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      if (prof?.role === 'agent' || prof?.role === 'pilgrim') {
        return { success: false, count: 0, message: 'Akses ditolak: Hanya staf yang berhak menerbitkan cicilan massal.' }
      }
    }

    // 1. Fetch all active registrations in the package
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select(`
        id,
        branch_id,
        code,
        status,
        total_price,
        payments (
          amount,
          paid_amount,
          status
        )
      `)
      .eq('package_id', params.package_id)
      .neq('status', 'cancelled')

    if (regError || !registrations || registrations.length === 0) {
      return {
        success: false,
        count: 0,
        message: 'Tidak ada jamaah aktif terdaftar pada paket ini untuk dibuatkan tagihan massal.',
      }
    }

    const inserts: any[] = []

    for (const reg of registrations) {
      const totalPrice = Number(reg.total_price) || 0
      const currentBilled = (reg.payments || []).reduce(
        (sum: number, p: any) => sum + (Number(p.amount) || 0),
        0
      )
      const remainingToBill = Math.max(0, totalPrice - currentBilled)

      if (remainingToBill > 0) {
        const perMonth = Math.round(remainingToBill / params.tenor_months)

        for (let i = 1; i <= params.tenor_months; i++) {
          const installmentAmount = i === params.tenor_months ? remainingToBill - perMonth * (i - 1) : perMonth

          // Calculate due date for installment i
          const dueDate = new Date(params.first_due_date)
          dueDate.setMonth(dueDate.getMonth() + (i - 1))
          dueDate.setDate(params.day_of_month || 10)

          const invoiceCode = `${reg.code}-C${i}`

          inserts.push({
            branch_id: reg.branch_id,
            registration_id: reg.id,
            code: invoiceCode,
            type: 'installment',
            amount: installmentAmount,
            paid_amount: 0,
            status: 'unpaid',
            due_date: dueDate.toISOString().split('T')[0],
            note: params.note || `Cicilan ke-${i} dari ${params.tenor_months} bulan`,
          })
        }
      }
    }

    if (inserts.length === 0) {
      return {
        success: false,
        count: 0,
        message: 'Semua jamaah pada paket ini telah memiliki tagihan penuh sesuai harga paket.',
      }
    }

    const { error: insertErr } = await supabase.from('payments').insert(inserts)

    if (insertErr) {
      console.error('generateMassInstallments insert error:', insertErr)
      return { success: false, count: 0, message: insertErr.message }
    }

    revalidatePath('/payments')
    revalidatePath('/registrations')

    return {
      success: true,
      count: inserts.length,
      message: `Berhasil menerbitkan ${inserts.length} invoice tagihan cicilan massal untuk seluruh jamaah paket!`,
    }
  } catch (err: any) {
    console.error('generateMassInstallments error:', err)
    return { success: false, count: 0, message: err.message || 'Terjadi kesalahan sistem' }
  }
}
