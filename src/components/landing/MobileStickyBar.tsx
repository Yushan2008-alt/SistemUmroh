'use client'

import Link from 'next/link'
import { MessageCircle, LogIn, Search } from 'lucide-react'

export function MobileStickyBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2.5 md:hidden shadow-lg pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))]">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <Link
          href="#katalog"
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-3 rounded-lg bg-stone-100 text-stone-800 text-xs font-semibold hover:bg-stone-200 transition-colors border border-stone-300"
          aria-label="Lihat Katalog Paket"
        >
          <Search className="w-4 h-4 text-[#0d7a64]" />
          <span>Lihat Paket</span>
        </Link>

        <a
          href="https://wa.me/6281288889999?text=Assalamu'alaikum%20Al-Madinah%20Travel,%20saya%20ingin%20konsultasi%20paket%20Umroh%20dan%20Haji"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-3 rounded-lg bg-[#0d7a64] text-white text-xs font-semibold hover:bg-[#0b6855] transition-colors shadow-xs"
          aria-label="Konsultasi WhatsApp"
        >
          <MessageCircle className="w-4 h-4 text-emerald-100" />
          <span>WhatsApp CS</span>
        </a>

        <Link
          href="/login"
          className="inline-flex items-center justify-center h-11 w-11 rounded-lg bg-[#084a3d] text-white hover:bg-[#073d32] transition-colors shrink-0 shadow-xs"
          aria-label="Masuk ke Portal Jamaah"
        >
          <LogIn className="w-4 h-4 text-emerald-100" />
        </Link>
      </div>
    </div>
  )
}
