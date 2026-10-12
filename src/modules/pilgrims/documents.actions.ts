'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  STANDARD_DOCUMENTS,
  type DocumentFilterParams,
  type DocumentItem,
  type PilgrimWithDocumentsSummary,
} from './types'

// Helper to determine the acting admin profile ID
async function getActingAdminProfileId(): Promise<string> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.id) {
      return user.id
    }
  } catch (err) {
    console.error('Could not get session user:', err)
  }
  // Default to Super Admin profile if unauthenticated or session expired
  return '11111111-1111-1111-1111-111111111111'
}

/**
 * Get all pilgrims with their aggregated document statuses
 */
export async function getPilgrimsWithDocumentStats(
  params?: DocumentFilterParams
): Promise<{ data: PilgrimWithDocumentsSummary[]; error?: string }> {
  try {
    const supabase = createAdminClient() as any

    let query = supabase
      .from('pilgrims')
      .select(`
        id,
        code,
        name,
        nik,
        phone,
        passport_number,
        passport_expiry,
        gender,
        branches (name),
        registrations (
          code,
          status,
          packages (name, departure_date)
        ),
        documents (
          id,
          type,
          status
        )
      `)
      .order('name', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching pilgrims documents stats:', error)
      return { data: [], error: error.message }
    }

    const items: PilgrimWithDocumentsSummary[] = (data || []).map((row: any) => {
      const activeReg = (row.registrations || []).find((r: any) => r.status !== 'cancelled') || row.registrations?.[0]
      const docs = row.documents || []

      const totalStandard = STANDARD_DOCUMENTS.length // 6
      const verifiedCount = docs.filter((d: any) => d.status === 'verified').length
      const uploadedCount = docs.filter((d: any) => d.status === 'uploaded').length
      const rejectedCount = docs.filter((d: any) => d.status === 'rejected').length
      const pendingCount = Math.max(0, totalStandard - (verifiedCount + uploadedCount + rejectedCount))

      const completionPercentage = Math.round((verifiedCount / totalStandard) * 100)

      let overallStatus: PilgrimWithDocumentsSummary['overall_status'] = 'incomplete'
      if (verifiedCount === totalStandard) {
        overallStatus = 'complete'
      } else if (rejectedCount > 0) {
        overallStatus = 'rejected'
      } else if (uploadedCount > 0) {
        overallStatus = 'in_review'
      }

      return {
        id: row.id,
        code: row.code,
        name: row.name,
        nik: row.nik,
        phone: row.phone,
        passport_number: row.passport_number,
        passport_expiry: row.passport_expiry,
        gender: row.gender,
        branch_name: row.branches?.name || 'Kantor Pusat',
        package_name: activeReg?.packages?.name || 'Belum Terdaftar Paket',
        departure_date: activeReg?.packages?.departure_date || null,
        registration_code: activeReg?.code || null,
        total_documents: totalStandard,
        verified_count: verifiedCount,
        uploaded_count: uploadedCount,
        rejected_count: rejectedCount,
        pending_count: pendingCount,
        completion_percentage: completionPercentage,
        overall_status: overallStatus,
      }
    })

    // Apply Client Filter Search & Status
    let filtered = items

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nik.includes(q) ||
          p.phone.includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.registration_code && p.registration_code.toLowerCase().includes(q))
      )
    }

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((p) => p.overall_status === params.status)
    }

    return { data: filtered }
  } catch (err: any) {
    console.error('getPilgrimsWithDocumentStats error:', err)
    return { data: [], error: err.message || 'Terjadi kesalahan sistem' }
  }
}

/**
 * Get pilgrim document details with auto-provisioning of 6 standard documents
 */
