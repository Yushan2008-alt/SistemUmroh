import { formatCurrency } from '@/lib/utils'
import type { CommissionRekap } from '../types'
import { Clock, CheckCircle2, DollarSign, XCircle } from 'lucide-react'

interface CommissionStatsCardsProps {
  rekap: CommissionRekap
}

export function CommissionStatsCards({ rekap }: CommissionStatsCardsProps) {
  const cards = [
    {
      ...rekap.pending,
      icon: Clock,
      bgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
      ...rekap.approved,
      icon: CheckCircle2,
      bgClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      ...rekap.paid,
      icon: DollarSign,
      bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      ...rekap.cancelled,
      icon: XCircle,
      bgClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.status}
            className="p-5 rounded-xl border bg-card text-card-foreground shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>
              <div className={`p-2 rounded-lg ${item.bgClass}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl font-bold tracking-tight text-foreground">
                {formatCurrency(item.totalAmount)}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeClass}`}>
                  {item.totalCount} komisi
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
