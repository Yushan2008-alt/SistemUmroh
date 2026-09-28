'use client'

import Link from 'next/link'
import {
  Package as PackageIcon,
  ArrowLeft,
  Edit,
  Calendar,
  Building,
  Plane,
  Users,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'

interface PackageDetailViewProps {
  pkg: any
}

export function PackageDetailView({ pkg }: PackageDetailViewProps) {
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

  const includedList = pkg.facility_included
    ? pkg.facility_included.split('\n').filter((item: string) => item.trim() !== '')
    : []

  const excludedList = pkg.facility_excluded
    ? pkg.facility_excluded.split('\n').filter((item: string) => item.trim() !== '')
    : []

  const registrations = pkg.registrations || []

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/packages"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                {pkg.type}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{pkg.duration_days} Hari Perjalanan</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {pkg.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/packages/${pkg.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-sm font-medium transition-colors"
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
            Edit Paket
          </Link>
          <Link
            href={`/registrations/create?package_id=${pkg.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-medium transition-all shadow-md"
          >
            <UserCheck className="w-4 h-4" />
            Daftarkan Jamaah
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Harga Paket</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-foreground">{formatCurrency(pkg.price)}</div>
          <p className="text-xs text-muted-foreground">Per jamaah (all-in)</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Sisa Kuota</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {pkg.remaining_quota ?? pkg.quota} Kursi
          </div>
          <p className="text-xs text-muted-foreground">Dari total kuota {pkg.quota} jamaah</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Keberangkatan</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm font-bold text-foreground">{formatDate(pkg.departure_date)}</div>
          <p className="text-xs text-muted-foreground">Pulang: {formatDate(pkg.return_date)}</p>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Status &amp; Cabang</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-foreground capitalize">{pkg.status}</div>
          <p className="text-xs text-muted-foreground">{pkg.branches?.name || 'Kantor Pusat'}</p>
        </div>
      </div>

      {/* Akomodasi & Transportasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hotel Mekah */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <Building className="w-4 h-4" />
            <span>Hotel Makkah</span>
          </div>
          {pkg.hotel_makkah ? (
            <div>
              <div className="font-bold text-foreground">{pkg.hotel_makkah.name}</div>
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <div>Bintang: {'★'.repeat(pkg.hotel_makkah.star_rating || 4)}</div>
                <div>Jarak: ±{pkg.hotel_makkah.distance_to_masjid || 150}m ke Masjidil Haram</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Belum ditetapkan</p>
          )}
        </div>

        {/* Hotel Madinah */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-sm">
            <Building className="w-4 h-4" />
            <span>Hotel Madinah</span>
          </div>
          {pkg.hotel_madinah ? (
            <div>
              <div className="font-bold text-foreground">{pkg.hotel_madinah.name}</div>
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <div>Bintang: {'★'.repeat(pkg.hotel_madinah.star_rating || 4)}</div>
                <div>Jarak: ±{pkg.hotel_madinah.distance_to_masjid || 100}m ke Masjid Nabawi</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Belum ditetapkan</p>
          )}
        </div>

        {/* Maskapai */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
            <Plane className="w-4 h-4" />
            <span>Penerbangan</span>
          </div>
          {pkg.airlines ? (
            <div>
              <div className="font-bold text-foreground">{pkg.airlines.name}</div>
              <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                <div>Kode: {pkg.airlines.code}</div>
                <div>Rute: {pkg.departure_city || 'Jakarta'} - Jeddah ({pkg.airlines.transit || 'Direct'})</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Belum ditetapkan</p>
          )}
        </div>
      </div>

      {/* Facilities Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Included */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Fasilitas Termasuk (Included)</span>
          </div>
          {includedList.length > 0 ? (
            <ul className="space-y-2 text-xs text-foreground">
              {includedList.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">-</p>
          )}
        </div>

        {/* Excluded */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <XCircle className="w-4 h-4" />
            <span>Fasilitas Tidak Termasuk (Excluded)</span>
          </div>
          {excludedList.length > 0 ? (
            <ul className="space-y-2 text-xs text-foreground">
              {excludedList.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <XCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">-</p>
          )}
        </div>
      </div>

      {/* Registered Pilgrims Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              Jamaah Terdaftar ({registrations.length})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftar jamaah yang telah memesan kursi pada paket keberangkatan ini.
            </p>
          </div>
          <Link
            href={`/registrations/create?package_id=${pkg.id}`}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Daftarkan Jamaah
          </Link>
        </div>

        {registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Nama Jamaah</th>
                  <th className="px-5 py-3">Gender</th>
                  <th className="px-5 py-3">Kontak / Paspor</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {registrations.map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {reg.pilgrims?.name || '-'}
                      <div className="text-xs text-muted-foreground font-mono">{reg.code}</div>
                    </td>
                    <td className="px-5 py-3.5 capitalize text-xs text-muted-foreground">
                      {reg.pilgrims?.gender || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-foreground">
                      <div>{reg.pilgrims?.phone || '-'}</div>
                      <div className="text-muted-foreground">{reg.pilgrims?.passport_number || '-'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize">
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
            Belum ada jamaah yang terdaftar dalam paket ini.
          </div>
        )}
      </div>
    </div>
  )
}
