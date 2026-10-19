/**
 * SYSTEM DOMAIN TYPES
 * Unified type definitions for System: Users, RBAC, Branches, Agents, Guides, Announcements, Logs, and Settings.
 *
 * @module @/modules/system/types
 */

import type { AnnouncementAudience, Role } from '@/types/database.types'

// ============================================================================
// Users & Staff
// ============================================================================

export interface UserProfileWithBranch {
  id: string
  branch_id: number | null
  name: string
  email: string
  phone: string | null
  role: Role
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  last_sign_in_at?: string | null
  branch?: {
    id: number
    name: string
  } | null
}

export interface UserFormData {
  name: string
  email: string
  role: Role
  branch_id?: number | null
  phone?: string | null
  is_active: boolean
  password?: string
}

export interface UserFilterParams {
  role?: string
  q?: string
}

// ============================================================================
// Branches
// ============================================================================

export interface Branch {
  id: number
  code: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  is_head_office: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BranchFormData {
  code: string
  name: string
  phone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  is_head_office?: boolean
  is_active?: boolean
}

// ============================================================================
// Agents & Partners
// ============================================================================

export interface Agent {
  id: number
  branch_id: number | null
  profile_id: string | null
  code: string
  name: string
  phone: string | null
  email: string | null
  commission_rate: number
  is_active: boolean
  created_at: string
  updated_at: string
  branch?: {
    id: number
    name: string
    code: string
  } | null
}

export interface AgentFormData {
  branch_id?: number | null
  code: string
  name: string
  phone?: string | null
  email?: string | null
  commission_rate: number
  is_active?: boolean
}

// ============================================================================
// Tour Guides (Muthawwif)
// ============================================================================

export interface Guide {
  id: number
  branch_id: number | null
  profile_id: string | null
  name: string
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  branch?: {
    id: number
    name: string
    code: string
  } | null
  profile?: {
    id: string
    email: string | null
    role: string
    is_active: boolean
  } | null
}

export interface GuideFormData {
  branch_id?: number | null
  name: string
  phone?: string | null
  email?: string | null
  is_active?: boolean
  create_account?: boolean
  account_email?: string
  account_password?: string
}

// ============================================================================
// Announcements & Broadcasts
// ============================================================================

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

// ============================================================================
// Audit Trails & Activity Logs
// ============================================================================

export interface ActivityLogWithRelations {
  id: number
  user_id: string | null
  branch_id: number | null
  action: string
  subject_type: string | null
  subject_id: string | null
  description: string | null
  properties: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: {
    id: string
    name: string
    email?: string
  } | null
}

export interface ActivityLogFilterParams {
  action?: string
  userId?: string
  q?: string
}

// ============================================================================
// System Settings
// ============================================================================

export interface SystemSettings {
  app_name: string
  app_tagline: string
  company_phone: string
  company_email: string
  company_address: string
  footer_copyright: string
  primary_color: string
  secondary_color: string
}
