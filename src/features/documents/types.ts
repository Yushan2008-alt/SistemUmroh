import type { DocumentStatus } from '@/types/database.types'

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
}
