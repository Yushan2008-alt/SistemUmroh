import { Star, Quote, CheckCircle2 } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'H. Bambang Sulistyo & Hj. Ratna',
    city: 'Surabaya, Jawa Timur',
    package: 'Umroh Plus Turki 12 Hari',
    quote:
      'Alhamdulillah perjalanan sangat khusyuk. Hotel Makkah benar-benar di pelataran Masjidil Haram sehingga orang tua tidak lelah berjalan. Pembimbing muthawif sangat sabar dan keilmuannya luas.',
    rating: 5,
    date: 'Keberangkatan Februari 2026',
  },
  {
    name: 'dr. Farah Maulida',
    city: 'Jakarta Selatan',
    package: 'Umroh Reguler Syawal 9 Hari',
    quote:
      'Sistem informasi jamaahnya sangat canggih. Notifikasi jadwal, unggah dokumen paspor, hingga pembayaran via transfer & QRIS langsung terverifikasi otomatis. Sangat efisien untuk profesional sibuk.',
    rating: 5,
    date: 'Keberangkatan Maret 2026',
  },
  {
    name: 'H. Ahmad Fauzan S.E.',
    city: 'Bandung, Jawa Barat',
    package: 'Haji Khusus Furoda 1447H',
    quote:
      'Kepastian tiket direct Saudia Airlines dan visa haji resmi terbit tepat waktu tanpa rasa was-was. Fasilitas maktab VIP di Mina dan Arafah sangat terawat. Pelayanan bintang lima sesungguhnya.',
    rating: 5,
    date: 'Musim Haji 1447H',
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimoni" className="py-12 sm:py-16 md:py-20 bg-stone-50 border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            TESTIMONI JAMAAH
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 tracking-tight mt-3">
            Kisah Bahagia Alumni Jamaah
          </h2>
          <p className="mt-2 text-sm sm:text-base text-stone-600">
            Komitmen kami adalah melayani tamu Allah dengan sepenuh hati dan standar kepastian tertinggi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 border border-stone-200 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-emerald-800/20" />
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                      {t.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </h4>
                    <p className="text-xs text-stone-500">{t.city}</p>
                  </div>
                </div>
                <div className="mt-2 inline-block px-2 py-0.5 rounded bg-emerald-50 text-[11px] font-medium text-emerald-800">
                  {t.package}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
