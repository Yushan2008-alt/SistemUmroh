import type { Role } from '@/types/database.types'
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  UserCheck,
  FileText,
  CreditCard,
  CalendarDays,
  PlaneTakeoff,
  Luggage,
  Coins,
  Megaphone,
  UserCog,
  Settings,
  ShieldCheck,
  Compass,
  FileCheck2,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: any
  roles: Role[]
  badge?: string
}

export const NAVIGATION_ITEMS: NavItem[] = [
  // Dashboard for all roles
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'admin', 'agent', 'pilgrim', 'guide'],
  },
  // Master Cabang (Super Admin only)
  {
    title: 'Kelola Cabang',
    href: '/branches',
    icon: Building2,
    roles: ['super_admin'],
  },
  // Master Paket, Hotel & Maskapai
  {
    title: 'Paket Umroh & Haji',
    href: '/packages',
    icon: Package,
    roles: ['super_admin', 'admin', 'agent'],
  },
  // Data Jamaah
  {
    title: 'Data Jamaah',
    href: '/pilgrims',
    icon: Users,
    roles: ['super_admin', 'admin', 'agent', 'guide'],
  },
  // Pendaftaran / Booking
  {
    title: 'Pendaftaran & Kuota',
    href: '/registrations',
    icon: UserCheck,
    roles: ['super_admin', 'admin', 'agent'],
  },
  // Checklist & Verifikasi Dokumen
  {
    title: 'Dokumen & Paspor',
    href: '/documents',
    icon: FileText,
    roles: ['super_admin', 'admin', 'agent', 'pilgrim'],
  },
  // Billing, Kasir & Kwitansi
  {
    title: 'Tagihan & Kasir',
    href: '/payments',
    icon: CreditCard,
    roles: ['super_admin', 'admin', 'agent', 'pilgrim'],
  },
  // Bimbingan & Presensi Manasik
  {
    title: 'Jadwal Manasik',
    href: '/manasik',
    icon: CalendarDays,
    roles: ['super_admin', 'admin', 'guide', 'pilgrim'],
  },
  // Manifest Penerbangan & Rooming
  {
    title: 'Manifest & Rooming',
    href: '/manifests',
    icon: PlaneTakeoff,
    roles: ['super_admin', 'admin', 'guide'],
  },
  // Distribusi Logistik Perlengkapan
  {
    title: 'Perlengkapan Jamaah',
    href: '/equipment',
    icon: Luggage,
    roles: ['super_admin', 'admin', 'pilgrim'],
  },
  // Komisi Agen
  {
    title: 'Komisi Agen',
    href: '/commissions',
    icon: Coins,
    roles: ['super_admin', 'admin', 'agent'],
  },
  // Pengumuman Internal
  {
    title: 'Pengumuman',
    href: '/announcements',
    icon: Megaphone,
    roles: ['super_admin', 'admin', 'agent', 'pilgrim', 'guide'],
  },
  // Manajemen Akun Pengguna
  {
    title: 'Kelola Pengguna',
    href: '/users',
    icon: UserCog,
    roles: ['super_admin', 'admin'],
  },
  // Pengaturan White-Label
  {
    title: 'Pengaturan Sistem',
    href: '/settings',
    icon: Settings,
    roles: ['super_admin'],
  },
  // Audit Trail Activity Logs
  {
    title: 'Log Aktivitas',
    href: '/activity-logs',
    icon: ShieldCheck,
    roles: ['super_admin', 'admin'],
  },
]

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin Pusat',
  admin: 'Admin Cabang',
  agent: 'Mitra Agen',
  pilgrim: 'Jamaah Umroh/Haji',
  guide: 'Muthawif Pembimbing',
}

export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // Registration statuses
  pending: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  confirmed: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  cancelled: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
  completed: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },

  // Payment statuses
  unpaid: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
  partial: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  paid: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },

  // Document statuses
  uploaded: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
  verified: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  rejected: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
}
