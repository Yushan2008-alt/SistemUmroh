-- ==============================================================================
-- FIX_AUTH_USERS.sql
-- Membersihkan data akun demo yang tidak kompatibel di auth.users & auth.identities
-- Serta memastikan trigger profil dan hak akses schema public siap untuk GoTrue
-- ==============================================================================

-- 1. Berikan hak akses penuh ke schema public untuk supabase_auth_admin (GoTrue)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin;

-- 2. Bersihkan record akun demo lama dari auth.identities
DELETE FROM auth.identities 
WHERE user_id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);

-- 3. Bersihkan record akun demo lama dari auth.users
DELETE FROM auth.users 
WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666'
);

-- 4. Perbarui fungsi trigger handle_new_auth_user agar aman dan tersinkronisasi otomatis
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
    -- Jangan gagalkan pembuatan user jika terjadi konflik profil
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Pasang trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
