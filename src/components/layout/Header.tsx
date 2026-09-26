'use client'

import { useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { BranchFocusSwitcher } from './BranchFocusSwitcher'
import { UserNav } from './UserNav'
import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'
import type { Role } from '@/types/database.types'

interface HeaderProps {
  userRole?: Role
  title?: string
  appName?: string
}

export function Header({ userRole = 'super_admin', title = 'Sistem Manajemen Travel', appName }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

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

      {/* Right: Branch Focus (Super Admin) & User Nav */}
      <div className="flex items-center gap-3">
        {userRole === 'super_admin' && <BranchFocusSwitcher />}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
        </Button>
        <UserNav />
      </div>
    </header>
  )
}
