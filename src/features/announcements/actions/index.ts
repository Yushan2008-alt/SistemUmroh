'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/activity-logger'
import type { AnnouncementWithRelations, AnnouncementFormData } from '../types'

export async function getAnnouncements(): Promise<AnnouncementWithRelations[]> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('announcements') as any)
    .select(`
      id,
      branch_id,
      package_id,
      created_by,
      title,
      body,
      audience,
      is_published,
      publish_at,
      expires_at,
      created_at,
      updated_at,
      branch:branches(id, name),
      package:packages(id, name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getAnnouncements] Error:', error)
    return []
  }

  return (data || []) as AnnouncementWithRelations[]
}

export async function getAnnouncementById(id: number): Promise<AnnouncementWithRelations | null> {
  const supabase = createAdminClient()

  const { data, error } = await (supabase.from('announcements') as any)
    .select(`
      id,
      branch_id,
      package_id,
      created_by,
      title,
      body,
      audience,
      is_published,
      publish_at,
      expires_at,
      created_at,
      updated_at,
      branch:branches(id, name),
      package:packages(id, name)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('[getAnnouncementById] Error:', error)
    return null
  }

  return data as AnnouncementWithRelations
}

export async function getAnnouncementFormOptions(): Promise<{
  branches: { id: number; name: string }[]
  packages: { id: number; name: string }[]
}> {
  const supabase = createAdminClient()

  const [branchesRes, packagesRes] = await Promise.all([
    (supabase.from('branches') as any).select('id, name').order('name'),
    (supabase.from('packages') as any).select('id, name').order('name'),
  ])

  return {
    branches: branchesRes.data || [],
    packages: packagesRes.data || [],
  }
}

export async function createAnnouncement(
  data: AnnouncementFormData
): Promise<{ success: boolean; message: string; id?: number }> {
  try {
    const supabase = createAdminClient()

    const payload = {
      title: data.title,
      body: data.body,
      audience: data.audience,
      branch_id: data.branch_id || null,
      package_id: data.package_id || null,
      is_published: data.is_published,
      publish_at: data.publish_at ? new Date(data.publish_at).toISOString() : new Date().toISOString(),
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
    }

    const { data: inserted, error } = await (supabase.from('announcements') as any)
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error('[createAnnouncement] Error:', error)
      return { success: false, message: 'Gagal membuat pengumuman: ' + error.message }
    }

    await logActivity({
      action: 'created',
      subject_type: 'announcement',
      subject_id: String(inserted.id),
      description: `Membuat pengumuman baru: ${data.title}`,
      properties: payload,
    })

    revalidatePath('/announcements')
    return { success: true, message: 'Pengumuman berhasil dibuat.', id: inserted.id }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}

export async function updateAnnouncement(
  id: number,
  data: AnnouncementFormData
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()

    const payload = {
      title: data.title,
      body: data.body,
      audience: data.audience,
      branch_id: data.branch_id || null,
      package_id: data.package_id || null,
      is_published: data.is_published,
      publish_at: data.publish_at ? new Date(data.publish_at).toISOString() : new Date().toISOString(),
      expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await (supabase.from('announcements') as any)
      .update(payload)
      .eq('id', id)

    if (error) {
      console.error('[updateAnnouncement] Error:', error)
      return { success: false, message: 'Gagal memperbarui pengumuman: ' + error.message }
    }

    await logActivity({
      action: 'updated',
      subject_type: 'announcement',
      subject_id: String(id),
      description: `Memperbarui pengumuman: ${data.title}`,
      properties: payload,
    })

    revalidatePath('/announcements')
    return { success: true, message: 'Pengumuman berhasil diperbarui.' }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}

export async function deleteAnnouncement(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()

    const { error } = await (supabase.from('announcements') as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[deleteAnnouncement] Error:', error)
      return { success: false, message: 'Gagal menghapus pengumuman: ' + error.message }
    }

    await logActivity({
      action: 'deleted',
      subject_type: 'announcement',
      subject_id: String(id),
      description: `Menghapus pengumuman #${id}`,
    })

    revalidatePath('/announcements')
    return { success: true, message: 'Pengumuman berhasil dihapus.' }
  } catch (err: any) {
    return { success: false, message: 'Terjadi kesalahan sistem: ' + (err.message || 'Unknown error') }
  }
}
