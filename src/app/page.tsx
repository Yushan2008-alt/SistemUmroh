import { getPackages } from '@/modules/operations/packages.actions'
import type { PackageItem } from '@/modules/operations/types'
import {
  LandingHeader,
  LandingHero,
  TrustFeatures,
  PackageCatalog,
  HowItWorks,
  TestimonialsSection,
  MobileStickyBar,
  LandingFooter,
} from '@/components/landing'

// Curated fallback packages with verified details
const FALLBACK_PACKAGES = [
  {
    id: 1,
    name: 'Umroh Reguler Syawal 1448H',
    type: 'Umroh Reguler',
    duration_days: 9,
    departure_date: '2026-10-25',
    price: 29500000,
    departure_city: 'Jakarta (CGK)',
    hotel_makkah_name: 'Swissôtel Al Maqam Makkah (★5)',
    hotel_madinah_name: 'Dar Al Taqwa Madinah (★5)',
    airline_name: 'Saudia Airlines (Direct CGK - MED)',
    quota: 45,
    remainingQuota: 12,
    badge: 'Paling Diminati',
    facilities: [
      'Tiket Pesawat PP Direct Saudia Airlines',
      'Hotel Bintang 5 Ring 1 Pelataran Masjid',
      'Makan 3x Sehari Fullboard Masakan Indonesia',
      'Visa Umroh Resmi & Asuransi Perjalanan Syariah',
      'Handling Bandara & Bimbingan Muthawif BNSP',
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
    hotel_makkah_name: 'Pullman Zamzam Makkah (★5)',
    hotel_madinah_name: 'Madinah Hilton (★5)',
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
    hotel_makkah_name: 'Fairmont Makkah Clock Royal Tower (★5)',
    hotel_madinah_name: 'The Oberoi Madinah (★5)',
    airline_name: 'Saudia Airlines Royal / Business',
    quota: 20,
    remainingQuota: 3,
    badge: 'Tanpa Antre Bertahun-tahun',
    facilities: [
      'Visa Haji Mujamalah (Furoda) Resmi Terdaftar',
      'Maktab VIP Tenda AC Mina & Arafah Dekat Jamarat',
      'Kereta Cepat Haramain Makkah - Madinah',
      'Dokter Pendamping & Muthawif Khusus 24 Jam',
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
    hotel_makkah_name: 'Mövenpick Hotel Hajar (★5)',
    hotel_madinah_name: 'Anwar Al Madinah Mövenpick (★5)',
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
    hotel_makkah_name: 'Anjum Hotel Makkah (★5)',
    hotel_madinah_name: 'Rove Al Madinah (★4)',
    airline_name: 'Batik Air / Lion Air Direct Umroh',
    quota: 45,
    remainingQuota: 18,
    badge: 'Paket Hemat',
    facilities: [
      'Penerbangan Langsung dari Bandara Juanda Surabaya',
      'Hotel Bintang 5 Makkah & Bintang 4 Madinah',
      'Konsumsi 3x Sehari Masakan Cita Rasa Nusantara',
      'Air Zamzam Resmi 5 Liter',
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
    hotel_makkah_name: 'Rotana Al Marwa Makkah (★5)',
    hotel_madinah_name: 'Millennium Al Aqeeq (★5)',
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
  let dynamicPackages: PackageItem[] = []
  try {
    const res = await getPackages()
    if (res && res.data) {
      dynamicPackages = res.data
    }
  } catch (err) {
    console.error('Error fetching dynamic packages:', err)
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-800 selection:text-white">
      {/* 1. Header with mobile navigation drawer */}
      <LandingHeader />

      <main>
        {/* 2. Hero Section */}
        <LandingHero />

        {/* 3. 5 Pasti Umroh Kemenag RI / Trust Features */}
        <TrustFeatures />

        {/* 4. Live Package Catalog with WebMCP integration */}
        <PackageCatalog
          initialPackages={dynamicPackages}
          fallbackPackages={FALLBACK_PACKAGES}
        />

        {/* 5. How It Works - 4 Steps to Baitullah */}
        <HowItWorks />

        {/* 6. Authentic Pilgrim Testimonials */}
        <TestimonialsSection />
      </main>

      {/* 7. Footer */}
      <LandingFooter />

      {/* 8. Mobile Sticky Conversion Bar */}
      <MobileStickyBar />
    </div>
  )
}
