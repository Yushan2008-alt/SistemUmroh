import {
  ShieldCheck,
  CalendarCheck2,
  Hotel,
  FileCheck2,
  Coins,
  Award,
  CheckCircle2,
} from 'lucide-react'

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Izin PPIU & PIHK Resmi',
    subtitle: 'Kemenag RI No. U.412/2021',
    description:
      'Terdaftar dan diawasi resmi oleh Kementerian Agama RI dengan akreditasi A, menjamin legalitas penuh perjalanan ibadah Anda.',
  },
  {
    icon: CalendarCheck2,
    title: 'Kepastian Jadwal & Tiket',
    subtitle: 'Direct Flight CGK - JED / MED',
    description:
      'Tiket maskapai ternama (Garuda Indonesia, Saudia Airlines) sudah dipesan sebelum paket dirilis. Jadwal pasti tanpa undur.',
  },
  {
    icon: Hotel,
    title: 'Hotel Ring 1 Pelataran',
    subtitle: 'Dekat Masjidil Haram & Nabawi',
    description:
      'Akomodasi bintang 5 dan 4 pilihan terbaik dengan jarak jalan kaki singkat, memudahkan ibadah wajib dan sunnah jamaah lansia.',
  },
  {
    icon: FileCheck2,
    title: 'Visa & Asuransi Syariah',
    subtitle: 'Proses Cepat & Terjamin',
    description:
      'Pengurusan e-Visa umroh resmi terintegrasi sistem Nusuk, dilengkapi perlindungan asuransi kesehatan & perjalanan syariah komprehensif.',
  },
  {
    icon: Coins,
    title: 'Biaya Transparan & All-In',
    subtitle: 'Tanpa Biaya Tersembunyi',
    description:
      'Seluruh komponen biaya tiket, hotel, visa, handling, perlengkapan, dan makan 3x sehari full-board tercantum jelas sejak awal.',
  },
  {
    icon: Award,
    title: 'Pembimbing Bersertifikat BNSP',
    subtitle: 'Muthawif Berpengalaman',
    description:
      'Setiap grup didampingi Tour Leader berlisensi dan Muthawif mukimin alumni universitas Islam Timur Tengah yang ramah dan sabar.',
  },
]

export function TrustFeatures() {
  return (
    <section id="keunggulan" className="py-12 sm:py-16 md:py-20 bg-stone-50 border-t border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0d7a64] border border-emerald-200/80 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0d7a64]" />
            STANDAR RESMI KEMENAG RI
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
            Ibadah Tenang dengan Komitmen 5 Pasti Umroh
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            Menghadirkan kepastian dan kenyamanan sejak pendaftaran, manasik, hingga kepulangan
            kembali ke tanah air dengan predikat mabrur.
          </p>
        </div>

        {/* Grid 6 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {PILLARS.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-5 sm:p-6 border border-stone-200 hover:border-[#0d7a64]/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-lg bg-emerald-50 text-[#0d7a64] flex items-center justify-center shrink-0 border border-emerald-100">
                      <Icon className="w-5 h-5 text-[#0d7a64]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-[#0d7a64] uppercase tracking-wider block">
                        {item.subtitle}
                      </span>
                      <h3 className="text-base font-semibold text-stone-900 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Official Certifications Banner matching Login Page Theme */}
        <div className="mt-8 sm:mt-10 bg-[#0d7a64] text-white rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-700/60 shadow-xs relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          <div className="relative z-10 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-white">
              Mitra Terpercaya Penyelenggaraan Umroh &amp; Haji Khusus
            </h4>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
              Terakreditasi A Komite Akreditasi Nasional (KAN) • IATA Accredited Agent • Anggota Asosiasi Amphuri / Himpuh
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 text-white border border-white/25">
              ★ Akreditasi A
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-emerald-100 border border-white/20">
              IATA 15-3-0000
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
