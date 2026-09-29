'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Landmark,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  CreditCard,
  Building2,
} from 'lucide-react'
import type { BankAccount } from '../types'
import { deleteBankAccount } from '../actions'
import { BankAccountModal } from './BankAccountModal'

interface BankAccountsTableProps {
  initialBankAccounts: BankAccount[]
  branches: { id: number; name: string; code: string }[]
  currentSearch?: string
}

export function BankAccountsTable({
  initialBankAccounts,
  branches,
  currentSearch = '',
}: BankAccountsTableProps) {
  const router = useRouter()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts)
  const [search, setSearch] = useState(currentSearch)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null)
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<BankAccount | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    router.push(`/bank-accounts?${params.toString()}`)
  }

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async () => {
    if (!deleteConfirmAccount) return
    setDeletingId(deleteConfirmAccount.id)
    setErrorMessage(null)

    const result = await deleteBankAccount(deleteConfirmAccount.id)
    setDeletingId(null)

    if (result.success) {
      setBankAccounts((prev) => prev.filter((b) => b.id !== deleteConfirmAccount.id))
      setDeleteConfirmAccount(null)
      router.refresh()
    } else {
      setErrorMessage(result.error || 'Gagal menghapus rekening bank')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Landmark className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Rekening Bank Penampung
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daftar rekening bank resmi untuk setoran pendaftaran, cicilan, dan pelunasan paket jamaah.
          </p>
        </div>
        <button
          onClick={() => {
            setAccountToEdit(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Rekening
        </button>
      </div>

      {/* Cards Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bankAccounts.map((account) => (
          <div
            key={account.id}
            className="p-5 rounded-2xl bg-gradient-to-br from-card to-muted/40 border border-border shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{account.bank_name}</h3>
                  <p className="text-xs text-muted-foreground">{account.branch_office || 'Kantor Pusat'}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  account.is_active
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {account.is_active ? 'Aktif' : 'Non-aktif'}
              </span>
            </div>

            <div className="my-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Nomor Rekening</span>
                <button
                  onClick={() => handleCopy(account.id, account.account_number)}
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {copiedId === account.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Salin
                    </>
                  )}
                </button>
              </div>
              <div className="text-lg font-mono font-bold text-foreground tracking-wider">
                {account.account_number}
              </div>
              <div className="text-xs text-muted-foreground pt-1 truncate">
                a.n. <span className="font-medium text-foreground">{account.account_holder}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                <span>{account.branch?.name || 'Semua Cabang'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setAccountToEdit(account)
                    setIsModalOpen(true)
                  }}
                  className="p-1 text-muted-foreground hover:text-emerald-600 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmAccount(account)}
                  className="p-1 text-muted-foreground hover:text-rose-600 transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bank Account Modal */}
      <BankAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accountToEdit={accountToEdit}
        branches={branches}
        onSuccess={() => {
          router.refresh()
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Rekening Bank</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-sm text-foreground">
              Apakah Anda yakin ingin menghapus rekening{' '}
              <span className="font-semibold text-rose-600">{deleteConfirmAccount.bank_name}</span> (
              {deleteConfirmAccount.account_number})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
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
