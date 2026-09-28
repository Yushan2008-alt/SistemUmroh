'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { UserProfileWithBranch } from '../types'
import { deleteUser, resetUserPassword } from '../actions'
import { ResetPasswordModal } from './ResetPasswordModal'
import { formatDate } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/constants'
import { Search, UserPlus, Edit2, KeyRound, Trash2, Users, Loader2 } from 'lucide-react'

interface UserListProps {
  initialUsers: UserProfileWithBranch[]
}

export function UserList({ initialUsers }: UserListProps) {
  const router = useRouter()
  const [users, setUsers] = useState<UserProfileWithBranch[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const [resetModalState, setResetModalState] = useState<{
    isOpen: boolean
    userName: string
    temporaryPassword: string | null
  }>({
    isOpen: false,
    userName: '',
    temporaryPassword: null,
  })

  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const name = u.name.toLowerCase()
      const email = u.email.toLowerCase()
      if (!name.includes(q) && !email.includes(q)) {
        return false
      }
    }
    return true
  })

  const handleResetPassword = async (user: UserProfileWithBranch) => {
    if (!confirm(`Reset kata sandi ${user.name}? Kata sandi sementara baru akan digenerate dan dimunculkan.`)) {
      return
    }

    setLoadingActionId(`reset-${user.id}`)
    try {
      const res = await resetUserPassword(user.id, user.name)
      if (res.success && res.temporaryPassword) {
        setResetModalState({
          isOpen: true,
          userName: user.name,
          temporaryPassword: res.temporaryPassword,
        })
      } else {
        alert(res.message)
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mereset kata sandi')
    } finally {
      setLoadingActionId(null)
    }
  }

  const handleDelete = async (user: UserProfileWithBranch) => {
    if (!confirm(`Hapus akun pengguna "${user.name}" (${user.email})? Aksi ini permanen.`)) {
      return
    }

    setLoadingActionId(`del-${user.id}`)
    try {
      const res = await deleteUser(user.id)
      if (res.success) {
        setUsers((prev) => prev.filter((item) => item.id !== user.id))
        router.refresh()
      } else {
        alert(res.message)
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pengguna')
    } finally {
      setLoadingActionId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
            Super Admin
          </span>
        )
      case 'admin':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
            Admin Cabang
          </span>
        )
      case 'agent':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            Mitra Agen
          </span>
        )
      case 'pilgrim':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            Jamaah
          </span>
        )
      case 'guide':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
            Muthawif
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
            {role}
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
              placeholder="Cari nama atau email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="all">Semua Role</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin Cabang</option>
            <option value="agent">Mitra Agen</option>
            <option value="pilgrim">Jamaah</option>
            <option value="guide">Muthawif</option>
          </select>
        </div>

        <Link
          href="/users/create"
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs inline-flex items-center justify-center gap-2 transition-colors shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Pengguna</span>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b font-semibold">
              <tr>
                <th className="px-5 py-3.5">Nama & Profil</th>
                <th className="px-4 py-3.5">Email Akun</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Cabang</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Terdaftar</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-foreground">Belum ada pengguna</p>
                      <p className="text-xs">Tambahkan akun login untuk staf, agen mitra, muthawif, atau jamaah.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{u.name}</div>
                          {u.phone && <div className="text-[11px] text-muted-foreground">{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-foreground font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                      {u.branch?.name ?? 'Pusat (Semua)'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {u.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/users/${u.id}/edit`}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleResetPassword(u)}
                          disabled={loadingActionId === `reset-${u.id}`}
                          className="px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                          title="Reset Sandi"
                        >
                          {loadingActionId === `reset-${u.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <KeyRound className="h-3 w-3" />
                          )}
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={loadingActionId === `del-${u.id}`}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                          title="Hapus"
                        >
                          {loadingActionId === `del-${u.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
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

      {/* Temporary Password Modal */}
      <ResetPasswordModal
        userName={resetModalState.userName}
        temporaryPassword={resetModalState.temporaryPassword}
        isOpen={resetModalState.isOpen}
        onClose={() =>
          setResetModalState({
            isOpen: false,
            userName: '',
            temporaryPassword: null,
          })
        }
      />
    </div>
  )
}
