'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AnnouncementWithRelations } from '../types'
import { deleteAnnouncement } from '../actions'
import { formatDateTime } from '@/lib/utils'
import { Search, Megaphone, Plus, Edit2, Trash2, Radio, Loader2 } from 'lucide-react'

interface AnnouncementListProps {
  initialAnnouncements: AnnouncementWithRelations[]
}

export function AnnouncementList({ initialAnnouncements }: AnnouncementListProps) {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<AnnouncementWithRelations[]>(initialAnnouncements)
  const [searchQuery, setSearchQuery] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('all')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const filtered = announcements.filter((a) => {
    if (audienceFilter !== 'all' && a.audience !== audienceFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const title = a.title.toLowerCase()
      const body = a.body.toLowerCase()
      const pkg = a.package?.name?.toLowerCase() || ''
      if (!title.includes(q) && !body.includes(q) && !pkg.includes(q)) {
        return false
      }
    }
    return true
  })

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus pengumuman "${title}"?`)) return

    setDeletingId(id)
    try {
      const res = await deleteAnnouncement(id)
      if (res.success) {
        setAnnouncements((prev) => prev.filter((item) => item.id !== id))
        router.refresh()
      } else {
        alert(res.message)
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pengumuman')
    } finally {
      setDeletingId(null)
    }
  }

  const getAudienceBadge = (audience: string) => {
    switch (audience) {
      case 'all':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
            Semua Pengguna
          </span>
        )
      case 'staff':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
            Staff & Admin
          </span>
        )
      case 'agent':
      case 'agents':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            Mitra Agen
          </span>
        )
      case 'pilgrim':
      case 'pilgrims':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            Jamaah
          </span>
        )
      case 'guide':
      case 'guides':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
            Muthawif
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
            {audience}
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari judul, isi pengumuman…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Audiens</option>
            <option value="staff">Staff & Admin</option>
            <option value="agent">Mitra Agen</option>
            <option value="pilgrim">Jamaah</option>
            <option value="guide">Muthawif</option>
          </select>
        </div>

        <Link
          href="/announcements/create"
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs inline-flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Pengumuman</span>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b font-semibold">
              <tr>
                <th className="px-5 py-3.5">Judul & Terkait</th>
                <th className="px-4 py-3.5">Target Audiens</th>
                <th className="px-4 py-3.5">Cabang</th>
                <th className="px-4 py-3.5">Status Publikasi</th>
                <th className="px-4 py-3.5">Mulai Tayang</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Megaphone className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-foreground">Belum ada pengumuman</p>
                      <p className="text-xs">Buat pengumuman untuk menyampaikan informasi penting ke staf, agen, atau jamaah.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const now = new Date()
                  const isLive =
                    a.is_published &&
                    (!a.publish_at || new Date(a.publish_at) <= now) &&
                    (!a.expires_at || new Date(a.expires_at) >= now)

                  return (
                    <tr key={a.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3.5 max-w-sm">
                        <div className="font-semibold text-foreground line-clamp-1">{a.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {a.package ? `Paket: ${a.package.name}` : a.body}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getAudienceBadge(a.audience)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                        {a.branch?.name ?? 'Semua Cabang'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {a.is_published ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                              Published
                            </span>
                            {isLive && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <Radio className="h-3 w-3 animate-pulse text-emerald-500" /> Live
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                        {a.publish_at ? formatDateTime(a.publish_at) : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/announcements/${a.id}/edit`}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(a.id, a.title)}
                            disabled={deletingId === a.id}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                            title="Hapus"
                          >
                            {deletingId === a.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
