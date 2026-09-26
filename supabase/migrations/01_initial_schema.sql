-- ==============================================================================
-- 01_initial_schema.sql
-- Sistem Manajemen Travel Umroh & Haji
-- Modern PostgreSQL 18 Schema for Supabase
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
        CREATE TYPE role_enum AS ENUM ('super_admin', 'admin', 'agent', 'pilgrim', 'guide');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'package_type_enum') THEN
        CREATE TYPE package_type_enum AS ENUM ('umroh', 'haji_khusus', 'haji_plus');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'package_status_enum') THEN
        CREATE TYPE package_status_enum AS ENUM ('draft', 'published', 'archived');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        CREATE TYPE gender_enum AS ENUM ('male', 'female');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status_enum') THEN
        CREATE TYPE registration_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status_enum') THEN
        CREATE TYPE document_status_enum AS ENUM ('pending', 'uploaded', 'verified', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type_enum') THEN
        CREATE TYPE payment_type_enum AS ENUM ('down_payment', 'installment', 'full_payment');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM ('unpaid', 'partial', 'paid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
        CREATE TYPE payment_method_enum AS ENUM ('transfer', 'cash', 'edc');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status_enum') THEN
        CREATE TYPE attendance_status_enum AS ENUM ('present', 'sick', 'excused', 'absent');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'room_type_enum') THEN
        CREATE TYPE room_type_enum AS ENUM ('quad', 'triple', 'double');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'equipment_status_enum') THEN
        CREATE TYPE equipment_status_enum AS ENUM ('pending', 'handed_over', 'returned');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commission_status_enum') THEN
        CREATE TYPE commission_status_enum AS ENUM ('pending', 'approved', 'paid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_audience_enum') THEN
        CREATE TYPE announcement_audience_enum AS ENUM ('all', 'staff', 'agents', 'pilgrims', 'guides');
    END IF;
END $$;

-- 3. HELPER TRIGGER FOR updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. MASTER TABLES

