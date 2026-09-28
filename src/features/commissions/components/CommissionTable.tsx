'use client'

import { useState } from 'react'
import type { CommissionWithRelations } from '../types'
import { CommissionStatusModal } from './CommissionStatusModal'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Filter, Coins, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react'

interface CommissionTableProps {
  initialCommissions: CommissionWithRelations[]
  agents: { id: number; name: string }[]
}

export function CommissionTable({ initialCommissions, agents }: CommissionTableProps) {
  const [commissions, setCommissions] = useState<CommissionWithRelations[]>(initialCommissions)
  const [statusFilter, setStatusFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedCommission, setSelectedCommission] = useState<CommissionWithRelations | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredCommissions = commissions.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (agentFilter !== 'all' && String(c.agent_id) !== agentFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const agentName = c.agent?.name?.toLowerCase() || ''
      const pilgrimName = c.registration?.pilgrim?.name?.toLowerCase() || ''
      const packageName = c.registration?.package?.name?.toLowerCase() || ''
      if (!agentName.includes(q) && !pilgrimName.includes(q) && !packageName.includes(q)) {
        return false
      }
    }
    return true
  })

  const handleOpenModal = (item: CommissionWithRelations) => {
    setSelectedCommission(item)
    setIsModalOpen(true)
  }

  const handleSuccess = () => {
    window.location.reload()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
            <CheckCircle className="h-3 w-3" /> Disetujui
          </span>
        )
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            <DollarSign className="h-3 w-3" /> Dibayar
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">
            <XCircle className="h-3 w-3" /> Dibatalkan
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
            <Clock className="h-3 w-3" /> Menunggu
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari agen, jamaah, paket…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu (Pending)</option>
              <option value="approved">Disetujui (Approved)</option>
              <option value="paid">Sudah Dibayar (Paid)</option>
              <option value="cancelled">Dibatalkan (Cancelled)</option>
            </select>

            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden max-w-[200px]"
            >
              <option value="all">Semua Agen</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
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
                <th className="px-5 py-3.5">Agen Mitra</th>
                <th className="px-4 py-3.5">Jamaah</th>
                <th className="px-4 py-3.5">Paket</th>
                <th className="px-4 py-3.5">Dasar Nominal</th>
                <th className="px-4 py-3.5">Rate</th>
                <th className="px-4 py-3.5">Nominal Komisi</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Coins className="h-10 w-10 text-muted-foreground/40 mb-2" />
                      <p className="font-semibold text-foreground">Belum ada data komisi</p>
                      <p className="text-xs">Komisi otomatis dibuat saat pendaftaran jamaah oleh agen.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((c) => {
                  const isFinal = c.status === 'paid' || c.status === 'cancelled'
                  return (
                    <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-foreground">{c.agent?.name ?? '-'}</div>
                        {c.agent?.code && (
                          <div className="text-xs text-muted-foreground font-mono">{c.agent.code}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{c.registration?.pilgrim?.name ?? '-'}</div>
                        {c.registration?.code && (
                          <div className="text-[11px] text-muted-foreground">Reg: #{c.registration.code}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-foreground max-w-[200px] truncate">
                        {c.registration?.package?.name ?? '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground">
                        {formatCurrency(c.base_amount)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-foreground">
                        {Number(c.rate).toFixed(2)}%
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(c.amount)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(c.status)}
                          {c.paid_at && (
                            <span className="text-[10px] text-muted-foreground">
                              Lunas: {formatDate(c.paid_at)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {isFinal ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground">
                            Final
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(c)}
                            className="px-3 py-1.5 rounded-lg border border-emerald-600/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold transition-colors"
                          >
                            Ubah Status…
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Modal */}
      <CommissionStatusModal
        commission={selectedCommission}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCommission(null)
        }}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