export async function getPilgrimDocuments(pilgrimId: number): Promise<{
  pilgrim: PilgrimWithDocumentsSummary | null
  documents: DocumentItem[]
  error?: string
}> {
  try {
    const supabase = createAdminClient() as any

    // 1. Fetch pilgrim info
    const { data: pilgrimData, error: pilgrimError } = await supabase
      .from('pilgrims')
      .select(`
        id,
        code,
        name,
        nik,
        phone,
        passport_number,
        passport_expiry,
        gender,
        branches (name),
        registrations (
          code,
          status,
          packages (name, departure_date)
        )
      `)
      .eq('id', pilgrimId)
      .single()

    if (pilgrimError || !pilgrimData) {
      return { pilgrim: null, documents: [], error: 'Data jamaah tidak ditemukan.' }
    }

    // 2. Fetch existing documents
    const { data: existingDocs, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('pilgrim_id', pilgrimId)

    if (docError) {
      return { pilgrim: null, documents: [], error: docError.message }
    }

    const currentDocs: any[] = existingDocs || []
    const existingTypes = new Set(currentDocs.map((d: any) => d.type))

    // 3. Auto-provision any missing standard documents
    const missingDocs = STANDARD_DOCUMENTS.filter((std) => !existingTypes.has(std.type))
    if (missingDocs.length > 0) {
      const inserts = missingDocs.map((std) => ({
        pilgrim_id: pilgrimId,
        type: std.type,
        label: std.label,
        status: 'pending',
      }))

      const { data: newDocs, error: insertError } = await supabase
        .from('documents')
        .insert(inserts)
        .select('*')

      if (!insertError && newDocs) {
        currentDocs.push(...newDocs)
      }
    }

    // 4. Fetch verifier profiles for documents that are verified
    const verifierIds = Array.from(
      new Set(currentDocs.map((d: any) => d.verified_by).filter(Boolean))
    ) as string[]

    const verifierMap: Record<string, string> = {}
    if (verifierIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', verifierIds)

      if (profiles) {
        profiles.forEach((p: any) => {
          verifierMap[p.id] = p.name
        })
      }
    }

    // 5. Generate signed URLs for documents with files
    const documents: DocumentItem[] = await Promise.all(
      currentDocs.map(async (doc: any) => {
        let signedUrl: string | null = null
        if (doc.file_path) {
          try {
            const { data: signData } = await supabase.storage
              .from('documents-vault')
              .createSignedUrl(doc.file_path, 3600) // 1 hour validity

            if (signData?.signedUrl) {
              signedUrl = signData.signedUrl
            }
          } catch (storageErr) {
            console.error('Error generating signed URL for:', doc.file_path, storageErr)
          }
        }

        return {
          id: doc.id,
          pilgrim_id: doc.pilgrim_id,
          type: doc.type,
          label: doc.label,
          file_path: doc.file_path,
          original_name: doc.original_name,
          mime_type: doc.mime_type,
          file_size: doc.file_size,
          status: doc.status,
          uploaded_at: doc.uploaded_at,
          verified_by: doc.verified_by,
          verified_at: doc.verified_at,
          note: doc.note,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          verifier_name: doc.verified_by ? verifierMap[doc.verified_by] || 'Admin Travel' : null,
          signed_url: signedUrl,
        }
      })
    )

    // Sort documents according to STANDARD_DOCUMENTS order
    const orderMap: Record<string, number> = {}
    STANDARD_DOCUMENTS.forEach((std, idx) => {
      orderMap[std.type] = idx
    })
    documents.sort((a, b) => {
      const orderA = orderMap[a.type] ?? 99
      const orderB = orderMap[b.type] ?? 99
      return orderA - orderB
    })

    // 6. Compute summary
    const activeReg = (pilgrimData.registrations || []).find((r: any) => r.status !== 'cancelled') || pilgrimData.registrations?.[0]
    const totalStandard = STANDARD_DOCUMENTS.length
    const verifiedCount = documents.filter((d) => d.status === 'verified').length
    const uploadedCount = documents.filter((d) => d.status === 'uploaded').length
    const rejectedCount = documents.filter((d) => d.status === 'rejected').length
    const pendingCount = documents.filter((d) => d.status === 'pending').length
    const completionPercentage = Math.round((verifiedCount / totalStandard) * 100)

    let overallStatus: PilgrimWithDocumentsSummary['overall_status'] = 'incomplete'
    if (verifiedCount === totalStandard) {
      overallStatus = 'complete'
    } else if (rejectedCount > 0) {
      overallStatus = 'rejected'
    } else if (uploadedCount > 0) {
      overallStatus = 'in_review'
    }

    const pilgrimSummary: PilgrimWithDocumentsSummary = {
      id: pilgrimData.id,
      code: pilgrimData.code,
      name: pilgrimData.name,
      nik: pilgrimData.nik,
      phone: pilgrimData.phone,
      passport_number: pilgrimData.passport_number,
      passport_expiry: pilgrimData.passport_expiry,
      gender: pilgrimData.gender,
      branch_name: pilgrimData.branches?.name || 'Kantor Pusat',
      package_name: activeReg?.packages?.name || 'Belum Terdaftar Paket',
      departure_date: activeReg?.packages?.departure_date || null,
      registration_code: activeReg?.code || null,
      total_documents: totalStandard,
      verified_count: verifiedCount,
      uploaded_count: uploadedCount,
      rejected_count: rejectedCount,
      pending_count: pendingCount,
      completion_percentage: completionPercentage,
      overall_status: overallStatus,
    }

    return { pilgrim: pilgrimSummary, documents }
  } catch (err: any) {
    console.error('getPilgrimDocuments error:', err)
    return { pilgrim: null, documents: [], error: err.message || 'Terjadi kesalahan sistem' }
  }
}

/**
 * Upload document file to Supabase Storage 'documents-vault'
 */
export async function uploadDocumentFile(
  pilgrimId: number,
  documentId: number,
  formData: FormData
): Promise<{ success: boolean; message: string; fileUrl?: string }> {
  try {
    const file = formData.get('file') as File | null
    if (!file || file.size === 0) {
      return { success: false, message: 'Silakan pilih berkas yang akan diunggah.' }
    }

    // 1. File Size Validation (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      return { success: false, message: 'Ukuran berkas melebihi batas maksimal 5 MB.' }
    }

    // 2. MIME Type Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: 'Format berkas tidak didukung. Harap unggah format JPG, PNG, WEBP, atau PDF.',
      }
    }

    const supabase = createAdminClient() as any

    // 3. Get document details
    const { data: doc, error: docErr } = await supabase
      .from('documents')
      .select('type, file_path')
      .eq('id', documentId)
      .single()

    if (docErr || !doc) {
      return { success: false, message: 'Data dokumen tidak ditemukan.' }
    }

    // 4. Construct safe file path
    const extension = file.name.split('.').pop() || (file.type === 'application/pdf' ? 'pdf' : 'jpg')
    const fileName = `${doc.type}_${Date.now()}.${extension}`
    const storagePath = `pilgrims/${pilgrimId}/${fileName}`

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 5. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents-vault')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { success: false, message: `Gagal mengunggah berkas: ${uploadError.message}` }
    }

    // 6. Delete old file if existed and different
    if (doc.file_path && doc.file_path !== storagePath) {
      try {
        await supabase.storage.from('documents-vault').remove([doc.file_path])
      } catch (rmErr) {
        console.warn('Could not remove old file:', rmErr)
      }
    }

    // 7. Update database record
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        file_path: storagePath,
        original_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        status: 'uploaded',
        uploaded_at: new Date().toISOString(),
        verified_by: null,
        verified_at: null,
        note: null,
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Document update error:', updateError)
      return { success: false, message: 'Gagal memperbarui data dokumen di database.' }
    }

    // 8. If passport document, update pilgrim passport info if provided in formData
    const passportNumber = formData.get('passport_number') as string | null
    const passportExpiry = formData.get('passport_expiry') as string | null
    if (doc.type === 'paspor' && (passportNumber || passportExpiry)) {
      const pilgrimUpdates: any = {}
      if (passportNumber) pilgrimUpdates.passport_number = passportNumber.trim().toUpperCase()
      if (passportExpiry) pilgrimUpdates.passport_expiry = passportExpiry
      await supabase.from('pilgrims').update(pilgrimUpdates).eq('id', pilgrimId)
    }

    revalidatePath('/documents')
    revalidatePath(`/documents/pilgrim/${pilgrimId}`)

    return { success: true, message: 'Berkas berhasil diunggah dan siap diverifikasi.' }
  } catch (err: any) {
    console.error('uploadDocumentFile error:', err)
    return { success: false, message: err.message || 'Terjadi kesalahan sistem saat unggah.' }
  }
}

