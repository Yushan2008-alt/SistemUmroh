'use client'

import { useRef } from 'react'
import {
  X,
  Printer,
  CheckCircle2,
  Building2,
  ShieldCheck,
  CreditCard,
  Calendar,
} from 'lucide-react'
import type { PaymentListItem } from '../types'

interface ReceiptModalProps {
  payment: PaymentListItem | null
  isOpen: boolean
  onClose: () => void
}

// Helper to convert number to Indonesian words (terbilang)
function terbilang(n: number): string {
  const angka = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ]

  if (n < 12) return angka[n]
  if (n < 20) return terbilang(n - 10) + ' Belas'
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10)
  if (n < 200) return 'Seratus ' + terbilang(n - 100)
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100)
  if (n < 2000) return 'Seribu ' + terbilang(n - 1000)
  if (n < 1000000) return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000)
  if (n < 1000000000) return terbilang(Math.floor(n / 1000000)) + ' Juta ' + terbilang(n % 1000000)
  if (n < 1000000000000) return terbilang(Math.floor(n / 1000000000)) + ' Miliar ' + terbilang(n % 1000000000)
  return ''
}

export function ReceiptModal({ payment, isOpen, onClose }: ReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !payment) return null

  const handlePrint = () => {
    window.print()
  }

  const pilgrim = payment.registrations?.pilgrims
  const pkg = payment.registrations?.packages
  const branchName = payment.branches?.name || 'Kantor Pusat Jakarta'

  const receiptNumber = `KW-${payment.code.replace('REG-', '').replace('PAY-', '')}`
  const paidAmount = Number(payment.paid_amount) || 0
  const wordsAmount = terbilang(paidAmount).trim() + ' Rupiah'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header toolbar */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 print:hidden">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
              Pratinjau Kwitansi Pembayaran
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
              {receiptNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kwitansi</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="flex-1 overflow-auto p-6 md:p-8 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
          <div
            ref={receiptRef}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-8 shadow-sm space-y-6 text-slate-900 dark:text-slate-100 relative overflow-hidden"
          >
            {/* Watermark Stempel Lunas */}
            {payment.status === 'paid' && (
              <div className="absolute right-8 top-28 border-4 border-emerald-600/30 text-emerald-600/40 font-black text-2xl uppercase tracking-widest px-6 py-2 rounded-xl rotate-[-15deg] select-none pointer-events-none">
                LUNAS
              </div>
            )}

            {/* Travel Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-700 pb-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
                  AL-MADINAH TRAVEL
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Penyelenggara Perjalanan Ibadah Umroh & Haji Khusus
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cabang: {branchName} • Izin Kemenag No. 912/2020
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold uppercase tracking-wider block text-slate-900 dark:text-white">
                  TANDA TERIMA PEMBAYARAN
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 block mt-0.5">
                  No: {receiptNumber}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Tanggal:{' '}
                  {payment.paid_at
                    ? new Date(payment.paid_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : new Date().toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                </span>
              </div>
            </div>

            {/* Receipt Body Details */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-4 gap-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Telah Diterima Dari
                </span>
                <span className="col-span-3 font-bold text-slate-900 dark:text-white text-sm">
                  : {pilgrim?.name} (NIK: {pilgrim?.nik})
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Uang Sejumlah
                </span>
                <span className="col-span-3 italic font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800/80">
                  : &ldquo;{wordsAmount}&rdquo;
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Untuk Pembayaran
                </span>
                <span className="col-span-3 text-slate-800 dark:text-slate-200">
                  : {payment.type === 'down_payment' ? 'Uang Muka (DP)' : payment.type === 'installment' ? 'Cicilan Biaya Umroh/Haji' : 'Pelunasan Biaya'} —{' '}
                  <strong>{pkg?.name}</strong> (Booking: {payment.registrations?.code})
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  Metode Pembayaran
                </span>
                <span className="col-span-3 uppercase font-medium text-slate-800 dark:text-slate-200">
                  : {payment.method || 'Transfer Bank'} {payment.note ? `(${payment.note})` : ''}
                </span>
              </div>
            </div>

            {/* Financial Summary Box */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-800/40 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[11px] text-slate-500 uppercase block">Jumlah Tagihan</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  Rp {payment.amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-emerald-600 uppercase font-semibold block">
                  Jumlah Dibayar
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base">
                  Rp {paidAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase block">Sisa Tagihan</span>
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  Rp {payment.remaining_balance.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs">
              <div>
                <span className="text-slate-500 block">Jamaah / Penyetor,</span>
                <div className="h-16 flex items-end justify-center">
                  <span className="font-bold underline text-slate-900 dark:text-white">
                    {pilgrim?.name}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Kasir / Petugas Travel,</span>
                <div className="h-16 flex items-end justify-center">
                  <span className="font-bold underline text-slate-900 dark:text-white">
                    Staff Keuangan Al-Madinah
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
