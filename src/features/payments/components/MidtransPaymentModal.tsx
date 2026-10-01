'use client'

import { useState, useEffect } from 'react'
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  RotateCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { createMidtransSnapToken, handleMidtransSnapSuccess, syncMidtransTransactionStatus } from '../actions'
import type { PaymentListItem } from '../types'

declare global {
  interface Window {
    snap?: any
  }
}

interface MidtransPaymentModalProps {
  payment: PaymentListItem | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function MidtransPaymentModal({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: MidtransPaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)
  const [orderId, setOrderId] = useState<string>('')
  const [mockProcessing, setMockProcessing] = useState(false)
  const [mockSelectedMethod, setMockSelectedMethod] = useState<'qris' | 'bca_va' | 'mandiri_va' | 'gopay'>('qris')
  const [syncing, setSyncing] = useState(false)
  const [copiedOrderId, setCopiedOrderId] = useState(false)

  const handleCopyOrderId = () => {
    if (!orderId) return
    navigator.clipboard.writeText(orderId)
    setCopiedOrderId(true)
    toast.success('Order ID berhasil disalin!')
    setTimeout(() => setCopiedOrderId(false), 2000)
  }

  const handleManualSync = async () => {
    if (!payment || !orderId) return
    setSyncing(true)
    try {
      const res = await syncMidtransTransactionStatus(payment.id, orderId)
      if (res.success && res.status === 'paid') {
        toast.success(res.message)
        onSuccess()
        onClose()
      } else {
        toast.info(res.message || 'Status belum berubah di Midtrans')
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memeriksa status')
    } finally {
      setSyncing(false)
    }
  }

  // Load Midtrans Snap.js script dynamically
  useEffect(() => {
    if (!isOpen) return

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-demo_key'
    const scriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'

    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`)
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = scriptUrl
      script.setAttribute('data-client-key', clientKey)
      script.async = true
      document.body.appendChild(script)
    }
  }, [isOpen])

  // Fetch token when modal opens
  useEffect(() => {
    if (!isOpen || !payment) return

    let isMounted = true
    setLoading(true)
    setToken(null)

    createMidtransSnapToken(payment.id)
      .then((res) => {
        if (!isMounted) return
        if (res.success && res.snap) {
          setToken(res.snap.token)
          setOrderId(res.snap.order_id)
          setIsMock(Boolean(res.snap.is_mock))

          // If real Midtrans Snap JS is available and not in mock mode, open Snap popup directly!
          if (!res.snap.is_mock && window.snap && typeof window.snap.pay === 'function') {
            window.snap.pay(res.snap.token, {
              onSuccess: async (result: any) => {
                toast.success('Pembayaran Midtrans berhasil!')
                await handleMidtransSnapSuccess(
                  payment.id,
                  res.snap?.order_id || '',
                  Number(result.gross_amount),
                  result.payment_type
                )
                onSuccess()
                onClose()
              },
              onPending: (result: any) => {
                toast.info('Menunggu pembayaran diselesaikan oleh jamaah.')
                onSuccess()
                onClose()
              },
              onError: (result: any) => {
                toast.error('Pembayaran gagal atau dibatalkan.')
              },
              onClose: async () => {
                if (res.snap?.order_id && !res.snap?.is_mock) {
                  try {
                    const syncRes = await syncMidtransTransactionStatus(payment.id, res.snap.order_id)
                    if (syncRes.success && syncRes.status === 'paid') {
                      toast.success(syncRes.message || 'Pembayaran Midtrans terkonfirmasi lunas!')
                      onSuccess()
                    }
                  } catch (e) {
                    console.error('Auto sync on close error:', e)
                  }
                }
                onClose()
              },
            })
          }
        } else {
          toast.error(res.message || 'Gagal memuat token Midtrans.')
        }
      })
      .catch((err) => {
        if (isMounted) toast.error(err.message || 'Terjadi kesalahan sistem')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, payment])

  if (!isOpen || !payment) return null

  // Function to simulate completing payment in Mock mode
  const handleSimulateMockPayment = async () => {
    setMockProcessing(true)
    try {
      const methodLabels: Record<string, string> = {
        qris: 'QRIS Gopay/ShopeePay',
        bca_va: 'BCA Virtual Account',
        mandiri_va: 'Mandiri Bill Payment',
        gopay: 'GoPay E-Wallet',
      }

      const res = await handleMidtransSnapSuccess(
        payment.id,
        orderId,
        payment.remaining_balance,
        methodLabels[mockSelectedMethod]
      )

      if (res.success) {
        toast.success(res.message)
        onSuccess()
        onClose()
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses simulasi')
    } finally {
      setMockProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                Bayar Online Midtrans Snap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sandbox Payment Gateway • QRIS, VA Bank & E-Wallet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading || mockProcessing}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Invoice Summary Box */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Invoice Tagihan:</span>
              <strong className="font-mono text-emerald-800 dark:text-emerald-300">
                {payment.code}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Nama Jamaah:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {payment.registrations?.pilgrims?.name}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Paket Terdaftar:</span>
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                {payment.registrations?.packages?.name}
              </span>
            </div>
            <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Total yang Harus Dibayar:
              </span>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                Rp {payment.remaining_balance.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Menghubungkan ke server Midtrans Sandbox...</p>
            </div>
          ) : isMock ? (
            /* Interactive Sandbox Simulator */
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-300">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  <strong>Sandbox Simulator Mode</strong>: Anda dapat memilih metode di bawah dan menguji pembayaran langsung untuk mensimulasikan transaksi sukses.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Saluran Pembayaran Sandbox:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMockSelectedMethod('qris')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs ${
                      mockSelectedMethod === 'qris'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>QRIS (Gopay / Shopee)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMockSelectedMethod('bca_va')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs ${
                      mockSelectedMethod === 'bca_va'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>BCA Virtual Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMockSelectedMethod('mandiri_va')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs ${
                      mockSelectedMethod === 'mandiri_va'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Mandiri Bill Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMockSelectedMethod('gopay')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all text-xs ${
                      mockSelectedMethod === 'gopay'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>GoPay / E-Wallet</span>
                  </button>
                </div>
              </div>

              {/* Simulation Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSimulateMockPayment}
                  disabled={mockProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {mockProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>
                    {mockProcessing
                      ? 'Memproses Pembayaran...'
                      : 'Simulasikan Pembayaran Sukses (Sandbox)'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Snap Popup Trigger and Simulator Testing Helper */
            <div className="space-y-4 pt-1">
              <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Jendela pembayaran Midtrans Snap telah aktif. Jika popup tertutup, klik tombol di bawah untuk membukanya kembali:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (token && window.snap) {
                      window.snap.pay(token, {
                        onSuccess: async (result: any) => {
                          toast.success('Pembayaran Midtrans berhasil!')
                          await handleMidtransSnapSuccess(
                            payment.id,
                            orderId,
                            Number(result.gross_amount),
                            result.payment_type
                          )
                          onSuccess()
                          onClose()
                        },
                        onPending: () => {
                          toast.info('Menunggu pembayaran diselesaikan oleh jamaah.')
                        },
                        onClose: async () => {
                          if (orderId && !isMock) {
                            try {
                              const syncRes = await syncMidtransTransactionStatus(payment.id, orderId)
                              if (syncRes.success && syncRes.status === 'paid') {
                                toast.success(syncRes.message || 'Pembayaran Midtrans terkonfirmasi lunas!')
                                onSuccess()
                              }
                            } catch (e) {
                              console.error('Auto sync on close error:', e)
                            }
                          }
                          onClose()
                        },
                      })
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Buka Jendela Pembayaran Snap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sandbox Testing & Simulator Helper Card */}
              <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-900 dark:text-sky-200">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>Panduan Pengujian Midtrans Simulator</span>
                  </div>
                  {orderId && (
                    <button
                      type="button"
                      onClick={handleCopyOrderId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 hover:bg-sky-100 transition-colors"
                      title="Salin Order ID Transaksi"
                    >
                      {copiedOrderId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{orderId}</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed">
                  Setelah memilih Virtual Account atau QRIS di Snap, Anda dapat menyimulasikan transfer sukses melalui <strong>Midtrans Payment Simulator</strong>:
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href="https://simulator.sandbox.midtrans.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-750 text-sky-700 dark:text-sky-300 text-xs font-medium rounded-lg border border-sky-200 dark:border-sky-700 transition-colors shadow-sm"
                  >
                    <span>Buka Midtrans Simulator</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'Memeriksa...' : 'Cek Status Midtrans'}</span>
                  </button>
                </div>

                <div className="text-[10px] text-sky-700/80 dark:text-sky-400 italic">
                  * Catatan: Jika Webhook Notification URL terhubung, status tagihan otomatis berubah menjadi Lunas tanpa perlu menekan tombol apa pun.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
