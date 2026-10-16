'use client'

import { useState, useRef } from 'react'
import {
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plane,
  Hotel,
  Calendar,
  Users,
  ShieldCheck,
  FileText,
  CreditCard,
  Upload,
  AlertTriangle,
  Loader2,
  FileCheck,
  Building,
  Info,
  BadgeCheck,
  Phone,
  User,
  HeartHandshake,
} from 'lucide-react'
import { toast } from 'sonner'
import { registerPilgrimWithSteps } from './dashboard.actions'

interface PackageRegistrationWizardModalProps {
  pkg: any
  initialPilgrim?: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PackageRegistrationWizardModal({
  pkg,
  initialPilgrim,
  isOpen,
  onClose,
  onSuccess,
}: PackageRegistrationWizardModalProps) {
  const [step, setStep] = useState<number>(1)
  const [submitting, setSubmitting] = useState(false)

  // Step 1: Room Selection
  const [roomType, setRoomType] = useState<'quad' | 'triple' | 'double'>('quad')

  // Step 2: Personal & Emergency Contact Data
  const [name, setName] = useState(initialPilgrim?.name || '')
  const [nik, setNik] = useState(initialPilgrim?.nik || '')
  const [phone, setPhone] = useState(initialPilgrim?.phone || '')
  const [address, setAddress] = useState(initialPilgrim?.address || '')
  const [emergencyName, setEmergencyName] = useState(initialPilgrim?.emergency_contact_name || '')
  const [emergencyRelation, setEmergencyRelation] = useState('Keluarga Kandung')
  const [emergencyPhone, setEmergencyPhone] = useState(initialPilgrim?.emergency_contact_phone || '')

  // Step 3: Terms & Mandatory Documents
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [passportFile, setPassportFile] = useState<File | null>(null)
  const [healthCertFile, setHealthCertFile] = useState<File | null>(null)
  const passportInputRef = useRef<HTMLInputElement>(null)
  const healthCertInputRef = useRef<HTMLInputElement>(null)

  // Step 5: Payment Scheme
  const [paymentScheme, setPaymentScheme] = useState<'dp_50' | 'full'>('dp_50')

  if (!isOpen || !pkg) return null

  // Calculate costs
  const basePrice = Number(pkg.price) || 0
  const roomSurcharge = roomType === 'triple' ? 1500000 : roomType === 'double' ? 3000000 : 0
  const totalPrice = basePrice + roomSurcharge
  const dpAmount = Math.round(totalPrice * 0.5)
  const settlementAmount = totalPrice - dpAmount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Included & Excluded lists
  const includedList = pkg.facility_included
    ? pkg.facility_included.split('\n').filter((item: string) => item.trim() !== '')
    : ['Tiket Pesawat PP', 'Akomodasi Hotel Bintang', 'Visa Umroh / Haji', 'Makan 3x Sehari', 'Handling & Perlengkapan']

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran berkas Paspor maksimal 5 MB.')
        return
      }
      setPassportFile(file)
    }
  }

  const handleHealthCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran berkas Surat Kesehatan maksimal 5 MB.')
        return
      }
      setHealthCertFile(file)
    }
  }

  const handleNextFromStep2 = () => {
    if (!name.trim()) {
      toast.error('Nama lengkap wajib diisi.')
      return
    }
    if (!nik.trim() || nik.trim().length < 16) {
      toast.error('NIK KTP wajib 16 digit.')
      return
    }
    if (!phone.trim()) {
      toast.error('Nomor WhatsApp / HP wajib diisi.')
      return
    }
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      toast.error('Nama dan kontak darurat keluarga wajib diisi.')
      return
    }
    setStep(3)
  }

  const handleNextFromStep3 = () => {
    if (!termsAccepted) {
      toast.error('Anda wajib menyetujui Syarat & Ketentuan Keberangkatan.')
      return
    }
    if (!passportFile) {
      toast.error('Berkas Paspor wajib diunggah untuk melanjutkan.')
      return
    }
    if (!healthCertFile) {
      toast.error('Berkas Surat Kesehatan / Kartu Vaksin wajib diunggah.')
      return
    }
    setStep(4)
  }

  const handleConfirmSubmit = async () => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('packageId', String(pkg.id))
      formData.append('roomType', roomType)
      formData.append('name', name.trim())
      formData.append('nik', nik.trim())
      formData.append('phone', phone.trim())
      formData.append('address', address.trim())
      formData.append('emergencyName', emergencyName.trim())
      formData.append('emergencyRelation', emergencyRelation.trim())
      formData.append('emergencyPhone', emergencyPhone.trim())
      formData.append('paymentScheme', paymentScheme)
      formData.append('termsAccepted', String(termsAccepted))

      if (passportFile) formData.append('passportFile', passportFile)
      if (healthCertFile) formData.append('healthCertFile', healthCertFile)

      const res = await registerPilgrimWithSteps(formData)
      if (res.success) {
        toast.success(res.message)
        onSuccess()
        onClose()
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      console.error('Wizard submission error:', err)
      toast.error(err.message || 'Gagal memproses pendaftaran paket.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL TOP HEADER */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Pendaftaran Terverifikasi
              </span>
              <span className="text-xs text-emerald-200">•</span>
              <span className="text-xs text-emerald-200 font-medium">Langkah {step} dari 5</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight mt-0.5 line-clamp-1">{pkg.name}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS STEPPER BAR */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border/60 shrink-0">
          <div className="grid grid-cols-5 gap-2">
            {[
              { num: 1, label: 'Paket & Kamar' },
              { num: 2, label: 'Data Diri' },
              { num: 3, label: 'S&K & Berkas' },
              { num: 4, label: 'Biaya' },
              { num: 5, label: 'Skema Bayar' },
            ].map((s) => {
              const isPassed = step > s.num
              const isCurrent = step === s.num
              return (
                <div key={s.num} className="flex flex-col items-center text-center">
                  <div
                    className={`h-1.5 w-full rounded-full mb-1.5 transition-all duration-300 ${
                      isPassed ? 'bg-emerald-600' : isCurrent ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 'bg-muted'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold truncate max-w-full ${
                      isCurrent
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : isPassed
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {s.num}. {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================================================================= */}
          {/* STEP 1: RINCIAN PAKET & PILIHAN KAMAR                             */}
          {/* ================================================================= */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Highlight Info Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Plane className="w-4 h-4 text-emerald-600" />
                    <span>Penerbangan &amp; Jadwal</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div>
                      Maskapai: <strong>{pkg.airlines?.name || 'Maskapai Internasional'}</strong> ({pkg.airlines?.code || 'PP'})
                    </div>
                    <div>
                      Keberangkatan: <strong>{formatDate(pkg.departure_date)}</strong> dari {pkg.departure_city || 'Jakarta'}
                    </div>
                    <div>
                      Durasi: <strong>{pkg.duration_days} Hari Perjalanan</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <Hotel className="w-4 h-4 text-amber-600" />
                    <span>Akomodasi Hotel Bintang</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div>
                      Makkah: <strong>{pkg.hotel_makkah?.name || 'Hotel Makkah'}</strong>
                    </div>
                    <div>
                      Madinah: <strong>{pkg.hotel_madinah?.name || 'Hotel Madinah'}</strong>
                    </div>
                    <div>
                      Sisa Kuota: <strong className="text-foreground">{pkg.quota || 45} Kursi Tersedia</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Occupancy Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Pilihan Tipe Kamar (Room Occupancy)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pilih kapasitas kamar hotel yang Anda inginkan selama berada di Tanah Suci.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Wajib Dipilih
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Quad */}
                  <label
                    onClick={() => setRoomType('quad')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      roomType === 'quad'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                        : 'border-border bg-card hover:border-emerald-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">Quad (Ber-4)</span>
                        {roomType === 'quad' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        1 Kamar diisi 4 orang jamaah. Pilihan paling hemat dan populer.
                      </p>
                    </div>
                    <div className="pt-3 mt-2 border-t border-border/60">
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                        Standar Paket (Rp 0)
                      </span>
                    </div>
                  </label>

                  {/* Triple */}
                  <label
                    onClick={() => setRoomType('triple')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      roomType === 'triple'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                        : 'border-border bg-card hover:border-emerald-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">Triple (Ber-3)</span>
                        {roomType === 'triple' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        1 Kamar diisi 3 orang jamaah. Lebih leluasa untuk rombongan keluarga kecil.
                      </p>
                    </div>
                    <div className="pt-3 mt-2 border-t border-border/60">
                      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                        +Rp 1.500.000 / pax
                      </span>
                    </div>
                  </label>

                  {/* Double */}
                  <label
                    onClick={() => setRoomType('double')}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      roomType === 'double'
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                        : 'border-border bg-card hover:border-emerald-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">Double (Ber-2)</span>
                        {roomType === 'double' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        1 Kamar khusus 2 orang (Privat Pasangan Suami-Istri).
                      </p>
                    </div>
                    <div className="pt-3 mt-2 border-t border-border/60">
                      <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300">
                        +Rp 3.000.000 / pax
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Facility Included Checklist */}
              <div className="p-4 rounded-2xl bg-card border border-border space-y-2.5">
                <span className="text-xs font-bold text-foreground block">
                  Fasilitas Termasuk dalam Paket Ini:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {includedList.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: KONFIRMASI DATA DIRI & KONTAK DARURAT                     */}
          {/* ================================================================= */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 text-xs text-sky-800 dark:text-sky-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
                <span>
                  Pastikan Nama Lengkap dan NIK sesuai dengan KTP elektronik Anda untuk proses penerbitan visa dan manifest maskapai.
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Data Diri Calon Jamaah
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Nama Lengkap (Sesuai KTP/Paspor) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Muhammad Ilham"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                      placeholder="16 Digit NIK KTP"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Alamat Lengkap Domisili
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Jalan, Kelurahan, Kecamatan, Kota"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 pt-3 border-t border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-rose-600" />
                    Kontak Darurat (Keluarga Terdekat yang Tidak Ikut)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pihak keluarga yang dapat dihubungi staf operasional saat terjadi kondisi darurat selama perjalanan ibadah.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Nama Kontak Darurat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Nama Keluarga"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Hubungan Keluarga <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    >
                      <option value="Suami / Istri">Suami / Istri</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Anak Kandung">Anak Kandung</option>
                      <option value="Saudara Kandung">Saudara Kandung</option>
                      <option value="Keluarga Lainnya">Keluarga Lainnya</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Nomor Telepon Darurat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="081987654321"
                      className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono bg-background border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: SYARAT & KETENTUAN KEBERANGKATAN + UPLOAD BERKAS WAJIB    */}
          {/* ================================================================= */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Syarat & Ketentuan Blog / Notice */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Syarat &amp; Ketentuan Keberangkatan Umroh / Haji:
                </span>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 text-xs text-muted-foreground space-y-2 max-h-36 overflow-y-auto leading-relaxed">
                  <p>
                    1. <strong>Masa Berlaku Paspor:</strong> Calon jamaah wajib memiliki paspor yang masih berlaku minimal 8 bulan terhitung dari tanggal keberangkatan dengan susunan nama minimal 2 suku kata.
                  </p>
                  <p>
                    2. <strong>Kesehatan &amp; Vaksinasi:</strong> Wajib menyertakan sertifikat vaksin meningitis yang sah atau surat keterangan bebas penyakit menular dari fasilitas kesehatan resmi.
                  </p>
                  <p>
                    3. <strong>Pembayaran &amp; Pelunasan:</strong> Pembayaran Uang Muka (DP 50%) dilakukan untuk mengunci nomor booking. Pelunasan sisa 50% wajib diselesaikan maksimal 14 hari sebelum hari keberangkatan.
                  </p>
                  <p>
                    4. <strong>Pembatalan Keberangkatan:</strong> Pembatalan sepihak setelah visa diterbitkan atau tiket maskapai issued akan dikenakan biaya administrasi sesuai ketentuan asosiasi travel haji umroh.
                  </p>
                  <p>
                    5. <strong>Bimbingan Manasik:</strong> Calon jamaah diwajibkan mengikuti seluruh sesi pembekalan bimbingan manasik ibadah yang telah dijadwalkan oleh travel.
                  </p>
                </div>

                <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-border text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-medium text-foreground select-none">
                    Saya telah membaca, memahami, dan menyetujui seluruh <strong>Syarat &amp; Ketentuan Keberangkatan</strong> di atas.
                  </span>
                </label>
              </div>

              {/* Upload Berkas Wajib (Ketat) */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Upload Dokumen Keberangkatan (Wajib Dilampirkan)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sesuai regulasi verifikasi awal, berkas scan Paspor dan Surat Kesehatan/Vaksin wajib dilampirkan sebelum pendaftaran disahkan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File 1: Paspor */}
                  <div
                    onClick={() => passportInputRef.current?.click()}
                    className={`cursor-pointer p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-2 ${
                      passportFile
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-border hover:border-emerald-400 bg-card'
                    }`}
                  >
                    <input
                      ref={passportInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handlePassportChange}
                      className="hidden"
                    />
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        passportFile
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {passportFile ? <FileCheck className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        1. Scan / Foto Paspor Asli <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {passportFile ? (
                          <strong className="text-emerald-700 dark:text-emerald-300">{passportFile.name}</strong>
                        ) : (
                          'Klik untuk pilih file JPG / PNG / PDF (Maks 5MB)'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* File 2: Surat Kesehatan / Vaksin */}
                  <div
                    onClick={() => healthCertInputRef.current?.click()}
                    className={`cursor-pointer p-4 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-2 ${
                      healthCertFile
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-border hover:border-emerald-400 bg-card'
                    }`}
                  >
                    <input
                      ref={healthCertInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleHealthCertChange}
                      className="hidden"
                    />
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        healthCertFile
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {healthCertFile ? <FileCheck className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        2. Surat Kesehatan / Kartu Vaksin <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {healthCertFile ? (
                          <strong className="text-emerald-700 dark:text-emerald-300">{healthCertFile.name}</strong>
                        ) : (
                          'Klik untuk pilih file JPG / PNG / PDF (Maks 5MB)'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {(!passportFile || !healthCertFile) && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Lengkapi kedua berkas di atas untuk mengaktifkan tombol lanjut ke rincian biaya.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: RINGKASAN BIAYA TRANSPARAN                                */}
          {/* ================================================================= */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Rincian Biaya Transparan (Tanpa Biaya Tersembunyi)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Berikut kalkulasi total pengeluaran resmi untuk paket perjalanan ibadah Anda.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-border/60">
                  <span className="text-muted-foreground">Biaya Dasar Paket ({pkg.name})</span>
                  <span className="font-bold text-foreground font-mono">{formatCurrency(basePrice)}</span>
                </div>

                <div className="flex items-center justify-between text-xs pb-3 border-b border-border/60">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground block">
                      Upgrade Tipe Kamar Hotel: <strong className="capitalize text-foreground">{roomType}</strong>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {roomType === 'quad'
                        ? 'Kamar Ber-4 (Kapasitas Standar)'
                        : roomType === 'triple'
                        ? 'Kamar Ber-3 (Surcharge +Rp 1.500.000)'
                        : 'Kamar Ber-2 (Surcharge +Rp 3.000.000)'}
                    </span>
                  </div>
                  <span className="font-bold text-foreground font-mono">
                    {roomSurcharge > 0 ? `+${formatCurrency(roomSurcharge)}` : 'Rp 0'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-2">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground block">
                      TOTAL BIAYA KESELURUHAN:
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Sudah termasuk visa, handling bagasi, dan akomodasi
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-muted-foreground">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  Jaminan Transparansi Travel
                </div>
                <p>
                  Nominal di atas adalah tarif final resmi. Pembayaran dapat dilakukan via Uang Muka (DP 50%) atau Pelunasan Penuh Langsung pada langkah berikutnya.
                </p>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 5: PEMILIHAN METODE & SKEMA PEMBAYARAN                        */}
          {/* ================================================================= */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Pilih Skema Pembayaran
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tentukan skema pembayaran awal yang paling nyaman untuk Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opsi DP 50% */}
                <label
                  onClick={() => setPaymentScheme('dp_50')}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    paymentScheme === 'dp_50'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-border bg-card hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">Uang Muka (DP 50%)</span>
                      {paymentScheme === 'dp_50' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Kunci kuota kursi resmi Anda dengan membayar 50% terlebih dahulu.
                    </p>
                    <div className="p-2.5 rounded-xl bg-background border border-border/70 text-xs space-y-1 font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tagihan DP Sekarang:</span>
                        <strong className="text-emerald-700 dark:text-emerald-300">{formatCurrency(dpAmount)}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Sisa Pelunasan:</span>
                        <span>{formatCurrency(settlementAmount)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border/60 text-[10px] text-muted-foreground">
                    Pelunasan maksimal 14 hari sebelum keberangkatan.
                  </div>
                </label>

                {/* Opsi Lunas 100% */}
                <label
                  onClick={() => setPaymentScheme('full')}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    paymentScheme === 'full'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-border bg-card hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">Langsung Lunas (100%)</span>
                      {paymentScheme === 'full' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Bayar lunas 100% langsung tanpa memikirkan sisa tagihan berikutnya.
                    </p>
                    <div className="p-2.5 rounded-xl bg-background border border-border/70 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Dibayar:</span>
                        <strong className="text-emerald-700 dark:text-emerald-300">{formatCurrency(totalPrice)}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border/60 text-[10px] text-muted-foreground">
                    Status pembayaran langsung tercatat lunas 100%.
                  </div>
                </label>
              </div>

              {/* Notice Confirmation */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <span className="font-bold block">Apa yang terjadi setelah konfirmasi?</span>
                <p>
                  Sistem akan memverifikasi pendaftaran Anda, menerbitkan invoice tagihan resmi, dan langsung menampilkan tombol <strong>Bayar (Midtrans QRIS / VA Bank)</strong> di dashboard jamaah Anda.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER CONTROLS */}
        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between shrink-0">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-border text-xs sm:text-sm font-semibold hover:bg-muted transition-colors inline-flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2 rounded-xl border border-border text-xs sm:text-sm font-medium hover:bg-muted transition-colors"
              >
                Batal
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Lanjut ke Data Diri</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleNextFromStep2}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Lanjut ke S&amp;K &amp; Berkas</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleNextFromStep3}
                disabled={!termsAccepted || !passportFile || !healthCertFile}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Lanjut ke Rincian Biaya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Pilih Skema Bayar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg transition-all inline-flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Pendaftaran...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    <span>Konfirmasi &amp; Kunci Pendaftaran</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
