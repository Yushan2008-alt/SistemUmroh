'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import type { Branch } from '../types'
import { deleteBranch } from '../actions'

interface BranchesTableProps {
  initialBranches: Branch[]
  currentSearch?: string
}

export function BranchesTable({ initialBranches, currentSearch = '' }: BranchesTableProps) {
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>(initialBranches)
  const [search, setSearch] = useState(currentSearch)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmBranch, setDeleteConfirmBranch] = useState<Branch | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    router.push(`/branches?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteConfirmBranch) return
    setDeletingId(deleteConfirmBranch.id)
    setErrorMessage(null)

    const result = await deleteBranch(deleteConfirmBranch.id)
    setDeletingId(null)

    if (result.success) {
      setBranches((prev) => prev.filter((b) => b.id !== deleteConfirmBranch.id))
      setDeleteConfirmBranch(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus cabang')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Kelola Cabang
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manajemen data kantor cabang dan kantor pusat operasional Umroh &amp; Haji.
          </p>
        </div>
        <Link
          href="/branches/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Cabang
        </Link>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs underline hover:no-underline font-semibold ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama cabang, kode, atau kota..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-medium transition-colors"
          >
            Cari
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                router.push('/branches')
              }}
              className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Branches Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        {branches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border/60 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Kode &amp; Nama Cabang</th>
                  <th className="px-5 py-3.5">Kota &amp; Alamat</th>
                  <th className="px-5 py-3.5">Kontak</th>
                  <th className="px-5 py-3.5">Tipe</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {branches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="hover:bg-muted/30 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/20">
                          {branch.code.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {branch.name}
                            {branch.is_head_office && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <ShieldCheck className="w-3 h-3" />
                                Pusat
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Kode: <span className="font-mono font-medium">{branch.code}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-foreground font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {branch.city || 'Indonesia'}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-[260px] mt-0.5">
                        {branch.address || '-'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {branch.phone ? (
                          <div className="text-xs text-foreground flex items-center gap-1.5 font-medium">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {branch.phone}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                        {branch.email && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Mail className="w-3 h-3" />
                            {branch.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {branch.is_head_office ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Kantor Pusat
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                          Cabang
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {branch.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/branches/${branch.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Edit Cabang"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {!branch.is_head_office && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmBranch(branch)}
                            className="p-2 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Hapus Cabang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">Belum ada cabang ditemukan</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {search
                ? `Tidak ada cabang dengan kata kunci "${search}".`
                : 'Mulai dengan menambahkan kantor cabang baru untuk sistem Anda.'}
            </p>
            <Link
              href="/branches/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Cabang Baru
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmBranch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">Hapus Cabang?</h3>
              <p className="text-sm text-muted-foreground">
                Apakah Anda yakin ingin menghapus cabang{' '}
                <strong className="text-foreground">{deleteConfirmBranch.name}</strong> (
                {deleteConfirmBranch.code})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBranch(null)}
                disabled={Boolean(deletingId)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-sm transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
