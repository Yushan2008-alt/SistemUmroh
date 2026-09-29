'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAVIGATION_GROUPS } from '@/lib/constants'
import type { Role } from '@/types/database.types'
import { Compass, Sparkles } from 'lucide-react'

interface SidebarProps {
  userRole?: Role
  appName?: string
}

export function Sidebar({ userRole = 'super_admin', appName = 'Al-Madinah Travel' }: SidebarProps) {
  const pathname = usePathname()

  // Filter groups and items accessible by current user's role
  const visibleGroups = NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(userRole)),
  })).filter((group) => group.roles.includes(userRole) && group.items.length > 0)

  return (
    <aside className="w-64 border-r border-border bg-card hidden md:flex md:flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Compass className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-tight text-foreground tracking-tight">
              {appName}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase">
              Management Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List with Group Headers */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {visibleGroups.map((group, groupIndex) => (
          <div key={group.label || `group-${groupIndex}`} className="space-y-1">
            {group.label && (
              <div className="px-3 pt-2 pb-1 text-[11px] font-bold text-muted-foreground/80 tracking-wider uppercase">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-muted-foreground'
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>


      {/* Footer Info */}
      <div className="p-3 border-t border-border mt-auto">
        <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-emerald-900 dark:text-emerald-200 truncate">
              V1.0 Production
            </span>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 truncate">
              Direct Supabase & RLS
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
