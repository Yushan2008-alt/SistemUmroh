/**
 * PILGRIMS DOMAIN TYPES
 * Unified type definitions for Pilgrims: Profiles, Registrations, Documents, and Manasik.
 *
 * @module @/modules/pilgrims/types
 */

import type { AttendanceStatus, DocumentStatus, Gender, PackageType, PaymentMethod, PaymentStatus, PaymentType, RegistrationStatus } from '@/types/database.types'

// ============================================================================
// Pilgrim Profiles
// ============================================================================

export interface PilgrimItem {
  id: number
  branch_id: number
  agent_id: number | null
  profile_id: string | null
  code: string
  nik: string
  passport_number: string | null
  passport_expiry: string | null
  name: string
  gender: Gender
  birth_place: string | null
  birth_date: string | null
  phone: string
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  health_notes: string | null
  mahram_id: number | null
  mahram_status: string | null
  is_active: boolean
  created_at: string
  updated_at: string

  // Joined relations
  branches?: {
    id: number
    name: string
    code: string
  } | null
  agents?: {
    id: number
    name: string
    code: string
    phone?: string
  } | null
  profiles?: {
    id: string
    name: string
    email: string
    role: string
  } | null
  registrations?: any[]
  documents_count?: number
}

export interface PilgrimFormData {
  branch_id: number
  agent_id?: number | null
  name: string
  gender: Gender
  nik: string
  birth_place?: string | null
  birth_date?: string | null
  phone: string
  email?: string | null
  address?: string | null
  passport_number?: string | null
  passport_expiry?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  mahram_status?: string | null
  health_notes?: string | null
  is_active?: boolean
  create_account?: boolean
  account_email?: string | null
}

export interface PilgrimFormDataOptions {
  branches: {
    id: number
    name: string
    code: string
  }[]
  agents: {
    id: number
    name: string
    code: string
  }[]
}

// ============================================================================
// Pilgrim Registrations
// ============================================================================

export interface RegistrationListItem {
  id: number
  branch_id: number
  pilgrim_id: number
  package_id: number
  agent_id: number | null
  guide_id: number | null
  code: string
  status: RegistrationStatus
  total_price: number
  registered_at: string
  notes: string | null
  created_at: string
  updated_at: string
  pilgrims: {
    id: number
    name: string
    phone: string
    passport_number: string | null
    nik: string
  } | null
  packages: {
    id: number
    name: string
    type: PackageType
    price: number
    departure_date: string
    duration_days: number
    quota: number
  } | null
  branches: {
    id: number
    name: string
    code: string
  } | null
  agents: {
    id: number
    name: string
    code: string
  } | null
  guides: {
    id: number
    name: string
  } | null
  payments?: {
    id: number
    code: string
    type: PaymentType
    amount: number
    paid_amount: number
    status: PaymentStatus
    due_date: string | null
    paid_at: string | null
    method: PaymentMethod | null
  }[]
  computed_payment_status?: 'paid' | 'partial' | 'unpaid'
  total_paid?: number
  remaining_balance?: number
}

export interface RegistrationFormData {
  pilgrim_id: number
  package_id: number
  guide_id?: number | null
  registered_at?: string
  notes?: string | null
}

// ============================================================================
// Documents & Verification
// ============================================================================

export type DocumentType = 'ktp' | 'kk' | 'paspor' | 'foto' | 'buku_nikah' | 'vaksin'

export interface StandardDocConfig {
  type: DocumentType
  label: string
  description: string
  required: boolean
}

export const STANDARD_DOCUMENTS: StandardDocConfig[] = [
  {
    type: 'ktp',
    label: 'KTP Asli / e-KTP',
    description: 'Kartu Tanda Penduduk yang masih berlaku dengan NIK jelas dan terbaca.',
    required: true,
  },
  {
    type: 'kk',
    label: 'Kartu Keluarga (KK)',
    description: 'Kartu Keluarga terbaru untuk verifikasi identitas dan hubungan keluarga/mahram.',
    required: true,
  },
  {
    type: 'paspor',
    label: 'Paspor Asli (Masa Berlaku Min. 7 Bulan)',
    description: 'Paspor asli dengan nama minimal 2-3 kata, masa berlaku minimal 7 bulan sebelum keberangkatan.',
    required: true,
  },
  {
    type: 'foto',
    label: 'Pas Foto 4x6 Latar Putih (Wajah 80%)',
    description: 'Foto berwarna terbaru dengan latar putih polos, fokus wajah 80%, tanpa kacamata atau penutup wajah.',
    required: true,
  },
  {
    type: 'buku_nikah',
    label: 'Buku Nikah / Akta Kelahiran',
    description: 'Buku nikah bagi pasangan suami-istri atau akta kelahiran untuk anak/jamaah wanita mahram.',
    required: false,
  },
  {
    type: 'vaksin',
    label: 'Sertifikat Vaksin Meningitis',
    description: 'Sertifikat vaksinasi meningitis resmi (Buku Kuning ICV atau sertifikat SatuSehat Kemenkes).',
    required: true,
  },
]

export interface DocumentItem {
  id: number
  pilgrim_id: number
  type: string
  label: string
  file_path: string | null
  original_name: string | null
  mime_type: string | null
  file_size: number | null
  status: DocumentStatus
  uploaded_at: string | null
  verified_by: string | null
  verified_at: string | null
  note: string | null
  created_at: string
  updated_at: string
  verifier_name?: string | null
  signed_url?: string | null
}

export interface PilgrimWithDocumentsSummary {
  id: number
  code: string
  name: string
  nik: string
  phone: string
  passport_number: string | null
  passport_expiry: string | null
  gender: string
  branch_name: string | null
  package_name: string | null
  departure_date: string | null
  registration_code: string | null
  total_documents: number
  verified_count: number
  uploaded_count: number
  rejected_count: number
  pending_count: number
  completion_percentage: number
  overall_status: 'complete' | 'in_review' | 'rejected' | 'incomplete'
}

export interface DocumentFilterParams {
  search?: string
  status?: 'all' | 'complete' | 'in_review' | 'rejected' | 'incomplete'
  packageId?: string
  pilgrimId?: number
}

// ============================================================================
// Manasik Schedules & Attendance
// ============================================================================

export interface ManasikScheduleItem {
  id: number
  branch_id: number
  package_id: number
  guide_id: number | null
  title: string
  date: string
  time: string
  location: string
  description: string | null
  created_at: string
  updated_at: string

  // Joined relations
  packages?: {
    id: number
    name: string
  } | null
  guides?: {
    id: number
    name: string
    phone: string
  } | null
  branches?: {
    id: number
    name: string
  } | null
  attendances?: {
    id: number
    pilgrim_id: number
    status: AttendanceStatus
  }[]
  attendances_count?: number
}

export interface ManasikFormData {
  branch_id: number
  package_id: number
  guide_id?: number | null
  title: string
  date: string
  time: string
  location: string
  description?: string | null
}

export interface ManasikFormDataOptions {
  packages: {
    id: number
    name: string
    branch_id: number
  }[]
  guides: {
    id: number
    name: string
    phone: string
  }[]
  branches: {
    id: number
    name: string
  }[]
}

export interface PilgrimAttendanceItem {
  pilgrim_id: number
  name: string
  gender: 'male' | 'female'
  phone: string
  status: AttendanceStatus
}
