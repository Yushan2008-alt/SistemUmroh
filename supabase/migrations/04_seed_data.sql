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
