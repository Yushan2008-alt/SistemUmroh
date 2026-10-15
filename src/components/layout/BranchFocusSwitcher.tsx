'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import type { Role } from '@/types/database.types'

interface Branch {
  id: number
  name: string
  code: string
  is_head_office: boolean
}

interface BranchFocusSwitcherProps {
  currentRole?: Role
}

export function BranchFocusSwitcher({ currentRole = 'admin' }: BranchFocusSwitcherProps) {
  const router = useRouter()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchBranches() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('branches')
          .select('id, name, code, is_head_office')
          .eq('is_active', true)
          .order('id', { ascending: true })

        let branchList: Branch[] = []
        if (!error && data && data.length > 0) {
          branchList = data
        } else {
          // Fallback 5 branches
          branchList = [
            { id: 1, name: 'Kantor Pusat Jakarta', code: 'HO-JKT', is_head_office: true },
            { id: 2, name: 'Cabang Surabaya', code: 'CAB-SBY', is_head_office: false },
            { id: 3, name: 'Cabang Bandung', code: 'CAB-BDG', is_head_office: false },
            { id: 4, name: 'Cabang Yogyakarta', code: 'CAB-YOG', is_head_office: false },
            { id: 5, name: 'Cabang Bogor', code: 'CAB-BGR', is_head_office: false },
          ]
        }
        setBranches(branchList)

        // Read saved branch or default to first branch (Jakarta)
        const saved = localStorage.getItem('branch_focus_id')
        const initialId = saved && saved !== 'all' && branchList.some(b => b.id === Number(saved))
          ? Number(saved)
          : branchList[0]?.id || 1

        setSelectedBranchId(initialId)
        localStorage.setItem('branch_focus_id', initialId.toString())
        document.cookie = `branch_focus_id=${initialId}; path=/; max-age=31536000; SameSite=Lax`
      } catch (err) {
        console.error('Failed to load branches:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [])

  const handleSelect = (id: number) => {
    setSelectedBranchId(id)
    localStorage.setItem('branch_focus_id', id.toString())
    document.cookie = `branch_focus_id=${id}; path=/; max-age=31536000; SameSite=Lax`
    window.dispatchEvent(new Event('branch_focus_changed'))
    router.refresh()
  }

  const activeBranch = branches.find((b) => b.id === selectedBranchId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'h-9 gap-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium'
        )}
      >
        <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="text-xs truncate max-w-[120px] sm:max-w-[180px]">
          {loading ? 'Memuat cabang...' : activeBranch ? activeBranch.name : 'Pilih Cabang'}
        </span>
        <ChevronsUpDown className="h-3 w-3 opacity-60 ml-auto shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px] shadow-lg">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
            <span>Pilih Cabang Operasional</span>
            {loading && <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {/* Daftar 5 Cabang Resmi Supabase (Satu per satu tanpa Semua Cabang) */}
        <DropdownMenuGroup>
          {branches.map((b) => (
            <DropdownMenuItem
              key={b.id}
              onClick={() => handleSelect(b.id)}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm text-foreground">{b.name}</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {b.code} {b.is_head_office ? '• Pusat' : '• Wilayah'}
                </span>
              </div>
              {selectedBranchId === b.id && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
