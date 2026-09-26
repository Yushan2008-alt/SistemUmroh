'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { RegistrationListItem } from '../types'
import { updateRegistrationStatus } from '../actions'
import type { RegistrationStatus } from '@/types/database.types'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Edit,
  CreditCard,
  User,
  Calendar,
  Phone,
  FileBadge,
  Building,
  Plane,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

interface RegistrationDetailViewProps {
  registration: RegistrationListItem
}

export function RegistrationDetailView({ registration: initialData }: RegistrationDetailViewProps) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [status, setStatus] = useState<RegistrationStatus>(initialData.status)
  const [savingStatus, setSavingStatus] = useState(false)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const handleStatusChange = async () => {
    if (status === data.status) return
    setSavingStatus(true)
    try {
      const res = await updateRegistrationStatus(data.id, status)
      if (res.success) {
        toast.success(`Status pendaftaran berhasil diperbarui menjadi ${status}.`)
        setData((prev) => ({ ...prev, status }))
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal memperbarui status.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setSavingStatus(false)
    }
  }

  const renderStatusBadge = (s: string) => {
    switch (s) {
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

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/registrations"
            className="p-2 border border-border hover:bg-muted text-muted-foreground rounded-lg transition-colors"
            title="Kembali ke Daftar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-foreground tracking-tight">{data.pilgrims?.name}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                {data.code}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Terdaftar pada {formatDate(data.registered_at)} · {data.branches?.name}
            </div>
          </div>
        </div>

        <Link
          href={`/registrations/${data.id}/edit`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium text-sm transition-colors shadow-xs self-start sm:self-auto"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Pendaftaran</span>
        </Link>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Total Tagihan</div>
            <div className="text-xl font-bold text-foreground mt-0.5">
              {formatCurrency(data.total_price)}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Sudah Dibayar</div>
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {formatCurrency(data.total_paid || 0)}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Sisa Tagihan</span>
              {data.computed_payment_status === 'paid' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Lunas
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                  {data.computed_payment_status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                </span>
              )}
            </div>
            <div className="text-xl font-bold text-foreground mt-0.5">
              {formatCurrency(data.remaining_balance || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Detail Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Informasi Pendaftaran */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
            Informasi Pendaftaran
          </h3>
          <dl className="divide-y divide-border text-sm">
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Status Pendaftaran</dt>
              <dd>{renderStatusBadge(data.status)}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Tanggal Booking</dt>
              <dd className="font-semibold text-foreground">{formatDate(data.registered_at)}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Harga Paket</dt>
              <dd className="font-semibold text-foreground">{formatCurrency(data.total_price)}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Agen Mitra</dt>
              <dd className="font-medium text-foreground">{data.agents?.name || 'Tanpa Agen'}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Pembimbing / Muthawif</dt>
              <dd className="font-medium text-foreground">{data.guides?.name || '-'}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Cabang Pendaftaran</dt>
              <dd className="font-medium text-foreground">{data.branches?.name || '-'}</dd>
            </div>
          </dl>

          {/* Quick Status Updater */}
          <div className="pt-2 border-t border-border">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Ubah Status Booking
            </label>
            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RegistrationStatus)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <button
                type="button"
                disabled={status === data.status || savingStatus}
                onClick={handleStatusChange}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
              >
                {savingStatus ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Card: Jamaah & Paket */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-3">
            Data Jamaah & Paket Terpilih
          </h3>
          <dl className="divide-y divide-border text-sm">
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Nama Jamaah</dt>
              <dd className="font-semibold text-foreground">{data.pilgrims?.name}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Nomor Paspor</dt>
              <dd className="font-mono text-foreground font-medium">{data.pilgrims?.passport_number || 'Belum Ada'}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Nomor Telepon</dt>
              <dd className="font-medium text-foreground">{data.pilgrims?.phone || '-'}</dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Nama Paket</dt>
              <dd className="font-semibold text-foreground max-w-[220px] text-right truncate" title={data.packages?.name}>
                {data.packages?.name}
              </dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Jenis Paket</dt>
              <dd>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 capitalize">
                  {data.packages?.type || 'Umroh'}
                </span>
              </dd>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <dt className="text-muted-foreground font-medium">Tanggal Keberangkatan</dt>
              <dd className="font-semibold text-emerald-700 dark:text-emerald-400">
                {formatDate(data.packages?.departure_date)}
              </dd>
            </div>
          </dl>

          {data.notes && (
            <div className="pt-2 border-t border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Catatan Khusus:
              </div>
              <p className="text-xs text-foreground bg-muted/40 p-3 rounded-lg border border-border">
                {data.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Tagihan & Pembayaran */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Tagihan & Pembayaran
          </h3>
          <Link
            href="/payments"
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Kelola Tagihan & Kasir</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {data.payments && data.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Kode Tagihan</th>
                  <th className="px-4 py-2.5">Jenis Tagihan</th>
                  <th className="px-4 py-2.5">Jumlah Tagihan</th>
                  <th className="px-4 py-2.5">Telah Dibayar</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{p.code}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground">
                        {p.type === 'down_payment' ? 'Uang Muka (DP)' : 'Cicilan'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(p.paid_amount)}
                    </td>
                    <td className="px-4 py-3">
                      {p.status === 'paid' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Lunas
                        </span>
                      ) : p.status === 'partial' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Sebagian
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                          Belum Bayar
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            Belum ada skema tagihan untuk booking ini. Anda dapat membuat tagihan melalui modul kasir.
          </div>
        )}
      </div>
    </div>
  )
}
