import { getPilgrimsWithDocumentStats } from '@/features/documents/actions'
import { DocumentsFilter } from '@/features/documents/components/DocumentsFilter'
import { DocumentsTable } from '@/features/documents/components/DocumentsTable'
import { FileCheck, ShieldCheck, Clock, AlertCircle, Users } from 'lucide-react'

export const metadata = {
  title: 'Dokumen & Paspor Jamaah | Travel Umroh & Haji',
  description: 'Manajemen berkas identitas, paspor, dan verifikasi dokumen persyaratan umroh dan haji.',
}

interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: 'all' | 'complete' | 'in_review' | 'rejected' | 'incomplete'
  }>
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const search = resolvedSearchParams.search || ''
  const status = resolvedSearchParams.status || 'all'

  // Fetch all pilgrims with document stats
  const { data: allPilgrims } = await getPilgrimsWithDocumentStats()

  // Calculate global summary stats
  const totalPilgrims = allPilgrims.length
  const completeCount = allPilgrims.filter((p) => p.overall_status === 'complete').length
  const inReviewCount = allPilgrims.filter((p) => p.overall_status === 'in_review').length
  const rejectedCount = allPilgrims.filter((p) => p.overall_status === 'rejected').length
  const incompleteCount = allPilgrims.filter((p) => p.overall_status === 'incomplete').length

  // Fetch filtered data for display
  const { data: pilgrims } = await getPilgrimsWithDocumentStats({
    search,
    status,
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dokumen & Paspor Jamaah
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              6 Dokumen Wajib
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verifikasi kelengkapan berkas KTP, Kartu Keluarga, Paspor, Pas Foto, Buku Nikah, dan Vaksin Meningitis.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Jamaah */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Jamaah
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {totalPilgrims}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Terdaftar di sistem</div>
          </div>
        </div>

        {/* Card 2: Dokumen Lengkap (6/6) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Lengkap (6/6)
            </span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {completeCount}
            </div>
            <div className="text-xs text-emerald-600/80 mt-0.5">
              {totalPilgrims > 0 ? `${Math.round((completeCount / totalPilgrims) * 100)}% dari total jamaah` : '0%'}
            </div>
          </div>
        </div>

        {/* Card 3: Menunggu Verifikasi */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Menunggu Review
            </span>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-0.5">
              {inReviewCount}
            </div>
            <div className="text-xs text-sky-600/80 mt-0.5">
              {inReviewCount > 0 ? 'Ada berkas baru' : 'Semua telah ditinjau'}
            </div>
          </div>
        </div>

        {/* Card 4: Ada Ditolak / Revisi */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Perlu Revisi
            </span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {rejectedCount}
            </div>
            <div className="text-xs text-rose-600/80 mt-0.5">
              {rejectedCount > 0 ? 'Menunggu re-upload jamaah' : 'Tidak ada revisi'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Component */}
      <DocumentsFilter
        currentSearch={search}
        currentStatus={status}
        stats={{
          total: totalPilgrims,
          complete: completeCount,
          in_review: inReviewCount,
          rejected: rejectedCount,
          incomplete: incompleteCount,
        }}
      />

      {/* Table Component */}
      <DocumentsTable items={pilgrims} />
    </div>
  )
}
