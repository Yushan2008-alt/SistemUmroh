import type { PackageStatus, PackageType } from '@/types/database.types'

export interface HotelOption {
  id: number
  name: string
  city: 'makkah' | 'madinah'
  star_rating: number
  distance_to_masjid: number
}

export interface AirlineOption {
  id: number
  name: string
  code: string
  transit: string | null
}

export interface BranchOption {
  id: number
  name: string
  code: string
}

export interface PackageItem {
  id: number
  branch_id: number
  name: string
  type: PackageType
  status: PackageStatus
  price: number
  quota: number
  duration_days: number
  departure_date: string
  return_date: string
  departure_city: string
  hotel_makkah_id: number | null
  hotel_madinah_id: number | null
  airline_id: number | null
  facility_included: string | null
  facility_excluded: string | null
  created_at: string
  updated_at: string

  // Joined relations
  branches?: BranchOption | null
  hotel_makkah?: HotelOption | null
  hotel_madinah?: HotelOption | null
  airlines?: AirlineOption | null

  // Aggregates
  active_registrations_count?: number
  remaining_quota?: number
}

export interface PackageFormData {
  branch_id: number
  name: string
  type: PackageType
  status: PackageStatus
  price: number
  quota: number
  duration_days: number
  departure_date: string
  return_date: string
  departure_city: string
  hotel_makkah_id?: number | null
  hotel_madinah_id?: number | null
  airline_id?: number | null
  facility_included?: string
  facility_excluded?: string
}

export interface PackageFormDataOptions {
  branches: BranchOption[]
  hotelsMakkah: HotelOption[]
  hotelsMadinah: HotelOption[]
  airlines: AirlineOption[]
}
