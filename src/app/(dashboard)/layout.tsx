import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar userRole="super_admin" appName="Al-Madinah Travel" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header userRole="super_admin" title="Dashboard Operasional" />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
