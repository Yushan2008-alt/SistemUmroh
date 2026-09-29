import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyMidtransSignature, isMidtransConfigured } from '@/lib/midtrans'
import { logActivity } from '@/lib/activity-logger'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json()

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = payload

    if (!order_id || !status_code || !gross_amount) {
      return NextResponse.json(
        { success: false, message: 'Payload tidak lengkap.' },
        { status: 400 }
      )
    }

    // 1. Verify Midtrans Security Signature (if configured in environment)
    if (isMidtransConfigured() && signature_key) {
      const isValid = verifyMidtransSignature(
        order_id,
        String(status_code),
        String(gross_amount),
        String(signature_key)
      )

      if (!isValid) {
        console.warn(`[Midtrans Webhook] Invalid signature key for Order ID: ${order_id}`)
        return NextResponse.json(
          { success: false, message: 'Invalid signature key.' },
          { status: 401 }
        )
      }
    }

    const supabase = createAdminClient() as any

    // 2. Locate the target payment record
    // Support formats:
    // Format A: "PAY-12-CODE-9999" (contains payment.id)
    // Format B: "CODE-9999" (contains payment.code)
    let payment: any = null

    if (order_id.startsWith('PAY-')) {
      const parts = order_id.split('-')
      const paymentId = parseInt(parts[1], 10)
      if (!isNaN(paymentId)) {
        const { data } = await supabase
          .from('payments')
          .select('*, registrations(*, packages(*))')
          .eq('id', paymentId)
          .maybeSingle()
        payment = data
      }
    }

    if (!payment) {
      // Try searching by payment code prefix
      const lastDashIdx = order_id.lastIndexOf('-')
      const baseCode = lastDashIdx !== -1 ? order_id.substring(0, lastDashIdx) : order_id

      const { data } = await supabase
        .from('payments')
        .select('*, registrations(*, packages(*))')
        .eq('code', baseCode)
        .maybeSingle()
      payment = data
    }

    if (!payment) {
      // Fallback: search by exact order_id match on code
      const { data } = await supabase
        .from('payments')
        .select('*, registrations(*, packages(*))')
        .eq('code', order_id)
        .maybeSingle()
      payment = data
    }

    if (!payment) {
      console.warn(`[Midtrans Webhook] Tagihan tidak ditemukan untuk Order ID: ${order_id}`)
      // Return 200 OK so Midtrans stops retrying unknown or test transactions
      return NextResponse.json({
        success: true,
        message: `Transaksi diterima, tagihan tidak ditemukan di sistem: ${order_id}`,
      })
    }

    // 3. Process Status
    const isSuccess =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept')

    if (isSuccess) {
      const totalAmount = Number(payment.amount) || 0
      const paymentTypeLabel = payment_type ? payment_type.toUpperCase() : 'ONLINE'

      // Update payment to 'paid'
      const { error: payErr } = await supabase
        .from('payments')
        .update({
          paid_amount: totalAmount,
          status: 'paid',
          paid_at: new Date().toISOString(),
          method: 'transfer',
          note: `Lunas otomatis via Midtrans Webhook (${paymentTypeLabel}) Ref: ${order_id}`,
        })
        .eq('id', payment.id)

      if (payErr) {
        console.error('[Midtrans Webhook] Failed to update payment status:', payErr)
        return NextResponse.json({ success: false, message: payErr.message }, { status: 500 })
      }

      // Check registration total balance
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

        const newRegistrationStatus =
          allInvoicesPaid || totalPaid >= registrationPrice ? 'paid' : 'confirmed'

        await supabase
          .from('registrations')
          .update({
            status: newRegistrationStatus,
          })
          .eq('id', payment.registration_id)
      }

      // Record Audit Trail in activity_logs
      await logActivity({
        action: 'payment_completed_webhook',
        subject_type: 'payment',
        subject_id: String(payment.id),
        description: `Pembayaran tagihan ${payment.code} sebesar Rp ${totalAmount.toLocaleString(
          'id-ID'
        )} via Midtrans ${paymentTypeLabel} berhasil diselesaikan otomatis oleh Webhook (Ref: ${order_id}).`,
        branch_id: payment.branch_id,
        properties: {
          order_id,
          transaction_id,
          payment_type,
          transaction_status,
          gross_amount,
        },
      })

      // Revalidate cache
      revalidatePath('/payments')
      revalidatePath('/registrations')
      revalidatePath('/dashboard')

      console.log(`[Midtrans Webhook] Sukses memproses pembayaran lunas untuk tagihan: ${payment.code}`)
      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil diselesaikan dan status diperbarui otomatis menjadi Lunas.',
      })
    } else if (transaction_status === 'pending') {
      console.log(`[Midtrans Webhook] Transaksi ${order_id} masih berstatus pending.`)
      return NextResponse.json({
        success: true,
        message: 'Transaksi berstatus pending (menunggu pembayaran jamaah).',
      })
    } else if (
      transaction_status === 'deny' ||
      transaction_status === 'cancel' ||
      transaction_status === 'expire'
    ) {
      // Record cancelled/expired
      await supabase
        .from('payments')
        .update({
          note: `Midtrans transaksi status: ${transaction_status.toUpperCase()} Ref: ${order_id}`,
        })
        .eq('id', payment.id)

      await logActivity({
        action: `payment_${transaction_status}_webhook`,
        subject_type: 'payment',
        subject_id: String(payment.id),
        description: `Transaksi Midtrans untuk tagihan ${payment.code} berstatus ${transaction_status.toUpperCase()} (Ref: ${order_id}).`,
        branch_id: payment.branch_id,
        properties: {
          order_id,
          transaction_status,
        },
      })

      revalidatePath('/payments')

      return NextResponse.json({
        success: true,
        message: `Transaksi berstatus: ${transaction_status}`,
      })
    }

    return NextResponse.json({ success: true, message: `Status transaksi: ${transaction_status}` })
  } catch (err: any) {
    console.error('[Midtrans Webhook] Error handler:', err)
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
