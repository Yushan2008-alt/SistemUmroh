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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                className="bg-white rounded-xl p-5 sm:p-6 border border-stone-200 hover:border-emerald-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                      <Icon className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
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

        {/* Official Certifications Banner */}
        <div className="mt-8 sm:mt-10 bg-emerald-900 text-white rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-emerald-800">
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-emerald-50">
              Mitra Terpercaya Penyelenggaraan Umroh & Haji Khusus
            </h4>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1">
              Terakreditasi A Komite Akreditasi Nasional (KAN) • IATA Accredited Agent • Anggota Asosiasi Amphuri / Himpuh
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-amber-300 border border-emerald-700">
              ★ Akreditasi A
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-emerald-100 border border-emerald-700">
              IATA 15-3-0000
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
