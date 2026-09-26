'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Edit3, Trash2, Calendar, UserCheck, AlertTriangle } from 'lucide-react'
import type { RegistrationListItem } from '../types'
import { deleteRegistration } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface RegistrationTableProps {
  initialData: RegistrationListItem[]
}

export function RegistrationTable({ initialData }: RegistrationTableProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; item?: RegistrationListItem }>({
    open: false,
  })

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      const res = await deleteRegistration(id)
      if (res.success) {
        toast.success('Pendaftaran berhasil dihapus.')
        setData((prev) => prev.filter((item) => item.id !== id))
        setConfirmModal({ open: false })
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal menghapus pendaftaran.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setDeletingId(null)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            Dikonfirmasi
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            Pending
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Selesai
          </span>
        )
      case 'cancelled':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            Dibatalkan
          </span>
        )
    }
  }

  const renderPaymentBadge = (paymentStatus?: 'paid' | 'partial' | 'unpaid') => {
    switch (paymentStatus) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Lunas
          </span>
        )
      case 'partial':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            Sebagian
          </span>
        )
      case 'unpaid':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            Belum Bayar
          </span>
        )
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-xs">
          <UserCheck className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Belum Ada Pendaftaran</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Belum ada data pendaftaran jamaah yang sesuai dengan filter yang dipilih. Silakan buat booking pendaftaran baru.
        </p>
        <Link
          href="/registrations/create"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm transition-colors shadow-xs"
        >
          <UserCheck className="h-4 w-4" />
          Daftarkan Jamaah Baru
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3.5">Kode</th>
                <th className="px-5 py-3.5">Jamaah</th>
                <th className="px-5 py-3.5">Paket</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Bayar</th>
                <th className="px-5 py-3.5">Tgl Daftar</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                    <Link href={`/registrations/${item.id}`} className="hover:underline">
                      {item.code}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-foreground">{item.pilgrims?.name || '-'}</div>
                    <div className="text-xs text-muted-foreground">{item.pilgrims?.phone || '-'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-foreground max-w-[220px] truncate" title={item.packages?.name}>
                      {item.packages?.name || '-'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {formatCurrency(item.total_price)}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {renderStatusBadge(item.status)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {renderPaymentBadge(item.computed_payment_status)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>{formatDate(item.registered_at)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/registrations/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Detail</span>
                      </Link>
                      <button
                        onClick={() => setConfirmModal({ open: true, item })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Hapus Pendaftaran"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && confirmModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Hapus Pendaftaran?</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus pendaftaran{' '}
              <strong className="text-foreground">{confirmModal.item.code}</strong> atas nama{' '}
              <strong className="text-foreground">{confirmModal.item.pilgrims?.name}</strong>? Tindakan ini juga akan
              menghapus tagihan pembayaran yang terkait.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal({ open: false })}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deletingId === confirmModal.item.id}
                onClick={() => handleDelete(confirmModal.item!.id)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors shadow-xs disabled:opacity-50"
              >
                {deletingId === confirmModal.item.id ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
