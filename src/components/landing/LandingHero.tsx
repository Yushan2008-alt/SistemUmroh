import Image from 'next/image'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  Users,
  Building,
  Award,
  CheckCircle2,
} from 'lucide-react'

export function LandingHero() {
  return (
    <section id="beranda" className="relative min-h-[520px] lg:min-h-[580px] flex items-center justify-center overflow-hidden bg-[#022318] border-b border-emerald-900/60">
      {/* Background Image with High Priority for Mobile LCP Optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/haramain-hero.jpg"
          alt="Suasana Ibadah Khusyuk di Pelataran Ka'bah Masjidil Haram Makkah"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
          className="object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#022318]/90 via-[#022318]/85 to-[#022318]" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-6">
        {/* Accreditation Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#043324] border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Penyelenggara Perjalanan Ibadah Terpercaya & Berizin Resmi Kemenag</span>
        </div>

        {/* Main Heading (Only one H1 per page for SEO) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.2] font-heading">
          Gerbang Menuju Perjalanan Ibadah yang{' '}
          <span className="text-amber-300 underline decoration-amber-400/60 decoration-2 underline-offset-8">
            Penuh Berkah & Terpercaya
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base lg:text-lg text-emerald-100/90 leading-relaxed font-normal">
          Wujudkan kerinduan suci menuju Baitullah bersama Al-Madinah Tour & Travel. Kami hadir mendampingi
          seluruh tahapan ibadah Anda dengan kepastian jadwal, akomodasi hotel bintang lima di pelataran
          Masjidil Haram, dan bimbingan muthawwif bersertifikat.
        </p>

        {/* Mobile-Friendly CTAs (Stacked on Mobile, Row on Tablet/Desktop, 48px height) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md sm:max-w-none mx-auto">
          <a
            href="#katalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all duration-200 min-h-[48px] cursor-pointer"
          >
            <span>Lihat Paket Keberangkatan</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="https://wa.me/6281288889999?text=Assalamu'alaikum%20Al-Madinah%20Travel,%20saya%20ingin%20konsultasi%20jadwal%20paket%20Umroh"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-sm border border-emerald-600/60 transition-all duration-200 min-h-[48px]"
          >
            <MessageCircle className="w-4 h-4 text-emerald-300" />
            <span>Konsultasi via WhatsApp</span>
          </a>
        </div>

        {/* 3 Quick Value Highlights */}
        <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto border-t border-emerald-900/60 text-left">
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800/70 text-amber-300 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-heading">15.000+</div>
              <div className="text-[11px] text-emerald-200/80">Jamaah Diberangkatkan</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800/70 text-amber-300 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-heading">Hotel Ring 1</div>
              <div className="text-[11px] text-emerald-200/80">Dekat Pelataran Masjid</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800/70 text-amber-300 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-base font-bold text-white font-heading">Akreditasi A</div>
              <div className="text-[11px] text-emerald-200/80">Nilai Unggul Kemenag RI</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
