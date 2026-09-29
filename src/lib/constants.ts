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
  Hotel,
  Plane,
  Landmark,
  Handshake,
  BookOpen,
} from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: any
  roles: Role[]
  badge?: string
}

export interface NavGroup {
  label?: string
  roles: Role[]
  items: NavItem[]
}

export const NAVIGATION_GROUPS: NavGroup[] = [
  // Dashboard Section
  {
    roles: ['super_admin', 'admin', 'agent', 'pilgrim', 'guide'],
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['super_admin', 'admin', 'agent', 'pilgrim', 'guide'],
      },
    ],
  },

  // STAFF: MASTER DATA
  {
    label: 'MASTER DATA',
    roles: ['super_admin', 'admin'],
    items: [
      {
        title: 'Kelola Cabang',
        href: '/branches',
        icon: Building2,
        roles: ['super_admin'],
      },
      {
        title: 'Paket Umroh & Haji',
        href: '/packages',
        icon: Package,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Hotel Makkah & Madinah',
        href: '/hotels',
        icon: Hotel,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Maskapai Penerbangan',
        href: '/airlines',
        icon: Plane,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Rekening Bank',
        href: '/bank-accounts',
        icon: Landmark,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Mitra Agen',
        href: '/agents',
        icon: Handshake,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Muthawif / Guide',
        href: '/guides',
        icon: BookOpen,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Data Jamaah',
        href: '/pilgrims',
        icon: Users,
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // STAFF: OPERASIONAL
  {
    label: 'OPERASIONAL',
    roles: ['super_admin', 'admin'],
    items: [
      {
        title: 'Pendaftaran & Kuota',
        href: '/registrations',
        icon: UserCheck,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Dokumen & Paspor',
        href: '/documents',
        icon: FileText,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Tagihan & Kasir',
        href: '/payments',
        icon: CreditCard,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Jadwal Manasik',
        href: '/manasik',
        icon: CalendarDays,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Manifest & Rooming',
        href: '/manifests',
        icon: PlaneTakeoff,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Perlengkapan Jamaah',
        href: '/equipment',
        icon: Luggage,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Komisi Agen',
        href: '/commissions',
        icon: Coins,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Pengumuman',
        href: '/announcements',
        icon: Megaphone,
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // STAFF: SISTEM
  {
    label: 'SISTEM',
    roles: ['super_admin', 'admin'],
    items: [
      {
        title: 'Kelola Pengguna',
        href: '/users',
        icon: UserCog,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Pengaturan Sistem',
        href: '/settings',
        icon: Settings,
        roles: ['super_admin'],
      },
      {
        title: 'Log Aktivitas',
        href: '/activity-logs',
        icon: ShieldCheck,
        roles: ['super_admin', 'admin'],
      },
    ],
  },

  // AGENT: MARKETING
  {
    label: 'MARKETING',
    roles: ['agent'],
    items: [
      {
        title: 'Jamaah Referral',
        href: '/pilgrims',
        icon: Users,
        roles: ['agent'],
      },
      {
        title: 'Pendaftaran Paket',
        href: '/registrations',
        icon: UserCheck,
        roles: ['agent'],
      },
      {
        title: 'Komisi Saya',
        href: '/commissions',
        icon: Coins,
        roles: ['agent'],
      },
      {
        title: 'Paket Tersedia',
        href: '/packages',
        icon: Package,
        roles: ['agent'],
      },
      {
        title: 'Pengumuman Travel',
        href: '/announcements',
        icon: Megaphone,
        roles: ['agent'],
      },
    ],
  },

  // PILGRIM: PERJALANAN SAYA
  {
    label: 'PERJALANAN SAYA',
    roles: ['pilgrim'],
    items: [
      {
        title: 'Pendaftaran Saya',
        href: '/registrations',
        icon: UserCheck,
        roles: ['pilgrim'],
      },
      {
        title: 'Dokumen & Paspor',
        href: '/documents',
        icon: FileText,
        roles: ['pilgrim'],
      },
      {
        title: 'Pembayaran & Tagihan',
        href: '/payments',
        icon: CreditCard,
        roles: ['pilgrim'],
      },
      {
        title: 'Jadwal Manasik',
        href: '/manasik',
        icon: CalendarDays,
        roles: ['pilgrim'],
      },
      {
        title: 'Perlengkapan Ibadah',
        href: '/equipment',
        icon: Luggage,
        roles: ['pilgrim'],
      },
      {
        title: 'Pengumuman Travel',
        href: '/announcements',
        icon: Megaphone,
        roles: ['pilgrim'],
      },
    ],
  },

  // GUIDE: BIMBINGAN
  {
    label: 'BIMBINGAN',
    roles: ['guide'],
    items: [
      {
        title: 'Jamaah Bimbingan',
        href: '/pilgrims',
        icon: Users,
        roles: ['guide'],
      },
      {
        title: 'Manasik & Absensi',
        href: '/manasik',
        icon: CalendarDays,
        roles: ['guide'],
      },
      {
        title: 'Manifest Rombongan',
        href: '/manifests',
        icon: PlaneTakeoff,
        roles: ['guide'],
      },
      {
        title: 'Pengumuman Travel',
        href: '/announcements',
        icon: Megaphone,
        roles: ['guide'],
      },
    ],
  },
]

// Backward compatibility helper
export const NAVIGATION_ITEMS: NavItem[] = NAVIGATION_GROUPS.flatMap((g) => g.items)


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
