'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Handshake,
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
  Percent,
  Building2,
} from 'lucide-react'
import type { Agent } from '../types'
import { deleteAgent } from '../actions'
import { AgentModal } from './AgentModal'

interface AgentsTableProps {
  initialAgents: Agent[]
  branches: { id: number; name: string; code: string }[]
  currentSearch?: string
}

export function AgentsTable({
  initialAgents,
  branches,
  currentSearch = '',
}: AgentsTableProps) {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [search, setSearch] = useState(currentSearch)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null)
  const [deleteConfirmAgent, setDeleteConfirmAgent] = useState<Agent | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    router.push(`/agents?${params.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteConfirmAgent) return
    setDeletingId(deleteConfirmAgent.id)
    setErrorMessage(null)

    const result = await deleteAgent(deleteConfirmAgent.id)
    setDeletingId(null)

    if (result.success) {
      setAgents((prev) => prev.filter((a) => a.id !== deleteConfirmAgent.id))
      setDeleteConfirmAgent(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus mitra agen')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Handshake className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Mitra Agen Travel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manajemen database agen marketing referral, skema komisi, dan status keaktifan.
          </p>
        </div>
        <button
          onClick={() => {
            setAgentToEdit(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Mitra Agen
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-xs">
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari agen, kode, no hp..."
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
          Total: <span className="text-foreground font-bold">{agents.length}</span> agen terdaftar
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
                <th className="px-5 py-3.5">Agen &amp; Kode</th>
                <th className="px-5 py-3.5">Cabang</th>
                <th className="px-5 py-3.5">Rate Komisi</th>
                <th className="px-5 py-3.5">Kontak</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <Handshake className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Tidak ada data mitra agen ditemukan</p>
                    <p className="text-xs mt-1">Coba ubah kata kunci pencarian atau tambah mitra baru.</p>
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{agent.name}</span>
                      </div>
                      <div className="mt-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                          {agent.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        {agent.branch?.name || 'Semua Cabang'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Percent className="w-3 h-3" />
                        {agent.commission_rate}%
                      </span>
                    </td>
                    <td className="px-5 py-4 space-y-1">
                      {agent.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <a
                            href={`https://wa.me/${agent.phone.replace(/^0/, '62').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-foreground"
                          >
                            {agent.phone}
                          </a>
                        </div>
                      )}
                      {agent.email && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{agent.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {agent.is_active ? (
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
                            setAgentToEdit(agent)
                            setIsModalOpen(true)
                          }}
                          className="p-1.5 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                          title="Edit Agen"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmAgent(agent)}
                          className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Hapus Agen"
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

      {/* Agent Create/Edit Modal */}
      <AgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        agentToEdit={agentToEdit}
        branches={branches}
        onSuccess={() => {
          router.refresh()
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Mitra Agen</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-sm text-foreground">
              Apakah Anda yakin ingin menghapus mitra agen{' '}
              <span className="font-semibold text-rose-600">{deleteConfirmAgent.name}</span> (
              {deleteConfirmAgent.code})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAgent(null)}
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
