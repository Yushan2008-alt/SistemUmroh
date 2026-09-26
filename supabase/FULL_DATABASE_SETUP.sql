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


-- ==============================================================================
-- 02_rls_policies.sql
-- Sistem Manajemen Travel Umroh & Haji
-- Comprehensive Multi-Tenant Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. HELPER FUNCTIONS FOR RLS EVALUATION
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS role_enum AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_branch_id()
RETURNS BIGINT AS $$
    SELECT branch_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
    SELECT (public.get_auth_role() = 'super_admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT (public.get_auth_role() IN ('super_admin', 'admin'));
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_access_branch(p_branch_id BIGINT)
RETURNS BOOLEAN AS $$
    SELECT (
        public.is_super_admin() OR 
        (public.get_auth_role() = 'admin' AND public.get_auth_branch_id() = p_branch_id)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. ENABLE RLS ON ALL TABLES
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilgrims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manasik_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manasik_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifest_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES PER TABLE

-- 3.1 Branches
CREATE POLICY "branches_select_policy" ON public.branches
    FOR SELECT TO authenticated
    USING (public.is_super_admin() OR id = public.get_auth_branch_id());

CREATE POLICY "branches_anon_select" ON public.branches
    FOR SELECT TO anon
    USING (is_active = TRUE);

CREATE POLICY "branches_write_policy" ON public.branches
    FOR ALL TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 3.2 Profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin() OR
        id = auth.uid() OR
        (public.get_auth_role() = 'admin' AND branch_id = public.get_auth_branch_id())
    );

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
        public.is_super_admin() OR
        id = auth.uid() OR
        (public.get_auth_role() = 'admin' AND branch_id = public.get_auth_branch_id())
    );

-- 3.3 Hotels & Airlines (Global Catalog)
CREATE POLICY "hotels_read_public" ON public.hotels
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "hotels_write_admin" ON public.hotels
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "airlines_read_public" ON public.airlines
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "airlines_write_admin" ON public.airlines
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3.4 Bank Accounts
CREATE POLICY "bank_accounts_read" ON public.bank_accounts
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "bank_accounts_write" ON public.bank_accounts
    FOR ALL TO authenticated
    USING (public.is_super_admin() OR (public.get_auth_role() = 'admin' AND branch_id = public.get_auth_branch_id()))
    WITH CHECK (public.is_super_admin() OR (public.get_auth_role() = 'admin' AND branch_id = public.get_auth_branch_id()));

-- 3.5 Packages
CREATE POLICY "packages_read_policy" ON public.packages
    FOR SELECT TO anon, authenticated
    USING (
        status = 'published' OR 
        public.is_super_admin() OR 
        (public.get_auth_role() = 'admin' AND branch_id = public.get_auth_branch_id())
    );

CREATE POLICY "packages_write_policy" ON public.packages
    FOR ALL TO authenticated
    USING (public.can_access_branch(branch_id))
    WITH CHECK (public.can_access_branch(branch_id));

-- 3.6 Agents
CREATE POLICY "agents_select_policy" ON public.agents
    FOR SELECT TO authenticated
    USING (
        public.can_access_branch(branch_id) OR
        profile_id = auth.uid()
    );

CREATE POLICY "agents_write_policy" ON public.agents
    FOR ALL TO authenticated
    USING (public.can_access_branch(branch_id))
    WITH CHECK (public.can_access_branch(branch_id));

-- 3.7 Guides
CREATE POLICY "guides_select_policy" ON public.guides
    FOR SELECT TO authenticated
    USING (
        public.can_access_branch(branch_id) OR
        profile_id = auth.uid()
    );

CREATE POLICY "guides_write_policy" ON public.guides
    FOR ALL TO authenticated
    USING (public.can_access_branch(branch_id))
    WITH CHECK (public.can_access_branch(branch_id));

-- 3.8 Pilgrims
CREATE POLICY "pilgrims_select_policy" ON public.pilgrims
    FOR SELECT TO authenticated
    USING (
        public.can_access_branch(branch_id) OR
        profile_id = auth.uid() OR
        agent_id IN (SELECT id FROM public.agents WHERE profile_id = auth.uid()) OR
        id IN (
            SELECT r.pilgrim_id FROM public.registrations r
            JOIN public.packages pkg ON r.package_id = pkg.id
            JOIN public.guides g ON r.guide_id = g.id
            WHERE g.profile_id = auth.uid()
        )
    );

CREATE POLICY "pilgrims_insert_policy" ON public.pilgrims
    FOR INSERT TO authenticated
    WITH CHECK (
        public.can_access_branch(branch_id) OR
        agent_id IN (SELECT id FROM public.agents WHERE profile_id = auth.uid())
    );

CREATE POLICY "pilgrims_update_policy" ON public.pilgrims
    FOR UPDATE TO authenticated
    USING (
        public.can_access_branch(branch_id) OR
        profile_id = auth.uid() OR
        agent_id IN (SELECT id FROM public.agents WHERE profile_id = auth.uid())
    );

CREATE POLICY "pilgrims_delete_policy" ON public.pilgrims
    FOR DELETE TO authenticated
    USING (public.can_access_branch(branch_id));

-- 3.9 Registrations
CREATE POLICY "registrations_select_policy" ON public.registrations
    FOR SELECT TO authenticated
    USING (
        public.can_access_branch(branch_id) OR
        pilgrim_id IN (SELECT id FROM public.pilgrims WHERE profile_id = auth.uid()) OR
        agent_id IN (SELECT id FROM public.agents WHERE profile_id = auth.uid()) OR
        guide_id IN (SELECT id FROM public.guides WHERE profile_id = auth.uid())
    );

CREATE POLICY "registrations_write_policy" ON public.registrations
    FOR ALL TO authenticated
    USING (public.can_access_branch(branch_id))
    WITH CHECK (public.can_access_branch(branch_id));

