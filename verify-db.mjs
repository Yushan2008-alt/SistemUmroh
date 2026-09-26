import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Error: Credentials tidak ditemukan di .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function verify() {
  console.log('==================================================')
  console.log('MEMERIKSA KONEKSI & DATABASE SUPABASE...')
  console.log('Project URL:', supabaseUrl)
  console.log('==================================================\n')

  const tables = [
    'branches',
    'profiles',
    'hotels',
    'airlines',
    'bank_accounts',
    'packages',
    'agents',
    'guides',
    'pilgrims',
    'registrations',
    'documents',
    'payments',
    'settings',
  ]

  let successCount = 0
  let missingCount = 0

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: false })
      .limit(1)

    if (error) {
      console.log(`❌ Tabel '${table}': BELUM DIBUAT (${error.message})`)
      missingCount++
    } else {
      console.log(`✅ Tabel '${table}': SIAP (Ditemukan data)`)
      successCount++
    }
  }

  // Check Storage
  const { data: buckets } = await supabase.storage.listBuckets()
  const vaultExists = buckets?.some((b) => b.name === 'documents-vault')
  console.log(
    `\n📦 Storage Bucket 'documents-vault': ${
      vaultExists ? '✅ SIAP' : '❌ BELUM DIBUAT'
    }`
  )

  console.log('\n==================================================')
  if (missingCount === 0) {
    console.log('🎉 SEMPURNA: Seluruh tabel database telah aktif & terisi!')
  } else {
    console.log(`⚠️  PERHATIAN: ${missingCount} tabel belum dibuat di Supabase.`)
    console.log(
      '👉 Jalankan isi berkas supabase/FULL_DATABASE_SETUP.sql di Supabase SQL Editor.'
    )
  }
  console.log('==================================================\n')
}

verify()
