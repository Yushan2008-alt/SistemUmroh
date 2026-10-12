import type { AnnouncementAudience } from '@/types/database.types'

export interface AnnouncementWithRelations {
  id: number
  branch_id: number | null
  package_id: number | null
  created_by: string | null
  title: string
  body: string
  audience: AnnouncementAudience
  is_published: boolean
  publish_at: string
  expires_at: string | null
  created_at: string
  updated_at: string
  branch?: {
    id: number
    name: string
  } | null
  package?: {
    id: number
    name: string
  } | null
  author?: {
    id: string
    name: string
  } | null
}

export interface AnnouncementFormData {
  title: string
  body: string
  audience: AnnouncementAudience
  branch_id?: number | null
  package_id?: number | null
  is_published: boolean
  publish_at?: string | null
  expires_at?: string | null
}