/**
 * Verify document (Admin / Super Admin action)
 */
export async function verifyDocument(
  documentId: number,
  pilgrimId: number,
  note?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient() as any
    const adminId = await getActingAdminProfileId()

    const { error } = await supabase
      .from('documents')
      .update({
        status: 'verified',
        verified_by: adminId,
        verified_at: new Date().toISOString(),
        note: note?.trim() || 'Dokumen telah diverifikasi dan dinyatakan valid.',
      })
      .eq('id', documentId)

    if (error) {
      console.error('verifyDocument error:', error)
      return { success: false, message: error.message }
    }

    revalidatePath('/documents')
    revalidatePath(`/documents/pilgrim/${pilgrimId}`)

    return { success: true, message: 'Dokumen berhasil disetujui / diverifikasi.' }
  } catch (err: any) {
    console.error('verifyDocument error:', err)
    return { success: false, message: err.message || 'Terjadi kesalahan sistem' }
  }
}

/**
 * Reject document with required reason note
 */
export async function rejectDocument(
  documentId: number,
  pilgrimId: number,
  reason: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!reason || !reason.trim()) {
      return { success: false, message: 'Alasan penolakan wajib diisi untuk catatan jamaah.' }
    }

    const supabase = createAdminClient() as any
    const adminId = await getActingAdminProfileId()

    const { error } = await supabase
      .from('documents')
      .update({
        status: 'rejected',
        verified_by: adminId,
        verified_at: new Date().toISOString(),
        note: reason.trim(),
      })
      .eq('id', documentId)

    if (error) {
      console.error('rejectDocument error:', error)
      return { success: false, message: error.message }
    }

    revalidatePath('/documents')
    revalidatePath(`/documents/pilgrim/${pilgrimId}`)

    return { success: true, message: 'Dokumen berhasil ditolak dengan catatan alasan.' }
  } catch (err: any) {
    console.error('rejectDocument error:', err)
    return { success: false, message: err.message || 'Terjadi kesalahan sistem' }
  }
}