-- 3.10 Documents
CREATE POLICY "documents_select_policy" ON public.documents
    FOR SELECT TO authenticated
    USING (
        public.is_admin() OR
        pilgrim_id IN (SELECT id FROM public.pilgrims WHERE profile_id = auth.uid()) OR
        pilgrim_id IN (SELECT id FROM public.pilgrims WHERE agent_id IN (SELECT id FROM public.agents WHERE profile_id = auth.uid()))
    );

CREATE POLICY "documents_insert_policy" ON public.documents
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_admin() OR
        pilgrim_id IN (SELECT id FROM public.pilgrims WHERE profile_id = auth.uid()) OR
        pilgrim_id IN (SELECT id FROM public.pilgrims WHERE agent_id IN (SELECT id FROM public.agents WHERE profile_id = auth.uid()))
    );

CREATE POLICY "documents_update_policy" ON public.documents
    FOR UPDATE TO authenticated
    USING (
        public.is_admin() OR
        pilgrim_id IN (SELECT id FROM public.pilgrims WHERE profile_id = auth.uid()) OR
        pilgrim_id IN (SELECT id FROM public.pilgrims WHERE agent_id IN (SELECT id FROM public.agents WHERE profile_id = auth.uid()))
    );

-- 3.11 Payments
CREATE POLICY "payments_select_policy" ON public.payments
    FOR SELECT TO authenticated
    USING (
        public.can_access_branch(branch_id) OR
        registration_id IN (
            SELECT r.id FROM public.registrations r
            JOIN public.pilgrims p ON r.pilgrim_id = p.id
            WHERE p.profile_id = auth.uid() OR r.agent_id IN (SELECT id FROM public.agents WHERE profile_id = auth.uid())
        )
    );

CREATE POLICY "payments_write_policy" ON public.payments
    FOR ALL TO authenticated
    USING (public.can_access_branch(branch_id))
    WITH CHECK (public.can_access_branch(branch_id));

-- 3.12 Manasik Schedules & Attendances
CREATE POLICY "manasik_schedules_select" ON public.manasik_schedules
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "manasik_schedules_write" ON public.manasik_schedules
    FOR ALL TO authenticated
    USING (public.can_access_branch(branch_id))
    WITH CHECK (public.can_access_branch(branch_id));

CREATE POLICY "manasik_attendances_select" ON public.manasik_attendances
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "manasik_attendances_write" ON public.manasik_attendances
    FOR ALL TO authenticated
    USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.manasik_schedules s
            JOIN public.guides g ON s.guide_id = g.id
            WHERE s.id = manasik_schedule_id AND g.profile_id = auth.uid()
        )
    );

-- 3.13 Manifest Entries & Rooming
CREATE POLICY "manifest_entries_select" ON public.manifest_entries
    FOR SELECT TO authenticated
    USING (
        public.is_admin() OR
        registration_id IN (
            SELECT r.id FROM public.registrations r
            JOIN public.pilgrims p ON r.pilgrim_id = p.id
            WHERE p.profile_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.registrations r
            JOIN public.guides g ON r.guide_id = g.id
            WHERE r.id = registration_id AND g.profile_id = auth.uid()
        )
    );

CREATE POLICY "manifest_entries_write" ON public.manifest_entries
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3.14 Equipment Distributions
CREATE POLICY "equipment_distributions_select" ON public.equipment_distributions
    FOR SELECT TO authenticated
    USING (
        public.is_admin() OR
        registration_id IN (
            SELECT r.id FROM public.registrations r
            JOIN public.pilgrims p ON r.pilgrim_id = p.id
            WHERE p.profile_id = auth.uid()
        )
    );

CREATE POLICY "equipment_distributions_write" ON public.equipment_distributions
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3.15 Commissions
CREATE POLICY "commissions_select_policy" ON public.commissions
    FOR SELECT TO authenticated
    USING (
        public.can_access_branch(branch_id) OR
        agent_id IN (SELECT id FROM public.agents WHERE profile_id = auth.uid())
    );

CREATE POLICY "commissions_write_policy" ON public.commissions
    FOR ALL TO authenticated
    USING (public.can_access_branch(branch_id))
    WITH CHECK (public.can_access_branch(branch_id));

-- 3.16 Announcements
CREATE POLICY "announcements_select_policy" ON public.announcements
    FOR SELECT TO authenticated
    USING (
        is_published = TRUE AND (
            audience = 'all' OR
            (audience = 'staff' AND public.get_auth_role() IN ('super_admin', 'admin')) OR
            (audience = 'agents' AND public.get_auth_role() = 'agent') OR
            (audience = 'pilgrims' AND public.get_auth_role() = 'pilgrim') OR
            (audience = 'guides' AND public.get_auth_role() = 'guide')
        )
    );

CREATE POLICY "announcements_write_policy" ON public.announcements
    FOR ALL TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3.17 Settings
CREATE POLICY "settings_select_policy" ON public.settings
    FOR SELECT TO anon, authenticated
    USING (TRUE);

CREATE POLICY "settings_write_policy" ON public.settings
    FOR ALL TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- 3.18 Activity Logs
CREATE POLICY "activity_logs_select_policy" ON public.activity_logs
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin() OR
        (public.get_auth_role() = 'admin' AND branch_id = public.get_auth_branch_id())
    );

CREATE POLICY "activity_logs_insert_policy" ON public.activity_logs
    FOR INSERT TO authenticated
    WITH CHECK (TRUE);


-- ==============================================================================
-- 03_rpc_functions.sql
-- Sistem Manajemen Travel Umroh & Haji
-- High-Performance Database Functions & Concurrency-Protected RPCs
-- ==============================================================================

