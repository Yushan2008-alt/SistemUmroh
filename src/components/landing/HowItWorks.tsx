import { Search, FileText, BookOpenCheck, PlaneTakeoff, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Pilih Paket & Jadwal',
    description:
      'Pilih paket Umroh atau Haji Khusus sesuai jadwal dan anggaran. Informasi maskapai, hotel, dan ketersediaan kuota transparan.',
  },
  {
    step: '02',
    icon: FileText,
    title: 'Booking & Unggah Berkas',
    description:
      'Kunci kursi Anda dengan DP resmi. Foto atau unggah KTP dan Paspor langsung dari smartphone Anda tanpa repot datang ke kantor.',
  },
  {
    step: '03',
    icon: BookOpenCheck,
    title: 'Bimbingan Manasik',
    description:
      'Dapatkan perlengkapan eksklusif ke alamat Anda dan ikuti manasik umroh sesuai sunnah secara tatap muka atau video manasik interaktif.',
  },
  {
    step: '04',
    icon: PlaneTakeoff,
    title: 'Berangkat ke Tanah Suci',
    description:
      'Didampingi Tour Leader & Muthawif berpengalaman sejak bandara keberangkatan, pelaksanaan ibadah, hingga tiba kembali di Indonesia.',
  },
]

export function HowItWorks() {
  return (
    <section id="cara-daftar" className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            PROSES MUDAH & CEPAT
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-3">
            4 Langkah Menuju Baitullah
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600">
            Alur pendaftaran digital terintegrasi yang praktis dan transparan, dapat dilakukan kapan saja dari ponsel Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="relative bg-stone-50/70 rounded-xl p-5 sm:p-6 border border-stone-200/90 flex flex-col justify-between hover:border-emerald-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-emerald-800/40">
                      {item.step}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick CTA */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="#paket"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-800 text-white font-medium hover:bg-emerald-900 transition-colors shadow-sm text-sm"
          >
            Mulai Pilih Paket Tersedia
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </Link>
        </div>
      </div>
    </section>
  )
}
