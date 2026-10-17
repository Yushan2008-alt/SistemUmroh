'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Compass,
  Menu,
  Phone,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '#beranda', label: 'Beranda' },
    { href: '#katalog', label: 'Paket Pilihan' },
    { href: '#keunggulan', label: '5 Pasti Umroh' },
    { href: '#cara-daftar', label: 'Cara Daftar' },
    { href: '#testimoni', label: 'Testimoni' },
    { href: '#kontak', label: 'Kontak' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d7a64]/95 backdrop-blur-md border-b border-emerald-800/60 transition-colors">
      {/* 1. TOP ANNOUNCEMENT BAR KEMENAG RI */}
      <div className="bg-[#084a3d] text-white text-[11px] border-b border-emerald-900/50 py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-200 font-bold border border-emerald-400/30 text-[10px] shrink-0">
              <BadgeCheck className="w-3 h-3 text-emerald-300" />
              Izin Kemenag RI
            </span>
            <span className="text-emerald-100/90 text-[10px] sm:text-xs truncate">
              PPIU No. U.123/2021 • PIHK No. H.456/2022 • Akreditasi A
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[10px] sm:text-xs text-emerald-100">
            <a
              href="tel:081288889999"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
              aria-label="Telepon Hotline 24 Jam"
            >
              <Phone className="w-3 h-3 text-emerald-300" />
              <span className="hidden sm:inline">Hotline:</span>
              <strong className="font-semibold">0812-8888-9999</strong>
            </a>
            <span className="hidden md:inline text-emerald-700">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              <span>SISKOPATUH</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo matching Login Page style */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-hidden group"
          aria-label="Al-Madinah Tour & Travel Beranda"
        >
          <div className="h-10 w-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:bg-white/25 transition-colors shrink-0">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-lg font-bold tracking-tight text-white font-heading">
                Al-Madinah
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 text-white font-bold border border-white/25 tracking-wider">
                TRAVEL
              </span>
            </div>
            <span className="text-[10px] text-emerald-100/80 font-medium tracking-wide block mt-0.5">
              Penyelenggara Umroh & Haji Khusus
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold" aria-label="Navigasi Utama">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3.5 py-2 rounded-lg text-emerald-50 hover:text-white hover:bg-white/10 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/login">
            <Button
              className="rounded-lg px-4 py-2 bg-white hover:bg-emerald-50 text-[#0d7a64] font-bold text-xs gap-1.5 shadow-xs border border-white transition-colors min-h-[40px] cursor-pointer"
            >
              <span>Masuk ke Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0d7a64]" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Drawer Trigger (48x48 touch target for Lighthouse) */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <Link href="/login" className="sm:hidden">
            <Button
              size="sm"
              className="bg-white hover:bg-emerald-50 text-[#0d7a64] font-bold text-xs px-3 py-1.5 rounded-lg border border-white min-h-[40px]"
            >
              Portal
            </Button>
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-white hover:bg-white/10 transition-colors border border-white/20 cursor-pointer"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] max-w-xs bg-[#0d7a64] text-white border-l border-emerald-800 p-0 flex flex-col justify-between"
            >
              <div className="p-5 space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                      <Compass className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block">Al-Madinah</span>
                      <span className="text-[10px] text-emerald-100/80 font-semibold block">Tour & Travel</span>
                    </div>
                  </div>
                </div>

                {/* Drawer Links */}
                <nav className="flex flex-col space-y-1" aria-label="Menu Mobile">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="px-3.5 py-3 rounded-lg text-sm font-semibold text-emerald-50 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-between"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
                    </a>
                  ))}
                </nav>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-5 border-t border-white/15 bg-[#084a3d] space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-emerald-50 text-[#0d7a64] font-bold text-sm rounded-xl transition-colors shadow-xs"
                >
                  <span>Masuk ke Portal Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://wa.me/6281288889999?text=Assalamu'alaikum%20Al-Madinah%20Travel,%20saya%20ingin%20konsultasi%20paket%20Umroh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-200" />
                  <span>Chat WhatsApp 24 Jam</span>
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