/**
 * Delete uploaded document file and reset status to pending
 */
export async function deleteDocumentFile(
  documentId: number,
  pilgrimId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient() as any

    const { data: doc, error: fetchErr } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single()

    if (fetchErr || !doc) {
      return { success: false, message: 'Dokumen tidak ditemukan.' }
    }

    if (doc.file_path) {
      try {
        await supabase.storage.from('documents-vault').remove([doc.file_path])
      } catch (rmErr) {
        console.warn('Storage delete warning:', rmErr)
      }
    }

    const { error: resetErr } = await supabase
      .from('documents')
      .update({
        file_path: null,
        original_name: null,
        mime_type: null,
        file_size: null,
        status: 'pending',
        uploaded_at: null,
        verified_by: null,
        verified_at: null,
        note: null,
      })
      .eq('id', documentId)

    if (resetErr) {
      return { success: false, message: resetErr.message }
    }

    revalidatePath('/documents')
    revalidatePath(`/documents/pilgrim/${pilgrimId}`)

    return { success: true, message: 'Berkas dokumen berhasil dihapus.' }
  } catch (err: any) {
    console.error('deleteDocumentFile error:', err)
    return { success: false, message: err.message || 'Terjadi kesalahan sistem' }
  }
}

/**
 * Update pilgrim passport details directly
 */
export async function updatePilgrimPassport(
  pilgrimId: number,
  passportNumber: string,
  passportExpiry: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient() as any

    const { error } = await supabase
      .from('pilgrims')
      .update({
        passport_number: passportNumber.trim().toUpperCase(),
        passport_expiry: passportExpiry,
      })
      .eq('id', pilgrimId)

    if (error) {
      return { success: false, message: error.message }
    }

    revalidatePath(`/documents/pilgrim/${pilgrimId}`)
    return { success: true, message: 'Data paspor jamaah berhasil diperbarui.' }
  } catch (err: any) {
    console.error('updatePilgrimPassport error:', err)
    return { success: false, message: err.message || 'Terjadi kesalahan sistem' }
  }
}
