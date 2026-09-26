'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Compass, Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(
          error.message === 'Invalid login credentials'
            ? 'Email atau kata sandi yang Anda masukkan salah.'
            : error.message
        )
        setIsLoading(false)
        return
      }

      // Successful login
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat masuk ke sistem.')
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/60 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Top Emerald Border Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

      <CardHeader className="text-center pt-8 pb-4">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-2 text-xs text-muted-foreground hover:text-emerald-500 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Halaman Utama</span>
        </Link>
        <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 mb-2">
          <Compass className="h-7 w-7" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          Portal Manajemen Travel
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Masuk dengan akun terdaftar untuk mengakses dashboard operasional
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-8">
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="nama@travel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9 h-10 text-sm bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Kata Sandi</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 pr-9 h-10 text-sm bg-background/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-10 mt-2 shadow-md shadow-emerald-600/20"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi...</span>
              </span>
            ) : (
              'Masuk ke Sistem'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border/60 text-center">
          <p className="text-[11px] text-muted-foreground">
            Lupa kata sandi atau butuh akses akun baru? Hubungi Staf Kantor Pusat atau Admin Cabang Anda.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
