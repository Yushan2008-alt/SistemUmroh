import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Baca konfigurasi dari .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('File .env.local tidak ditemukan di direktori proyek.');
  process.exit(1);
}

const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.includes('='))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const anon = createClient(supabaseUrl, anonKey);

const DEMO_USERS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'superadmin@travel.com',
    password: 'Password123!',
    name: 'Ustadz H. Abdullah (Super Admin)',
    role: 'super_admin',
    branch_id: 1,
    phone: '081211112222'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'admin.jakarta@travel.com',
    password: 'Password123!',
    name: 'Siti Rahma (Admin Jakarta)',
    role: 'admin',
    branch_id: 1,
    phone: '081233334444'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin.surabaya@travel.com',
    password: 'Password123!',
    name: 'Bambang Prakoso (Admin Surabaya)',
    role: 'admin',
    branch_id: 2,
    phone: '081255556666'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'agen.ahmad@travel.com',
    password: 'Password123!',
    name: 'Ahmad Fauzi (Mitra Agen)',
    role: 'agent',
    branch_id: 1,
    phone: '081277778888'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'muthawif.fadli@travel.com',
    password: 'Password123!',
    name: 'Ustadz Fadli Rahman (Muthawif)',
    role: 'guide',
    branch_id: 1,
    phone: '081299990000'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'jamaah.budi@travel.com',
    password: 'Password123!',
    name: 'Budi Santoso (Calon Jamaah)',
    role: 'pilgrim',
    branch_id: 1,
    phone: '081312345678'
  }
];

async function seedUsers() {
  console.log('===============================================================');
  console.log('  PROVISIONING 6 AKUN DEMO RESMI VIA SUPABASE AUTH ADMIN API   ');
  console.log('===============================================================\n');

  for (const user of DEMO_USERS) {
    console.log(`[+] Mendaftarkan ${user.email} (${user.role})...`);
    
    // 1. Coba create user dengan ID tetap
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        role: user.role,
        branch_id: user.branch_id,
        phone: user.phone
      }
    });

    if (createError) {
      console.warn(`    ⚠️ Catatan saat create (${user.email}): ${createError.message}`);
      // Jika user sudah ada, update password dan konfirmasi
      console.log(`    -> Mencoba update password & metadata ${user.email}...`);
      const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
          branch_id: user.branch_id,
          phone: user.phone
        }
      });
      if (updateError) {
        console.error(`    ❌ Gagal update: ${updateError.message}`);
      } else {
        console.log(`    ✅ Berhasil diperbarui.`);
      }
    } else {
      console.log(`    ✅ Berhasil dibuat dengan ID: ${createData.user.id}`);
    }

    // 2. Pastikan tabel public.profiles memiliki data yang sinkron
    const { error: profileError } = await admin.from('profiles').upsert({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      branch_id: user.branch_id,
      phone: user.phone,
      is_active: true
    });

    if (profileError) {
      console.warn(`    ⚠️ Catatan profil (${user.email}): ${profileError.message}`);
    } else {
      console.log(`    ✅ Profil database tersinkron.`);
    }

    // 3. Uji login langsung via signInWithPassword (Anon Key)
    const { data: loginData, error: loginError } = await anon.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (loginError) {
      console.error(`    ❌ Uji Login Gagal: ${loginError.message}`);
    } else {
      console.log(`    🎉 Uji Login Sukses! Token JWT valid.`);
      await anon.auth.signOut();
    }
    console.log('---------------------------------------------------------------');
  }

  console.log('\n===============================================================');
  console.log('  PROSES PROVISIONING SELESAI                                 ');
  console.log('===============================================================');
}

seedUsers().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
