'use client'

import { useState, useEffect } from 'react'
import { Building2, Check, ChevronsUpDown } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Branch {
  id: number
  name: string
  code: string
  is_head_office: boolean
}

export function BranchFocusSwitcher() {
  const [branches, setBranches] = useState<Branch[]>([
    { id: 1, name: 'Kantor Pusat Jakarta', code: 'HO-JKT', is_head_office: true },
    { id: 2, name: 'Cabang Surabaya', code: 'CAB-SBY', is_head_office: false },
    { id: 3, name: 'Cabang Bandung', code: 'CAB-BDG', is_head_office: false },
  ])
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null) // null = all branches

  useEffect(() => {
    const saved = localStorage.getItem('branch_focus_id')
    if (saved) {
      setSelectedBranchId(saved === 'all' ? null : Number(saved))
    }
  }, [])

  const handleSelect = (id: number | null) => {
    setSelectedBranchId(id)
    if (id === null) {
      localStorage.setItem('branch_focus_id', 'all')
    } else {
      localStorage.setItem('branch_focus_id', id.toString())
    }
    window.dispatchEvent(new Event('branch_focus_changed'))
  }

  const activeBranch = branches.find((b) => b.id === selectedBranchId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'h-9 gap-2 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
        )}
      >
        <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="font-medium text-xs truncate max-w-[140px] sm:max-w-[200px]">
          {activeBranch ? activeBranch.name : 'Semua Cabang (Global)'}
        </span>
        <ChevronsUpDown className="h-3 w-3 opacity-60 ml-auto" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
          Fokus Cabang (Super Admin)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleSelect(null)}
          className="flex items-center justify-between cursor-pointer"
        >
          <span className="font-medium text-sm">Semua Cabang (Global)</span>
          {selectedBranchId === null && <Check className="h-4 w-4 text-emerald-600" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {branches.map((b) => (
          <DropdownMenuItem
            key={b.id}
            onClick={() => handleSelect(b.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium text-sm">{b.name}</span>
              <span className="text-[11px] text-muted-foreground">{b.code}</span>
            </div>
            {selectedBranchId === b.id && <Check className="h-4 w-4 text-emerald-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
