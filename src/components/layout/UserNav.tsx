'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { ROLE_LABELS } from '@/lib/constants'
import type { Role } from '@/types/database.types'

interface UserNavProps {
  user?: {
    email: string
    name: string
    role: Role
    branchName?: string
  }
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter()
  const supabase = createClient()

  const currentUser = user || {
    email: 'superadmin@travel.com',
    name: 'Ustadz H. Abdullah',
    role: 'super_admin' as Role,
    branchName: 'Kantor Pusat Jakarta',
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-center p-0 outline-none cursor-pointer hover:ring-2 hover:ring-emerald-500/30 transition-all">
        {currentUser.name.charAt(0).toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{currentUser.email}</p>
            <div className="pt-1.5 flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                {ROLE_LABELS[currentUser.role] || currentUser.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Profil Saya</span>
          </DropdownMenuItem>
          {currentUser.role === 'super_admin' && (
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Pengaturan Travel</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-rose-600 dark:text-rose-400 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar (Logout)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
