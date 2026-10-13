import Link from 'next/link'
import Image from 'next/image'
import {
  Compass,
  Calendar,
  MapPin,
  Plane,
  Building,
  CheckCircle2,
  Users,
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Star,
  Award,
  ChevronRight,
  FileText,
  BadgeCheck,
  HeartHandshake,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getPackages } from '@/modules/operations/packages.actions'
import type { PackageItem } from '@/modules/operations/types'

// Curated fallback packages with full details
const FALLBACK_PACKAGES: Array<{
  id: number
  name: string
  type: string
  duration_days: number
  departure_date: string
  price: number
  departure_city: string
  hotel_makkah_name: string
  hotel_makkah_stars: number
  hotel_makkah_dist: string
  hotel_madinah_name: string
  hotel_madinah_stars: number
  hotel_madinah_dist: string
  airline_name: string
  quota: number
  remainingQuota: number
  badge: string
  facilities: string[]
}> = [
  {
    id: 1,
    name: 'Umroh Reguler Syawal 1448H',
    type: 'Umroh Reguler',
    duration_days: 9,
    departure_date: '2026-10-25',
    price: 29500000,
    departure_city: 'Jakarta (CGK)',
    hotel_makkah_name: 'Swissôtel Al Maqam Makkah',
    hotel_makkah_stars: 5,
    hotel_makkah_dist: '50m ke Masjidil Haram',
    hotel_madinah_name: 'Dar Al Taqwa Madinah',
    hotel_madinah_stars: 5,
    hotel_madinah_dist: '30m ke Masjid Nabawi',
    airline_name: 'Saudia Airlines (Direct CGK - MED)',
    quota: 45,
    remainingQuota: 12,
    badge: 'Paling Diminati',
    facilities: [
      'Tiket Pesawat PP Direct Saudia Airlines',
      'Hotel Bintang 5 Ring 1 Pelataran Masjid',
      'Makan 3x Sehari Fullboard Masakan Indonesia',
      'Visa Umroh Resmi & Asuransi Perjalanan',
      'Handling Bandara & Bimbingan Muthawwif',
    ],
  },
  {
    id: 2,
    name: 'Umroh Ramadhan Berkah I\'tikaf',
    type: 'Umroh Ramadhan',
    duration_days: 12,
    departure_date: '2026-11-15',
    price: 42000000,
    departure_city: 'Jakarta (CGK)',
    hotel_makkah_name: 'Pullman Zamzam Makkah',
    hotel_makkah_stars: 5,
    hotel_makkah_dist: '80m ke Masjidil Haram',
    hotel_madinah_name: 'Madinah Hilton',
    hotel_madinah_stars: 5,
    hotel_madinah_dist: '70m ke Masjid Nabawi',
    airline_name: 'Garuda Indonesia (Direct CGK - JED)',
    quota: 40,
    remainingQuota: 8,
    badge: 'I\'tikaf 10 Malam Terakhir',
    facilities: [
      'Tiket PP Garuda Indonesia Direct Flight',
      'Bimbingan I\'tikaf Khusus Bersama Asatidz',
      'Fullboard Sahur & Iftar Prasmanan Istimewa',
      'Kereta Cepat Haramain Makkah - Madinah',
      'Perlengkapan Umroh Eksklusif & Koper Kabin',
    ],
  },
  {
    id: 3,
    name: 'Haji Khusus Furoda VIP Mujamalah',
    type: 'Haji Khusus',
    duration_days: 25,
    departure_date: '2027-05-20',
    price: 265000000,
    departure_city: 'Jakarta (CGK)',
    hotel_makkah_name: 'Swissôtel Al Maqam VIP Suite',
    hotel_makkah_stars: 5,
    hotel_makkah_dist: '50m ke Masjidil Haram',
    hotel_madinah_name: 'Dar Al Taqwa Executive Suite',
    hotel_madinah_stars: 5,
    hotel_madinah_dist: '30m ke Masjid Nabawi',
    airline_name: 'Garuda Indonesia (Business Class)',
    quota: 20,
    remainingQuota: 4,
    badge: 'Langsung Berangkat Tanpa Antre',
    facilities: [
      'Visa Haji Mujamalah Resmi Terdaftar Kemenag',
      'Maktab Tenda VIP Ber-AC Arafah & Mina',
      'Kereta Cepat Haramain High-Speed Train',
      'Ziarah Eksklusif Tempat Bersejarah & Jabal Uhud',
      'Dokter & Tim Medis Pendamping 24 Jam',
    ],
  },
]

