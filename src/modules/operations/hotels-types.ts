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
