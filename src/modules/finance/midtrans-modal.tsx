'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  CreditCard,
  QrCode,
  Building2,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  Loader2,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  createMidtransSnapToken,
  handleMidtransSnapSuccess,
  syncMidtransTransactionStatus,
  simulateMidtransQrisPayment,
  getPaymentById,
} from './payments.actions'
import { ReceiptModal } from './receipt-modal'
import type { PaymentListItem, MidtransPaymentDetails } from './types'

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
  const [orderId, setOrderId] = useState<string | null>(null)
  const [snapToken, setSnapToken] = useState<string | null>(null)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const [details, setDetails] = useState<MidtransPaymentDetails | null>(null)
  const [isLoadingToken, setIsLoadingToken] = useState(false)
  const [isTriggeringQris, setIsTriggeringQris] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [updatedPayment, setUpdatedPayment] = useState<PaymentListItem | null>(null)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitiatedRef = useRef<number | null>(null)

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // Process verified payment
  const processSuccess = useCallback(
    async (completedOrderId: string, _grossAmount?: number, _paymentType?: string) => {
      stopPolling()
      setIsLoadingToken(false)
      setIsTriggeringQris(false)

      toast.success('Alhamdulillah, pembayaran berhasil diverifikasi!')

      if (payment) {
        try {
          const fresh = await getPaymentById(payment.id)
          if (fresh.data) {
            setUpdatedPayment(fresh.data)
          } else {
            setUpdatedPayment({
              ...payment,
              status: 'paid',
              paid_amount: payment.amount,
              remaining_balance: 0,
              paid_at: new Date().toISOString(),
            })
          }
        } catch {
          setUpdatedPayment({
            ...payment,
            status: 'paid',
            paid_amount: payment.amount,
            remaining_balance: 0,
            paid_at: new Date().toISOString(),
          })
        }
      }

      onSuccess()
      setShowReceipt(true)
    },
    [payment, onSuccess, stopPolling]
  )

  // Polling to detect payments completed externally via Midtrans Simulator
  const startPolling = useCallback(
    (targetOrderId: string) => {
      if (!payment || !targetOrderId) return
      stopPolling()

      pollingRef.current = setInterval(async () => {
        try {
          const res = await syncMidtransTransactionStatus(payment.id, targetOrderId)
          if (res.success && res.status === 'paid') {
            stopPolling()
            await processSuccess(targetOrderId)
          } else if (res.details) {
            setDetails((prev) => ({ ...prev, ...res.details }))
          }
        } catch {
          // Silent polling
        }
      }, 2500)
    },
    [payment, stopPolling, processSuccess]
  )

  // Initialize Snap Token when modal is opened
  useEffect(() => {
    if (isOpen && payment) {
      if (hasInitiatedRef.current !== payment.id) {
        hasInitiatedRef.current = payment.id
        setOrderId(null)
        setSnapToken(null)
        setRedirectUrl(null)
        setDetails(null)
        setShowReceipt(false)
        setUpdatedPayment(null)
        setIsLoadingToken(true)

        createMidtransSnapToken(payment.id)
          .then((res) => {
            if (res.success && res.snap?.token) {
              setOrderId(res.snap.order_id)
              setSnapToken(res.snap.token)
              setRedirectUrl(res.snap.redirect_url)
              startPolling(res.snap.order_id)
            } else {
              toast.error(res.message || 'Gagal memuat sesi Midtrans Snap.')
            }
          })
          .catch((err) => {
            toast.error(err.message || 'Gagal menghubungkan ke Midtrans.')
          })
          .finally(() => {
            setIsLoadingToken(false)
          })
      }
    } else {
      hasInitiatedRef.current = null
      stopPolling()
      setIsLoadingToken(false)
    }

    return () => {
      stopPolling()
    }
  }, [isOpen, payment?.id, startPolling, stopPolling])

  // Instant Trigger for QRIS Payment via Midtrans Simulator
  const handleTriggerQrisSimulation = async () => {
    if (!payment || !orderId) return
    setIsTriggeringQris(true)
    try {
      const res = await simulateMidtransQrisPayment(payment.id, orderId)
      if (res.success) {
        await processSuccess(orderId, payment.remaining_balance, 'QRIS (Sandbox Simulator)')
      } else {
        toast.error(res.message || 'Gagal memproses simulasi QRIS.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan pada trigger simulasi.')
    } finally {
      setIsTriggeringQris(false)
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
    toast.success('Berhasil disalin ke clipboard!')
  }

  // If receipt is shown, render the official ReceiptModal
  if (showReceipt) {
    return (
      <ReceiptModal
        payment={updatedPayment || payment}
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false)
          onClose()
        }}
      />
    )
  }

  if (!isOpen || !payment) return null

  // Effective QR Code Image URL that Midtrans QRIS Simulator expects
  const qrCodeUrl =
    details?.qr_code_url ||
    (details?.transaction_id
      ? `https://api.sandbox.midtrans.com/v2/qris/${details.transaction_id}/qr-code`
      : '')

  const remaining = Math.max(0, payment.remaining_balance)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-[460px] shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        {/* Header Bar */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  Pembayaran Midtrans Snap
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Sandbox
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">
                {payment.code} • Rp {remaining.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Tutup pembayaran"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sandbox Simulator Testing Controller Bar */}
        <div className="bg-slate-900 text-white px-3.5 py-2.5 border-b border-slate-800 text-xs shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-300">
              <span className="text-slate-400 font-sans text-[10px]">Order:</span>
              <span className="font-bold truncate max-w-[200px]">{orderId || 'Menyiapkan...'}</span>
              {orderId && (
                <button
                  type="button"
                  onClick={() => handleCopy(orderId, 'order_id')}
                  className="p-0.5 hover:text-white text-slate-400"
                  title="Salin Order ID"
                >
                  {copiedKey === 'order_id' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <RotateCw className="w-3 h-3 animate-spin text-emerald-400" />
              <span>Auto-detecting</span>
            </div>
          </div>

          {/* Quick Trigger & Simulator Links */}
          <div className="flex items-center gap-2">
            {qrCodeUrl ? (
              <button
                type="button"
                onClick={() => handleCopy(qrCodeUrl, 'qr_url')}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] border border-slate-700 transition-colors"
                title="Salin URL gambar QRIS untuk di-paste di Simulator"
              >
                {copiedKey === 'qr_url' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Salin URL QRIS</span>
              </button>
            ) : (
              <a
                href="https://simulator.sandbox.midtrans.com/v2/qris/index"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] border border-slate-700 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-sky-400" />
                <span>Web Simulator</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>
            )}

            {/* Instant Simulator Trigger Button */}
            <button
              type="button"
              onClick={handleTriggerQrisSimulation}
              disabled={isTriggeringQris || !orderId}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition-colors disabled:opacity-50"
              title="Simulasikan pembayaran QRIS berhasil langsung via Midtrans Simulator"
            >
              {isTriggeringQris ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{isTriggeringQris ? 'Memproses...' : '⚡ Trigger QRIS'}</span>
            </button>
          </div>
        </div>

        {/* Snap Official Redirection Popup Area */}
        <div className="relative flex-1 overflow-y-auto min-h-[620px] bg-slate-50 dark:bg-slate-900 flex flex-col">
          {isLoadingToken || !redirectUrl ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs z-10">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Memuat antarmuka Midtrans Snap...
              </span>
            </div>
          ) : (
            <iframe
              src={redirectUrl}
              className="w-full h-[620px] flex-1 border-0 rounded-b-2xl"
              title="Midtrans Snap Payment"
              allow="payment *"
            />
          )}

          {/* Backup link in case browser extensions block iframes */}
          {redirectUrl && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-center text-[10px] text-slate-400">
              Jika pop up tidak termuat sempurna:{' '}
              <a
                href={redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Buka di Tab Baru</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