export default async function LandingPage() {
  // Fetch active packages from database with graceful fallback
  let dynamicPackages: PackageItem[] = []
  try {
    const res = await getPackages()
    if (res.data && res.data.length > 0) {
      dynamicPackages = res.data
    }
  } catch (err) {
    console.warn('LandingPage: using fallback packages due to query notice', err)
  }

  return (
    <div className="min-h-screen bg-[#fafcf9] text-foreground flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* 1. TOP UTILITY / ACCREDITATION BAR (NUSUK STYLE) */}
      <div className="bg-[#03261a] border-b border-emerald-900/60 text-emerald-100 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-800/80 text-amber-300 font-semibold text-[11px] border border-amber-400/30">
              <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
              Izin Resmi Kemenag RI
            </span>
            <span className="text-emerald-200/90 hidden sm:inline text-[11px]">
              No. U.123/2021 • PIHK No. H.456/2022 • Akreditasi A (Unggul)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-emerald-200/90">
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Hotline 24 Jam: <strong>0812-8888-9999</strong></span>
            </span>
            <span className="hidden md:inline text-emerald-600">•</span>
            <span className="hidden md:inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>SISKOPATUH Terintegrasi</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR (NUSUK BRANDED) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#022c22] border border-amber-500/40 p-2 flex items-center justify-center text-amber-400 shadow-md shadow-emerald-950/15 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#064e3b] font-heading leading-none">
                  Al-Madinah
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200/70">
                  TRAVEL
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium block tracking-wide mt-0.5">
                Penyelenggara Ibadah Umroh & Haji Khusus
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
            <a
              href="#"
              className="px-4 py-2 rounded-xl bg-[#064e3b] text-white font-semibold transition-colors shadow-xs"
            >
              Beranda
            </a>
            <a
              href="#layanan"
              className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#064e3b] hover:bg-emerald-50 transition-colors"
            >
              Layanan Kami
            </a>
            <a
              href="#katalog"
              className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#064e3b] hover:bg-emerald-50 transition-colors"
            >
              Paket Pilihan
            </a>
            <a
              href="#keunggulan"
              className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#064e3b] hover:bg-emerald-50 transition-colors"
            >
              Keunggulan
            </a>
            <a
              href="#kontak"
              className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-[#064e3b] hover:bg-emerald-50 transition-colors"
            >
              Kontak
            </a>
          </nav>

          {/* Portal Action Button */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="rounded-full px-5 py-2.5 bg-gradient-to-r from-[#064e3b] to-[#043324] hover:from-[#085a44] hover:to-[#064430] text-white font-semibold shadow-md shadow-emerald-950/20 border border-emerald-700/40 gap-2 transition-all duration-200">
                <span>Masuk ke Portal</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (ATMOSPHERIC HARAMAIN NUSUK STYLE) */}
      <section className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center overflow-hidden bg-[#022318]">
        {/* Background Image with optimized Next Image & Gradient Vignette */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/haramain-hero.jpg"
            alt="Suasana Ibadah di Masjidil Haram Makkah"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-105 transform motion-safe:animate-pulse motion-safe:duration-[10000ms]"
          />
          {/* Nusuk Signature Deep Emerald Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#021f15]/95 via-[#033423]/80 to-[#021f15]/95 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#021f15] via-transparent to-[#021f15]/60" />
          {/* Subtle Islamic Geometric Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,78,59,0.35)_0%,transparent_70%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-7">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-medium shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Penyelenggara Perjalanan Ibadah Terpercaya & Berizin Resmi Kemenag</span>
          </div>

          {/* Main Nusuk Typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-heading leading-[1.2] drop-shadow-md">
            Gerbang Menuju Perjalanan Ibadah yang{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 underline decoration-amber-400/40 decoration-wavy decoration-1 underline-offset-8">
              Penuh Berkah & Terpercaya
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal drop-shadow-sm">
            Wujudkan kerinduan suci menuju Baitullah bersama Al-Madinah Tour & Travel. Kami hadir mendampingi
            seluruh tahapan ibadah Anda dengan kepastian jadwal, akomodasi hotel bintang lima di pelataran
            Masjidil Haram, dan bimbingan muthawwif bersertifikat sepanjang tahun.
          </p>

          {/* Action Buttons (Nusuk Rounded Pill Style) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <a
              href="#katalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-950/20 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>Lihat Paket Pilihan</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-emerald-300/40 text-white font-semibold text-sm sm:text-base shadow-lg transition-all duration-200"
            >
              <span>Masuk ke Portal Jamaah</span>
              <Compass className="w-4 h-4 text-emerald-300" />
            </Link>
          </div>

          {/* Quick Metrics Below Hero */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-emerald-700/30">
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-extrabold text-amber-300 font-heading">15.000+</span>
              <span className="text-[12px] text-emerald-200/80">Jamaah Terlayani</span>
            </div>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-extrabold text-amber-300 font-heading">100%</span>
              <span className="text-[12px] text-emerald-200/80">Pasti Berangkat</span>
            </div>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-extrabold text-amber-300 font-heading">Bintang 5</span>
              <span className="text-[12px] text-emerald-200/80">Hotel Ring 1 Haram</span>
            </div>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-extrabold text-amber-300 font-heading">99.8%</span>
              <span className="text-[12px] text-emerald-200/80">Kepuasan Jamaah</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LAYANAN UNGGULAN (NUSUK ARCHWAY MOTIF CARDS) */}
      <section id="layanan" className="py-20 bg-[#fafcf9] border-b border-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-[#064e3b] font-semibold text-xs tracking-wider uppercase">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Layanan Unggulan
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              Perjalanan Ibadah Bersama Al-Madinah
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Dari awal pendaftaran hingga kembali ke tanah air, kami mendampingi setiap langkah ibadah
              Anda dengan kenyamanan, keamanan, dan kepastian.
            </p>
          </div>

          {/* Nusuk Archway Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="group bg-white rounded-b-2xl rounded-t-[40px] p-6 border border-emerald-900/10 shadow-sm hover:shadow-xl hover:border-emerald-600/30 transition-all duration-300 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200 flex items-center justify-center text-[#064e3b] group-hover:scale-110 group-hover:bg-[#064e3b] group-hover:text-amber-300 transition-all duration-300 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Paket Resmi & Berizin Kemenag
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Terdaftar resmi di SISKOPATUH Kemenag RI dengan kepastian nomor porsi dan tiket pesawat penerbangan langsung PP.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-b-2xl rounded-t-[40px] p-6 border border-emerald-900/10 shadow-sm hover:shadow-xl hover:border-emerald-600/30 transition-all duration-300 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200 flex items-center justify-center text-[#064e3b] group-hover:scale-110 group-hover:bg-[#064e3b] group-hover:text-amber-300 transition-all duration-300 shadow-inner">
                <Compass className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Bimbingan Muthawwif Sunnah
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Didampingi asatidz dan muthawwif bersertifikat untuk memastikan setiap rukun dan doa ibadah sesuai sunnah Rasulullah SAW.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-b-2xl rounded-t-[40px] p-6 border border-emerald-900/10 shadow-sm hover:shadow-xl hover:border-emerald-600/30 transition-all duration-300 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200 flex items-center justify-center text-[#064e3b] group-hover:scale-110 group-hover:bg-[#064e3b] group-hover:text-amber-300 transition-all duration-300 shadow-inner">
                <Building className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Hotel Bintang 5 Ring 1 Masjid
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Akomodasi terbaik di pelataran Masjidil Haram Makkah dan Masjid Nabawi Madinah untuk kemudahan shalat berjamaah.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group bg-white rounded-b-2xl rounded-t-[40px] p-6 border border-emerald-900/10 shadow-sm hover:shadow-xl hover:border-emerald-600/30 transition-all duration-300 flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200 flex items-center justify-center text-[#064e3b] group-hover:scale-110 group-hover:bg-[#064e3b] group-hover:text-amber-300 transition-all duration-300 shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Layanan Berkas & Visa Kilat
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verifikasi paspor cepat, visa umroh/haji resmi, asuransi syariah perjalanan, dan handling bandara terintegrasi tanpa ribet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KATALOG PAKET PERJALANAN (DYNAMIC DARI DATABASE SUPABASE + FALLBACK) */}
      <section id="katalog" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-xs tracking-wider uppercase border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Katalog Resmi 1448H
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                Pilihan Paket Umroh & Haji Khusus
              </h2>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Pilih tanggal keberangkatan dan paket akomodasi yang sesuai dengan kenyamanan ibadah Anda dan keluarga.
              </p>
            </div>
            <Link href="/login" className="self-start md:self-auto">
              <Button variant="outline" className="border-emerald-700/30 text-[#064e3b] hover:bg-emerald-50 rounded-full font-semibold gap-2">
                <span>Lihat Semua Paket di Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Package Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dynamicPackages.length > 0
              ? dynamicPackages.slice(0, 6).map((pkg) => {
                  const regCount = (pkg as any).registrations?.length || 0
                  const remainingQuota = Math.max(0, pkg.quota - regCount)
                  const quotaPercent = Math.min(100, Math.round((regCount / (pkg.quota || 1)) * 100))

                  return (
                    <Card
                      key={pkg.id}
                      className="border border-emerald-900/15 rounded-3xl overflow-hidden hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 flex flex-col bg-white"
                    >
                      {/* Top Banner */}
                      <div className="bg-gradient-to-r from-[#064e3b] to-[#043324] p-5 text-white flex items-center justify-between">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
                            {pkg.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            {pkg.duration_days} Hari Perjalanan
                          </span>
                        </div>
                        <Badge className="bg-amber-400 text-slate-950 font-bold text-xs border-0 px-2.5 py-1">
                          {pkg.departure_city || 'Jakarta (CGK)'}
                        </Badge>
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-slate-900 font-heading leading-tight line-clamp-2">
                            {pkg.name}
                          </h3>

                          {/* Price */}
                          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                            <span className="text-xs text-muted-foreground block">Biaya Paket All-In:</span>
                            <div className="text-2xl font-extrabold text-[#064e3b] font-heading">
                              {formatCurrency(pkg.price)}
                            </div>
                            <span className="text-[11px] text-emerald-700 font-medium block">
                              Bisa diangsur hingga H-30 keberangkatan
                            </span>
                          </div>

                          {/* Logistics Details */}
                          <div className="space-y-2.5 text-xs text-slate-700">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Keberangkatan: <strong>{formatDate(pkg.departure_date)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Plane className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Maskapai: <strong>{pkg.airlines?.name || 'Saudia Airlines / Garuda'}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Makkah: <strong>{pkg.hotel_makkah?.name || 'Hotel Bintang 5 Dekat Masjid'}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Madinah: <strong>{pkg.hotel_madinah?.name || 'Hotel Bintang 5 Dekat Masjid'}</strong></span>
                            </div>
                          </div>

                          {/* Quota Progress */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Ketersediaan Kursi:</span>
                              <span className="font-bold text-[#064e3b]">Tersisa {remainingQuota} Seat</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full"
                                style={{ width: `${quotaPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Booking CTA Button */}
                        <Link href="/login" className="w-full pt-2">
                          <Button className="w-full rounded-xl bg-[#064e3b] hover:bg-[#085a44] text-white font-semibold shadow-md shadow-emerald-950/15 py-2.5 gap-2">
                            <span>Pilih Paket & Daftar</span>
                            <ArrowRight className="w-4 h-4 text-amber-300" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })
              : FALLBACK_PACKAGES.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="border border-emerald-900/15 rounded-3xl overflow-hidden hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 flex flex-col bg-white"
                  >
                    {/* Top Banner */}
                    <div className="bg-gradient-to-r from-[#064e3b] to-[#043324] p-5 text-white flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
                          {pkg.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {pkg.duration_days} Hari Perjalanan
                        </span>
                      </div>
                      <Badge className="bg-amber-400 text-slate-950 font-bold text-xs border-0 px-2.5 py-1">
                        {pkg.badge}
                      </Badge>
                    </div>

                    <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-900 font-heading leading-tight">
                          {pkg.name}
                        </h3>

                        {/* Price */}
                        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                          <span className="text-xs text-muted-foreground block">Biaya Paket All-In:</span>
                          <div className="text-2xl font-extrabold text-[#064e3b] font-heading">
                            {formatCurrency(pkg.price)}
                          </div>
                          <span className="text-[11px] text-emerald-700 font-medium block">
                            Bisa diangsur hingga H-30 keberangkatan
                          </span>
                        </div>

                        {/* Logistics Details */}
                        <div className="space-y-2.5 text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Keberangkatan: <strong>{formatDate(pkg.departure_date)} ({pkg.departure_city})</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Maskapai: <strong>{pkg.airline_name}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Makkah: <strong>{pkg.hotel_makkah_name} ({pkg.hotel_makkah_dist})</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Madinah: <strong>{pkg.hotel_madinah_name} ({pkg.hotel_madinah_dist})</strong></span>
                          </div>
                        </div>

                        {/* Quota Progress */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Ketersediaan Kursi:</span>
                            <span className="font-bold text-[#064e3b]">Tersisa {pkg.remainingQuota} dari {pkg.quota} Kursi</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full"
                              style={{ width: `${Math.round(((pkg.quota - pkg.remainingQuota) / pkg.quota) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Booking CTA Button */}
                      <Link href="/login" className="w-full pt-2">
                        <Button className="w-full rounded-xl bg-[#064e3b] hover:bg-[#085a44] text-white font-semibold shadow-md shadow-emerald-950/15 py-2.5 gap-2">
                          <span>Pilih Paket & Daftar</span>
                          <ArrowRight className="w-4 h-4 text-amber-300" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* 6. KEUNGGULAN "5 PASTI UMROH" KEMENAG RI */}
      <section id="keunggulan" className="py-20 bg-gradient-to-b from-slate-50 to-[#fafcf9] border-y border-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#064e3b] font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Komitmen Perlindungan Jamaah
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              Standar 5 Pasti Umroh Kemenag RI
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Kami menjamin kepatuhan 100% terhadap regulasi Kementerian Agama untuk memberikan rasa aman dan tenang bagi jamaah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold text-lg font-heading border border-emerald-200">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pasti Travelnya</h3>
              <p className="text-xs text-muted-foreground">Berizin resmi Kemenag RI dengan rekam jejak terpercaya sejak 2015.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold text-lg font-heading border border-emerald-200">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pasti Jadwalnya</h3>
              <p className="text-xs text-muted-foreground">Tanggal keberangkatan dan kepulangan pasti dengan tiket issued di awal.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold text-lg font-heading border border-emerald-200">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pasti Terbangnya</h3>
              <p className="text-xs text-muted-foreground">Penerbangan langsung bersama maskapai resmi berstandar IATA.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold text-lg font-heading border border-emerald-200">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pasti Hotelnya</h3>
              <p className="text-xs text-muted-foreground">Akomodasi hotel bintang 5 ring 1 terkonfirmasi sejak awal pendaftaran.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold text-lg font-heading border border-emerald-200">
                5
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Pasti Visanya</h3>
              <p className="text-xs text-muted-foreground">Visa umroh dan haji resmi terbit sebelum hari keberangkatan jamaah.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LANGKAH MUDAH PENDAFTARAN */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-xs tracking-wider uppercase border border-amber-200">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
              Alur Pendaftaran
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              4 Langkah Mudah Menuju Baitullah
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Proses registrasi transparan, serba digital, dan didampingi tim konsultan kami hingga hari keberangkatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-6 rounded-2xl bg-[#fafcf9] border border-emerald-900/10 space-y-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#064e3b] text-amber-300 flex items-center justify-center font-bold font-heading text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">Pilih Paket</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Pilih jadwal dan tipe paket umroh atau haji yang sesuai dengan kebutuhan Anda.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fafcf9] border border-emerald-900/10 space-y-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#064e3b] text-amber-300 flex items-center justify-center font-bold font-heading text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">Lengkapi Berkas</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Unggah dokumen paspor, KTP, dan bukti vaksinasi langsung melalui portal digital kami.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fafcf9] border border-emerald-900/10 space-y-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#064e3b] text-amber-300 flex items-center justify-center font-bold font-heading text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">Manasik Intensif</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Ikuti sesi bimbingan manasik teori dan praktik simulasi ibadah bersama muthawwif.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#fafcf9] border border-emerald-900/10 space-y-3 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#064e3b] text-amber-300 flex items-center justify-center font-bold font-heading text-sm">
                04
              </div>
              <h3 className="font-bold text-slate-900 text-base">Berangkat Ibadah</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Nikmati perjalanan ibadah yang khusyuk, tenang, dan mabrur didampingi tim kami.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONI JAMAAH */}
      <section className="py-20 bg-slate-50 border-t border-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#064e3b] font-semibold text-xs tracking-wider uppercase">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Kisah Jamaah
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
              Pengalaman Ibadah Bersama Al-Madinah
            </h2>
            <p className="text-sm text-muted-foreground">
              Ratusan kisah kepuasan jamaah yang telah menunaikan ibadah umroh dan haji bersama kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-emerald-900/10 shadow-xs space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "Alhamdulillah, perjalanan Umroh Ramadhan bersama keluarga sangat berkesan. Hotelnya benar-benar di depan pelataran Masjidil Haram, muthawwifnya sabar dan sangat menguasai sejarah Islam."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#064e3b] font-bold text-xs flex items-center justify-center font-heading">
                  HA
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">H. Ahmad Fauzi & Keluarga</h4>
                  <p className="text-[11px] text-muted-foreground">Jamaah Umroh Ramadhan 1447H • Jakarta</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-emerald-900/10 shadow-xs space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "Pelayanan sistem digitalnya sangat memudahkan. Status paspor dan visa terpantau jelas di akun portal, proses manasiknya mendalam, dan makanan di Makkah sesuai selera nusantara."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#064e3b] font-bold text-xs flex items-center justify-center font-heading">
                  SW
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Hj. Siti Wahyuni</h4>
                  <p className="text-[11px] text-muted-foreground">Jamaah Umroh Reguler Syawal • Surabaya</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-emerald-900/10 shadow-xs space-y-4">
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                "Bismillah, Haji Khusus Furoda lewat Al-Madinah terbukti profesional. Maktab di Mina ber-AC nyaman, jadwal kereta cepat tepat waktu, dan bimbingan ibadahnya sangat menenangkan hati."
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#064e3b] font-bold text-xs flex items-center justify-center font-heading">
                  RP
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Dr. H. Raden Pratama</h4>
                  <p className="text-[11px] text-muted-foreground">Jamaah Haji Khusus VIP • Bandung</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SPIRITUAL CALL TO ACTION BANNER (NUSUK DEEP EMERALD) */}
      <section className="py-20 bg-gradient-to-r from-[#022318] via-[#043425] to-[#022318] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.15)_0%,transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-950/80 border border-amber-400/40 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Labbaik Allahumma Labbaik</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading leading-tight">
            Panggilan Suci ke Rumah Allah Menanti Anda
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Siapkan niat suci Anda dan keluarga. Hubungi konsultan kami atau daftar langsung melalui portal
            resmi untuk mengamankan kursi keberangkatan Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-sm shadow-xl transition-all"
            >
              Mulai Pendaftaran di Portal
            </Link>
            <a
              href="https://wa.me/6281288889999?text=Assalamu'alaikum%20Al-Madinah%20Travel,%20saya%20ingin%20konsultasi%20paket%20Umroh"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-emerald-300/40 text-white font-semibold text-sm transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>Konsultasi via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 10. FOOTER (NUSUK BRANDED) */}
      <footer id="kontak" className="bg-[#021f15] text-emerald-100 border-t border-emerald-900/60 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Legal */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#064e3b] to-[#022c22] border border-amber-500/40 p-2 flex items-center justify-center text-amber-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-white font-heading block leading-none">
                    Al-Madinah
                  </span>
                  <span className="text-[10px] text-amber-300 font-semibold tracking-wider uppercase block mt-1">
                    Tour & Travel
                  </span>
                </div>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Penyelenggara Perjalanan Ibadah Umroh (PPIU) dan Haji Khusus (PIHK) resmi Kementerian Agama Republik Indonesia.
              </p>
              <div className="pt-2 text-xs text-amber-300/90 space-y-1 font-mono">
                <div>SK PPIU: No. U.123/2021</div>
                <div>SK PIHK: No. H.456/2022</div>
              </div>
            </div>

            {/* Col 2: Navigasi */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                Navigasi Cepat
              </h4>
              <ul className="space-y-2 text-xs text-emerald-200/80">
                <li><a href="#" className="hover:text-amber-300 transition-colors">Beranda Utama</a></li>
                <li><a href="#layanan" className="hover:text-amber-300 transition-colors">Layanan Unggulan</a></li>
                <li><a href="#katalog" className="hover:text-amber-300 transition-colors">Paket Umroh & Haji</a></li>
                <li><a href="#keunggulan" className="hover:text-amber-300 transition-colors">5 Pasti Umroh</a></li>
                <li><Link href="/login" className="hover:text-amber-300 transition-colors">Portal Jamaah & Mitra</Link></li>
              </ul>
            </div>

            {/* Col 3: Kantor Cabang */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                Kantor Operasional
              </h4>
              <div className="space-y-2 text-xs text-emerald-200/80">
                <div>
                  <strong className="text-white block">Kantor Pusat Jakarta:</strong>
                  Menara Al-Madinah Lantai 12, Jl. HR Rasuna Said, Jakarta Selatan
                </div>
                <div>
                  <strong className="text-white block">Kantor Cabang:</strong>
                  Surabaya • Bandung • Medan • Makassar • Yogyakarta
                </div>
              </div>
            </div>

            {/* Col 4: Kontak & Bantuan */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                Kontak Layanan
              </h4>
              <div className="space-y-2 text-xs text-emerald-200/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hotline: 0812-8888-9999 (24 Jam)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email: info@almadinah-travel.co.id</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Senin - Sabtu: 08.00 - 17.00 WIB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/80 gap-3">
            <p>© {new Date().getFullYear()} Al-Madinah Tour & Travel. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
            <p>Sistem Manajemen Operasional Umroh & Haji Terintegrasi</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
