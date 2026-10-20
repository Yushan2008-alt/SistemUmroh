'use client'

import { useRef } from 'react'
import {
  X,
  Printer,
  ShieldCheck,
  User,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  Building2,
  HeartPulse,
} from 'lucide-react'
import type { RegistrationListItem } from './types'

interface PilgrimCardModalProps {
  registration: RegistrationListItem | null
  isOpen: boolean
  onClose: () => void
}

export function PilgrimCardModal({ registration, isOpen, onClose }: PilgrimCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  if (!isOpen || !registration) return null

  const handlePrint = () => {
    window.print()
  }

  const pilgrim = registration.pilgrims
  const pkg = registration.packages
  const branch = registration.branches

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl w-full max-w-xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Toolbar */}
        <div className="px-6 py-3.5 border-b border-border flex items-center justify-between bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">
              Pratinjau Kartu Tanda Pengenal Jamaah
            </h3>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              {registration.code}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak Kartu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="p-6 overflow-y-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950/50">
          {/* Printable Card */}
          <div
            id="pilgrim-card-printable"
            ref={cardRef}
            className="w-full max-w-[340px] bg-white text-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 select-none print:shadow-none print:border-none print:m-0"
          >
            {/* Card Header (Islamic Emerald & Gold) */}
            <div className="bg-gradient-to-br from-[#022318] via-[#064e3b] to-[#042f24] text-white p-5 text-center relative border-b-2 border-amber-500/80">
              <div className="absolute top-2 right-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500 text-slate-950 rounded-full font-mono">
                  {pkg?.type?.toUpperCase() || 'UMROH'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto mb-2 text-amber-300">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                Sistem Travel Umroh &amp; Haji
              </div>
              <h2 className="text-sm font-extrabold tracking-wide uppercase mt-0.5 text-white">
                {branch?.name || 'Kantor Pusat'}
              </h2>
              <div className="text-[9px] text-emerald-200 mt-1 uppercase tracking-widest border-t border-emerald-700/60 pt-1">
                Kartu Tanda Pengenal Jamaah / Pilgrim Pass
              </div>
            </div>

            {/* Photo & Identity Section */}
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-24 rounded-2xl bg-slate-100 border-2 border-emerald-600/40 flex flex-col items-center justify-center text-slate-400 mb-2 shadow-inner relative overflow-hidden">
                  <User className="w-10 h-10 text-emerald-700/60" />
                  <span className="text-[9px] font-semibold text-emerald-800 uppercase mt-1">
                    {pilgrim?.gender === 'female' ? 'Muslimah' : 'Muslim'}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug uppercase">
                  {pilgrim?.name}
                </h3>
                <div className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1">
                  {registration.code}
                </div>
              </div>

              {/* Identity Details Grid */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">No. Paspor</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {pilgrim?.passport_number || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Masa Berlaku Paspor</span>
                  <span className="font-medium text-slate-800">
                    {formatDate(pilgrim?.passport_expiry)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">NIK Jamaah</span>
                  <span className="font-mono text-slate-700">{pilgrim?.nik || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Paket Ibadah</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[170px]" title={pkg?.name}>
                    {pkg?.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500 font-medium">Keberangkatan</span>
                  <span className="font-bold text-emerald-700">
                    {formatDate(pkg?.departure_date)}
                  </span>
                </div>
              </div>

              {/* Emergency Contact Box */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-700" />
                  Kontak Darurat Keluarga
                </div>
                <div className="font-semibold text-slate-900">
                  {pilgrim?.emergency_contact_name || 'Keluarga Jamaah'}
                </div>
                <div className="font-mono text-slate-700 text-xs">
                  {pilgrim?.emergency_contact_phone || pilgrim?.phone || '-'}
                </div>
              </div>

              {/* Barcode / Scan Placeholder */}
              <div className="pt-2 text-center border-t border-slate-200/60">
                <div className="font-mono text-[9px] tracking-widest text-slate-400 uppercase">
                  VERIFIED PILGRIM PASS · TRAVEL MANAGEMENT
                </div>
                {/* Visual Barcode bars */}
                <div className="flex items-center justify-center gap-[2px] h-6 mt-1 opacity-70">
                  {[4, 2, 5, 1, 3, 6, 2, 4, 1, 5, 3, 2, 6, 4, 1, 3, 5, 2, 4, 6, 1, 3].map((h, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 w-[2.5px] rounded-xs"
                      style={{ height: `${h * 3.5}px` }}
                    />
                  ))}
                </div>
                <div className="text-[8px] font-mono text-slate-400 mt-1">
                  HARAP GANTUNGKAN KARTU INI SELAMA KEGIATAN IBADAH
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
