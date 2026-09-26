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