-- 1. RPC: book_registration
-- Concurrency protected with 'FOR UPDATE' row lock on packages
CREATE OR REPLACE FUNCTION public.book_registration(
    p_pilgrim_id BIGINT,
    p_package_id BIGINT,
    p_agent_id BIGINT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pkg RECORD;
    v_pilgrim RECORD;
    v_booked_count INT;
    v_reg_id BIGINT;
    v_reg_code VARCHAR(50);
    v_branch_id BIGINT;
    v_agent_rate NUMERIC(5, 2);
    v_comm_amount NUMERIC(15, 2);
BEGIN
    -- 1. Row-lock package record to prevent race conditions & overbooking
    SELECT * INTO v_pkg FROM public.packages WHERE id = p_package_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Paket perjalanan ID % tidak ditemukan.', p_package_id;
    END IF;

    -- 2. Validate quota availability
    SELECT COUNT(*) INTO v_booked_count 
    FROM public.registrations 
    WHERE package_id = p_package_id AND status != 'cancelled';

    IF v_booked_count >= v_pkg.quota THEN
        RAISE EXCEPTION 'KUOTA_PENUH: Kuota paket (%) telah terisi penuh (%/% kursi).', 
            v_pkg.name, v_booked_count, v_pkg.quota;
    END IF;

    -- 3. Get pilgrim branch
    SELECT * INTO v_pilgrim FROM public.pilgrims WHERE id = p_pilgrim_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Data jamaah ID % tidak ditemukan.', p_pilgrim_id;
    END IF;
    v_branch_id := v_pilgrim.branch_id;

    -- 4. Generate unique registration code: REG-XXXXXX
    v_reg_code := 'REG-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));

    -- 5. Insert registration
    INSERT INTO public.registrations (
        branch_id,
        pilgrim_id,
        package_id,
        agent_id,
        code,
        status,
        total_price,
        registered_at,
        notes
    ) VALUES (
        v_branch_id,
        p_pilgrim_id,
        p_package_id,
        p_agent_id,
        v_reg_code,
        'pending',
        v_pkg.price,
        CURRENT_DATE,
        p_notes
    ) RETURNING id INTO v_reg_id;

    -- 6. Calculate & insert agent commission if referral exists
    IF p_agent_id IS NOT NULL THEN
        SELECT commission_rate INTO v_agent_rate FROM public.agents WHERE id = p_agent_id;
        IF FOUND AND v_agent_rate > 0 THEN
            v_comm_amount := (v_pkg.price * v_agent_rate) / 100.0;
            INSERT INTO public.commissions (
                branch_id,
                agent_id,
                registration_id,
                base_amount,
                rate,
                amount,
                status
            ) VALUES (
                v_branch_id,
                p_agent_id,
                v_reg_id,
                v_pkg.price,
                v_agent_rate,
                v_comm_amount,
                'pending'
            );
        END IF;
    END IF;

    -- 7. Auto-generate standard document checklist
    INSERT INTO public.documents (pilgrim_id, type, label, status)
    VALUES 
        (p_pilgrim_id, 'ktp', 'KTP Asli / e-KTP', 'pending'),
        (p_pilgrim_id, 'kk', 'Kartu Keluarga (KK)', 'pending'),
        (p_pilgrim_id, 'paspor', 'Paspor Asli (Masa Berlaku Min. 7 Bulan)', 'pending'),
        (p_pilgrim_id, 'foto', 'Pas Foto 4x6 Latar Putih (Wajah 80%)', 'pending'),
        (p_pilgrim_id, 'buku_nikah', 'Buku Nikah / Akta Kelahiran', 'pending'),
        (p_pilgrim_id, 'vaksin', 'Sertifikat Vaksin Meningitis', 'pending')
    ON CONFLICT DO NOTHING;

    -- 8. Auto-generate standard equipment checklist
    INSERT INTO public.equipment_distributions (registration_id, item, quantity, status)
    VALUES
        (v_reg_id, 'Koper Bagasi 24 Inch', 1, 'pending'),
        (v_reg_id, 'Koper Kabin 20 Inch', 1, 'pending'),
        (v_reg_id, 'Tas Paspor & Dokumen', 1, 'pending'),
        (v_reg_id, 'Seragam Batik Travel', 1, 'pending'),
        (v_reg_id, 'Kain Ihram (Pria) / Mukena (Wanita)', 1, 'pending'),
        (v_reg_id, 'Buku Doa & Panduan Manasik', 1, 'pending'),
        (v_reg_id, 'Tali ID Card Jamaah', 1, 'pending');

    RETURN jsonb_build_object(
        'success', true,
        'registration_id', v_reg_id,
        'code', v_reg_code,
        'message', 'Pendaftaran berhasil dibuat dan kuota terproteksi.'
    );
END;
$$;

-- 2. RPC: record_payment
-- Atomic cashier payment update with auto status recalculation
CREATE OR REPLACE FUNCTION public.record_payment(
    p_payment_id BIGINT,
    p_amount NUMERIC(15, 2),
    p_method payment_method_enum,
    p_bank_account_id BIGINT DEFAULT NULL,
    p_proof_path TEXT DEFAULT NULL,
    p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pay RECORD;
    v_new_paid NUMERIC(15, 2);
    v_new_status payment_status_enum;
BEGIN
    -- 1. Row-lock payment record
    SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tagihan pembayaran ID % tidak ditemukan.', p_payment_id;
    END IF;

    IF v_pay.status = 'paid' THEN
        RAISE EXCEPTION 'Tagihan pembayaran ini sudah berstatus LUNAS.';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Nominal pembayaran harus lebih besar dari 0.';
    END IF;

    v_new_paid := v_pay.paid_amount + p_amount;
    
    -- Prevent silent overpayment
    IF v_new_paid > v_pay.amount THEN
        RAISE EXCEPTION 'Nominal pembayaran melebihi sisa tagihan. Maksimal pembayaran: %', (v_pay.amount - v_pay.paid_amount);
    END IF;

    -- 2. Calculate status
    IF v_new_paid >= v_pay.amount THEN
        v_new_status := 'paid';
    ELSE
        v_new_status := 'partial';
    END IF;

    -- 3. Update payment
    UPDATE public.payments SET
        paid_amount = v_new_paid,
        status = v_new_status,
        paid_at = NOW(),
        method = p_method,
        bank_account_id = p_bank_account_id,
        recorded_by = auth.uid(),
        proof_path = COALESCE(p_proof_path, proof_path),
        note = COALESCE(p_note, note),
        updated_at = NOW()
    WHERE id = p_payment_id;

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', p_payment_id,
        'paid_amount', v_new_paid,
        'status', v_new_status,
        'message', 'Pembayaran kasir berhasil dicatat.'
    );
END;
$$;

-- 3. RPC: generate_bill_schedule
-- Generates down payment and installment invoices with rounding remainder absorption
CREATE OR REPLACE FUNCTION public.generate_bill_schedule(
    p_registration_id BIGINT,
    p_down_payment NUMERIC(15, 2),
    p_installments_count INT,
    p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_reg RECORD;
    v_remaining NUMERIC(15, 2);
    v_monthly_base NUMERIC(15, 2);
    v_remainder NUMERIC(15, 2);
    v_current_amount NUMERIC(15, 2);
    v_due_date DATE;
    v_code VARCHAR(50);
    v_count INT := 0;
    i INT;
BEGIN
    SELECT * INTO v_reg FROM public.registrations WHERE id = p_registration_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Registrasi ID % tidak ditemukan.', p_registration_id;
    END IF;

    -- 1. Insert Down Payment (DP) if applicable
    IF p_down_payment > 0 THEN
        v_code := 'INV-DP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        INSERT INTO public.payments (
            branch_id,
            registration_id,
            code,
            type,
            amount,
            paid_amount,
            status,
            due_date
        ) VALUES (
            v_reg.branch_id,
            p_registration_id,
            v_code,
            'down_payment',
            p_down_payment,
            0.00,
            'unpaid',
            CURRENT_DATE + INTERVAL '7 days'
        );
        v_count := v_count + 1;
    END IF;

    -- 2. Calculate Installments
    v_remaining := v_reg.total_price - p_down_payment;
    IF v_remaining > 0 AND p_installments_count > 0 THEN
        v_monthly_base := FLOOR(v_remaining / p_installments_count);
        v_remainder := v_remaining - (v_monthly_base * p_installments_count);

        FOR i IN 1..p_installments_count LOOP
            -- Absorb rounding remainder on last installment
            IF i = p_installments_count THEN
                v_current_amount := v_monthly_base + v_remainder;
            ELSE
                v_current_amount := v_monthly_base;
            END IF;

            v_due_date := p_start_date + ((i - 1) * INTERVAL '1 month');
            v_code := 'INV-CICIL-' || i || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

            INSERT INTO public.payments (
                branch_id,
                registration_id,
                code,
                type,
                amount,
                paid_amount,
                status,
                due_date
            ) VALUES (
                v_reg.branch_id,
                p_registration_id,
                v_code,
                'installment',
                v_current_amount,
                0.00,
                'unpaid',
                v_due_date
            );
            v_count := v_count + 1;
        END LOOP;
    ELSIF v_remaining > 0 AND p_installments_count = 0 AND p_down_payment = 0 THEN
        -- Full single payment
        v_code := 'INV-FULL-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        INSERT INTO public.payments (
            branch_id,
            registration_id,
            code,
            type,
            amount,
            paid_amount,
            status,
            due_date
        ) VALUES (
            v_reg.branch_id,
            p_registration_id,
            v_code,
            'full_payment',
            v_reg.total_price,
            0.00,
            'unpaid',
            CURRENT_DATE + INTERVAL '14 days'
        );
        v_count := v_count + 1;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'bills_generated', v_count,
        'message', format('%s tagihan pembayaran berhasil di-generate.', v_count)
    );