-- 4.1 Branches (Cabang)
CREATE TABLE IF NOT EXISTS public.branches (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    is_head_office BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 4.2 Profiles (Synced with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES public.branches(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role role_enum NOT NULL DEFAULT 'pilgrim',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 Hotels
CREATE TABLE IF NOT EXISTS public.hotels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL CHECK (city IN ('makkah', 'madinah')),
    star_rating SMALLINT NOT NULL DEFAULT 4 CHECK (star_rating BETWEEN 1 AND 5),
    distance_to_masjid INTEGER NOT NULL DEFAULT 100, -- meter
    address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 Airlines
CREATE TABLE IF NOT EXISTS public.airlines (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    transit VARCHAR(100) DEFAULT 'Direct',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.5 Bank Accounts
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT REFERENCES public.branches(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    branch_office VARCHAR(150),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.6 Packages
CREATE TABLE IF NOT EXISTS public.packages (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type package_type_enum NOT NULL DEFAULT 'umroh',
    status package_status_enum NOT NULL DEFAULT 'draft',
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    quota INTEGER NOT NULL DEFAULT 45,
    duration_days INTEGER NOT NULL DEFAULT 9,
    departure_date DATE NOT NULL,
    return_date DATE NOT NULL,
    departure_city VARCHAR(100) NOT NULL DEFAULT 'Jakarta',
    hotel_makkah_id BIGINT REFERENCES public.hotels(id) ON DELETE SET NULL,
    hotel_madinah_id BIGINT REFERENCES public.hotels(id) ON DELETE SET NULL,
    airline_id BIGINT REFERENCES public.airlines(id) ON DELETE SET NULL,
    facility_included TEXT,
    facility_excluded TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.7 Agents
CREATE TABLE IF NOT EXISTS public.agents (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00, -- in percentage
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.8 Guides (Muthawif)
CREATE TABLE IF NOT EXISTS public.guides (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.9 Pilgrims (Jamaah)
CREATE TABLE IF NOT EXISTS public.pilgrims (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    agent_id BIGINT REFERENCES public.agents(id) ON DELETE SET NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    nik VARCHAR(16) NOT NULL UNIQUE,
    passport_number VARCHAR(50),
    passport_expiry DATE,
    name VARCHAR(255) NOT NULL,
    gender gender_enum NOT NULL DEFAULT 'male',
    birth_place VARCHAR(100),
    birth_date DATE,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    health_notes TEXT,
    mahram_id BIGINT REFERENCES public.pilgrims(id) ON DELETE SET NULL,
    mahram_status VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.10 Registrations (Booking)
CREATE TABLE IF NOT EXISTS public.registrations (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    pilgrim_id BIGINT NOT NULL REFERENCES public.pilgrims(id) ON DELETE CASCADE,
    package_id BIGINT NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    agent_id BIGINT REFERENCES public.agents(id) ON DELETE SET NULL,
    guide_id BIGINT REFERENCES public.guides(id) ON DELETE SET NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    status registration_status_enum NOT NULL DEFAULT 'pending',
    total_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    registered_at DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_pilgrim_package UNIQUE (pilgrim_id, package_id)
);

-- 4.11 Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id BIGSERIAL PRIMARY KEY,
    pilgrim_id BIGINT NOT NULL REFERENCES public.pilgrims(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'ktp', 'kk', 'paspor', 'foto', 'buku_nikah', 'vaksin'
    label VARCHAR(150) NOT NULL,
    file_path TEXT,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    status document_status_enum NOT NULL DEFAULT 'pending',
    uploaded_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.12 Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    registration_id BIGINT NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    type payment_type_enum NOT NULL DEFAULT 'down_payment',
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status payment_status_enum NOT NULL DEFAULT 'unpaid',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    method payment_method_enum,
    bank_account_id BIGINT REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    proof_path TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.13 Manasik Schedules
CREATE TABLE IF NOT EXISTS public.manasik_schedules (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    package_id BIGINT NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    guide_id BIGINT REFERENCES public.guides(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.14 Manasik Attendances
CREATE TABLE IF NOT EXISTS public.manasik_attendances (
    id BIGSERIAL PRIMARY KEY,
    manasik_schedule_id BIGINT NOT NULL REFERENCES public.manasik_schedules(id) ON DELETE CASCADE,
    pilgrim_id BIGINT NOT NULL REFERENCES public.pilgrims(id) ON DELETE CASCADE,
    status attendance_status_enum NOT NULL DEFAULT 'absent',
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_schedule_pilgrim UNIQUE (manasik_schedule_id, pilgrim_id)
);

-- 4.15 Manifest Entries
CREATE TABLE IF NOT EXISTS public.manifest_entries (
    id BIGSERIAL PRIMARY KEY,
    package_id BIGINT NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
    registration_id BIGINT NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE UNIQUE,
    room_number VARCHAR(50),
    room_type room_type_enum NOT NULL DEFAULT 'quad',
    bus_number VARCHAR(50),
    seat_number VARCHAR(50),
    mahram_group VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.16 Equipment Distributions
CREATE TABLE IF NOT EXISTS public.equipment_distributions (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    item VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status equipment_status_enum NOT NULL DEFAULT 'pending',
    handed_at TIMESTAMPTZ,
    handed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.17 Commissions
CREATE TABLE IF NOT EXISTS public.commissions (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    agent_id BIGINT NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    registration_id BIGINT NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE UNIQUE,
    base_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status commission_status_enum NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.18 Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT REFERENCES public.branches(id) ON DELETE CASCADE,
    package_id BIGINT REFERENCES public.packages(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    audience announcement_audience_enum NOT NULL DEFAULT 'all',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    publish_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.19 Settings (White-Label & General Config)
CREATE TABLE IF NOT EXISTS public.settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    group_name VARCHAR(100) NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.20 Activity Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    branch_id BIGINT REFERENCES public.branches(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    subject_type VARCHAR(100),
    subject_id VARCHAR(100),
    description TEXT,
    properties JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_profiles_branch ON public.profiles(branch_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_packages_branch ON public.packages(branch_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_dates ON public.packages(departure_date, return_date);
CREATE INDEX IF NOT EXISTS idx_pilgrims_branch ON public.pilgrims(branch_id);
CREATE INDEX IF NOT EXISTS idx_pilgrims_nik ON public.pilgrims(nik);
CREATE INDEX IF NOT EXISTS idx_registrations_branch ON public.registrations(branch_id);
CREATE INDEX IF NOT EXISTS idx_registrations_package ON public.registrations(package_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
CREATE INDEX IF NOT EXISTS idx_documents_pilgrim ON public.documents(pilgrim_id);
CREATE INDEX IF NOT EXISTS idx_payments_registration ON public.payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_manasik_schedule ON public.manasik_schedules(package_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- 6. ATTACH updated_at TRIGGERS
CREATE TRIGGER set_timestamp_branches BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_hotels BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_airlines BEFORE UPDATE ON public.airlines FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_bank_accounts BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_packages BEFORE UPDATE ON public.packages FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_agents BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_guides BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_pilgrims BEFORE UPDATE ON public.pilgrims FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_registrations BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_documents BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_payments BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_manasik_schedules BEFORE UPDATE ON public.manasik_schedules FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_manasik_attendances BEFORE UPDATE ON public.manasik_attendances FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_manifest_entries BEFORE UPDATE ON public.manifest_entries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_equipment_distributions BEFORE UPDATE ON public.equipment_distributions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_commissions BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_announcements BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_timestamp_settings BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 7. AUTH USER SYNC TRIGGER
-- Automatically creates public.profiles row when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        branch_id,
        phone
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::role_enum, 'pilgrim'),
        (NEW.raw_user_meta_data->>'branch_id')::BIGINT,
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name),
        role = COALESCE(EXCLUDED.role, profiles.role),
        branch_id = COALESCE(EXCLUDED.branch_id, profiles.branch_id),
        phone = COALESCE(EXCLUDED.phone, profiles.phone);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
