'use client'

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
} from 'lucide-react'
import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function PilgrimDashboard() {
  const tripDetails = {
    packageName: 'Paket Umroh Reguler Syawal 1447H (12 Hari)',
    departureDate: '15 Oktober 2026',
    daysRemaining: 19,
    airline: 'Saudia Airlines (SV-816) - Direct CGK ke JED',
    hotelMakkah: 'Swissôtel Al Maqam Makkah (50m ke Pelataran Masjidil Haram)',
    hotelMadinah: 'Pullman Zamzam Madinah (100m ke Masjid Nabawi)',
    totalPrice: 29500000,
    paidAmount: 20000000,
    remainingAmount: 9500000,
  }

  const paymentPercentage = Math.round((tripDetails.paidAmount / tripDetails.totalPrice) * 100)

  const documentChecklist = [
    { title: 'Paspor Asli (Masa berlaku > 8 bulan)', status: 'verified', note: 'Nomor: B7623190' },
    { title: 'Buku Vaksin Meningitis (Buku Kuning)', status: 'verified', note: 'Terbit Dinkes' },
    { title: 'Pasfoto 4x6 Latar Putih 80% Wajah', status: 'uploaded', note: 'Sedang diperiksa staf' },
    { title: 'KTP & Kartu Keluarga (KK)', status: 'verified', note: 'Valid NIK 3578...' },
  ]

  return (
    <PageContainer>
      {/* Hero Trip Countdown Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs px-3.5 py-1 rounded-full mb-3 backdrop-blur-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Pendaftaran Dikonfirmasi • Kode: REG-SYAWAL-001</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ahlan Wa Sahlan, Ahmad Fauzi!
          </h1>
          <p className="text-emerald-100 text-sm mt-1">
            {tripDetails.packageName}
          </p>

          {/* Countdown Highlight Box */}
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-white/15">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-extrabold text-2xl text-emerald-300 border border-white/20">
                {tripDetails.daysRemaining}
              </div>
              <div>
                <span className="text-xs text-emerald-200 uppercase tracking-wider block font-semibold">
                  Hari Lagi
                </span>
                <span className="text-sm font-bold text-white">Menuju Tanah Suci</span>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-white/20" />

            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2 text-emerald-100">
                <Plane className="w-3.5 h-3.5 text-emerald-300" />
                <span>{tripDetails.airline}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-100">
                <Hotel className="w-3.5 h-3.5 text-emerald-300" />
                <span>{tripDetails.hotelMakkah}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
      </div>

      {/* 2-Column Dashboard Grid: Billing & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Status Pelunasan Pembayaran */}
        <Card className="border-border/80 shadow-xs">
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
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200">
                Cicilan Berjalan ({paymentPercentage}%)
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Terbayar: Rp {tripDetails.paidAmount.toLocaleString('id-ID')}</span>
                <span className="font-bold text-foreground">Total: Rp {tripDetails.totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${paymentPercentage}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-amber-800 dark:text-amber-300 block font-semibold">
                  Sisa Tagihan Pelunasan (Jatuh Tempo H-10)
                </span>
                <span className="text-lg font-bold text-amber-900 dark:text-amber-100 font-mono">
                  Rp {tripDetails.remainingAmount.toLocaleString('id-ID')}
                </span>
              </div>
              <Link
                href="/payments"
                className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                Bayar Sekarang <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Kuitansi resmi langsung terbit otomatis setelah pembayaran diverifikasi.</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Checklist Dokumen & Paspor */}
        <Card className="border-border/80 shadow-xs">
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
            <Link href="/documents" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              Upload Berkas
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentChecklist.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/70 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">{doc.title}</div>
                  <div className="text-[11px] text-muted-foreground">{doc.note}</div>
                </div>
                {doc.status === 'verified' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200">
                    <Clock className="w-3 h-3" /> Diperiksa
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Jadwal Manasik & Perlengkapan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manasik Schedule */}
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
            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Manasik Akbar &amp; Pemantapan Terakhir
                  </span>
                  <h4 className="text-sm font-bold text-foreground mt-0.5">
                    Praktik Tawaf, Sa’i &amp; Fiqih Perjalanan di Pesawat
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shrink-0">
                  Wajib Hadir
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sabtu, 05 Okt 2026 • 08.30 - 12.00 WIB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Grand Ballroom Hotel Aston Jakarta</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pemateri: <span className="font-semibold text-foreground">Ustadz H. Abdullah, Lc. MA</span>. Disediakan simulasi miniatur Ka’bah dan konsumsi makan siang.
            </p>
          </CardContent>
        </Card>

        {/* Perlengkapan Ibadah */}
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
    </PageContainer>
  )
}