END;
$$;

-- 4. RPC: get_dashboard_summary
-- Aggregated statistical metrics for super admin / branch admin dashboard
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_branch_id BIGINT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_pilgrims BIGINT;
    v_active_registrations BIGINT;
    v_revenue_collected NUMERIC(15, 2);
    v_outstanding_bills NUMERIC(15, 2);
    v_payment_status_breakdown JSONB;
BEGIN
    -- Total Pilgrims
    SELECT COUNT(*) INTO v_total_pilgrims
    FROM public.pilgrims
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id) AND is_active = TRUE;

    -- Active Registrations
    SELECT COUNT(*) INTO v_active_registrations
    FROM public.registrations
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id) AND status IN ('pending', 'confirmed');

    -- Total Revenue Collected
    SELECT COALESCE(SUM(paid_amount), 0) INTO v_revenue_collected
    FROM public.payments
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id);

    -- Total Outstanding Bills
    SELECT COALESCE(SUM(amount - paid_amount), 0) INTO v_outstanding_bills
    FROM public.payments
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id) AND status != 'paid';

    -- Payment status counts
    SELECT jsonb_build_object(
        'paid', COUNT(*) FILTER (WHERE status = 'paid'),
        'partial', COUNT(*) FILTER (WHERE status = 'partial'),
        'unpaid', COUNT(*) FILTER (WHERE status = 'unpaid')
    ) INTO v_payment_status_breakdown
    FROM public.payments
    WHERE (p_branch_id IS NULL OR branch_id = p_branch_id);

    RETURN jsonb_build_object(
        'total_pilgrims', v_total_pilgrims,
        'active_registrations', v_active_registrations,
        'revenue_collected', v_revenue_collected,
        'outstanding_bills', v_outstanding_bills,
        'payment_status_breakdown', v_payment_status_breakdown
    );
