import type { RoomType } from '@/types/database.types'

export interface ManifestPackage {
  id: number
  name: string
  type: string
  departure_date: string
  return_date: string
  departure_city: string
  quota: number
  active_registrations_count: number
  branches?: {
    id: number
    name: string
    code: string
  } | null
  hotel_makkah?: {
    id: number
    name: string
    star_rating: number
  } | null
  hotel_madinah?: {
    id: number
    name: string
    star_rating: number
  } | null
  airlines?: {
    id: number
    name: string
    code: string
  } | null
}

export interface ManifestEntry {
  id?: number
  package_id: number
  registration_id: number
  room_number: string | null
  room_type: RoomType | null
  bus_number: string | null
  seat_number: string | null
  mahram_group: string | null
}

export interface ManifestRegistrationItem {
  id: number // registration_id
  code: string
  status: string
  registered_at: string
  pilgrim: {
    id: number
    name: string
    gender: 'male' | 'female'
    nik: string
    phone: string
    passport_number: string | null
    passport_expiry: string | null
    mahram_status: string | null
  }
  manifest_entry?: ManifestEntry | null
}

export interface ManifestRowInput {
  room_number: string
  room_type: RoomType | ''
  bus_number: string
  seat_number: string
  mahram_group: string
}
