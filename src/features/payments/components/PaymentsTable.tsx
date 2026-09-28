'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  RotateCw,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Receipt,
} from 'lucide-react'
import { toast } from 'sonner'
import { syncMidtransTransactionStatus } from '../actions'
import type { PaymentListItem } from '../types'
import { MidtransPaymentModal } from './MidtransPaymentModal'
import { RecordPaymentModal } from './RecordPaymentModal'
import { ReceiptModal } from './ReceiptModal'

interface PaymentsTableProps {
  items: PaymentListItem[]
}

export function PaymentsTable({ items }: PaymentsTableProps) {
  const router = useRouter()
  const [midtransDoc, setMidtransDoc] = useState<PaymentListItem | null>(null)
  const [manualDoc, setManualDoc] = useState<PaymentListItem | null>(null)
  const [receiptDoc, setReceiptDoc] = useState<PaymentListItem | null>(null)
  const [checkingId, setCheckingId] = useState<number | null>(null)

  const handleRefresh = () => {
    router.refresh()
  }

  const handleSyncStatus = async (payment: PaymentListItem) => {
    setCheckingId(payment.id)
    try {
      const res = await syncMidtransTransactionStatus(payment.id, payment.code)
      if (res.success) {
        toast.success(res.message)
        handleRefresh()
      } else {
        toast.info(res.message)
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyinkronkan status')
    } finally {
      setCheckingId(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <CreditCard className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Belum ada tagihan pembayaran
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Tidak ditemukan tagihan pembayaran yang sesuai dengan kriteria filter pencarian.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice & Registrasi</th>
                <th className="py-3.5 px-4">Nama Jamaah & Paket</th>
                <th className="py-3.5 px-4">Jatuh Tempo</th>
                <th className="py-3.5 px-4">Rincian Nominal</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Kasir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {items.map((payment) => {
                const pilgrim = payment.registrations?.pilgrims
                const pkg = payment.registrations?.packages

                // Type badge configuration
                let typeBadge = (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Tagihan
                  </span>
                )
                if (payment.type === 'down_payment') {
                  typeBadge = (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                      Uang Muka (DP)
                    </span>
                  )
                } else if (payment.type === 'installment') {
                  typeBadge = (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Cicilan
                    </span>
                  )
                } else if (payment.type === 'full_payment') {
                  typeBadge = (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Pelunasan Penuh
                    </span>
                  )
                }

                // Status Badge
                let statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Belum Bayar
                  </span>
                )
                if (payment.status === 'paid') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Lunas
                    </span>
                  )
                } else if (payment.status === 'partial') {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Sebagian
                    </span>
                  )
                }

                // Due date check
                const isOverdue =
                  payment.due_date &&
                  payment.status !== 'paid' &&
                  new Date(payment.due_date) < new Date()

                return (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Invoice & Registration Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {payment.code}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {typeBadge}
                        {payment.registrations?.code && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {payment.registrations.code}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pilgrim Name & Package */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {pilgrim?.name || 'Jamaah'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]" title={pkg?.name}>
                        {pkg?.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        HP: {pilgrim?.phone || '-'}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4">
                      {payment.due_date ? (
                        <div
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-semibold'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(payment.due_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                      {isOverdue && (
                        <span className="block text-[10px] text-rose-600 font-bold uppercase mt-0.5">
                          Jatuh Tempo
                        </span>
                      )}
                    </td>

                    {/* Financial Amounts */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Rp {payment.amount.toLocaleString('id-ID')}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] mt-0.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Dibayar: Rp {payment.paid_amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {payment.remaining_balance > 0 && (
                        <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
                          Sisa: Rp {payment.remaining_balance.toLocaleString('id-ID')}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">{statusBadge}</td>

                    {/* Actions Toolbar */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Midtrans Online Payment Button */}
                        {payment.status !== 'paid' && (
                          <button
                            onClick={() => setMidtransDoc(payment)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
                            title="Bayar Online via Midtrans Snap (QRIS, VA Bank)"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Bayar Midtrans</span>
                          </button>
                        )}

                        {/* Manual Cashier Recording Button */}
                        {payment.status !== 'paid' && (
                          <button
                            onClick={() => setManualDoc(payment)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Catat Pembayaran Tunai atau Transfer Bank"
                          >
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Catat Kasir</span>
                          </button>
                        )}

                        {/* Receipt Button if payment has been made */}
                        {payment.paid_amount > 0 && (
                          <button
                            onClick={() => setReceiptDoc(payment)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors"
                            title="Lihat & Cetak Kwitansi Resmi"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Kwitansi</span>
                          </button>
                        )}

                        {/* On-demand Sync Status Button */}
                        {payment.status !== 'paid' && (
                          <button
                            onClick={() => handleSyncStatus(payment)}
                            disabled={checkingId === payment.id}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors"
                            title="Cek Status Transaksi ke Midtrans"
                          >
                            <RotateCw
                              className={`w-3.5 h-3.5 ${
                                checkingId === payment.id ? 'animate-spin text-sky-600' : ''
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <MidtransPaymentModal
        payment={midtransDoc}
        isOpen={Boolean(midtransDoc)}
        onClose={() => setMidtransDoc(null)}
        onSuccess={handleRefresh}
      />

      <RecordPaymentModal
        payment={manualDoc}
        isOpen={Boolean(manualDoc)}
        onClose={() => setManualDoc(null)}
        onSuccess={handleRefresh}
      />

      <ReceiptModal
        payment={receiptDoc}
        isOpen={Boolean(receiptDoc)}
        onClose={() => setReceiptDoc(null)}
      />
    </>
  )
}
