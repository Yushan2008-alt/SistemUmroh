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
      'Kajian Fiqih Ibadah & Tadabbur Quran Harian',
      'Ziarah Kota Makkah & Madinah Eksklusif',
    ],
  },
  {
    id: 3,
    name: 'Haji Khusus VIP Furoda 1448H',
    type: 'Haji Khusus',
    duration_days: 25,
    departure_date: '2027-05-18',
    price: 235000000,
    departure_city: 'Jakarta (CGK)',
    hotel_makkah_name: 'Fairmont Makkah Clock Royal Tower',
    hotel_makkah_stars: 5,
    hotel_makkah_dist: 'Pelataran Depan Masjidil Haram',
    hotel_madinah_name: 'The Oberoi Madinah',
    hotel_madinah_stars: 5,
    hotel_madinah_dist: 'Pelataran Utama Pintu Wanita/Pria',
    airline_name: 'Saudia Airlines Royal Class / Business',
    quota: 20,
    remainingQuota: 3,
    badge: 'Tanpa Antre Panjang',
    facilities: [
      'Visa Haji Mujamalah (Furoda) Resmi Terdaftar',
      'Maktab VIP Tenda AC Mina & Arafah Dekat Jamarat',
      'Kereta Cepat Haramain Makkah - Madinah',
      'Dokter Pendamping & Muthawwif Khusus 24 Jam',
      'Perlengkapan Haji Eksklusif Koper Hardcase',
    ],
  },
  {
    id: 4,
    name: 'Umroh Plus Turki Musim Gugur',
    type: 'Umroh Plus',
    duration_days: 12,
    departure_date: '2026-11-28',
    price: 36500000,
    departure_city: 'Jakarta (CGK)',
    hotel_makkah_name: 'Mövenpick Hotel & Residence Hajar',
    hotel_makkah_stars: 5,
    hotel_makkah_dist: 'Abraj Al Bait Complex',
    hotel_madinah_name: 'Anwar Al Madinah Mövenpick',
    hotel_madinah_stars: 5,
    hotel_madinah_dist: 'Pintu Masuk Gerbang Utama',
    airline_name: 'Turkish Airlines (CGK - IST - MED)',
    quota: 35,
    remainingQuota: 15,
    badge: 'Wisata Sejarah Islam',
    facilities: [
      'City Tour Istanbul: Hagia Sophia & Blue Mosque',
      'Bosphorus Cruise Tour Eksklusif',
      'Hotel Bintang 5 di Istanbul, Makkah, & Madinah',
      'Pemandu Wisata Sejarah Berbahasa Indonesia',
      'Tiket Masuk Seluruh Destinasi Sejarah Termasuk',
    ],
  },
  {
    id: 5,
    name: 'Umroh Awal Musim Hemat Berkualitas',
    type: 'Umroh Reguler',
    duration_days: 9,
    departure_date: '2026-12-05',
    price: 27500000,
    departure_city: 'Surabaya (SUB)',
    hotel_makkah_name: 'Anjum Hotel Makkah',
    hotel_makkah_stars: 5,
    hotel_makkah_dist: '150m ke Pelataran Luar Haram',
    hotel_madinah_name: 'Rove Al Madinah',
    hotel_madinah_stars: 4,
    hotel_madinah_dist: '100m ke Masjid Nabawi',
    airline_name: 'Lion Air / Batik Air Direct Umroh',
    quota: 45,
    remainingQuota: 18,
    badge: 'Paket Hemat',
    facilities: [
      'Penerbangan Langsung dari Bandara Juanda Surabaya',
      'Hotel Bintang 5 Makkah & Bintang 4 Madinah',
      'Konsumsi 3x Sehari Masakan Cita Rasa Nusantara',
      'Air Zamzam Resmi (Sesuai Regulasi Maskapai)',
      'Free Manasik Teori & Praktik Sebelum Berangkat',
    ],
  },
  {
    id: 6,
    name: 'Umroh Plus Dubai & Abu Dhabi',
    type: 'Umroh Plus',
    duration_days: 13,
    departure_date: '2026-12-20',
    price: 38900000,
    departure_city: 'Jakarta (CGK)',
    hotel_makkah_name: 'Rotana Al Marwa Makkah',
    hotel_makkah_stars: 5,
    hotel_makkah_dist: 'Direct Access ke Haram',
    hotel_madinah_name: 'Millennium Al Aqeeq',
    hotel_madinah_stars: 5,
    hotel_madinah_dist: '50m ke Gerbang Pria',
    airline_name: 'Emirates Airlines (CGK - DXB - JED)',
    quota: 30,
    remainingQuota: 6,
    badge: 'Liburan Akhir Tahun',
    facilities: [
      'Kunjungan Burj Khalifa & Dubai Mall',
      'Tour Masjid Agung Sheikh Zayed Abu Dhabi',
      'Desert Safari & Dinner Masakan Timur Tengah',
      'Akomodasi Hotel Bintang 5 Terintegrasi',
      'Bimbingan Ibadah Penuh dari Tanah Air',
    ],
  },
]

