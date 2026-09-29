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
