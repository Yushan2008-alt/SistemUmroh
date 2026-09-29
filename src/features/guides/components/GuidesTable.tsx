'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import type { Guide } from '../types'
import { deleteGuide } from '../actions'
import { GuideModal } from './GuideModal'

interface GuidesTableProps {
  initialGuides: Guide[]
  branches: { id: number; name: string; code: string }[]
  currentSearch?: string
}

export function GuidesTable({
  initialGuides,
  branches,
  currentSearch = '',
}: GuidesTableProps) {
  const router = useRouter()
  const [guides, setGuides] = useState<Guide[]>(initialGuides)
  const [search, setSearch] = useState(currentSearch)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [guideToEdit, setGuideToEdit] = useState<Guide | null>(null)
  const [deleteConfirmGuide, setDeleteConfirmGuide] = useState<Guide | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {guides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
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

      {/* Guide Create/Edit Modal */}
      <GuideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        guideToEdit={guideToEdit}
        branches={branches}
        onSuccess={() => {
          router.refresh()
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Data Muthawif</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-sm text-foreground">
              Apakah Anda yakin ingin menghapus data muthawif{' '}
              <span className="font-semibold text-rose-600">{deleteConfirmGuide.name}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmGuide(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors shadow-sm"
              >
                {deletingId !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
