'use client'

import { useState } from 'react'
import type { ActivityLogWithRelations } from '../types'
import { formatDateTime } from '@/lib/utils'
import { Search, History, Filter } from 'lucide-react'

interface ActivityLogTableProps {
  initialLogs: ActivityLogWithRelations[]
  actions: string[]
  users: { id: string; name: string }[]
}

export function ActivityLogTable({ initialLogs, actions, users }: ActivityLogTableProps) {
  const [logs] = useState<ActivityLogWithRelations[]>(initialLogs)
  const [actionFilter, setActionFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false
    if (userFilter !== 'all' && log.user_id !== userFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const desc = log.description?.toLowerCase() || ''
      const action = log.action.toLowerCase()
      const userName = log.user?.name?.toLowerCase() || ''
      const ip = log.ip_address?.toLowerCase() || ''
      if (!desc.includes(q) && !action.includes(q) && !userName.includes(q) && !ip.includes(q)) {
        return false
      }
    }
    return true
  })

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            created
          </span>
        )
      case 'updated':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
            updated
          </span>
        )
      case 'deleted':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">
            deleted
          </span>
        )
      case 'reset_password':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            reset_password
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
            {action}
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
              placeholder="Cari deskripsi, aksi, IP…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">Semua Aksi</option>
              {actions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>

            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden max-w-[200px]"
            >
              <option value="all">Semua Pengguna</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b font-semibold">
              <tr>
                <th className="px-5 py-3.5">Waktu</th>
                <th className="px-4 py-3.5">Pengguna</th>
                <th className="px-4 py-3.5">Aksi</th>
                <th className="px-4 py-3.5">Deskripsi Aktivitas</th>
                <th className="px-5 py-3.5 text-right">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <History className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-foreground">Belum ada riwayat aktivitas</p>
                      <p className="text-xs">Setiap operasi sistem akan tercatat di sini secara otomatis.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-medium text-foreground">
                      {log.user?.name ?? 'Sistem'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-4 py-3.5 text-foreground max-w-md">
                      <div>{log.description ?? '-'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {log.ip_address ?? '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
