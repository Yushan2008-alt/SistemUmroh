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
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  createDirectMidtransCharge,
  handleMidtransSnapSuccess,
  syncMidtransTransactionStatus,
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
  const [activeTab, setActiveTab] = useState<'qris' | 'va'>('qris')
  const [selectedBank, setSelectedBank] = useState<'bca' | 'mandiri' | 'bri' | 'bni' | 'permata'>('bca')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [details, setDetails] = useState<MidtransPaymentDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
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
      setIsLoading(false)
      setIsSimulating(false)

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
      }, 3000)
    },
    [payment, stopPolling, processSuccess]
  )

  // Load / initialize direct charge session for QRIS or VA
  const initCharge = useCallback(
    async (method: 'qris' | 'bca_va' | 'bri_va' | 'bni_va' | 'mandiri_bill') => {
      if (!payment) return
      setIsLoading(true)

      try {
        const res = await createDirectMidtransCharge(payment.id, method)
        if (res.success && res.details && res.order_id) {
          setOrderId(res.order_id)
          setDetails(res.details)
          startPolling(res.order_id)
        } else {
          toast.error(res.message || 'Gagal memuat sesi transaksi.')
        }
      } catch (err: any) {
        toast.error(err.message || 'Terjadi gangguan koneksi Midtrans.')
      } finally {
        setIsLoading(false)
      }
    },
    [payment, startPolling]
  )

  // Reset and initialize strictly ONCE per modal opening
  useEffect(() => {
    if (isOpen && payment) {
      if (hasInitiatedRef.current !== payment.id) {
        hasInitiatedRef.current = payment.id
        setOrderId(null)
        setDetails(null)
        setActiveTab('qris')
        setSelectedBank('bca')
        setShowReceipt(false)
        setUpdatedPayment(null)
        initCharge('qris')
      }
    } else {
      hasInitiatedRef.current = null
      stopPolling()
      setIsLoading(false)
    }

    return () => {
      stopPolling()
    }
  }, [isOpen, payment?.id, initCharge, stopPolling])

  // Instant In-App Sandbox Simulation Trigger
  const handleSimulateSandboxPayment = async () => {
    if (!payment) return
    setIsSimulating(true)
    try {
      const effectiveOrderId =
        orderId || `PAY-${payment.id}-${payment.code}-${Date.now().toString().slice(-4)}`
      const remainingAmount = Math.max(0, payment.remaining_balance)
      const channelLabel =
        activeTab === 'qris'
          ? 'QRIS (Sanlance)'
          : `${selectedBank.toUpperCase()} Virtual Account`

      const res = await handleMidtransSnapSuccess(
        payment.id,
        effectiveOrderId,
        remainingAmount,
        channelLabel
      )

      if (res.success) {
        await processSuccess(effectiveOrderId, remainingAmount, channelLabel)
      } else {
        toast.error(res.message || 'Gagal memproses simulasi pembayaran.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setIsSimulating(false)
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
    toast.success('Berhasil disalin ke clipboard!')
  }

  // If receipt is shown, render only the official ReceiptModal
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

  const remaining = Math.max(0, payment.remaining_balance)
  const formattedAmount = `Rp ${remaining.toLocaleString('id-ID')}`
  const pilgrimName = payment.registrations?.pilgrims?.name || 'Jamaah'
  const packageName = payment.registrations?.packages?.name || 'Paket Umroh'

  // Determine effective QR Code Image URL (Public URL that Midtrans Simulator can fetch)
  const qrCodeUrl =
    details?.qr_code_url ||
    (details?.transaction_id
      ? `https://api.sandbox.midtrans.com/v2/qris/${details.transaction_id}/qr-code`
      : '')

  // Virtual Account number for current bank
  const currentVaObj = details?.va_numbers?.find(
    (v) => v.bank.toLowerCase() === selectedBank.toLowerCase()
  ) || details?.va_numbers?.[0]
  const currentVaNumber = currentVaObj?.va_number

  // Bank Simulator URLs
  const bankSimulatorMap: Record<string, string> = {
    bca: 'https://simulator.sandbox.midtrans.com/bca/va/index',
    bri: 'https://simulator.sandbox.midtrans.com/openapi/va/index?bank=bri',
    bni: 'https://simulator.sandbox.midtrans.com/bni/va/index',
    mandiri: 'https://simulator.sandbox.midtrans.com/openapi/va/index?bank=mandiri',
    permata: 'https://simulator.sandbox.midtrans.com/openapi/va/index?bank=permata',
  }
  const currentBankSimulatorUrl = bankSimulatorMap[selectedBank] || 'https://simulator.sandbox.midtrans.com/bca/va/index'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                Midtrans Payment
              </h3>
              <span className="text-[10px] text-slate-500 font-mono block">
                {payment.code}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount & Summary Header */}
        <div className="px-5 py-3 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">
              Total Pembayaran
            </span>
            <span className="font-extrabold text-lg sm:text-xl font-mono text-white">
              {formattedAmount}
            </span>
            <span className="text-[11px] text-emerald-200/80 block truncate max-w-[260px]">
              {packageName} • {pilgrimName}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-600/50">
              Sandbox
            </span>
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('qris')
              if (!details?.qr_code_url) initCharge('qris')
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'qris'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>GoPay / QRIS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('va')
              if (!details?.va_numbers) initCharge('bca_va')
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'va'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Virtual Account</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="py-10 text-center space-y-2.5">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                Menyiapkan transaksi Midtrans Sandbox...
              </p>
            </div>
          ) : activeTab === 'qris' ? (
            /* TAB: QRIS / GOPAY */
            <div className="space-y-3.5 text-center animate-in fade-in duration-150">
              {/* Merchant Title */}
              <div className="space-y-0.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                  Sanlance
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  NMID: ID1026526624386 • QRIS Standar Nasional
                </span>
              </div>

              {/* Native QR Code Image */}
              <div className="relative inline-block mx-auto group">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QRIS Midtrans Code"
                    className="w-52 h-52 mx-auto object-contain p-2 bg-white rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-context-menu"
                    title="Klik kanan gambar ini > Copy image address untuk simulator"
                  />
                ) : (
                  <div className="w-52 h-52 mx-auto flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Instructional Context Hint */}
              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-300 space-y-1">
                <span className="font-bold block">
                  💡 Cara Pengujian di Midtrans Simulator:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Klik kanan gambar QR di atas &gt; pilih <strong>&quot;Copy image address&quot;</strong>, lalu tempelkan ke kolom simulator QRIS.
                </p>
              </div>

              {/* Simulator Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href="https://simulator.sandbox.midtrans.com/qris/index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold hover:bg-sky-100 transition-colors"
                >
                  <span>Buka Simulator QRIS Midtrans</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleSimulateSandboxPayment}
                  disabled={isSimulating}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSimulating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>Simulasi Bayar Instan (1-Klik Lunas)</span>
                </button>
              </div>
            </div>
          ) : (
            /* TAB: VIRTUAL ACCOUNT */
            <div className="space-y-3.5 animate-in fade-in duration-150">
              {/* Bank Selector Pills */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Pilih Bank:
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {(['bca', 'bri', 'bni', 'mandiri', 'permata'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setSelectedBank(b)
                        const mapMethod: Record<string, any> = {
                          bca: 'bca_va',
                          bri: 'bri_va',
                          bni: 'bni_va',
                          mandiri: 'mandiri_bill',
                          permata: 'bca_va',
                        }
                        initCharge(mapMethod[b])
                      }}
                      className={`py-1.5 px-1 rounded-lg text-xs font-extrabold uppercase transition-all text-center ${
                        selectedBank === b
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* VA Number Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Nomor Virtual Account ({selectedBank.toUpperCase()}):
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-extrabold text-base text-emerald-700 dark:text-emerald-300 select-all tracking-wide">
                    {currentVaNumber ||
                      (selectedBank === 'mandiri' && details?.bill_key
                        ? `Key: ${details.bill_key}`
                        : 'Menyiapkan VA...')}
                  </span>
                  {currentVaNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopy(currentVaNumber, 'va')}
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-xs transition-colors"
                    >
                      {copiedKey === 'va' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin VA</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {selectedBank === 'mandiri' && details?.bill_key && (
                  <div className="text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200/60 dark:border-slate-700 flex justify-between">
                    <span>Company Code: <strong>{details.biller_code || '70012'}</strong></span>
                    <span>Bill Key: <strong>{details.bill_key}</strong></span>
                  </div>
                )}
              </div>

              {/* Bank Simulator Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href={currentBankSimulatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold hover:bg-sky-100 transition-colors"
                >
                  <span>Buka Simulator VA {selectedBank.toUpperCase()}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleSimulateSandboxPayment}
                  disabled={isSimulating}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSimulating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>Simulasi Bayar Instan</span>
                </button>
              </div>
            </div>
          )}

          {/* Polling Tracker Footer */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <RotateCw className="w-3 h-3 text-emerald-600 animate-spin" />
              <span>Auto-sync aktif (3s)</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>256-Bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
