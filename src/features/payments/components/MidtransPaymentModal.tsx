'use client'

import { useState, useEffect, useRef } from 'react'
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
  Lock,
  ArrowRight,
  Sparkles,
  Printer,
  ChevronRight,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  createMidtransSnapToken,
  handleMidtransSnapSuccess,
  syncMidtransTransactionStatus,
} from '../actions'
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

type PaymentChannel =
  | 'dana'
  | 'gopay'
  | 'shopeepay'
  | 'bca_va'
  | 'mandiri_va'
  | 'bni_va'
  | 'bri_va'
  | 'permata_va'
  | 'qris'

export function MidtransPaymentModal({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: MidtransPaymentModalProps) {
  // Modal Stages: 'select_method' | 'processing' | 'active_checkout' | 'success'
  const [stage, setStage] = useState<'select_method' | 'processing' | 'active_checkout' | 'success'>('select_method')
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('dana')
  const [orderId, setOrderId] = useState<string>('')
  const [snapToken, setSnapToken] = useState<string | null>(null)
  const [deeplinkUrl, setDeeplinkUrl] = useState<string>('')
  const [redirectUrl, setRedirectUrl] = useState<string>('')
  const [isMock, setIsMock] = useState(false)
  const [isAuthorizing, setIsAuthorizing] = useState(false)
  const [pin, setPin] = useState('123456')
  const [copiedOrderId, setCopiedOrderId] = useState(false)
  const [copiedVa, setCopiedVa] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Reset state whenever modal opens with a new payment
  useEffect(() => {
    if (isOpen) {
      setStage('select_method')
      setSelectedChannel('dana')
      setOrderId('')
      setSnapToken(null)
      setDeeplinkUrl('')
      setRedirectUrl('')
      setIsMock(false)
      setIsAuthorizing(false)
      setPin('123456')
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    }
  }, [isOpen, payment?.id])

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  // Start real-time background polling when transaction is active
  const startStatusPolling = (orderIdToPoll: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current)

    pollingRef.current = setInterval(async () => {
      if (!payment || !orderIdToPoll) return
      try {
        const res = await syncMidtransTransactionStatus(payment.id, orderIdToPoll)
        if (res.success && res.status === 'paid') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          setStage('success')
          toast.success('Pembayaran berhasil dikonfirmasi secara real-time!')
          onSuccess()
        }
      } catch (err) {
        // silent fail on polling interval
      }
    }, 4000)
  }

  if (!isOpen || !payment) return null

  const lockedAmount = Math.max(0, payment.remaining_balance)
  const formattedAmount = `Rp ${lockedAmount.toLocaleString('id-ID')}`

  // Handle clicking "Bayar Sekarang"
  const handleInitiatePayment = async () => {
    setStage('processing')
    try {
      const res = await createMidtransSnapToken(payment.id, selectedChannel)

      if (!res.success || !res.snap) {
        toast.error(res.message || 'Gagal memulai transaksi pembayaran.')
        setStage('select_method')
        return
      }

      const snap = res.snap
      setOrderId(snap.order_id)
      setSnapToken(snap.token)
      setRedirectUrl(snap.redirect_url)
      setIsMock(Boolean(snap.is_mock))

      const directDeeplink = snap.deeplink_url || snap.redirect_url
      setDeeplinkUrl(directDeeplink)

      // Check if mobile device
      const isMobile =
        typeof window !== 'undefined' &&
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

      // Start automatic background verification
      startStatusPolling(snap.order_id)

      if (isMobile && (selectedChannel === 'dana' || selectedChannel === 'gopay')) {
        // Direct launch to DANA/GoPay App
        toast.info(`Membuka aplikasi ${selectedChannel.toUpperCase()}...`)
        window.location.href = directDeeplink
      }

      // Transition to active checkout view (for Desktop / Mobile fallback)
      setStage('active_checkout')
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.')
      setStage('select_method')
    }
  }

  // Handle simulating PIN confirmation in DANA / Simulator
  const handleConfirmPinPayment = async () => {
    setIsAuthorizing(true)
    try {
      const channelLabels: Record<PaymentChannel, string> = {
        dana: 'DANA E-Wallet',
        gopay: 'GoPay E-Wallet',
        shopeepay: 'ShopeePay',
        bca_va: 'BCA Virtual Account',
        mandiri_va: 'Mandiri Bill Payment',
        bni_va: 'BNI Virtual Account',
        bri_va: 'BRI Virtual Account',
        permata_va: 'Permata Virtual Account',
        qris: 'QRIS Scan & Pay',
      }

      const res = await handleMidtransSnapSuccess(
        payment.id,
        orderId || `PAY-${payment.id}-${Date.now()}`,
        lockedAmount,
        channelLabels[selectedChannel]
      )

      if (res.success) {
        if (pollingRef.current) clearInterval(pollingRef.current)
        setStage('success')
        toast.success(`Pembayaran ${channelLabels[selectedChannel]} berhasil diverifikasi!`)
        onSuccess()
      } else {
        toast.error(res.message || 'Gagal menyelesaikan pembayaran.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan otorisasi.')
    } finally {
      setIsAuthorizing(false)
    }
  }

  const handleCopyText = (text: string, type: 'order' | 'va') => {
    navigator.clipboard.writeText(text)
    if (type === 'order') {
      setCopiedOrderId(true)
      setTimeout(() => setCopiedOrderId(false), 2000)
    } else {
      setCopiedVa(true)
      setTimeout(() => setCopiedVa(false), 2000)
    }
    toast.success('Berhasil disalin ke clipboard!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Detail & Metode Pembayaran
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih saluran resmi untuk pelunasan tagihan ibadah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* ========================================================================= */}
          {/* STAGE 1: SELECT METHOD & VIEW LOCKED INVOICE DETAILS                      */}
          {/* ========================================================================= */}
          {stage === 'select_method' && (
            <>
              {/* Box Rincian Tagihan & Nominal Terkunci */}
              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/60 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Invoice:</span>
                    <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {payment.code}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Tagihan Sah
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Nama Jamaah:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {payment.registrations?.pilgrims?.name || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Paket Umroh/Haji:</span>
                    <span className="text-slate-800 dark:text-slate-200 truncate block font-medium">
                      {payment.registrations?.packages?.name || '-'}
                    </span>
                  </div>
                </div>

                {/* Locked Amount Display */}
                <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Nominal Pembayaran Terkunci:
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Otomatis terkunci di aplikasi DANA & e-wallet
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                      {formattedAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pilihan Metode Pembayaran */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    Pilih Saluran Pembayaran:
                  </label>
                  <span className="text-[11px] text-slate-500">Paling Cepat & Instan</span>
                </div>

                {/* Section 1: E-Wallets */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Dompet Digital (E-Wallet)
                  </span>

                  {/* DANA - REKOMENDASI UTAMA */}
                  <div
                    onClick={() => setSelectedChannel('dana')}
                    className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      selectedChannel === 'dana'
                        ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-xs tracking-wider shadow-sm shrink-0">
                        DANA
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            DANA E-Wallet
                          </strong>
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                            <Sparkles className="w-3 h-3 text-sky-600" />
                            Rekomendasi
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Buka aplikasi DANA langsung siap transfer dengan nominal terkunci.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedChannel === 'dana'
                          ? 'border-sky-600 bg-sky-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selectedChannel === 'dana' && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  {/* GoPay */}
                  <div
                    onClick={() => setSelectedChannel('gopay')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      selectedChannel === 'gopay'
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                        GoPay
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                          GoPay / Gojek
                        </strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Buka aplikasi Gojek / scan QRIS GoPay dengan nominal terkunci.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedChannel === 'gopay'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selectedChannel === 'gopay' && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  {/* ShopeePay */}
                  <div
                    onClick={() => setSelectedChannel('shopeepay')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      selectedChannel === 'shopeepay'
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                        Shopee
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                          ShopeePay
                        </strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Buka aplikasi ShopeePay otomatis.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedChannel === 'shopeepay'
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {selectedChannel === 'shopeepay' && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </div>
                </div>

                {/* Section 2: Virtual Account (Bank Transfer) */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Virtual Account (Transfer Otomatis 24 Jam)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'bca_va', label: 'BCA Virtual Account', code: 'BCA' },
                      { id: 'mandiri_va', label: 'Mandiri Bill Payment', code: 'MANDIRI' },
                      { id: 'bni_va', label: 'BNI Virtual Account', code: 'BNI' },
                      { id: 'bri_va', label: 'BRI (BRIVA)', code: 'BRI' },
                    ].map((bank) => (
                      <div
                        key={bank.id}
                        onClick={() => setSelectedChannel(bank.id as PaymentChannel)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                          selectedChannel === bank.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <span className="truncate">{bank.label}</span>
                        {selectedChannel === bank.id && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: QRIS */}
                <div>
                  <div
                    onClick={() => setSelectedChannel('qris')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      selectedChannel === 'qris'
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-slate-900 dark:text-white block">
                          QRIS (Scan Semua Bank & E-Wallet)
                        </strong>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Scan instan dari Livin, BCA Mobile, BRImo, DANA, OVO, GoPay.
                        </p>
                      </div>
                    </div>
                    {selectedChannel === 'qris' && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Action: "Bayar Sekarang" */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>
                    {selectedChannel === 'dana'
                      ? `Bayar via DANA — ${formattedAmount}`
                      : `Bayar Sekarang — ${formattedAmount}`}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Transaksi resmi dilindungi Midtrans Payment Gateway & OJK
                </p>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: LOADING / CONNECTING TO PAYMENT GATEWAY                          */}
          {/* ========================================================================= */}
          {stage === 'processing' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Menghubungkan ke Saluran {selectedChannel.toUpperCase()}...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Menyiapkan transaksi aman dengan nominal terkunci{' '}
                  <strong className="text-slate-800 dark:text-slate-200">{formattedAmount}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 3: ACTIVE CHECKOUT / DANA APP DEEPLINK & SIMULATOR                  */}
          {/* ========================================================================= */}
          {stage === 'active_checkout' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Box Info Nominal Terkunci */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Order ID:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {orderId}
                    </span>
                    <button
                      onClick={() => handleCopyText(orderId, 'order')}
                      className="p-1 text-slate-400 hover:text-slate-600"
                      title="Salin Order ID"
                    >
                      {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Nominal Siap Transfer:</span>
                  </div>
                  <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                    {formattedAmount}
                  </span>
                </div>
              </div>

              {/* TAMPILAN KHUSUS DANA */}
              {selectedChannel === 'dana' && (
                <div className="p-4 rounded-2xl border-2 border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-sm shadow-md shrink-0">
                      DANA
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        Aplikasi DANA Siap Menerima Pembayaran
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Nominal <strong className="text-sky-700 dark:text-sky-300">{formattedAmount}</strong> sudah terkunci otomatis.
                      </p>
                    </div>
                  </div>

                  {/* Tombol Deeplink DANA Langsung (Untuk HP / Mobile) */}
                  <a
                    href={deeplinkUrl || `dana://checkout?order_id=${orderId}&amount=${lockedAmount}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Buka Aplikasi DANA (Deep Link Otomatis)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* SIMULATOR OTORISASI PIN DANA (UNTUK PENGUJIAN DESKTOP & SANDBOX) */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-sky-600" />
                        Otorisasi PIN DANA (Sandbox Simulator)
                      </span>
                      <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/50 px-2 py-0.5 rounded-full">
                        Siap Bayar
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Di HP, Anda tinggal memasukkan PIN DANA. Pada sesi uji coba ini, klik tombol di bawah untuk memvalidasi otorisasi PIN & pelunasan instan:
                    </p>

                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="PIN DANA (6 digit)"
                        className="w-36 px-3 py-2 text-center font-mono tracking-widest text-sm font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleConfirmPinPayment}
                        disabled={isAuthorizing}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        {isAuthorizing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Memproses PIN...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Konfirmasi PIN & Bayar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAMPILAN JIKA PILIH SALURAN LAIN (GOPAY, QRIS, ATAU VA) */}
              {selectedChannel !== 'dana' && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Saluran: {selectedChannel.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">Nominal: {formattedAmount}</span>
                  </div>

                  {selectedChannel === 'qris' && (
                    <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl text-center space-y-2">
                      <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center rounded-lg border border-dashed border-slate-300">
                        <QrCode className="w-20 h-20 text-slate-800 dark:text-white" />
                      </div>
                      <p className="text-[11px] text-slate-500">Scan QRIS menggunakan DANA / GoPay / M-Banking Anda</p>
                    </div>
                  )}

                  {selectedChannel.includes('_va') && (
                    <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Nomor Virtual Account:</span>
                        <strong className="font-mono text-sm text-slate-800 dark:text-slate-100">
                          8808{orderId.replace(/\D/g, '').slice(-8) || '12345678'}
                        </strong>
                      </div>
                      <button
                        onClick={() => handleCopyText(`8808${orderId.replace(/\D/g, '').slice(-8) || '12345678'}`, 'va')}
                        className="px-2.5 py-1 text-xs border rounded-lg hover:bg-slate-50"
                      >
                        {copiedVa ? 'Tersalin' : 'Salin VA'}
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmPinPayment}
                    disabled={isAuthorizing}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    {isAuthorizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Konfirmasi Pembayaran Selesai</span>
                  </button>
                </div>
              )}

              {/* Auto-sync Status Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                  <span>Sistem memantau pelunasan secara real-time...</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStage('select_method')}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Ubah Metode
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 4: SUCCESS / PAYMENT CONFIRMED SCREEN                               */}
          {/* ========================================================================= */}
          {stage === 'success' && (
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="font-extrabold text-xl text-slate-900 dark:text-white">
                  Alhamdulillah, Pembayaran Berhasil!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Tagihan invoice <strong className="text-slate-800 dark:text-slate-200">{payment.code}</strong> sebesar{' '}
                  <strong className="text-emerald-700 dark:text-emerald-300">{formattedAmount}</strong> telah lunas diverifikasi.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedChannel === 'dana' ? 'DANA E-Wallet' : selectedChannel.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Database:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Lunas (Paid)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Transaksi:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess()
                    onClose()
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  Selesai & Ke Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
