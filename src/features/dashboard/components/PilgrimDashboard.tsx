'use client'

import { useState, useEffect } from 'react'
import {
  CalendarDays,
  Plane,
  Hotel,
  FileCheck2,
  CreditCard,
  Luggage,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  Loader2,
  Compass,
  Users,
  Check,
  ShieldCheck,
  Building2,
  FileText,
  BadgeCheck,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getPilgrimDashboardData, registerPilgrimToPackage, type PilgrimDashboardData } from '../actions'
import { MidtransPaymentModal } from '@/features/payments/components/MidtransPaymentModal'
import type { PaymentListItem } from '@/features/payments/types'

export function PilgrimDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PilgrimDashboardData | null>(null)
  const [registeringPkgId, setRegisteringPkgId] = useState<number | null>(null)
  const [activePaymentDoc, setActivePaymentDoc] = useState<PaymentListItem | null>(null)

  const loadDashboardData = async () => {
    try {
      const res = await getPilgrimDashboardData()
      setData(res)
    } catch (err: any) {
      console.error('Error loading pilgrim dashboard:', err)
      toast.error('Gagal memuat data dashboard jamaah.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleSelectPackage = async (packageId: number) => {
    setRegisteringPkgId(packageId)
    try {
      const res = await registerPilgrimToPackage(packageId)
      if (res.success) {
        toast.success(res.message)
        await loadDashboardData()
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat mendaftar paket.')
    } finally {
      setRegisteringPkgId(null)
    }
  }

  if (loading) {
    return (
      <PageContainer className="space-y-6">
        <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-semibold">Memuat Portal Jamaah Anda...</span>
          </div>
        </div>
      </PageContainer>
    )
  }

  const pilgrimName = data?.pilgrim?.name || data?.profile?.name || data?.user?.name || 'Jamaah'
  const registration = data?.registration
  const pkg = registration?.packages
  const payments = data?.payments || []
  const documents = data?.documents || []
  const manasikSchedules = data?.manasikSchedules || []
  const availablePackages = data?.availablePackages || []

  // Compute payment financial totals
  const totalPrice = Number(registration?.total_price) || Number(pkg?.price) || 0
  const totalPaid = payments.reduce((acc, p) => acc + (Number(p.paid_amount) || 0), 0)
  const remainingTotal = Math.max(0, totalPrice - totalPaid)
  const paymentPercentage = totalPrice > 0 ? Math.min(100, Math.round((totalPaid / totalPrice) * 100)) : 0

  // Calculate Countdown
  let daysRemaining = 0
  if (pkg?.departure_date) {
    const depTime = new Date(pkg.departure_date).getTime()
    const nowTime = new Date().getTime()
    daysRemaining = Math.max(0, Math.ceil((depTime - nowTime) / (1000 * 60 * 60 * 24)))
  }

  // Find first unpaid payment invoice for quick pay
  const unpaidInvoice = payments.find((p) => p.status !== 'paid')

  return (
    <PageContainer className="space-y-8">
      {/* ========================================================================= */}
      {/* HERO BANNER: DYNAMIC ACCORDING TO USER & REGISTRATION STATUS              */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs px-3.5 py-1 rounded-full backdrop-blur-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>
              {registration
                ? `Pendaftaran Dikonfirmasi • Kode: ${registration.code}`
                : 'Calon Jamaah Umroh & Haji • Profil Lengkap'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ahlan Wa Sahlan, {pilgrimName}!
          </h1>

          <p className="text-emerald-100 text-sm leading-relaxed">
            {registration && pkg
              ? pkg.name
              : 'Selamat datang di portal keberangkatan ibadah. Profil identitas Anda telah tersimpan dengan aman di sistem pusat Al-Madinah Travel.'}
          </p>

          {/* If Registered: Show Trip Countdown Highlight */}
          {registration && pkg && (
            <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-white/15">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-extrabold text-2xl text-emerald-300 border border-white/20">
                  {daysRemaining}
                </div>
                <div>
                  <span className="text-xs text-emerald-200 uppercase tracking-wider block font-semibold">
                    Hari Lagi
                  </span>
                  <span className="text-sm font-bold text-white">Menuju Tanah Suci</span>
                </div>
              </div>

              <div className="hidden sm:block h-10 w-px bg-white/20" />

              <div className="text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-100">
                  <Plane className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>
                    {pkg.airlines?.name || 'Penerbangan Direct'} ({pkg.airlines?.code || 'PP'}) - {pkg.departure_city || 'Jakarta'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-100">
                  <Hotel className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>
                    Makkah: {pkg.hotel_makkah?.name || 'Hotel Makkah'} • Madinah: {pkg.hotel_madinah?.name || 'Hotel Madinah'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* CASE 1: PILGRIM HAS NOT REGISTERED FOR A PACKAGE YET                      */}
      {/* SHOW INTERACTIVE ACTIVE PACKAGES CATALOG RIGHT ON THE DASHBOARD           */}
      {/* ========================================================================= */}
      {!registration && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                Pilih Paket Keberangkatan Umroh & Haji
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Pilih paket ibadah yang Anda inginkan untuk mendaftarkan kursi keberangkatan resmi Anda.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 self-start sm:self-auto">
              {availablePackages.length} Paket Tersedia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availablePackages.map((p) => {
              const isProcessingThis = registeringPkgId === p.id
              const formattedPrice = `Rp ${Number(p.price).toLocaleString('id-ID')}`
              const depFormatted = p.departure_date
                ? new Date(p.departure_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '-'

              return (
                <Card
                  key={p.id}
                  className="border-border/80 hover:border-emerald-500/60 transition-all hover:shadow-md flex flex-col justify-between overflow-hidden group"
                >
                  <CardHeader className="p-5 pb-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                        {p.type === 'haji_khusus' ? 'Haji Khusus Furoda' : 'Umroh Reguler'}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                        {depFormatted} ({p.duration_days} Hari)
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold text-foreground group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {p.name}
                    </CardTitle>

                    <div className="pt-2 flex items-baseline justify-between border-t border-border/50">
                      <div>
                        <span className="text-[10px] text-muted-foreground block font-medium">Biaya Paket:</span>
                        <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                          {formattedPrice}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block font-medium">Sisa Kuota:</span>
                        <span className="text-xs font-bold text-foreground">
                          {p.quota || 45} Kursi
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4">
                    {/* Hotel & Flight Info */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Plane className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate">
                          <strong>{p.airlines?.name || 'Maskapai Internasional'}</strong> ({p.airlines?.code || 'PP'}) • Berangkat dari {p.departure_city || 'Jakarta'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Hotel className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">
                          Makkah: <strong>{p.hotel_makkah?.name || 'Hotel Makkah'}</strong> • Madinah: <strong>{p.hotel_madinah?.name || 'Hotel Madinah'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectPackage(p.id)}
                      disabled={registeringPkgId !== null}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-emerald-600/20"
                    >
                      {isProcessingThis ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mendaftarkan Kursi...</span>
                        </>
                      ) : (
                        <>
                          <span>Pilih &amp; Daftar Paket Ini</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE 2: PILGRIM IS ALREADY REGISTERED                                     */}
      {/* SHOW REAL PAYMENT STATUS, 6 DOCUMENTS CHECKLIST, & MANASIK                */}
      {/* ========================================================================= */}
      {registration && (
        <>
          {/* Row 1: Billing & Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Status Pembayaran Paket Real */}
            <Card className="border-border/80 shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      Status Pembayaran Paket
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Rincian pembayaran biaya keberangkatan umroh Anda
                    </CardDescription>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                    {paymentPercentage === 100 ? 'Lunas (100%)' : `Terbayar (${paymentPercentage}%)`}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">
                      Terbayar: Rp {totalPaid.toLocaleString('id-ID')}
                    </span>
                    <span className="font-bold text-foreground">
                      Total: Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${paymentPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Sisa Tagihan & Tombol Bayar */}
                {unpaidInvoice ? (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-amber-800 dark:text-amber-300 block font-semibold">
                        Tagihan Aktif ({unpaidInvoice.type === 'down_payment' ? 'Uang Muka / DP' : 'Pelunasan'})
                      </span>
                      <span className="text-lg font-bold text-amber-900 dark:text-amber-100 font-mono">
                        Rp {unpaidInvoice.remaining_balance.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePaymentDoc(unpaidInvoice as any)}
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Bayar</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Seluruh tagihan paket umroh Anda telah lunas diverifikasi!</span>
                  </div>
                )}

                <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Kuitansi resmi langsung terbit otomatis setelah pembayaran.</span>
                  </div>
                  <Link href="/payments" className="text-emerald-600 hover:underline font-semibold">
                    Semua Invoice
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Checklist Dokumen Riil dari Database */}
            <Card className="border-border/80 shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Kelengkapan Berkas Dokumen
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Checklist persyaratan visa umroh &amp; manifest penerbangan
                  </CardDescription>
                </div>
                <Link
                  href="/documents"
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Upload Berkas
                </Link>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {documents.length > 0 ? (
                  documents.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/70 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground">{doc.label || doc.type}</div>
                        <div className="text-[11px] text-muted-foreground">{doc.note || 'Dokumen Wajib'}</div>
                      </div>
                      {doc.status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                        </span>
                      ) : doc.status === 'uploaded' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200">
                          <Clock className="w-3 h-3" /> Diperiksa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <AlertCircle className="w-3 h-3 text-slate-400" /> Belum Upload
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    Belum ada berkas yang diunggah.{' '}
                    <Link href="/documents" className="text-emerald-600 font-semibold underline">
                      Upload sekarang
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Jadwal Manasik & Perlengkapan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manasik Schedule Riil */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  Jadwal Bimbingan Manasik Umroh
                </CardTitle>
                <CardDescription className="text-xs">
                  Sesi pembekalan fiqih dan tata cara ibadah sebelum terbang
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {manasikSchedules.length > 0 ? (
                  manasikSchedules.map((sch) => (
                    <div
                      key={sch.id}
                      className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                            Sesi Bimbingan
                          </span>
                          <h4 className="text-sm font-bold text-foreground mt-0.5">{sch.title}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                          Wajib Hadir
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {new Date(sch.date).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {sch.start_time ? ` • ${sch.start_time.slice(0, 5)} WIB` : ''}
                          </span>
                        </div>
                        {sch.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{sch.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                    Jadwal manasik resmi untuk kloter Anda sedang dipersiapkan oleh pihak cabang. Notifikasi akan dikirimkan melalui WhatsApp saat tanggal ditentukan.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Perlengkapan Ibadah Jamaah */}
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-emerald-600" />
                  Perlengkapan Ibadah Jamaah
                </CardTitle>
                <CardDescription className="text-xs">
                  Status logistik koper, seragam, dan perlengkapan ibadah
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground text-[10px] block">Koper Bagasi 24 Inch</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Diterima
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground text-[10px] block">Kain Ihram / Mukena</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Diterima
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground text-[10px] block">Buku Doa &amp; Panduan</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Diterima
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground text-[10px] block">ID Card &amp; Tali Gelang</span>
                    <span className="font-bold text-sky-700 flex items-center gap-1 mt-1">
                      <Clock className="w-3.5 h-3.5" /> Dibagi di Bandara
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground pt-1">
                  Hubungi petugas logistik di kantor cabang jika ada perlengkapan yang cacat atau belum lengkap.
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Payment Modal Integration for Direct Payment on Dashboard */}
      {activePaymentDoc && (
        <MidtransPaymentModal
          payment={activePaymentDoc}
          isOpen={!!activePaymentDoc}
          onClose={() => setActivePaymentDoc(null)}
          onSuccess={() => {
            loadDashboardData()
            setActivePaymentDoc(null)
          }}
        />
      )}
    </PageContainer>
  )
}
