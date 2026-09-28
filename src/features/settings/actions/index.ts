'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity-logger'
import type { SystemSettings } from '../types'

const defaultSettings: SystemSettings = {
  app_name: 'Al-Madinah Tour & Travel',
  app_tagline: 'Melayani Tamu Allah dengan Amanah & Sepenuh Hati',
  company_phone: '+62 812-3456-7890',
  company_email: 'info@almadinahtravel.com',
  company_address: 'Jl. M.H. Thamrin No. 12, Menteng, Jakarta Pusat, DKI Jakarta 10350',
  footer_copyright: '© 2026 PT Al-Madinah Tour & Travel. Seluruh Hak Cipta Dilindungi.',
  primary_color: '#059669',
  secondary_color: '#d97706',
}

export async function getSettings(): Promise<SystemSettings> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('settings') as any)
    .select('key, value')

  if (error || !data) {
    console.error('[getSettings] Error:', error)
    return defaultSettings
  }

  const result: Record<string, string> = { ...defaultSettings }

  data.forEach((row: { key: string; value: string | null }) => {
    if (row.key && row.value !== null) {
      result[row.key] = row.value
    }
  })

  return result as unknown as SystemSettings
}

export async function updateSettings(
  payload: Partial<SystemSettings>
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()

    const upsertRows = Object.entries(payload).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
      group_name: key.includes('color') || key.includes('app') ? 'branding' : 'contact',
      updated_at: new Date().toISOString(),
    }))

    for (const row of upsertRows) {
      await (supabase.from('settings') as any)
        .upsert(row, { onConflict: 'key' })
    }

    await logActivity({
      action: 'updated',
      subject_type: 'settings',
      description: 'Memperbarui pengaturan white-label sistem',
      properties: payload,
    })

    revalidatePath('/settings')
    revalidatePath('/', 'layout')
    return { success: true, message: 'Pengaturan white-label berhasil disimpan.' }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}
