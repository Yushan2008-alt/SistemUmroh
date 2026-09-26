import { Badge } from '@/components/ui/badge'
import { STATUS_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
}

const STATUS_INDONESIAN_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Terkonfirmasi',
  cancelled: 'Dibatalkan',
  completed: 'Selesai',
  unpaid: 'Belum Lunas',
  partial: 'Dicicil (Sebagian)',
  paid: 'Lunas',
  uploaded: 'Sudah Diunggah',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
  handed_over: 'Diserahkan',
  returned: 'Dikembalikan',
  present: 'Hadir',
  sick: 'Sakit',
  excused: 'Izin',
  absent: 'Alpa',
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase()
  const color = STATUS_COLORS[normalized] || {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-border',
  }

  const displayLabel = label || STATUS_INDONESIAN_LABELS[normalized] || status

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs px-2.5 py-0.5 border shadow-2xs capitalize',
        color.bg,
        color.text,
        color.border,
        className
      )}
    >
      {displayLabel}
    </Badge>
  )
}
