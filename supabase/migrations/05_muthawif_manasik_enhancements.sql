-- 05_muthawif_manasik_enhancements.sql
-- Migration for Muthawif (Guide) and Manasik Schedules & Attendance enhancements

-- 1. Make package_id nullable on manasik_schedules to support branch-wide manasik akbar / general sessions
DO $$
BEGIN
    ALTER TABLE public.manasik_schedules ALTER COLUMN package_id DROP NOT NULL;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- 2. Ensure index on guide_id for fast schedule and registration lookup
CREATE INDEX IF NOT EXISTS idx_manasik_schedules_guide_id ON public.manasik_schedules(guide_id);
CREATE INDEX IF NOT EXISTS idx_registrations_guide_id ON public.registrations(guide_id);
CREATE INDEX IF NOT EXISTS idx_guides_profile_id ON public.guides(profile_id);

-- 3. Ensure recorded_by column exists on manasik_attendances
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'manasik_attendances' 
        AND column_name = 'recorded_by'
    ) THEN
        ALTER TABLE public.manasik_attendances ADD COLUMN recorded_by VARCHAR(255);
    END IF;
END $$;
