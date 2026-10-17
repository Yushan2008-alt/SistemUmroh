import Image from 'next/image'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Users,
  Building,
  Award,
} from 'lucide-react'

export function LandingHero() {
  return (
    <section id="beranda" className="relative min-h-[520px] lg:min-h-[580px] flex items-center justify-center overflow-hidden bg-[#0d7a64] border-b border-emerald-800/50">
      {/* Background Radial Pattern matching Login Page */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Background Image with High Priority for Mobile LCP Optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/haramain-hero.jpg"
          alt="Suasana Ibadah Khusyuk di Pelataran Ka'bah Masjidil Haram Makkah"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
          className="object-cover object-center opacity-20 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d7a64]/90 via-[#0d7a64]/80 to-[#0d7a64]" />
      </div>

      {/* Mosque Dome & Minarets SVG Illustration at bottom matching Login Page */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-20 z-0">
        <svg
          viewBox="0 0 700 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto text-emerald-200 fill-current"
        >
          {/* Left Minaret */}
          <path d="M70 260V90L77 82V65L82 60V35L77 30L82 10L87 30L82 35V60L87 65V82L94 90V260H70Z" />
          <circle cx="82" cy="7" r="3" />
          {/* Small Dome Left */}
          <path d="M120 260V180C120 130 180 120 210 90C240 120 300 130 300 180V260H120Z" />
          <path d="M210 90V65L207 62L210 50L213 62L210 65Z" />
          {/* Grand Center Dome */}
          <path d="M250 260V160C250 80 340 70 380 20C420 70 510 80 510 160V260H250Z" />
          <path d="M380 20V0L377 -2L380 -12L383 -2L380 0Z" />
          {/* Small Dome Right */}
          <path d="M470 260V185C470 140 520 130 550 100C580 130 630 140 630 185V260H470Z" />
          {/* Right Minaret */}
          <path d="M640 260V90L647 82V65L652 60V35L647 30L652 10L657 30L652 35V60L657 65V82L664 90V260H640Z" />
          <circle cx="652" cy="7" r="3" />
        </svg>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-6">
        {/* Accreditation Pill matching Login Page */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/40 border border-emerald-400/20 text-emerald-100 text-xs sm:text-sm font-medium shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          <span>Penyelenggara Perjalanan Ibadah Terpercaya &amp; Berizin Resmi Kemenag</span>
        </div>

        {/* Main Heading (Only one H1 per page for SEO) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.2] font-heading">
          Gerbang Menuju Perjalanan Ibadah yang{' '}
          <span className="underline decoration-emerald-300 decoration-2 underline-offset-8">
            Penuh Berkah &amp; Terpercaya
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-emerald-100/90 leading-relaxed font-normal">
          Wujudkan kerinduan suci menuju Baitullah bersama Al-Madinah Tour &amp; Travel. Kami hadir mendampingi
          seluruh tahapan ibadah Anda dengan kepastian jadwal, akomodasi hotel bintang lima di pelataran
          Masjidil Haram, dan bimbingan muthawwif bersertifikat.
        </p>

        {/* Mobile-Friendly CTAs (Stacked on Mobile, Row on Tablet/Desktop, 48px height) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md sm:max-w-none mx-auto">
          <a
            href="#katalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0d7a64] font-bold text-sm shadow-md transition-all duration-200 min-h-[48px] cursor-pointer"
          >
            <span>Lihat Paket Keberangkatan</span>
            <ArrowRight className="w-4 h-4 text-[#0d7a64]" />
          </a>

          <a
            href="https://wa.me/6281288889999?text=Assalamu'alaikum%20Al-Madinah%20Travel,%20saya%20ingin%20konsultasi%20jadwal%20paket%20Umroh"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/25 transition-all duration-200 min-h-[48px]"
          >
            <MessageCircle className="w-4 h-4 text-emerald-200" />
            <span>Konsultasi via WhatsApp</span>
          </a>
        </div>

        {/* 3 Quick Value Highlights */}
        <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto border-t border-white/15 text-left">
          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-heading">15.000+</div>
              <div className="text-[11px] text-emerald-100/80">Jamaah Diberangkatkan</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-heading">Hotel Ring 1</div>
              <div className="text-[11px] text-emerald-100/80">Dekat Pelataran Masjid</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-heading">Akreditasi A</div>
              <div className="text-[11px] text-emerald-100/80">Nilai Unggul Kemenag RI</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
