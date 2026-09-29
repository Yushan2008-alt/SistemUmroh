import crypto from 'crypto'
// @ts-ignore
import midtransClient from 'midtrans-client'

export function getMidtransSnap() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-demo_key'
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-demo_key'
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

  return new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey,
  })
}

export function getMidtransCoreApi() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-demo_key'
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-demo_key'
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'

  return new midtransClient.CoreApi({
    isProduction,
    serverKey,
    clientKey,
  })
}

export function isMidtransConfigured(): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  return Boolean(
    serverKey &&
    !serverKey.includes('demo_key') &&
    (serverKey.startsWith('SB-Mid-server-') || serverKey.startsWith('Mid-server-'))
  )
}

/**
 * Verify Midtrans Webhook Notification Signature Key
 * Format: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
  if (!serverKey) return false

  const rawInput = `${orderId}${statusCode}${grossAmount}${serverKey}`
  const expectedHash = crypto.createHash('sha512').update(rawInput).digest('hex')
  return expectedHash.toLowerCase() === signatureKey.toLowerCase()
}

