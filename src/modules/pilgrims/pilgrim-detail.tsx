'use client'

import Link from 'next/link'
import {
  Users,
  ArrowLeft,
  Edit,
  Phone,
  MessageCircle,
  FileText,
  Calendar,
  Building2,
  Package,
  HeartPulse,
  CreditCard,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'

interface PilgrimDetailViewProps {
  pilgrim: any
}

export function PilgrimDetailView({ pilgrim }: PilgrimDetailViewProps) {
  const getWhatsAppLink = (phone: string, name: string) => {
    let clean = phone.replace(/[^0-9]/g, '')
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1)
    }
    const message = encodeURIComponent(`Assalamu'alaikum Wr. Wb. Bpk/Ibu ${name}...`)
    return `https://wa.me/${clean}?text=${message}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const registrations = pilgrim.registrations || []
  const documents = pilgrim.documents || []

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/pilgrims"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                {pilgrim.code || 'JAMAAH'}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground capitalize">{pilgrim.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {pilgrim.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {pilgrim.phone && (
            <a
              href={getWhatsAppLink(pilgrim.phone, pilgrim.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat WhatsApp
            </a>
          )}
          <Link
            href={`/pilgrims/${pilgrim.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
            Edit Profil
          </Link>
          <Link
            href={`/registrations/create?pilgrim_id=${pilgrim.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-medium transition-all shadow-md"
          >
            <UserCheck className="w-4 h-4" />
            Daftar Paket Baru
          </Link>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Details */}
        <div className="md:col-span-2 bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Informasi Data Pribadi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Nomor Induk Kependudukan (NIK)</span>
              <span className="font-mono font-semibold text-foreground">{pilgrim.nik}</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Tempat, Tanggal Lahir</span>
              <span className="font-medium text-foreground">
                {pilgrim.birth_place || '-'}, {formatDate(pilgrim.birth_date)}
              </span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Telepon / WhatsApp</span>
              <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                {pilgrim.phone}
              </span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Email</span>
              <span className="font-medium text-foreground">
                {pilgrim.profiles?.email || '-'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground block">Alamat Domisili</span>
              <span className="font-medium text-foreground">{pilgrim.address || '-'}</span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Cabang Pendaftaran</span>
              <span className="font-medium text-foreground">
                {pilgrim.branches?.name || 'Kantor Pusat'}
              </span>
            </div>

            <div>
              <span className="text-xs text-muted-foreground block">Agen Referral</span>
              <span className="font-medium text-foreground">
                {pilgrim.agents?.name || 'Pendaftaran Langsung'}
              </span>
            </div>
          </div>
        </div>

        {/* Paspor & Darurat Card */}
        <div className="space-y-6">
          {/* Paspor */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-foreground font-semibold text-sm">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <FileText className="w-4 h-4" />
                <span>Paspor RI</span>
              </div>
              <span className="text-xs font-mono font-bold text-foreground">
                {pilgrim.passport_number || 'Belum Ada'}
              </span>
            </div>
            <div className="text-xs space-y-1 text-muted-foreground pt-1 border-t border-border/60">
              <div>Berlaku s/d: <strong className="text-foreground">{formatDate(pilgrim.passport_expiry)}</strong></div>
            </div>
          </div>

          {/* Mahram & Darurat */}
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-sm">
              <HeartPulse className="w-4 h-4" />
              <span>Mahram &amp; Darurat</span>
            </div>
            <div className="text-xs space-y-2 pt-1 border-t border-border/60">
              <div>
                <span className="text-muted-foreground block">Hubungan Mahram:</span>
                <span className="font-medium text-foreground">{pilgrim.mahram_status || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Kontak Darurat:</span>
                <span className="font-medium text-foreground">{pilgrim.emergency_contact_name || '-'} ({pilgrim.emergency_contact_phone || '-'})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Pendaftaran Paket */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Riwayat Pendaftaran Paket ({registrations.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Jejak keikutsertaan paket perjalanan Umroh atau Haji oleh jamaah ini.
            </p>
          </div>
          <Link
            href={`/registrations/create?pilgrim_id=${pilgrim.id}`}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Daftarkan ke Paket
          </Link>
        </div>

        {registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Kode Booking</th>
                  <th className="px-5 py-3">Paket Perjalanan</th>
                  <th className="px-5 py-3">Jadwal Berangkat</th>
                  <th className="px-5 py-3">Total Biaya</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {registrations.map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-foreground">
                      {reg.code}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {reg.packages?.name || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {formatDate(reg.packages?.departure_date)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-foreground text-xs">
                      {formatCurrency(reg.total_price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize">
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/registrations/${reg.id}`}
                        className="text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        Detail Registrasi
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Jamaah ini belum memiliki riwayat pendaftaran paket.
          </div>
        )}
      </div>

      {/* Dokumen & Checklist Terupload */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Kelengkapan Dokumen ({documents.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Checklist dokumen paspor, KTP, dan surat kesehatan jamaah.
            </p>
          </div>
          <Link
            href={`/documents/pilgrim/${pilgrim.id}`}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Buka Vault Dokumen
          </Link>
        </div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-5">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-border/70 bg-background flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-foreground capitalize">
                    {doc.type.replace('_', ' ')}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[150px]">
                    {doc.file_name || 'File terupload'}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Belum ada berkas dokumen yang diunggah untuk jamaah ini.
          </div>
        )}
      </div>
    </div>
  )
}