END;
$$;


-- ==============================================================================
-- 04_seed_data.sql
-- Sistem Manajemen Travel Umroh & Haji
-- Comprehensive Indonesian Travel Seed Data & Realistic Demos
-- ==============================================================================

-- 1. SYSTEM SETTINGS (WHITE-LABEL CONFIG)
INSERT INTO public.settings (key, value, group_name) VALUES
    ('app_name', 'Al-Madinah Tour & Travel', 'branding'),
    ('app_tagline', 'Melayani Tamu Allah dengan Amanah & Sepenuh Hati', 'branding'),
    ('primary_color', '#059669', 'branding'),
    ('secondary_color', '#d97706', 'branding'),
    ('company_email', 'info@almadinahtravel.com', 'contact'),
    ('company_phone', '+62 812-3456-7890', 'contact'),
    ('company_address', 'Jl. M.H. Thamrin No. 12, Menteng, Jakarta Pusat, DKI Jakarta 10350', 'contact'),
    ('footer_copyright', '© 2026 PT Al-Madinah Tour & Travel. Seluruh Hak Cipta Dilindungi.', 'branding')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. BRANCHES (CABANG)
INSERT INTO public.branches (id, code, name, phone, email, address, city, is_head_office, is_active) VALUES
    (1, 'HO-JKT', 'Kantor Pusat Jakarta', '021-3901234', 'pusat@almadinahtravel.com', 'Jl. M.H. Thamrin No. 12, Menteng', 'Jakarta Pusat', TRUE, TRUE),
    (2, 'CAB-SBY', 'Cabang Surabaya', '031-5678901', 'surabaya@almadinahtravel.com', 'Jl. Raya Darmo No. 45, Wonokromo', 'Surabaya', FALSE, TRUE),
    (3, 'CAB-BDG', 'Cabang Bandung', '022-4209876', 'bandung@almadinahtravel.com', 'Jl. Ir. H. Djuanda No. 88, Dago', 'Bandung', FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('branches_id_seq', (SELECT MAX(id) FROM public.branches));

-- 3. HOTELS
INSERT INTO public.hotels (id, name, city, star_rating, distance_to_masjid, address, is_active) VALUES
    (1, 'Swissôtel Al Maqam Makkah', 'makkah', 5, 50, 'Abraj Al Bait Complex, King Abdul Aziz Endowment, Makkah', TRUE),
    (2, 'Pullman Zamzam Makkah', 'makkah', 5, 80, 'Abraj Al Bait Complex, Makkah', TRUE),
    (3, 'Dar Al Taqwa Hotel Madinah', 'madinah', 5, 30, 'Off King Fahd Gates, Northern Central Area, Madinah', TRUE),
    (4, 'Madinah Hilton Hotel', 'madinah', 5, 70, 'King Fahad Street, Madinah', TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('hotels_id_seq', (SELECT MAX(id) FROM public.hotels));

-- 4. AIRLINES
INSERT INTO public.airlines (id, name, code, transit, is_active) VALUES
    (1, 'Garuda Indonesia', 'GA-980', 'Direct CGK - JED', TRUE),
    (2, 'Saudia Airlines', 'SV-819', 'Direct CGK - MED', TRUE),
    (3, 'Emirates', 'EK-357', 'Transit Dubai (DXB)', TRUE),
    (4, 'Qatar Airways', 'QR-959', 'Transit Doha (DOH)', TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('airlines_id_seq', (SELECT MAX(id) FROM public.airlines));

-- 5. BANK ACCOUNTS
INSERT INTO public.bank_accounts (id, branch_id, bank_name, account_number, account_holder, branch_office, is_active) VALUES
    (1, 1, 'Bank Syariah Indonesia (BSI)', '7001234567', 'PT Al-Madinah Wisata Syariah', 'KCP Thamrin Jakarta', TRUE),
    (2, 1, 'Bank Mandiri', '1230009876543', 'PT Al-Madinah Wisata Syariah', 'KCP Kebon Sirih Jakarta', TRUE),
    (3, 2, 'BCA Syariah', '0112345678', 'PT Al-Madinah Wisata Syariah', 'KCP Darmo Surabaya', TRUE)
ON CONFLICT (id) DO UPDATE SET bank_name = EXCLUDED.bank_name;

SELECT setval('bank_accounts_id_seq', (SELECT MAX(id) FROM public.bank_accounts));

-- 6. PACKAGES
INSERT INTO public.packages (
    id, branch_id, name, type, status, price, quota, duration_days,
    departure_date, return_date, departure_city,
    hotel_makkah_id, hotel_madinah_id, airline_id,
    facility_included, facility_excluded
) VALUES
    (1, 1, 'Umroh Reguler Syawal 1447H (9 Hari)', 'umroh', 'published', 29500000.00, 45, 9,
     '2026-10-15', '2026-10-24', 'Jakarta', 1, 3, 2,
     'Tiket PP Saudia Airlines, Hotel Makkah Swissotel & Madinah Dar Al Taqwa, Visa Umroh, Makan 3x Sehari Fullboard Menu Indonesia, Bus AC Eksekutif, Handling & Asuransi Perjalanan',
     'Pembuatan Paspor, Pengeluaran Pribadi, Kelebihan Bagasi'),

    (2, 1, 'Umroh Ramadhan Berkah I’tikaf 12 Hari', 'umroh', 'published', 42000000.00, 40, 12,
     '2026-11-05', '2026-11-17', 'Jakarta', 2, 4, 1,
     'Tiket PP Garuda Indonesia, Hotel Bintang 5 Dekat Masjid, Fullboard Sahur & Iftar, Bimbingan I’tikaf, Muthawif Berpengalaman',
     'Laundry Pribadi, Biaya Medical Check Up Khusus'),

    (3, 1, 'Haji Khusus Furoda VIP Langsung Berangkat', 'haji_khusus', 'published', 265000000.00, 20, 25,
     '2027-05-20', '2027-06-14', 'Jakarta', 1, 3, 1,
     'Visa Haji Mujamalah Resmi, Maktab VIP Tenda Ber-AC Mina & Arafah, Kereta Cepat Haramain, Hotel Dekat Masjid, Ziarah Makkah & Madinah',
     'Dam Tamattu, Pengeluaran Pribadi'),

    (4, 2, 'Umroh Plus Turki Musim Gugur 12 Hari', 'umroh', 'published', 36500000.00, 35, 12,
     '2026-11-20', '2026-12-02', 'Surabaya', 1, 4, 3,
     'City Tour Istanbul, Bosphorus Cruise, Hotel Bintang 5 Turki & Saudi, Visa Turki & Umroh, Bus Pariwisata VIP',
     'Optional Tour Balon Udara Cappadocia')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('packages_id_seq', (SELECT MAX(id) FROM public.packages));

-- 7. DEFAULT AUTH USERS (PASSWORD: Password123!)
-- Insert into auth.users safely with bcrypt hash
DO $$
DECLARE
    v_user_super UUID := '11111111-1111-1111-1111-111111111111';
    v_user_admin_jkt UUID := '22222222-2222-2222-2222-222222222222';
    v_user_admin_sby UUID := '33333333-3333-3333-3333-333333333333';
    v_user_agent UUID := '44444444-4444-4444-4444-444444444444';
    v_user_guide UUID := '55555555-5555-5555-5555-555555555555';
    v_user_pilgrim UUID := '66666666-6666-6666-6666-666666666666';
    v_encrypted_pw TEXT := crypt('Password123!', gen_salt('bf'));
BEGIN
    -- Super Admin User
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        v_user_super, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'superadmin@travel.com', v_encrypted_pw, NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Ustadz H. Abdullah (Super Admin)","role":"super_admin","branch_id":1,"phone":"081211112222"}',
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    -- Admin Jakarta User
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        v_user_admin_jkt, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin.jakarta@travel.com', v_encrypted_pw, NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Siti Rahma (Admin Jakarta)","role":"admin","branch_id":1,"phone":"081233334444"}',
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    -- Admin Surabaya User
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        v_user_admin_sby, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin.surabaya@travel.com', v_encrypted_pw, NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Bambang Prakoso (Admin Surabaya)","role":"admin","branch_id":2,"phone":"081255556666"}',
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    -- Agent User
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        v_user_agent, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'agen.ahmad@travel.com', v_encrypted_pw, NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Ahmad Fauzi (Mitra Agen)","role":"agent","branch_id":1,"phone":"081277778888"}',
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    -- Guide User
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        v_user_guide, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'muthawif.fadli@travel.com', v_encrypted_pw, NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Ustadz Fadli Rahman (Muthawif)","role":"guide","branch_id":1,"phone":"081299990000"}',
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    -- Pilgrim User
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
        v_user_pilgrim, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'jamaah.budi@travel.com', v_encrypted_pw, NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Budi Santoso (Calon Jamaah)","role":"pilgrim","branch_id":1,"phone":"081312345678"}',
        NOW(), NOW()
    ) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

    -- Ensure profiles are populated and synchronized
    INSERT INTO public.profiles (id, email, name, role, branch_id, phone, is_active) VALUES
        (v_user_super, 'superadmin@travel.com', 'Ustadz H. Abdullah (Super Admin)', 'super_admin', 1, '081211112222', TRUE),
        (v_user_admin_jkt, 'admin.jakarta@travel.com', 'Siti Rahma (Admin Jakarta)', 'admin', 1, '081233334444', TRUE),
        (v_user_admin_sby, 'admin.surabaya@travel.com', 'Bambang Prakoso (Admin Surabaya)', 'admin', 2, '081255556666', TRUE),
        (v_user_agent, 'agen.ahmad@travel.com', 'Ahmad Fauzi (Mitra Agen)', 'agent', 1, '081277778888', TRUE),
        (v_user_guide, 'muthawif.fadli@travel.com', 'Ustadz Fadli Rahman (Muthawif)', 'guide', 1, '081299990000', TRUE),
        (v_user_pilgrim, 'jamaah.budi@travel.com', 'Budi Santoso (Calon Jamaah)', 'pilgrim', 1, '081312345678', TRUE)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        branch_id = EXCLUDED.branch_id,
        phone = EXCLUDED.phone;
END $$;

-- 8. AGENTS & GUIDES TABLES
INSERT INTO public.agents (id, branch_id, profile_id, code, name, phone, email, commission_rate, is_active) VALUES
    (1, 1, '44444444-4444-4444-4444-444444444444', 'AGN-001', 'Ahmad Fauzi', '081277778888', 'agen.ahmad@travel.com', 5.00, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('agents_id_seq', (SELECT MAX(id) FROM public.agents));

INSERT INTO public.guides (id, branch_id, profile_id, name, phone, email, is_active) VALUES
    (1, 1, '55555555-5555-5555-5555-555555555555', 'Ustadz Fadli Rahman', '081299990000', 'muthawif.fadli@travel.com', TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('guides_id_seq', (SELECT MAX(id) FROM public.guides));

-- 9. PILGRIMS (JAMAAH)
INSERT INTO public.pilgrims (
    id, branch_id, agent_id, profile_id, code, nik, passport_number, passport_expiry,
    name, gender, birth_place, birth_date, phone, address,
    emergency_contact_name, emergency_contact_phone, health_notes, is_active
) VALUES
    (1, 1, 1, '66666666-6666-6666-6666-666666666666', 'PLG-2026-001', '3201011508850001', 'B8923412', '2031-08-15',
     'Budi Santoso', 'male', 'Jakarta', '1985-08-15', '081312345678', 'Jl. Tebet Barat Raya No. 4, Jakarta Selatan',
     'Hj. Sulastri', '081398765432', 'Riwayat asam lambung ringan, tidak ada alergi obat.', TRUE),

    (2, 1, 1, NULL, 'PLG-2026-002', '3201015609870002', 'B8923413', '2031-09-20',
     'Siti Aminah', 'female', 'Bandung', '1987-09-16', '081387654321', 'Jl. Tebet Barat Raya No. 4, Jakarta Selatan',
     'Budi Santoso', '081312345678', 'Kondisi sehat wal afiat.', TRUE),

    (3, 1, NULL, NULL, 'PLG-2026-003', '3578011204700005', 'B7623190', '2030-05-10',
     'H. Bambang Gunawan', 'male', 'Surabaya', '1970-04-12', '081298761234', 'Jl. Darmo Permai II No. 15, Surabaya',
     'Dewi Lestari', '081298764321', 'Riwayat hipertensi terkontrol, membawa obat rutin.', TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Set mahram relation for Siti Aminah (Suami: Budi Santoso)
UPDATE public.pilgrims SET mahram_id = 1, mahram_status = 'Istri' WHERE id = 2;

SELECT setval('pilgrims_id_seq', (SELECT MAX(id) FROM public.pilgrims));

-- 10. REGISTRATIONS (BOOKINGS)
INSERT INTO public.registrations (
    id, branch_id, pilgrim_id, package_id, agent_id, guide_id, code, status, total_price, registered_at, notes
) VALUES
    (1, 1, 1, 1, 1, 1, 'REG-SYAWAL-001', 'confirmed', 29500000.00, '2026-09-01', 'Pendaftaran rombongan keluarga Pak Budi'),
    (2, 1, 2, 1, 1, 1, 'REG-SYAWAL-002', 'confirmed', 29500000.00, '2026-09-01', 'Istri Pak Budi Santoso (kamar Quad)'),
    (3, 1, 3, 3, NULL, NULL, 'REG-FURODA-001', 'pending', 265000000.00, '2026-09-10', 'Pendaftaran Haji Khusus Furoda VIP')
ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code;

SELECT setval('registrations_id_seq', (SELECT MAX(id) FROM public.registrations));

-- 11. PAYMENTS (TAGIHAN & PEMBAYARAN)
INSERT INTO public.payments (
    id, branch_id, registration_id, code, type, amount, paid_amount, status, due_date, paid_at, method, bank_account_id, note
) VALUES
    (1, 1, 1, 'INV-DP-001', 'down_payment', 10000000.00, 10000000.00, 'paid', '2026-09-07', '2026-09-02 10:30:00+07', 'transfer', 1, 'DP Umroh Lunas via BSI'),
    (2, 1, 1, 'INV-CICIL-1', 'installment', 9750000.00, 9750000.00, 'paid', '2026-09-25', '2026-09-20 14:15:00+07', 'transfer', 1, 'Cicilan 1 via BSI'),
    (3, 1, 1, 'INV-CICIL-2', 'installment', 9750000.00, 0.00, 'unpaid', '2026-10-05', NULL, NULL, NULL, 'Jatuh tempo pelunasan sebelum berangkat'),

    (4, 1, 2, 'INV-DP-002', 'down_payment', 10000000.00, 10000000.00, 'paid', '2026-09-07', '2026-09-02 10:35:00+07', 'transfer', 1, 'DP Umroh Bu Siti Lunas'),
    (5, 1, 2, 'INV-CICIL-3', 'installment', 19500000.00, 0.00, 'unpaid', '2026-10-05', NULL, NULL, NULL, 'Sisa pelunasan paket umroh'),

    (6, 1, 3, 'INV-DP-003', 'down_payment', 50000000.00, 50000000.00, 'paid', '2026-09-17', '2026-09-12 11:00:00+07', 'transfer', 2, 'DP Haji Furoda VIP Mandiri')
ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code;

SELECT setval('payments_id_seq', (SELECT MAX(id) FROM public.payments));

-- 12. DOCUMENTS
INSERT INTO public.documents (id, pilgrim_id, type, label, status, original_name, verified_at, note) VALUES
    (1, 1, 'ktp', 'KTP Asli / e-KTP', 'verified', 'ktp_budi_santoso.jpg', NOW(), 'Data NIK sesuai Disdukcapil'),
    (2, 1, 'kk', 'Kartu Keluarga (KK)', 'verified', 'kk_keluarga_budi.pdf', NOW(), 'Valid'),
    (3, 1, 'paspor', 'Paspor Asli', 'verified', 'paspor_budi.pdf', NOW(), 'Masa berlaku hingga 2031'),
    (4, 1, 'foto', 'Pas Foto 4x6 Latar Putih', 'verified', 'foto_budi.jpg', NOW(), 'Foto resmi 80% wajah'),
    (5, 1, 'buku_nikah', 'Buku Nikah', 'verified', 'buku_nikah_budi.pdf', NOW(), 'Sesuai buku KUA'),
    (6, 1, 'vaksin', 'Sertifikat Vaksin Meningitis', 'uploaded', 'sertifikat_vaksin_meningitis.pdf', NULL, 'Menunggu verifikasi medis kantor kesehatan bandara')
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label;

SELECT setval('documents_id_seq', (SELECT MAX(id) FROM public.documents));

-- 13. MANASIK SCHEDULES & ATTENDANCE
INSERT INTO public.manasik_schedules (id, branch_id, package_id, guide_id, title, date, time, location, description) VALUES
    (1, 1, 1, 1, 'Bimbingan Manasik Akbar Syawal - Teori Rukun & Larangan Ihram', '2026-10-01', '08:30:00', 'Auditorium Asrama Haji Pondok Gede, Jakarta', 'Pembekalan tata cara ihram, niat di miqat, rukun tawaf dan sai, serta pembagian seragam & koper.')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

SELECT setval('manasik_schedules_id_seq', (SELECT MAX(id) FROM public.manasik_schedules));

INSERT INTO public.manasik_attendances (id, manasik_schedule_id, pilgrim_id, status) VALUES
    (1, 1, 1, 'present'),
    (2, 1, 2, 'present')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

SELECT setval('manasik_attendances_id_seq', (SELECT MAX(id) FROM public.manasik_attendances));

-- 14. MANIFEST ENTRIES
INSERT INTO public.manifest_entries (id, package_id, registration_id, room_number, room_type, bus_number, seat_number, mahram_group) VALUES
    (1, 1, 1, '804', 'quad', 'BUS-01', '12A', 'Grup Budi Santoso'),
    (2, 1, 2, '804', 'quad', 'BUS-01', '12B', 'Grup Budi Santoso')
ON CONFLICT (id) DO UPDATE SET room_number = EXCLUDED.room_number;

SELECT setval('manifest_entries_id_seq', (SELECT MAX(id) FROM public.manifest_entries));

-- 15. EQUIPMENT DISTRIBUTIONS
INSERT INTO public.equipment_distributions (id, registration_id, item, quantity, status, handed_at) VALUES
    (1, 1, 'Koper Bagasi 24 Inch', 1, 'handed_over', NOW()),
    (2, 1, 'Koper Kabin 20 Inch', 1, 'handed_over', NOW()),
    (3, 1, 'Seragam Batik Travel', 1, 'handed_over', NOW()),
    (4, 1, 'Kain Ihram (Pria)', 1, 'handed_over', NOW()),
    (5, 1, 'Buku Panduan Doa & Manasik', 1, 'handed_over', NOW()),
    (6, 2, 'Mukena Bordir Travel', 1, 'handed_over', NOW())
ON CONFLICT (id) DO UPDATE SET item = EXCLUDED.item;

SELECT setval('equipment_distributions_id_seq', (SELECT MAX(id) FROM public.equipment_distributions));

-- 16. COMMISSIONS
INSERT INTO public.commissions (id, branch_id, agent_id, registration_id, base_amount, rate, amount, status, note) VALUES
    (1, 1, 1, 1, 29500000.00, 5.00, 1475000.00, 'approved', 'Komisi pendaftaran jamaah Budi Santoso (nunggu pelunasan cicilan 2)'),
    (2, 1, 1, 2, 29500000.00, 5.00, 1475000.00, 'pending', 'Komisi pendaftaran jamaah Siti Aminah')
ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount;

SELECT setval('commissions_id_seq', (SELECT MAX(id) FROM public.commissions));

-- 17. ANNOUNCEMENTS
INSERT INTO public.announcements (id, branch_id, title, body, audience, is_published) VALUES
    (1, 1, 'Pemberitahuan Jadwal Manasik Akbar Syawal 1447H', 'Assalamu’alaikum Wr. Wb. Seluruh calon jamaah Umroh Syawal diharapkan hadir pada hari Sabtu, 1 Oktober 2026 di Auditorium Asrama Haji Pondok Gede. Seragam batik dan koper akan dibagikan langsung.', 'all', TRUE),
    (2, 1, 'Instruksi Pengumpulan Berkas Paspor Asli H-14', 'Kepada seluruh mitra agen, mohon pastikan paspor fisik jamaah sudah tiba di kantor operasional pusat paling lambat 14 hari sebelum tanggal keberangkatan untuk proses pengajuan visa elektronik muassasah.', 'agents', TRUE)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

SELECT setval('announcements_id_seq', (SELECT MAX(id) FROM public.announcements));


-- ==============================================================================
-- FIX_AUTH_USERS.sql
-- Memperbaiki Supabase GoTrue Auth Identities & Izin Schema (Versi Kompatibel UUID)
-- ==============================================================================

-- 1. Berikan hak akses penuh ke schema public untuk supabase_auth_admin (GoTrue)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin;

-- 2. Bersihkan identitas lama (jika ada) untuk ke-6 user demo agar tidak terjadi duplikasi index
DELETE FROM auth.identities 
WHERE provider = 'email' AND user_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);

-- 3. Masukkan identitas ke auth.identities dengan tipe UUID valid (gen_random_uuid()) & provider_id
INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(), -- Kolom id bertipe UUID
    id::text,          -- Kolom provider_id bertipe TEXT
    id,                -- Kolom user_id bertipe UUID
    jsonb_build_object('sub', id::text, 'email', email),
    'email',
    NOW(),
    NOW(),
    NOW()
FROM auth.users
WHERE email IN (
    'superadmin@travel.com',
    'admin.jakarta@travel.com',
    'admin.surabaya@travel.com',
    'agen.ahmad@travel.com',
    'muthawif.fadli@travel.com',
    'jamaah.budi@travel.com'
);

-- 4. Update status akun di auth.users: Terkonfirmasi & Password terenkripsi bcrypt
UPDATE auth.users 
SET 
    encrypted_password = crypt('Password123!', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    last_sign_in_at = NOW(),
    aud = 'authenticated',
    role = 'authenticated'
WHERE email IN (
    'superadmin@travel.com',
    'admin.jakarta@travel.com',
    'admin.surabaya@travel.com',
    'agen.ahmad@travel.com',
    'muthawif.fadli@travel.com',
    'jamaah.budi@travel.com'
);

-- 5. Perbarui trigger handle_new_auth_user agar aman dari error blocking
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
EXCEPTION WHEN OTHERS THEN
    -- Jangan gagalkan login jika sinkronisasi profil gagal
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
