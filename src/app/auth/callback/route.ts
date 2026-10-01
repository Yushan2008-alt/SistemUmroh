import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    let targetPath = '/dashboard'
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', origin))

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            redirectResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // 1. Cek atau inisialisasi profil pengguna
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('id, role, name, phone, branch_id')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile) {
          // Pengguna baru dari Google OAuth -> daftarkan sebagai role 'pilgrim' (Jamaah)
          const fullName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Jamaah Baru'
          const avatarUrl = user.user_metadata?.avatar_url || null

          await (supabase as any).from('profiles').insert({
            id: user.id,
            email: user.email,
            name: fullName,
            avatar_url: avatarUrl,
            role: 'pilgrim',
            is_active: true,
          })

          targetPath = '/complete-profile'
        } else if (profile.role === 'pilgrim') {
          // 2. Periksa apakah data jamaah di tabel pilgrims sudah lengkap
          const { data: pilgrim } = await (supabase as any)
            .from('pilgrims')
            .select('id, nik, phone')
            .eq('profile_id', user.id)
            .maybeSingle()

          if (!pilgrim || !pilgrim.nik || !pilgrim.phone) {
            targetPath = '/complete-profile'
          }
        }

        const finalResponse = NextResponse.redirect(new URL(targetPath, origin))
        // Salin cookies sesi Supabase ke response pengalihan final
        redirectResponse.cookies.getAll().forEach((c) => {
          finalResponse.cookies.set(c.name, c.value, c)
        })
        return finalResponse
      }
    }
  }

  // Jika tidak ada code atau terjadi error pertukaran sesi
  return NextResponse.redirect(new URL('/login?error=oauth_failed', origin))
}
