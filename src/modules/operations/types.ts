/**
 * OPERATIONS DOMAIN TYPES
 * Unified type definitions for Operations: Packages, Airlines, Hotels, Manifests, and Equipment.
 *
 * @module @/modules/operations/types
 */

import type { EquipmentStatus, PackageStatus, PackageType, RoomType } from '@/types/database.types'

// ============================================================================
// Packages
// ============================================================================

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

// ============================================================================
// Airlines
// ============================================================================

export interface Airline {
  id: number
  name: string
  code: string
  transit: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AirlineFormData {
  name: string
  code: string
  transit?: string | null
  is_active?: boolean
}

// ============================================================================
// Hotels
// ============================================================================

export interface Hotel {
  id: number
  name: string
  city: string
  star_rating: number
  distance_to_masjid: number | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HotelFormData {
  name: string
  city: string
  star_rating: number
  distance_to_masjid?: number | null
  address?: string | null
  is_active?: boolean
}

// ============================================================================
// Manifests & Room Lists
// ============================================================================

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

// ============================================================================
// Equipment Distribution
// ============================================================================

export interface EquipmentDistributionItem {
  id: number
  registration_id: number
  item: string
  quantity: number
  status: EquipmentStatus
  handed_at: string | null
  handed_by: string | null
  created_at: string
  updated_at: string

  // Joined relations
  registrations?: {
    id: number
    code: string
    pilgrims?: {
      id: number
      name: string
      phone: string
    } | null
    packages?: {
      id: number
      name: string
    } | null
  } | null
}

export interface EquipmentFormData {
  registration_id: number
  item: string
  quantity: number
  status: EquipmentStatus
  handed_at?: string | null
}

export interface RegistrationOption {
  id: number
  code: string
  pilgrim_name: string
  package_name: string
}

export interface EquipmentFormDataOptions {
  registrations: RegistrationOption[]
}
