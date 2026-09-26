import { ReactNode } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: any
  children?: ReactNode
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-border bg-card/50">
      <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-xs">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  )
}