export default async function HomePage() {
  // Fetch real packages from Supabase
  const { data: rawPackages } = await getPackages()
  const dynamicPackages = rawPackages || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-600 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BAR KEMENAG RI */}
      <div className="bg-[#022318] text-white text-xs border-b border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-900 text-amber-300 font-bold text-[11px] border border-amber-400/30">
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
            <span className="hidden md:inline text-emerald-700">•</span>
            <span className="hidden md:inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>SISKOPATUH Terintegrasi</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#064e3b] border border-amber-500/50 p-2 flex items-center justify-center text-amber-400">
              <Compass className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  Al-Madinah
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-bold border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/50">
                  TRAVEL
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block tracking-wide mt-0.5">
                Penyelenggara Ibadah Umroh & Haji Khusus
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
            <a
              href="#"
              className="px-3.5 py-2 rounded-lg bg-[#064e3b] text-white transition-colors"
            >
              Beranda
            </a>
            <a
              href="#layanan"
              className="px-3.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-[#064e3b] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Layanan Kami
            </a>
            <a
              href="#katalog"
              className="px-3.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-[#064e3b] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Paket Pilihan
            </a>
            <a
              href="#keunggulan"
              className="px-3.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-[#064e3b] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Keunggulan
            </a>
            <a
              href="#kontak"
              className="px-3.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-[#064e3b] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Kontak
            </a>
          </nav>

          {/* Portal Action Button */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="rounded-lg px-4 py-2 bg-[#064e3b] hover:bg-[#053f30] text-white font-bold border border-emerald-700 text-xs gap-2 transition-colors">
                <span>Masuk ke Portal</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (SOLID DEEP EMERALD & MONOCHROME CONTRAST) */}
      <section className="relative min-h-[520px] lg:min-h-[600px] flex items-center justify-center overflow-hidden bg-[#022318] border-b border-emerald-900/60">
        {/* Subtle Background Layer */}
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src="/images/haramain-hero.jpg"
            alt="Suasana Ibadah di Masjidil Haram Makkah"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#022318]/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#043324] border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Penyelenggara Perjalanan Ibadah Terpercaya & Berizin Resmi Kemenag</span>
          </div>

          {/* Main Typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.2]">
            Gerbang Menuju Perjalanan Ibadah yang{' '}
            <span className="text-amber-300 underline decoration-amber-400/60 decoration-2 underline-offset-8">
              Penuh Berkah & Terpercaya
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal">
            Wujudkan kerinduan suci menuju Baitullah bersama Al-Madinah Tour & Travel. Kami hadir mendampingi
            seluruh tahapan ibadah Anda dengan kepastian jadwal, akomodasi hotel bintang lima di pelataran
            Masjidil Haram, dan bimbingan muthawwif bersertifikat sepanjang tahun.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="#katalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm border border-amber-300 transition-colors"
            >
              <span>Lihat Paket Pilihan</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-[#064e3b] hover:bg-[#075f48] border border-emerald-600/50 text-white font-semibold text-sm transition-colors"
            >
              <span>Masuk ke Portal Jamaah</span>
              <Compass className="w-4 h-4 text-amber-300" />
            </Link>
          </div>

          {/* Quick Metrics Below Hero */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-emerald-800/80">
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-extrabold text-amber-300">15.000+</span>
              <span className="text-xs text-emerald-200/90 font-medium">Jamaah Terlayani</span>
            </div>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-extrabold text-amber-300">100%</span>
              <span className="text-xs text-emerald-200/90 font-medium">Pasti Berangkat</span>
            </div>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-extrabold text-amber-300">Bintang 5</span>
              <span className="text-xs text-emerald-200/90 font-medium">Hotel Ring 1 Haram</span>
            </div>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-extrabold text-amber-300">99.8%</span>
              <span className="text-xs text-emerald-200/90 font-medium">Kepuasan Jamaah</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LAYANAN UNGGULAN */}
      <section id="layanan" className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#064e3b] dark:text-emerald-400 font-bold text-xs tracking-wider uppercase border border-emerald-200 dark:border-emerald-800/40">
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Layanan Unggulan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Perjalanan Ibadah Bersama Al-Madinah
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Dari awal pendaftaran hingga kembali ke tanah air, kami mendampingi setiap langkah ibadah
              Anda dengan kenyamanan, keamanan, dan kepastian.
            </p>
          </div>

          {/* Clean Flat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 flex flex-col items-start text-left space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-[#064e3b] dark:text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Paket Resmi & Berizin Kemenag
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Terdaftar resmi di SISKOPATUH Kemenag RI dengan kepastian nomor porsi dan tiket penerbangan langsung PP.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 flex flex-col items-start text-left space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-[#064e3b] dark:text-emerald-400">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bimbingan Muthawwif Sunnah
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Didampingi asatidz dan muthawwif bersertifikat untuk memastikan setiap rukun dan doa ibadah sesuai sunnah.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 flex flex-col items-start text-left space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-[#064e3b] dark:text-emerald-400">
                <Building className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hotel Bintang 5 Ring 1 Masjid
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Akomodasi terbaik di pelataran Masjidil Haram Makkah dan Masjid Nabawi Madinah untuk kemudahan ibadah.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700/60 flex flex-col items-start text-left space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-[#064e3b] dark:text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Layanan Berkas & Visa Kilat
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Verifikasi paspor cepat, visa umroh/haji resmi, asuransi syariah, dan handling bandara terintegrasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KATALOG PAKET PERJALANAN */}
      <section id="katalog" className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 text-amber-900 font-bold text-xs tracking-wider uppercase border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700/50">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Katalog Resmi 1448H
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Pilihan Paket Umroh & Haji Khusus
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Pilih tanggal keberangkatan dan paket akomodasi yang sesuai dengan kenyamanan ibadah Anda dan keluarga.
              </p>
            </div>
            <Link href="/login" className="self-start md:self-auto">
              <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold gap-2 text-xs">
                <span>Lihat Semua Paket di Portal</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Package Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dynamicPackages.length > 0
              ? dynamicPackages.slice(0, 6).map((pkg) => {
                  const regCount = (pkg as any).registrations?.length || 0
                  const remainingQuota = Math.max(0, pkg.quota - regCount)
                  const quotaPercent = Math.min(100, Math.round((regCount / (pkg.quota || 1)) * 100))

                  return (
                    <Card
                      key={pkg.id}
                      className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-900"
                    >
                      {/* Top Banner */}
                      <div className="bg-[#064e3b] p-4 text-white flex items-center justify-between border-b border-emerald-800">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
                            {pkg.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            {pkg.duration_days} Hari Perjalanan
                          </span>
                        </div>
                        <Badge className="bg-amber-400 text-slate-950 font-bold text-xs border-0 px-2.5 py-0.5 rounded">
                          {pkg.departure_city || 'Jakarta (CGK)'}
                        </Badge>
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-5">
                        <div className="space-y-3.5">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                            {pkg.name}
                          </h3>

                          {/* Price */}
                          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Biaya Paket All-In:</span>
                            <div className="text-xl font-extrabold text-[#064e3b] dark:text-emerald-400">
                              {formatCurrency(pkg.price)}
                            </div>
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block">
                              Bisa diangsur hingga H-30 keberangkatan
                            </span>
                          </div>

                          {/* Logistics Details */}
                          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Keberangkatan: <strong>{formatDate(pkg.departure_date)}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Plane className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Maskapai: <strong>{pkg.airlines?.name || 'Saudia Airlines / Garuda'}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Makkah: <strong>{pkg.hotel_makkah?.name || 'Hotel Bintang 5 Dekat Masjid'}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Madinah: <strong>{pkg.hotel_madinah?.name || 'Hotel Bintang 5 Dekat Masjid'}</strong></span>
                            </div>
                          </div>

                          {/* Quota Progress */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-500 dark:text-slate-400">Ketersediaan Kursi:</span>
                              <span className="font-bold text-[#064e3b] dark:text-emerald-400">Tersisa {remainingQuota} Seat</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${quotaPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Booking CTA Button */}
                        <Link href="/login" className="w-full pt-1">
                          <Button className="w-full rounded-lg bg-[#064e3b] hover:bg-[#053f30] text-white font-bold py-2 text-xs border border-emerald-700/50 gap-2 transition-colors">
                            <span>Pilih Paket & Daftar</span>
                            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })
              : FALLBACK_PACKAGES.map((pkg) => (
                  <Card
                    key={pkg.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-slate-900"
                  >
                    {/* Top Banner */}
                    <div className="bg-[#064e3b] p-4 text-white flex items-center justify-between border-b border-emerald-800">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
                          {pkg.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-emerald-100 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {pkg.duration_days} Hari Perjalanan
                        </span>
                      </div>
                      <Badge className="bg-amber-400 text-slate-950 font-bold text-xs border-0 px-2.5 py-0.5 rounded">
                        {pkg.badge}
                      </Badge>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-5">
                      <div className="space-y-3.5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                          {pkg.name}
                        </h3>

                        {/* Price */}
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Biaya Paket All-In:</span>
                          <div className="text-xl font-extrabold text-[#064e3b] dark:text-emerald-400">
                            {formatCurrency(pkg.price)}
                          </div>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block">
                            Bisa diangsur hingga H-30 keberangkatan
                          </span>
                        </div>

                        {/* Logistics Details */}
                        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Keberangkatan: <strong>{formatDate(pkg.departure_date)} ({pkg.departure_city})</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Plane className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Maskapai: <strong>{pkg.airline_name}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Makkah: <strong>{pkg.hotel_makkah_name} ({pkg.hotel_makkah_dist})</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Madinah: <strong>{pkg.hotel_madinah_name} ({pkg.hotel_madinah_dist})</strong></span>
                          </div>
                        </div>

                        {/* Quota Progress */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Ketersediaan Kursi:</span>
                            <span className="font-bold text-[#064e3b] dark:text-emerald-400">Tersisa {pkg.remainingQuota} dari {pkg.quota} Kursi</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full"
                              style={{ width: `${Math.round(((pkg.quota - pkg.remainingQuota) / pkg.quota) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Booking CTA Button */}
                      <Link href="/login" className="w-full pt-1">
                        <Button className="w-full rounded-lg bg-[#064e3b] hover:bg-[#053f30] text-white font-bold py-2 text-xs border border-emerald-700/50 gap-2 transition-colors">
                          <span>Pilih Paket & Daftar</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* 6. KEUNGGULAN "5 PASTI UMROH" KEMENAG RI */}
      <section id="keunggulan" className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#064e3b] dark:text-emerald-400 font-bold text-xs tracking-wider uppercase border border-emerald-200 dark:border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Komitmen Perlindungan Jamaah
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Standar 5 Pasti Umroh Kemenag RI
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Kami menjamin kepatuhan 100% terhadap regulasi Kementerian Agama untuk memberikan rasa aman dan tenang bagi jamaah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#064e3b] dark:text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-200 dark:border-emerald-800/40">
                1
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pasti Travelnya</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Berizin resmi Kemenag RI dengan rekam jejak terpercaya sejak 2015.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#064e3b] dark:text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-200 dark:border-emerald-800/40">
                2
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pasti Jadwalnya</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Tanggal keberangkatan dan kepulangan pasti dengan tiket issued di awal.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#064e3b] dark:text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-200 dark:border-emerald-800/40">
                3
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pasti Terbangnya</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Penerbangan langsung bersama maskapai resmi berstandar internasional.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#064e3b] dark:text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-200 dark:border-emerald-800/40">
                4
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pasti Hotelnya</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Akomodasi hotel bintang 5 ring 1 terkonfirmasi sejak awal pendaftaran.</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-center">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#064e3b] dark:text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-200 dark:border-emerald-800/40">
                5
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pasti Visanya</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Visa umroh dan haji resmi terbit sebelum hari keberangkatan jamaah.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. LANGKAH MUDAH PENDAFTARAN */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-50 text-amber-900 font-bold text-xs tracking-wider uppercase border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700/50">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Alur Pendaftaran
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              4 Langkah Mudah Menuju Baitullah
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Proses registrasi transparan, serba digital, dan didampingi tim konsultan kami hingga hari keberangkatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-center">
              <div className="w-9 h-9 mx-auto rounded-lg bg-[#064e3b] text-amber-300 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Pilih Paket</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Pilih jadwal dan tipe paket umroh atau haji yang sesuai dengan kebutuhan Anda.</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-center">
              <div className="w-9 h-9 mx-auto rounded-lg bg-[#064e3b] text-amber-300 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Lengkapi Berkas</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Unggah dokumen paspor, KTP, dan bukti vaksinasi langsung melalui portal digital kami.</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-center">
              <div className="w-9 h-9 mx-auto rounded-lg bg-[#064e3b] text-amber-300 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Manasik Intensif</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Ikuti sesi bimbingan manasik teori dan praktik simulasi ibadah bersama muthawwif.</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-center">
              <div className="w-9 h-9 mx-auto rounded-lg bg-[#064e3b] text-amber-300 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Berangkat Ibadah</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Nikmati perjalanan ibadah yang khusyuk, tenang, dan mabrur didampingi tim kami.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONI JAMAAH */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#064e3b] dark:text-emerald-400 font-bold text-xs tracking-wider uppercase border border-emerald-200 dark:border-emerald-800/40">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Kisah Jamaah
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Pengalaman Ibadah Bersama Al-Madinah
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ratusan kisah kepuasan jamaah yang telah menunaikan ibadah umroh dan haji bersama kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "Alhamdulillah, perjalanan Umroh Ramadhan bersama keluarga sangat berkesan. Hotelnya benar-benar di depan pelataran Masjidil Haram, muthawwifnya sabar dan sangat menguasai sejarah Islam."
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#064e3b] dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                  HA
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">H. Ahmad Fauzi & Keluarga</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Jamaah Umroh Ramadhan 1447H • Jakarta</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "Pelayanan sistem digitalnya sangat memudahkan. Status paspor dan visa terpantau jelas di akun portal, proses manasiknya mendalam, dan makanan di Makkah sesuai selera nusantara."
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#064e3b] dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                  SW
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Hj. Siti Wahyuni</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Jamaah Umroh Reguler Syawal • Surabaya</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "Bismillah, Haji Khusus Furoda lewat Al-Madinah terbukti profesional. Maktab di Mina ber-AC nyaman, jadwal kereta cepat tepat waktu, dan bimbingan ibadahnya sangat menenangkan hati."
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#064e3b] dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                  RP
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">Dr. H. Raden Pratama</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Jamaah Haji Khusus VIP • Bandung</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SPIRITUAL CALL TO ACTION BANNER */}
      <section className="py-16 bg-[#022318] text-white border-y border-emerald-900">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-[#043324] border border-amber-400/40 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Labbaik Allahumma Labbaik</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Panggilan Suci ke Baitullah Menanti Anda
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Siapkan niat suci Anda dan keluarga. Hubungi konsultan kami atau daftar langsung melalui portal
            resmi untuk mengamankan kursi keberangkatan Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm border border-amber-300 transition-colors"
            >
              Mulai Pendaftaran di Portal
            </Link>
            <a
              href="https://wa.me/6281288889999?text=Assalamu'alaikum%20Al-Madinah%20Travel,%20saya%20ingin%20konsultasi%20paket%20Umroh"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg bg-[#064e3b] hover:bg-[#075f48] border border-emerald-600/50 text-white font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>Konsultasi via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer id="kontak" className="bg-[#021f15] text-emerald-100 border-t border-emerald-900 pt-14 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Legal */}
            <div className="space-y-3.5 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#064e3b] border border-amber-500/40 p-2 flex items-center justify-center text-amber-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white block leading-none">
                    Al-Madinah
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold tracking-wider uppercase block mt-1">
                    Tour & Travel
                  </span>
                </div>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Penyelenggara Perjalanan Ibadah Umroh (PPIU) dan Haji Khusus (PIHK) resmi Kementerian Agama Republik Indonesia.
              </p>
              <div className="pt-1 text-xs text-amber-300/90 space-y-0.5 font-mono">
                <div>SK PPIU: No. U.123/2021</div>
                <div>SK PIHK: No. H.456/2022</div>
              </div>
            </div>

            {/* Col 2: Navigasi */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
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
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Kantor Operasional
              </h4>
              <div className="space-y-2 text-xs text-emerald-200/80">
                <div>
                  <strong className="text-white block font-semibold">Kantor Pusat Jakarta:</strong>
                  Menara Al-Madinah Lantai 12, Jl. HR Rasuna Said, Jakarta Selatan
                </div>
                <div>
                  <strong className="text-white block font-semibold">Kantor Cabang:</strong>
                  Surabaya • Bandung • Medan • Makassar • Yogyakarta
                </div>
              </div>
            </div>

            {/* Col 4: Kontak & Bantuan */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
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

          <div className="pt-6 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400/80 gap-2">
            <p>© {new Date().getFullYear()} Al-Madinah Tour & Travel. Seluruh Hak Cipta Dilindungi.</p>
            <p>Sistem Manajemen Operasional Umroh & Haji Terintegrasi</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
