'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Forgot password dialog state
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null)
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null)

  // Load saved email on mount if remember me was used
  useEffect(() => {
    const savedEmail = localStorage.getItem('saved_login_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true)
    setErrorMessage(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setIsLoadingGoogle(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memulai proses autentikasi dengan Google.')
      setIsLoadingGoogle(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    // Handle remember me persistence
    if (rememberMe) {
      localStorage.setItem('saved_login_email', email)
    } else {
      localStorage.removeItem('saved_login_email')
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(
          error.message === 'Invalid login credentials'
            ? 'Email atau kata sandi yang Anda masukkan tidak sesuai.'
            : error.message
        )
        setIsLoading(false)
        return
      }

      // Login success
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi gangguan saat memproses login.')
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSendingReset(true)
    setResetErrorMessage(null)
    setResetSuccessMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
      })

      if (error) {
        setResetErrorMessage(error.message)
      } else {
        setResetSuccessMessage(
          'Tautan pemulihan kata sandi telah dikirimkan ke email Anda. Silakan periksa folder Inbox atau Spam.'
        )
      }
    } catch (err: any) {
      setResetErrorMessage(err.message || 'Gagal mengirim email reset password.')
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white dark:bg-slate-950 font-sans">
      {/* ============================================================ */}
      {/* LEFT PANEL: Deep Emerald Branding & Mosque Silhouette        */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0d7a64] relative flex-col justify-between p-12 lg:p-16 text-white overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        {/* Top Header: Logo "TU" & Title */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white font-bold text-base shadow-sm tracking-wider">
            TU
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight text-white tracking-tight">
              Travel Umroh & Haji
            </h2>
            <p className="text-xs text-emerald-100/80 font-normal">
              Sistem Manajemen Umroh & Haji
            </p>
          </div>
        </div>

        {/* Middle Content: Pill, Headline, Subtitle, Checklists */}
        <div className="relative z-10 my-auto max-w-lg space-y-6 pt-8 pb-12">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-800/40 border border-emerald-400/20 text-emerald-100 text-xs px-3.5 py-1.5 rounded-full shadow-2xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            <span>Sistem Terintegrasi Multi-Cabang</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Kelola perjalanan ibadah
            <br />
            dengan lebih tenang.
          </h1>

          {/* Description */}
          <p className="text-sm text-emerald-100/90 leading-relaxed font-normal">
            Pendaftaran jamaah, dokumen, pembayaran, manasik, manifest keberangkatan, hingga komisi
            agen — semuanya rapi dalam satu platform.
          </p>

          {/* Checklist Items */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-white stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm text-emerald-50 font-normal">
                Data jamaah & dokumen terpusat dan aman
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-white stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm text-emerald-50 font-normal">
                Pembayaran, cicilan, dan kuitansi otomatis
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-white stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm text-emerald-50 font-normal">
                Manasik, manifest, serta komisi agen real-time
              </span>
            </div>
          </div>
        </div>

        {/* Mosque Dome & Minarets SVG Illustration positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none opacity-25">
          <svg
            viewBox="0 0 700 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto text-emerald-300 fill-current"
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

        {/* Left Footer */}
        <div className="relative z-10 pt-4">
          <p className="text-xs text-emerald-100/70 font-normal">
            © 2026 Travel Umroh & Haji — Sistem Manajemen Umroh & Haji.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL: Clean Minimalist Login Form                     */}
      {/* ============================================================ */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen bg-white dark:bg-slate-950">
        {/* Mobile Header (Brand Icon & Title for <1024px screens) */}
        <div className="lg:hidden flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#0d7a64] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              TU
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 dark:text-white block leading-tight">
                Travel Umroh & Haji
              </span>
              <span className="text-[10px] text-slate-500 block">
                Sistem Manajemen Terpadu
              </span>
            </div>
          </div>
          <Link href="/" className="text-xs text-slate-500 hover:text-[#0d7a64] flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Beranda</span>
          </Link>
        </div>

        {/* Main Login Form Container */}
        <div className="my-auto max-w-sm sm:max-w-md w-full mx-auto py-8">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Selamat datang kembali
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
              Masuk menggunakan akun Anda untuk melanjutkan.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Google OAuth Login Button */}
          <div className="mb-6 space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isLoadingGoogle}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all shadow-xs hover:border-emerald-600/50 hover:shadow-emerald-500/5"
            >
              {isLoadingGoogle ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0d7a64]" />
                  <span>Menghubungkan ke Google...</span>
                </span>
              ) : (
                <>
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Masuk dengan Google</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 font-normal">
              Akun Google otomatis terdaftar dengan peran <span className="font-semibold text-emerald-600 dark:text-emerald-400">Jamaah</span>.
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-950 px-3 text-slate-400 font-medium tracking-wider text-[10px]">
                atau masuk dengan akun demo / email
              </span>
            </div>
          </div>

          {/* Quick Demo Logins Bar */}
          <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Pilih Akun Demo (Password: password)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('superadmin@example.com')
                  setPassword('password')
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-left transition-colors"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@example.com')
                  setPassword('password')
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 text-left transition-colors"
              >
                🏢 Admin Cabang
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('agent@example.com')
                  setPassword('password')
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600 text-left transition-colors"
              >
                💼 Mitra Agen
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('jamaah@example.com')
                  setPassword('password')
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 text-left transition-colors"
              >
                🕋 Jamaah Umroh
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('muthawif@example.com')
                  setPassword('password')
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-600 text-left transition-colors col-span-2 sm:col-span-1"
              >
                👳 Muthawif
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="nama@travel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-lg focus-visible:border-[#0d7a64] focus-visible:ring-[#0d7a64]/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email)
                    setIsForgotOpen(true)
                  }}
                  className="text-xs font-semibold text-[#0d7a64] hover:underline"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-11 text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-lg focus-visible:border-[#0d7a64] focus-visible:ring-[#0d7a64]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#0d7a64] focus:ring-[#0d7a64] accent-[#0d7a64] cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none"
              >
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#0d7a64] hover:bg-[#0b6855] text-white font-semibold rounded-lg text-sm transition-all shadow-xs"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </span>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>

          {/* Help Callout Card */}
          <div className="mt-8 rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 p-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              Belum punya akun? Akun jamaah, agen, dan muthawif dibuat oleh staf kantor. Silakan
              hubungi admin cabang Anda untuk mendapatkan akses.
            </p>
          </div>
        </div>

        {/* Right Footer */}
        <div className="text-center pt-6">
          <p className="text-xs text-slate-400 dark:text-slate-600 font-normal">
            © 2026 Travel Umroh & Haji
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FORGOT PASSWORD MODAL DIALOG (SUPABASE AUTH)                 */}
      {/* ============================================================ */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-[#0d7a64] mb-2">
              <KeyRound className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Lupa Password</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Masukkan alamat email akun Anda. Kami akan mengirimkan instruksi dan tautan untuk
              membuat kata sandi baru.
            </DialogDescription>
          </DialogHeader>

          {resetSuccessMessage ? (
            <div className="py-4 space-y-4 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-[#0d7a64] flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {resetSuccessMessage}
              </p>
              <Button
                onClick={() => {
                  setIsForgotOpen(false)
                  setResetSuccessMessage(null)
                }}
                className="w-full bg-[#0d7a64] hover:bg-[#0b6855] text-white text-xs h-9"
              >
                Tutup
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
              {resetErrorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">
                  {resetErrorMessage}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Akun</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="nama@travel.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotOpen(false)}
                  className="text-xs h-9"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSendingReset}
                  className="bg-[#0d7a64] hover:bg-[#0b6855] text-white text-xs h-9"
                >
                  {isSendingReset ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </span>
                  ) : (
                    'Kirim Link Reset'
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
