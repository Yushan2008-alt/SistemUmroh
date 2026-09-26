import { Loader2 } from 'lucide-react'

export function LoadingSpinner({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
      <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
