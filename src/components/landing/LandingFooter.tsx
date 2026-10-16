import Link from 'next/link'
import {
  Compass,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="bg-[#022318] text-stone-300 border-t border-emerald-900/60 pb-20 md:pb-12 pt-12 sm:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-emerald-900/60">
          {/* Brand & Legal Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-700/80 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight block">
                  AL-MUHAJIRIN TRAVEL
                </span>
                <span className="text-[11px] font-medium text-amber-400 block -mt-0.5">
                  Penyelenggara Umroh & Haji Khusus
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed mb-4 max-w-sm">
              Biro perjalanan wisata ibadah Umroh dan Haji Khusus resmi berizin Kemenag RI.
              Melayani ribuan jamaah ke tanah suci dengan integritas, transparansi, dan kenyamanan ibadah prima.
            </p>

            <div className="space-y-2 text-xs text-stone-300/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Izin PPIU No: U.412/2021 | PIHK No: HK.028/2023</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Akreditasi A Kemenag RI • IATA Member 15-3-0000</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 text-amber-400/90">
              Navigasi Cepat
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  href="#paket"
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  Katalog Paket Umroh
                </Link>
              </li>
              <li>
                <Link
                  href="#keunggulan"
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  5 Pasti Umroh Kemenag
                </Link>
              </li>
              <li>
                <Link
                  href="#cara-daftar"
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  Alur Pendaftaran
                </Link>
              </li>
              <li>
                <Link
                  href="#testimoni"
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  Testimoni Jamaah
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-amber-300 transition-colors inline-flex items-center gap-1 font-medium text-amber-300"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  Portal Masuk Akun
                </Link>
              </li>
            </ul>
          </div>

          {/* Kantor Cabang */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 text-amber-400/90">
              Jaringan Cabang
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300/80">
              <div>
                <p className="font-semibold text-stone-200">Kantor Pusat (Jakarta)</p>
                <p>Jl. HR. Rasuna Said Kav. C-17, Kuningan, Jakarta Selatan</p>
              </div>
              <div>
                <p className="font-semibold text-stone-200">Cabang Surabaya</p>
                <p>Jl. Raya Darmo No. 82, Wonokromo, Surabaya</p>
              </div>
              <div>
                <p className="font-semibold text-stone-200">Cabang Bandung</p>
                <p>Jl. Buah Batu No. 142, Lengkong, Kota Bandung</p>
              </div>
            </div>
          </div>

          {/* Kontak & Layanan */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 text-amber-400/90">
              Layanan Jamaah
            </h4>
            <div className="space-y-3 text-xs sm:text-sm text-stone-300/80">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-stone-200">Hotline 24/7:</span>
                  <a href="tel:0215550192" className="hover:text-amber-300">
                    (021) 555-0192
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-stone-200">Email Resmi:</span>
                  <a href="mailto:info@almuhajirin-travel.id" className="hover:text-amber-300">
                    info@almuhajirin-travel.id
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-stone-200">Jam Operasional Kantor:</span>
                  <span>Senin - Sabtu: 08:30 - 17:00 WIB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Sistem Manajemen Umroh & Haji Enterprise. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-stone-300">Privasi & Keamanan</span>
            <span>•</span>
            <span className="hover:text-stone-300">Syarat & Ketentuan</span>
            <span>•</span>
            <span className="hover:text-stone-300">Regulasi Kemenag RI</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
