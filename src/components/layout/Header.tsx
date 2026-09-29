'use client'

import { useState } from 'react'
import { Menu, Bell, LogOut } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { BranchFocusSwitcher } from './BranchFocusSwitcher'
import { DemoRoleSwitcher } from './DemoRoleSwitcher'
import { UserNav } from './UserNav'
import { Sidebar } from './Sidebar'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/database.types'

interface HeaderProps {
  userRole?: Role
  title?: string
  appName?: string
}

export function Header({ userRole = 'super_admin', title = 'Sistem Manajemen Travel', appName }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      window.location.href = '/login'
    }
  }

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Drawer & Title */}
      <div className="flex items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar userRole={userRole} appName={appName} />
          </SheetContent>
        </Sheet>

        <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
          {title}
        </h1>
      </div>

      {/* Right: Demo Role Switcher, Branch Focus, User Nav & Prominent Logout in Top-Right Corner */}
      <div className="flex items-center gap-2 sm:gap-3">
        <DemoRoleSwitcher currentRole={userRole} />
        {userRole === 'super_admin' && <BranchFocusSwitcher />}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
        </Button>
        <UserNav />

        {/* Tombol Keluar (Logout) Langsung di Pojok Kanan Atas */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-xs font-semibold gap-1.5 px-3 py-1.5 h-9 shrink-0 cursor-pointer shadow-sm transition-all"
          title="Keluar dari sistem dan kembali ke halaman login"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          <span className="hidden sm:inline">{loggingOut ? 'Keluar...' : 'Keluar'}</span>
        </Button>
      </div>
    </header>
  )
}

