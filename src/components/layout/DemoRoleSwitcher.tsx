'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldAlert,
  Building2,
  Handshake,
  UserCheck,
  BookOpen,
  ChevronsUpDown,
  Check,
  Loader2,
  Sparkles,
  LogOut,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types/database.types'

interface DemoRoleOption {
  role: Role
  label: string
  name: string
  email: string
  icon: any
  badgeColor: string
  desc: string
}

const DEMO_ROLES: DemoRoleOption[] = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    name: 'Super Admin Pusat',
    email: 'superadmin@example.com',
    icon: ShieldAlert,
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    desc: 'Akses penuh seluruh cabang, white-label, master data',
  },
  {
    role: 'admin',
    label: 'Admin Cabang',
    name: 'Admin Cabang Jakarta',
    email: 'admin@example.com',
    icon: Building2,
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    desc: 'Operasional cabang Jakarta, pendaftaran, manifest',
  },
  {
    role: 'agent',
    label: 'Mitra Agen',
    name: 'Hasan Basri',
    email: 'agent@example.com',
    icon: Handshake,
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    desc: 'Jamaah referral & pemantauan saldo komisi agen',
  },
  {
    role: 'pilgrim',
    label: 'Jamaah Umroh',
    name: 'Ahmad Fauzi',
    email: 'jamaah@example.com',
    icon: UserCheck,
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    desc: 'Status pendaftaran, berkas dokumen, tagihan bayar',
  },
  {
    role: 'guide',
    label: 'Muthawif / Guide',
    name: 'Ustadz Abdullah',
    email: 'muthawif@example.com',
    icon: BookOpen,
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    desc: 'Bimbingan jamaah & presensi kehadiran manasik',
  },
]

interface DemoRoleSwitcherProps {
  currentRole?: Role
}

export function DemoRoleSwitcher({ currentRole = 'super_admin' }: DemoRoleSwitcherProps) {
  const router = useRouter()
  const [switching, setSwitching] = useState<Role | null>(null)
  const supabase = createClient()

  const activeOption = DEMO_ROLES.find((r) => r.role === currentRole) || DEMO_ROLES[0]
  const ActiveIcon = activeOption.icon

  const handleSwitchRole = async (target: DemoRoleOption) => {
    if (target.role === currentRole) return
    setSwitching(target.role)

    try {
      // Sign in as the demo user with standard password
      const { error } = await supabase.auth.signInWithPassword({
        email: target.email,
        password: 'password',
      })

      if (error) {
        console.error('Error switching demo role:', error.message)
        alert('Gagal beralih peran: ' + error.message)
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Unexpected switch error:', err)
    } finally {
      setSwitching(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100/70 transition-colors text-xs font-semibold outline-none cursor-pointer">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="hidden sm:inline text-muted-foreground font-normal">Peran Demo:</span>
        <span className="font-bold flex items-center gap-1.5">
          <ActiveIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          {activeOption.label}
        </span>
        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72 p-1.5" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Ganti Peran Demo (1-Click)
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {DEMO_ROLES.map((item) => {
            const ItemIcon = item.icon
            const isSelected = item.role === currentRole
            const isThisSwitching = switching === item.role

            return (
              <DropdownMenuItem
                key={item.role}
                onClick={() => handleSwitchRole(item)}
                disabled={switching !== null}
                className="flex items-start gap-2.5 p-2 rounded-lg cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/50"
              >
                <div className="p-1.5 rounded-md bg-muted text-foreground shrink-0 mt-0.5">
                  {isThisSwitching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <ItemIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground truncate">{item.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5 line-clamp-1">{item.desc}</p>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={async () => {
              try {
                await supabase.auth.signOut()
              } finally {
                window.location.href = '/login'
              }
            }}
            className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/50 font-medium text-xs"
          >
            <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Keluar ke Halaman Login (/login)</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
