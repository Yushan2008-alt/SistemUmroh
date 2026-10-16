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
  X,
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
    { href: '#langkah', label: 'Cara Daftar' },
    { href: '#testimoni', label: 'Testimoni' },
    { href: '#kontak', label: 'Kontak' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-[#022318]/95 backdrop-blur-md border-b border-emerald-900/60 transition-colors">
      {/* 1. TOP ANNOUNCEMENT BAR KEMENAG RI */}
      <div className="bg-[#011710] text-white text-[11px] border-b border-emerald-950 py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-amber-300 font-bold border border-amber-400/30 text-[10px] shrink-0">
              <BadgeCheck className="w-3 h-3 text-amber-400" />
              Izin Kemenag RI
            </span>
            <span className="text-emerald-200/90 text-[10px] sm:text-xs truncate">
              PPIU No. U.123/2021 • PIHK No. H.456/2022 • Akreditasi A
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-[10px] sm:text-xs text-emerald-200">
            <a
              href="tel:081288889999"
              className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors"
              aria-label="Telepon Hotline 24 Jam"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Hotline:</span>
              <strong className="font-semibold">0812-8888-9999</strong>
            </a>
            <span className="hidden md:inline text-emerald-800">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>SISKOPATUH</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 focus:outline-hidden group"
          aria-label="Al-Madinah Tour & Travel Beranda"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-[#043324] border border-amber-400/40 p-1.5 flex items-center justify-center text-amber-300 shadow-xs group-hover:border-amber-400 transition-colors shrink-0">
            <Compass className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-lg font-bold tracking-tight text-white font-heading">
                Al-Madinah
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold tracking-wider">
                TRAVEL
              </span>
            </div>
            <span className="text-[10px] text-emerald-200/80 font-medium tracking-wide block mt-0.5">
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
              className="px-3.5 py-2 rounded-lg text-emerald-100 hover:text-amber-300 hover:bg-emerald-900/40 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link href="/login">
            <Button
              className="rounded-lg px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs gap-1.5 shadow-xs border border-amber-300 transition-colors min-h-[40px] cursor-pointer"
            >
              <span>Masuk ke Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Drawer Trigger (48x48 touch target for Lighthouse) */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <Link href="/login" className="sm:hidden">
            <Button
              size="sm"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg border border-amber-300 min-h-[40px]"
            >
              Portal
            </Button>
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              className="w-11 h-11 inline-flex items-center justify-center rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-900/60 transition-colors border border-emerald-800/80 cursor-pointer"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] max-w-xs bg-[#022318] text-white border-l border-emerald-900 p-0 flex flex-col justify-between"
            >
              <div className="p-5 space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-emerald-900/80 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-700/80 p-1.5 flex items-center justify-center text-amber-300">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block">Al-Madinah</span>
                      <span className="text-[10px] text-amber-300 font-semibold block">Tour & Travel</span>
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
                      className="px-3.5 py-3 rounded-lg text-sm font-semibold text-emerald-100 hover:bg-emerald-900/60 hover:text-amber-300 transition-colors flex items-center justify-between"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  ))}
                </nav>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-5 border-t border-emerald-900/80 bg-[#011710] space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-xs"
                >
                  <span>Masuk ke Portal Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="https://wa.me/6281288889999?text=Assalamu'alaikum%20Al-Madinah%20Travel,%20saya%20ingin%20konsultasi%20paket%20Umroh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl border border-emerald-600/50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-300" />
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
