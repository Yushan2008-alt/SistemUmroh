import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn('flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6', className)}>
      {children}
    </main>
  )
}
