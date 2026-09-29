import { getBankAccounts, getAvailableBranches } from '@/features/bank-accounts/actions'
import { BankAccountsTable } from '@/features/bank-accounts/components/BankAccountsTable'

interface PageProps {
  searchParams: Promise<{ q?: string; branch?: string }>
}

export const metadata = {
  title: 'Rekening Bank | Sistem Manajemen Umroh & Haji',
  description: 'Pengelolaan rekening bank penampung pembayaran paket umroh & haji.',
}

export default async function BankAccountsPage({ searchParams }: PageProps) {
  const { q, branch } = await searchParams
  const branchId = branch ? Number(branch) : undefined
  const [{ data: bankAccounts }, branches] = await Promise.all([
    getBankAccounts(branchId, q),
    getAvailableBranches(),
  ])

  return (
    <div className="container mx-auto py-2 sm:py-4">
      <BankAccountsTable
        initialBankAccounts={bankAccounts}
        branches={branches}
        currentSearch={q}
      />
    </div>
  )
}
