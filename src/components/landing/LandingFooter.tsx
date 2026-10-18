import Link from 'next/link'
import {
  Compass,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'

export function LandingFooter() {
  return (
    <footer id="kontak" className="bg-[#09473b] text-emerald-100 border-t border-emerald-800/60 pb-20 md:pb-12 pt-12 sm:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-emerald-800/50">
          {/* Brand & Legal Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white shadow-xs">
                <Compass className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight block">
                  AL-MADINAH TRAVEL
                </span>
                <span className="text-[11px] font-medium text-emerald-200 block -mt-0.5">
                  Penyelenggara Umroh &amp; Haji Khusus
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed mb-4 max-w-sm">
              Biro perjalanan wisata ibadah Umroh dan Haji Khusus resmi berizin Kemenag RI.
              Melayani ribuan jamaah ke tanah suci dengan integritas, transparansi, dan kenyamanan ibadah prima.
            </p>

            <div className="space-y-2 text-xs text-emerald-200/90">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Izin PPIU No: U.123/2021 | PIHK No: H.456/2022</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Akreditasi A Kemenag RI • IATA Member 15-3-0000</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="#katalog"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 text-emerald-100/90"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                  Katalog Paket Umroh
                </Link>
              </li>
              <li>
                <Link
                  href="#keunggulan"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 text-emerald-100/90"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                  5 Pasti Umroh Kemenag
                </Link>
              </li>
              <li>
                <Link
                  href="#cara-daftar"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 text-emerald-100/90"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                  Alur Pendaftaran
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 font-semibold text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                  Portal Masuk Akun
                </Link>
              </li>
            </ul>
          </div>

          {/* Kantor Cabang */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Jaringan Cabang
            </h4>
            <div className="space-y-2.5 text-xs text-emerald-100/80">
              <div>
                <p className="font-semibold text-white">Kantor Pusat (Jakarta)</p>
                <p>Jl. HR. Rasuna Said Kav. C-17, Kuningan, Jakarta Selatan</p>
              </div>
              <div>
                <p className="font-semibold text-white">Cabang Surabaya</p>
                <p>Jl. Raya Darmo No. 82, Wonokromo, Surabaya</p>
              </div>
              <div>
                <p className="font-semibold text-white">Cabang Bandung</p>
                <p>Jl. Buah Batu No. 142, Lengkong, Kota Bandung</p>
              </div>
            </div>
          </div>

          {/* Kontak & Layanan */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Layanan Jamaah
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-emerald-100/80">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">Hotline 24/7:</span>
                  <a href="tel:081288889999" className="hover:text-white">
                    0812-8888-9999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">Email Resmi:</span>
                  <a href="mailto:info@almadinah-travel.com" className="hover:text-white">
                    info@almadinah-travel.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-white">Jam Operasional:</span>
                  <span>Senin - Sabtu: 08:30 - 17:00 WIB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-200/70 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Sistem Manajemen Umroh &amp; Haji Enterprise. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privasi &amp; Keamanan</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Syarat &amp; Ketentuan</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Regulasi Kemenag RI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
