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
  return Boolean(serverKey && !serverKey.includes('demo_key') && serverKey.startsWith('SB-Mid-server-'))
}
