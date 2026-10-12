import type { AttendanceStatus } from '@/types/database.types'

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
