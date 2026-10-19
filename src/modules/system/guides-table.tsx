'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Building2,
  GraduationCap,
  KeyRound,
  ShieldCheck,
  CalendarDays,
  Users,
  ArrowRight,
} from 'lucide-react'
import type { Guide } from './types'
import { deleteGuide } from './guides.actions'
import { GuideModal } from './guide-modal'

interface GuidesTableProps {
  initialGuides: Guide[]
  branches: { id: number; name: string; code: string }[]
  currentSearch?: string
  userRole?: string
}

export function GuidesTable({
  initialGuides,
  branches,
  currentSearch = '',
  userRole = 'super_admin',
}: GuidesTableProps) {
  const router = useRouter()
  const [guides, setGuides] = useState<Guide[]>(initialGuides)
  const [search, setSearch] = useState(currentSearch)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [guideToEdit, setGuideToEdit] = useState<Guide | null>(null)
  const [deleteConfirmGuide, setDeleteConfirmGuide] = useState<Guide | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isGuideUser = userRole === 'guide'

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    router.push(`/guides?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteConfirmGuide) return
    setDeletingId(deleteConfirmGuide.id)
    setErrorMessage(null)

    const result = await deleteGuide(deleteConfirmGuide.id)
    setDeletingId(null)

    if (result.success) {
      setGuides((prev) => prev.filter((g) => g.id !== deleteConfirmGuide.id))
      setDeleteConfirmGuide(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus muthawif')
    }
  }

  // =========================================================================
  // VIEW KHUSUS: GUIDE VIEW ONLY (PROFIL SAYA)
  // =========================================================================
  if (isGuideUser) {
    const myGuide = guides[0]

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Profil Muthawif Pembimbing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Informasi profil bimbingan ibadah, kontak, dan penugasan manasik resmi Anda.
          </p>
        </div>

        {myGuide ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Profile Card */}
            <div className="md:col-span-2 rounded-2xl bg-card border border-border shadow-xs p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-3xl font-bold shrink-0 border border-emerald-200 dark:border-emerald-800">
                  👳
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Muthawif Kemenag RI Bersertifikat
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{myGuide.name}</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Penugasan: {myGuide.branch?.name || 'Seluruh Kantor Cabang'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-muted-foreground font-medium block">Nomor WhatsApp / HP</span>
                  <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>{myGuide.phone || '-'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-muted-foreground font-medium block">Alamat Email Login</span>
                  <div className="flex items-center gap-2 font-semibold text-foreground text-sm truncate">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{myGuide.email || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Kewenangan &amp; Kode Etik Pembimbing
                </h4>
                <ul className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1 list-disc list-inside">
                  <li>Memimpin bimbingan manasik teori dan praktik untuk rombongan yang ditugaskan.</li>
                  <li>Melakukan pencatatan presensi kehadiran jamaah secara tertib pada setiap sesi.</li>
                  <li>Mendampingi pelaksanaan ibadah umroh/haji dengan penuh amanah dan kesabaran.</li>
                </ul>
              </div>
            </div>

            {/* Quick Action Side Card */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-card border border-border shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-bold text-foreground">Menu Terkait Bimbingan</h3>

                <Link
                  href="/manasik"
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all text-xs font-semibold group"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="w-4 h-4 text-emerald-600" />
                    <span>Jadwal Manasik &amp; Absensi</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/pilgrims"
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all text-xs font-semibold group"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>Jamaah Bimbingan Saya</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="rounded-2xl bg-muted/40 border border-border p-4 text-xs text-muted-foreground">
                <p>
                  Perubahan data profil muthawif (nama, nomor telepon, atau mutasi cabang) dikelola langsung oleh
                  manajemen staf kantor cabang Anda.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-600" />
            <h3 className="text-base font-bold text-foreground">Data Profil Belum Terhubung</h3>
            <p className="text-xs mt-1 max-w-md mx-auto">
              Akun Anda belum ditautkan ke data master muthawif. Silakan hubungi admin cabang untuk menghubungkan profil pembimbing Anda.
            </p>
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // VIEW STAFF (ADMIN / SUPER ADMIN): FULL CRUD & PROVISIONING
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Muthawif &amp; Pembimbing Ibadah
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Database pembimbing ibadah umroh &amp; haji, ustadz pemateri manasik, dan muthawif tanah suci.
          </p>
        </div>
        <button
          onClick={() => {
            setGuideToEdit(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Muthawif
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-xs">
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama muthawif, email, no hp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium rounded-xl transition-colors shrink-0"
          >
            Cari
          </button>
        </form>

        <div className="text-xs text-muted-foreground font-medium">
          Total: <span className="text-foreground font-bold">{guides.length}</span> muthawif terdaftar
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs underline ml-2">
            Tutup
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3.5">Nama Muthawif</th>
                <th className="px-5 py-3.5">Cabang</th>
                <th className="px-5 py-3.5">Kontak</th>
                <th className="px-5 py-3.5">Akun Portal</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {guides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Tidak ada data muthawif ditemukan</p>
                    <p className="text-xs mt-1">Coba ubah kata kunci pencarian atau tambah muthawif baru.</p>
                  </td>
                </tr>
              ) : (
                guides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                          👳
                        </div>
                        <span>{guide.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        {guide.branch?.name || 'Semua Cabang'}
                      </span>
                    </td>
                    <td className="px-5 py-4 space-y-1">
                      {guide.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <a
                            href={`https://wa.me/${guide.phone.replace(/^0/, '62').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-foreground"
                          >
                            {guide.phone}
                          </a>
                        </div>
                      )}
                      {guide.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{guide.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {guide.profile_id ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <KeyRound className="w-3 h-3 text-emerald-600" />
                          Akun Terhubung
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                          Tanpa Akun
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {guide.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <XCircle className="w-3.5 h-3.5" />
                          Non-aktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setGuideToEdit(guide)
                            setIsModalOpen(true)
                          }}
                          className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                          title="Edit Muthawif"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmGuide(guide)}
                          className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Hapus Muthawif"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <GuideModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setGuideToEdit(null)
        }}
        onSuccess={() => {
          router.refresh()
        }}
        guideToEdit={guideToEdit}
        branches={branches}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/50">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Konfirmasi Hapus</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-sm text-foreground">
              Apakah Anda yakin ingin menghapus data muthawif{' '}
              <strong className="text-foreground">{deleteConfirmGuide.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmGuide(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
              >
                {deletingId !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
