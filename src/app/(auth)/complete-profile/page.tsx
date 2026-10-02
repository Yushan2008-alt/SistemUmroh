'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  User,
  Phone,
  CreditCard,
  MapPin,
  Building2,
  Calendar,
  FileText,
  HeartHandshake,
  Loader2,
  CheckCircle2,
  ArrowRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getCompleteProfileInitialData,
  completePilgrimProfile,
  type CompleteProfileInput,
} from '@/features/pilgrims/actions/completeProfile'
import { createClient } from '@/lib/supabase/client'
import type { Gender } from '@/types/database.types'

export default function CompleteProfilePage() {
  const router = useRouter()
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // User Google info
  const [googleUser, setGoogleUser] = useState<{
    id: string
    email: string
    name: string
    avatar_url: string | null
  } | null>(null)

  const [branches, setBranches] = useState<
    Array<{ id: number; name: string; code: string; city: string | null }>
  >([])

  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [nik, setNik] = useState('')
  const [birthPlace, setBirthPlace] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [address, setAddress] = useState('')
  const [branchId, setBranchId] = useState<string>('')
  const [passportNumber, setPassportNumber] = useState('')
  const [passportExpiry, setPassportExpiry] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')

  useEffect(() => {
    async function loadData() {
      setIsLoadingInitial(true)
      const res = await getCompleteProfileInitialData()

      if (res.error || !res.user) {
        // Jika belum login, redirect ke login
        router.push('/login')
        return
      }

      setGoogleUser(res.user)
      setName(res.user.name || '')
      setBranches(res.branches)

      if (res.branches.length > 0) {
        setBranchId(String(res.branches[0].id))
      }

      // Jika data jamaah sudah pernah diisi
      if (res.existingPilgrim) {
        const p = res.existingPilgrim
        if (p.name) setName(p.name)
        if (p.phone) setPhone(p.phone)
        if (p.gender) setGender(p.gender as Gender)
        if (p.nik) setNik(p.nik)
        if (p.birth_place) setBirthPlace(p.birth_place)
        if (p.birth_date) setBirthDate(p.birth_date)
        if (p.address) setAddress(p.address)
        if (p.branch_id) setBranchId(String(p.branch_id))
        if (p.passport_number) setPassportNumber(p.passport_number)
        if (p.passport_expiry) setPassportExpiry(p.passport_expiry)
        if (p.emergency_contact_name) setEmergencyContactName(p.emergency_contact_name)
        if (p.emergency_contact_phone) setEmergencyContactPhone(p.emergency_contact_phone)
      }

      setIsLoadingInitial(false)
    }

    loadData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

        // Front-end Strict Validation for all required fields
    if (!name.trim()) {
      setErrorMessage('Nama lengkap sesuai KTP wajib diisi.')
      setIsSubmitting(false)
      return
    }

    const cleanPhone = phone.trim()
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Nomor WhatsApp / Handphone wajib diisi minimal 10 digit.')
      setIsSubmitting(false)
      return
    }

    const cleanNik = nik.replace(/\D/g, '')
    if (cleanNik.length !== 16) {
      setErrorMessage('Nomor NIK KTP harus tepat 16 digit angka.')
      setIsSubmitting(false)
      return
    }

    if (!birthPlace.trim()) {
      setErrorMessage('Tempat lahir wajib diisi.')
      setIsSubmitting(false)
      return
    }

    if (!birthDate) {
      setErrorMessage('Tanggal lahir wajib diisi.')
      setIsSubmitting(false)
      return
    }

    if (!address.trim()) {
      setErrorMessage('Alamat domisili lengkap wajib diisi.')
      setIsSubmitting(false)
      return
    }

    if (!branchId) {
      setErrorMessage('Pilih salah satu kantor cabang pendaftaran.')
      setIsSubmitting(false)
      return
    }

    if (!passportNumber.trim()) {
      setErrorMessage('Nomor paspor wajib diisi.')
      setIsSubmitting(false)
      return
    }

    if (!passportExpiry) {
      setErrorMessage('Masa berlaku paspor wajib diisi.')
      setIsSubmitting(false)
      return
    }

    if (!emergencyContactName.trim()) {
      setErrorMessage('Nama kontak darurat keluarga wajib diisi.')
      setIsSubmitting(false)
      return
    }

    if (!emergencyContactPhone.trim() || emergencyContactPhone.trim().length < 10) {
      setErrorMessage('Nomor telepon kontak darurat wajib diisi minimal 10 digit.')
      setIsSubmitting(false)
      return
    }

    const payload: CompleteProfileInput = {
      name: name.trim(),
      phone: phone.trim(),
      gender,
      nik: cleanNik,
      birth_place: birthPlace.trim() || null,
      birth_date: birthDate || null,
      address: address.trim(),
      branch_id: Number(branchId),
      passport_number: passportNumber.trim() || null,
      passport_expiry: passportExpiry || null,
      emergency_contact_name: emergencyContactName.trim() || null,
      emergency_contact_phone: emergencyContactPhone.trim() || null,
    }

    const res = await completePilgrimProfile(payload)

    if (res.success) {
      // INSTANT DIRECT REDIRECT KE DASHBOARD JAMAAH
      window.location.href = '/dashboard'
    } else {
      setErrorMessage(res.error || 'Gagal menyimpan profil.')
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0d7a64] mx-auto" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Menyiapkan formulir pendaftaran jamaah...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-[#0d7a64] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                TU
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Lengkapi Profil Jamaah
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Satu langkah lagi untuk mengakses portal keberangkatan ibadah Umroh & Haji Anda.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 self-start sm:self-auto"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Ganti Akun
            </Button>
          </div>

          {/* Connected Google Account Pill */}
          {googleUser && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <div className="flex items-center gap-3">
                {googleUser.avatar_url ? (
                  <img
                    src={googleUser.avatar_url}
                    alt={googleUser.name}
                    className="h-10 w-10 rounded-full border border-emerald-300 dark:border-emerald-700 object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-[#0d7a64] text-white flex items-center justify-center font-bold text-sm">
                    {googleUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {googleUser.name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      <ShieldCheck className="h-3 w-3" />
                      Google Terverifikasi
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {googleUser.email}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                  Peran Sistem
                </span>
                <span className="text-xs font-bold text-[#0d7a64] dark:text-emerald-400">
                  🕋 Jamaah
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Comprehensive Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identitas Pribadi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <User className="h-4 w-4 text-[#0d7a64]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                1. Data Identitas Pribadi
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama Lengkap"
                  className="h-10 text-sm"
                />
              </div>

              {/* No WhatsApp / Telepon */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp / Handphone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="08123456789"
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-4 pt-1.5">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={gender === 'male'}
                      onChange={() => setGender('male')}
                      className="accent-[#0d7a64] h-4 w-4"
                    />
                    Laki-laki
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={gender === 'female'}
                      onChange={() => setGender('female')}
                      className="accent-[#0d7a64] h-4 w-4"
                    />
                    Perempuan
                  </label>
                </div>
              </div>

              {/* NIK KTP */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nomor Induk Kependudukan (NIK 16 Digit) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="320101xxxxxxxxxx"
                    className="pl-9 h-10 text-sm font-mono tracking-wider"
                  />
                </div>
              </div>

              {/* Tempat Lahir */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tempat Lahir <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Contoh: Jakarta"
                  className="h-10 text-sm"
                />
              </div>

              {/* Tanggal Lahir */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tanggal Lahir <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Alamat Domisili */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alamat Lengkap Domisili <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={2}
                  placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0d7a64]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Cabang & Paspor */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Building2 className="h-4 w-4 text-[#0d7a64]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                2. Kantor Cabang & Dokumen Paspor
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Pilihan Kantor Cabang */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kantor Cabang Terdekat <span className="text-rose-500">*</span>
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  required
                  className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0d7a64]"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city || b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nomor Paspor */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nomor Paspor <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    placeholder="Contoh: A1234567"
                    className="pl-9 h-10 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Tanggal Habis Berlaku Paspor */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Masa Berlaku Paspor <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Kontak Darurat */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <HeartHandshake className="h-4 w-4 text-[#0d7a64]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                3. Kontak Darurat Keluarga
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Kontak Darurat <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Contoh: Siti Rahma (Istri / Keluarga)"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nomor Telepon Kontak Darurat <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="081298765432"
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data yang Anda masukkan dilindungi dan digunakan untuk pengurusan berkas Kemenag & visa.
            </p>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 h-12 bg-[#0d7a64] hover:bg-[#0b6855] text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-emerald-900/10 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>Simpan</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
