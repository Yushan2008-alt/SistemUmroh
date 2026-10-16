import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database.types'
import { getPilgrimDocuments, getCurrentPilgrim } from '@/modules/pilgrims'
import { PilgrimDocumentList } from '@/modules/pilgrims'
import { ArrowLeft, UserX } from 'lucide-react'
import Link from 'next/navigation'

export const metadata = {
  title: 'Kelola Dokumen Jamaah | Travel Umroh & Haji',
  description: 'Verifikasi 6 dokumen standar jamaah dan manajemen paspor.',
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PilgrimDocumentsDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const pilgrimId = Number(resolvedParams.id)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let userRole: Role = 'super_admin'

  if (user) {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role) {
      userRole = profile.role as Role
    }

    if (userRole === 'pilgrim') {
      const currentPilgrim = await getCurrentPilgrim()
      if (!currentPilgrim || currentPilgrim.id !== pilgrimId) {
        return (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm my-12">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserX className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Akses Dibatasi</h2>
            <p className="text-sm text-slate-500 mt-1">Anda hanya memiliki izin untuk melihat dan mengelola berkas dokumen milik Anda sendiri.</p>
            <div className="mt-5">
              <a
                href="/documents"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Dokumen Saya</span>
              </a>
            </div>
          </div>
        )
      }
    }
  }

  if (isNaN(pilgrimId) || pilgrimId <= 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm my-12">
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserX className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">ID Jamaah Tidak Valid</h2>
        <p className="text-sm text-slate-500 mt-1">Harap pilih jamaah melalui daftar dokumen.</p>
        <div className="mt-5">
          <a
            href="/documents"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Dokumen</span>
          </a>
        </div>
      </div>
    )
  }

  const { pilgrim, documents, error } = await getPilgrimDocuments(pilgrimId)

  if (error || !pilgrim) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm my-12">
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <UserX className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data Jamaah Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'Data jamaah tidak terdaftar di sistem.'}</p>
        <div className="mt-5">
          <a
            href="/documents"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Dokumen</span>
          </a>
        </div>
      </div>
    )
  }

  return <PilgrimDocumentList pilgrim={pilgrim} documents={documents} userRole={userRole} />
}
