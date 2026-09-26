export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Role = 'super_admin' | 'admin' | 'agent' | 'pilgrim' | 'guide'
export type PackageType = 'umroh' | 'haji_khusus' | 'haji_plus'
export type PackageStatus = 'draft' | 'published' | 'archived'
export type Gender = 'male' | 'female'
export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type DocumentStatus = 'pending' | 'uploaded' | 'verified' | 'rejected'
export type PaymentType = 'down_payment' | 'installment' | 'full_payment'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'
export type PaymentMethod = 'transfer' | 'cash' | 'edc'
export type AttendanceStatus = 'present' | 'sick' | 'excused' | 'absent'
export type RoomType = 'quad' | 'triple' | 'double'
export type EquipmentStatus = 'pending' | 'handed_over' | 'returned'
export type CommissionStatus = 'pending' | 'approved' | 'paid'
export type AnnouncementAudience = 'all' | 'staff' | 'agents' | 'pilgrims' | 'guides'

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
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
          deleted_at: string | null
        }
        Insert: {
          id?: number
          code: string
          name: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          is_head_office?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: number
          code?: string
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          is_head_office?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      profiles: {
        Row: {
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
        }
        Insert: {
          id: string
          branch_id?: number | null
          name: string
          email: string
          phone?: string | null
          role?: Role
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          branch_id?: number | null
          name?: string
          email?: string
          phone?: string | null
          role?: Role
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      hotels: {
        Row: {
          id: number
          name: string
          city: 'makkah' | 'madinah'
          star_rating: number
          distance_to_masjid: number
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          city: 'makkah' | 'madinah'
          star_rating?: number
          distance_to_masjid?: number
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          city?: 'makkah' | 'madinah'
          star_rating?: number
          distance_to_masjid?: number
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      airlines: {
        Row: {
          id: number
          name: string
          code: string
          transit: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          code: string
          transit?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          code?: string
          transit?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bank_accounts: {
        Row: {
          id: number
          branch_id: number | null
          bank_name: string
          account_number: string
          account_holder: string
          branch_office: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          branch_id?: number | null
          bank_name: string
          account_number: string
          account_holder: string
          branch_office?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number | null
          bank_name?: string
          account_number?: string
          account_holder?: string
          branch_office?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      packages: {
        Row: {
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
        }
        Insert: {
          id?: number
          branch_id: number
          name: string
          type?: PackageType
          status?: PackageStatus
          price?: number
          quota?: number
          duration_days?: number
          departure_date: string
          return_date: string
          departure_city?: string
          hotel_makkah_id?: number | null
          hotel_madinah_id?: number | null
          airline_id?: number | null
          facility_included?: string | null
          facility_excluded?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number
          name?: string
          type?: PackageType
          status?: PackageStatus
          price?: number
          quota?: number
          duration_days?: number
          departure_date?: string
          return_date?: string
          departure_city?: string
          hotel_makkah_id?: number | null
          hotel_madinah_id?: number | null
          airline_id?: number | null
          facility_included?: string | null
          facility_excluded?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agents: {
        Row: {
          id: number
          branch_id: number
          profile_id: string | null
          code: string
          name: string
          phone: string
          email: string | null
          commission_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          branch_id: number
          profile_id?: string | null
          code: string
          name: string
          phone: string
          email?: string | null
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number
          profile_id?: string | null
          code?: string
          name?: string
          phone?: string
          email?: string | null
          commission_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      guides: {
        Row: {
          id: number
          branch_id: number
          profile_id: string | null
          name: string
          phone: string
          email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          branch_id: number
          profile_id?: string | null
          name: string
          phone: string
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number
          profile_id?: string | null
          name?: string
          phone?: string
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pilgrims: {
        Row: {
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
        }
        Insert: {
          id?: number
          branch_id: number
          agent_id?: number | null
          profile_id?: string | null
          code: string
          nik: string
          passport_number?: string | null
          passport_expiry?: string | null
          name: string
          gender?: Gender
          birth_place?: string | null
          birth_date?: string | null
          phone: string
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          health_notes?: string | null
          mahram_id?: number | null
          mahram_status?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number
          agent_id?: number | null
          profile_id?: string | null
          code?: string
          nik?: string
          passport_number?: string | null
          passport_expiry?: string | null
          name?: string
          gender?: Gender
          birth_place?: string | null
          birth_date?: string | null
          phone?: string
          address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          health_notes?: string | null
          mahram_id?: number | null
          mahram_status?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
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
        }
        Insert: {
          id?: number
          branch_id: number
          pilgrim_id: number
          package_id: number
          agent_id?: number | null
          guide_id?: number | null
          code: string
          status?: RegistrationStatus
          total_price?: number
          registered_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number
          pilgrim_id?: number
          package_id?: number
          agent_id?: number | null
          guide_id?: number | null
          code?: string
          status?: RegistrationStatus
          total_price?: number
          registered_at?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
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
        }
        Insert: {
          id?: number
          pilgrim_id: number
          type: string
          label: string
          file_path?: string | null
          original_name?: string | null
          mime_type?: string | null
          file_size?: number | null
          status?: DocumentStatus
          uploaded_at?: string | null
          verified_by?: string | null
          verified_at?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          pilgrim_id?: number
          type?: string
          label?: string
          file_path?: string | null
          original_name?: string | null
          mime_type?: string | null
          file_size?: number | null
          status?: DocumentStatus
          uploaded_at?: string | null
          verified_by?: string | null
          verified_at?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: number
          branch_id: number
          registration_id: number
          code: string
          type: PaymentType
          amount: number
          paid_amount: number
          status: PaymentStatus
          due_date: string | null
          paid_at: string | null
          method: PaymentMethod | null
          bank_account_id: number | null
          recorded_by: string | null
          proof_path: string | null
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          branch_id: number
          registration_id: number
          code: string
          type?: PaymentType
          amount?: number
          paid_amount?: number
          status?: PaymentStatus
          due_date?: string | null
          paid_at?: string | null
          method?: PaymentMethod | null
          bank_account_id?: number | null
          recorded_by?: string | null
          proof_path?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number
          registration_id?: number
          code?: string
          type?: PaymentType
          amount?: number
          paid_amount?: number
          status?: PaymentStatus
          due_date?: string | null
          paid_at?: string | null
          method?: PaymentMethod | null
          bank_account_id?: number | null
          recorded_by?: string | null
          proof_path?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      manasik_schedules: {
        Row: {
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
        }
        Insert: {
          id?: number
          branch_id: number
          package_id: number
          guide_id?: number | null
          title: string
          date: string
          time: string
          location: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number
          package_id?: number
          guide_id?: number | null
          title?: string
          date?: string
          time?: string
          location?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      manasik_attendances: {
        Row: {
          id: number
          manasik_schedule_id: number
          pilgrim_id: number
          status: AttendanceStatus
          recorded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          manasik_schedule_id: number
          pilgrim_id: number
          status?: AttendanceStatus
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          manasik_schedule_id?: number
          pilgrim_id?: number
          status?: AttendanceStatus
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      manifest_entries: {
        Row: {
          id: number
          package_id: number
          registration_id: number
          room_number: string | null
          room_type: RoomType
          bus_number: string | null
          seat_number: string | null
          mahram_group: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          package_id: number
          registration_id: number
          room_number?: string | null
          room_type?: RoomType
          bus_number?: string | null
          seat_number?: string | null
          mahram_group?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          package_id?: number
          registration_id?: number
          room_number?: string | null
          room_type?: RoomType
          bus_number?: string | null
          seat_number?: string | null
          mahram_group?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      equipment_distributions: {
        Row: {
          id: number
          registration_id: number
          item: string
          quantity: number
          status: EquipmentStatus
          handed_at: string | null
          handed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          registration_id: number
          item: string
          quantity?: number
          status?: EquipmentStatus
          handed_at?: string | null
          handed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          registration_id?: number
          item?: string
          quantity?: number
          status?: EquipmentStatus
          handed_at?: string | null
          handed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      commissions: {
        Row: {
          id: number
          branch_id: number
          agent_id: number
          registration_id: number
          base_amount: number
          rate: number
          amount: number
          status: CommissionStatus
          paid_at: string | null
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          branch_id: number
          agent_id: number
          registration_id: number
          base_amount?: number
          rate?: number
          amount?: number
          status?: CommissionStatus
          paid_at?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number
          agent_id?: number
          registration_id?: number
          base_amount?: number
          rate?: number
          amount?: number
          status?: CommissionStatus
          paid_at?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
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
        }
        Insert: {
          id?: number
          branch_id?: number | null
          package_id?: number | null
          created_by?: string | null
          title: string
          body: string
          audience?: AnnouncementAudience
          is_published?: boolean
          publish_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          branch_id?: number | null
          package_id?: number | null
          created_by?: string | null
          title?: string
          body?: string
          audience?: AnnouncementAudience
          is_published?: boolean
          publish_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: number
          key: string
          value: string | null
          group_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          key: string
          value?: string | null
          group_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          key?: string
          value?: string | null
          group_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: number
          user_id: string | null
          branch_id: number | null
          action: string
          subject_type: string | null
          subject_id: string | null
          description: string | null
          properties: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          branch_id?: number | null
          action: string
          subject_type?: string | null
          subject_id?: string | null
          description?: string | null
          properties?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          branch_id?: number | null
          action?: string
          subject_type?: string | null
          subject_id?: string | null
          description?: string | null
          properties?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      book_registration: {
        Args: {
          p_pilgrim_id: number
          p_package_id: number
          p_agent_id?: number | null
          p_notes?: string | null
        }
        Returns: Json
      }
      record_payment: {
        Args: {
          p_payment_id: number
          p_amount: number
          p_method: PaymentMethod
          p_bank_account_id?: number | null
          p_proof_path?: string | null
          p_note?: string | null
        }
        Returns: Json
      }
      generate_bill_schedule: {
        Args: {
          p_registration_id: number
          p_down_payment: number
          p_installments_count: number
          p_start_date?: string
        }
        Returns: Json
      }
      get_dashboard_summary: {
        Args: {
          p_branch_id?: number | null
        }
        Returns: Json
      }
    }
  }
}
