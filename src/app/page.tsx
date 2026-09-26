import Link from 'next/link'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatRupiah } from '@/features/payments/utils/terbilang'

const ACTIVE_PACKAGES = [
  {
    id: 1,
    name: 'Umroh Reguler Syawal 1447H',
    type: 'Umroh Reguler',
    duration: '9 Hari',
    departureDate: '15 Okt 2026',
    price: 29500000,
    departureCity: 'Jakarta (CGK)',
    hotelMakkah: 'Swissôtel Al Maqam (Bintang 5 - 50m)',
    hotelMadinah: 'Dar Al Taqwa (Bintang 5 - 30m)',
    airline: 'Saudia Airlines (Direct CGK - MED)',
    quota: 45,
    remainingQuota: 12,
    badge: 'Paling Diminati',
    included: [
      'Tiket Pesawat PP Direct',
      'Hotel Bintang 5 Dekat Masjid',
      'Makan 3x Sehari Fullboard Indonesia',
      'Visa Umroh & Asuransi Perjalanan',
      'Handling Bandara & Muthawif Pembimbing',
    ],
  },
  {
    id: 2,
    name: 'Umroh Ramadhan Berkah I’tikaf',
    type: 'Umroh Ramadhan',
    duration: '12 Hari',
    departureDate: '05 Nov 2026',
    price: 42000000,
    departureCity: 'Jakarta (CGK)',
    hotelMakkah: 'Pullman Zamzam (Bintang 5 - 80m)',
    hotelMadinah: 'Madinah Hilton (Bintang 5 - 70m)',
    airline: 'Garuda Indonesia (Direct CGK - JED)',
    quota: 40,
    remainingQuota: 8,
    badge: 'I’tikaf 10 Malam Terakhir',
    included: [
      'Tiket PP Garuda Indonesia',
      'Bimbingan I’tikaf Khusus Muthawif',
      'Fullboard Sahur & Iftar Lezat',
      'Kereta Cepat Haramain Makkah-Madinah',
      'Perlengkapan Umroh Eksklusif',
    ],
  },
  {
    id: 3,
    name: 'Haji Khusus Furoda VIP Mujamalah',
    type: 'Haji Khusus',
    duration: '25 Hari',
    departureDate: '20 Mei 2027',
    price: 265000000,
    departureCity: 'Jakarta (CGK)',
    hotelMakkah: 'Swissôtel Al Maqam VIP Suite',
    hotelMadinah: 'Dar Al Taqwa Executive Suite',
    airline: 'Garuda Indonesia Business Class',
    quota: 20,
    remainingQuota: 4,
    badge: 'Langsung Berangkat Tanpa Antre',
    included: [
      'Visa Haji Mujamalah Resmi Kemenag',
      'Maktab Tenda VIP Ber-AC Mina & Arafah',
      'Kereta Cepat Haramain High-Speed Train',
      'Ziarah Eksklusif Tempat Bersejarah',
      'Dokter & Tim Medis Pendamping 24 Jam',
    ],
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09130e] text-foreground flex flex-col">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
        <span>Pendaftaran Umroh Musim 1448H Telah Dibuka. Hubungi kantor cabang terdekat kami!</span>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-foreground block leading-tight">
                Al-Madinah Tour & Travel
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase block">
                Penyelenggara Resmi Izin Kemenag RI
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#katalog" className="hover:text-emerald-600 transition-colors">
              Paket Perjalanan
            </a>
            <a href="#keunggulan" className="hover:text-emerald-600 transition-colors">
              Keunggulan
            </a>
            <a href="#kontak" className="hover:text-emerald-600 transition-colors">
              Kontak Kami
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 gap-2 font-medium">
                <span>Masuk ke Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-emerald-50/50 via-slate-50 to-white dark:from-[#0c1f17] dark:via-[#09130e] dark:to-[#09130e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 px-3 py-1 text-xs font-semibold gap-1.5 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Amanah, Resmi, & Berizin Kemenag
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Menuju Baitullah dengan Penuh{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Kekhusyukan & Keberkahan
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Pelayanan perjalanan ibadah Umroh dan Haji Khusus bertaraf bintang 5 dengan bimbingan
              muthawif berkompeten, hotel dekat Masjidil Haram, dan kepastian jadwal keberangkatan.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#katalog">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base px-8 h-12 shadow-lg shadow-emerald-600/25">
                  Lihat Paket Tersedia
                </Button>
              </a>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold text-base px-6 h-12 border-emerald-200 hover:bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300">
                  Portal Staf & Jamaah
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      </section>

      {/* Package Catalog Section */}
      <section id="katalog" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-300 text-xs uppercase tracking-wider font-semibold">
            Katalog Perjalanan Terbuka
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Pilihan Paket Umroh & Haji Khusus
          </h2>
          <p className="text-sm text-muted-foreground">
            Transparansi penuh mengenai fasilitas, maskapai penerbangan, hotel akomodasi, dan sisa kuota kursi secara real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ACTIVE_PACKAGES.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden border-border/80 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-emerald-500/50 bg-card group">
              <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-6 text-white relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                    {pkg.type}
                  </span>
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {pkg.duration}
                  </span>
                </div>
                <h3 className="text-xl font-bold leading-snug group-hover:text-amber-200 transition-colors">
                  {pkg.name}
                </h3>
                <div className="mt-4 pt-3 border-t border-white/15 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-100 block">Mulai dari</span>
                    <span className="text-2xl font-extrabold">{formatRupiah(pkg.price)}</span>
                  </div>
                  <Badge className="bg-amber-400 text-amber-950 font-bold text-[10px] px-2">
                    {pkg.badge}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5 text-foreground font-medium">
                    <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Keberangkatan: {pkg.departureDate}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Embarkasi: {pkg.departureCity}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Plane className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{pkg.airline}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Building className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Mekah: {pkg.hotelMakkah}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Building className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Madinah: {pkg.hotelMadinah}</span>
                  </div>

                  {/* Quota Progress */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-muted-foreground">Sisa Kuota Kursi</span>
                      <span className="text-emerald-600 font-bold">{pkg.remainingQuota} dari {pkg.quota} Kursi</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${((pkg.quota - pkg.remainingQuota) / pkg.quota) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs font-semibold text-foreground mb-2">Fasilitas Termasuk:</p>
                  <ul className="space-y-1.5">
                    {pkg.included.map((inc, i) => (
                      <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/login" className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                    Daftar Melalui Staf / Agen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust & Features Section */}
      <section id="keunggulan" className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Izin Resmi Kemenag</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Penyelenggara Perjalanan Ibadah Umroh (PPIU) dengan rekam jejak amanah & profesional.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Hotel Depan Pelataran</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Akomodasi bintang 5 berjarak 30-80 meter langsung melangkah menuju Masjidil Haram.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Muthawif Bersertifikat</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Bimbingan ibadah intensif sesuai Al-Qur'an dan Sunnah sejak manasik di tanah air.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Penerbangan Langsung</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Terbang nyaman tanpa transit bersama Saudia Airlines dan maskapai terbaik Garuda Indonesia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Compass className="h-5 w-5" />
                </div>
                <span className="font-bold text-base text-white">Al-Madinah Tour & Travel</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Melayani pendaftaran jamaah umroh dan haji dari kantor pusat Jakarta dan jaringan cabang di seluruh Indonesia dengan sistem digital modern terintegrasi.
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-sm text-white mb-3">Kantor Operasional</h5>
              <div className="space-y-2 text-xs text-slate-400">
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Jl. M.H. Thamrin No. 12, Menteng, Jakarta Pusat, DKI Jakarta 10350</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>021-3901234 / +62 812-3456-7890</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>info@almadinahtravel.com</span>
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-sm text-white mb-3">Portal Pengguna</h5>
              <p className="text-xs text-slate-400 mb-4">
                Akses masuk khusus staf kantor pusat, admin cabang, mitra agen, dan calon jamaah terdaftar.
              </p>
              <Link href="/login">
                <Button variant="outline" className="border-emerald-600 text-emerald-400 hover:bg-emerald-950/60 w-full sm:w-auto">
                  Masuk ke Portal Sistem
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-slate-500">
            © 2026 PT Al-Madinah Tour & Travel. Seluruh Hak Cipta Dilindungi. Sistem Manajemen Terpadu v1.0.
          </div>
        </div>
      </footer>
    </div>
  )
}
