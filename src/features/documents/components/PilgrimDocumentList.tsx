'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/navigation'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Eye,
  Download,
  Trash2,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  CreditCard,
  Phone,
  User,
  Package,
  AlertTriangle,
  RotateCcw,
  Check,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { deleteDocumentFile, updatePilgrimPassport } from '../actions'
import { STANDARD_DOCUMENTS, type DocumentItem, type PilgrimWithDocumentsSummary } from '../types'
import { DocumentPreviewModal } from './DocumentPreviewModal'
import { DocumentUploadModal } from './DocumentUploadModal'
import { DocumentVerificationModal } from './DocumentVerificationModal'

interface PilgrimDocumentListProps {
  pilgrim: PilgrimWithDocumentsSummary
  documents: DocumentItem[]
}

export function PilgrimDocumentList({
  pilgrim,
  documents: initialDocuments,
}: PilgrimDocumentListProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments)

  // Modals state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null)
  const [uploadDoc, setUploadDoc] = useState<DocumentItem | null>(null)
  const [verifyDoc, setVerifyDoc] = useState<DocumentItem | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Direct Passport edit modal/state
  const [editingPassport, setEditingPassport] = useState(false)
  const [passportNumber, setPassportNumber] = useState(pilgrim.passport_number || '')
  const [passportExpiry, setPassportExpiry] = useState(pilgrim.passport_expiry || '')
  const [savingPassport, setSavingPassport] = useState(false)

  const handleRefresh = () => {
    router.refresh()
  }

  const handleDeleteFile = async (documentId: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus berkas dokumen ini? Dokumen akan kembali ke status Belum Diunggah.')) {
      return
    }

    setDeletingId(documentId)
    try {
      const res = await deleteDocumentFile(documentId, pilgrim.id)
      if (res.success) {
        toast.success(res.message)
        handleRefresh()
      } else {
        toast.error(res.message || 'Gagal menghapus berkas.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSavePassport = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPassport(true)
    try {
      const res = await updatePilgrimPassport(pilgrim.id, passportNumber, passportExpiry)
      if (res.success) {
        toast.success(res.message)
        setEditingPassport(false)
        handleRefresh()
      } else {
        toast.error(res.message)
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSavingPassport(false)
    }
  }

  // Compute metrics
  const verifiedCount = documents.filter((d) => d.status === 'verified').length
  const uploadedCount = documents.filter((d) => d.status === 'uploaded').length
  const rejectedCount = documents.filter((d) => d.status === 'rejected').length
  const pendingCount = documents.filter((d) => d.status === 'pending').length
  const totalStandard = STANDARD_DOCUMENTS.length
  const percentage = Math.round((verifiedCount / totalStandard) * 100)

  let progressColor = 'bg-slate-300 dark:bg-slate-700'
  if (percentage === 100) {
    progressColor = 'bg-emerald-500'
  } else if (rejectedCount > 0) {
    progressColor = 'bg-rose-500'
  } else if (uploadedCount > 0) {
    progressColor = 'bg-sky-500'
  } else if (percentage > 0) {
    progressColor = 'bg-amber-500'
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <a
              href="/documents"
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shrink-0"
              title="Kembali ke Daftar Dokumen"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {pilgrim.name}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {pilgrim.code}
                </span>
                {pilgrim.registration_code && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                    {pilgrim.registration_code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex-wrap">
                <span>NIK: <strong className="text-slate-700 dark:text-slate-300">{pilgrim.nik}</strong></span>
                <span>•</span>
                <span>HP: <strong className="text-slate-700 dark:text-slate-300">{pilgrim.phone}</strong></span>
                <span>•</span>
                <span>Cabang: <strong className="text-slate-700 dark:text-slate-300">{pilgrim.branch_name}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingPassport(!editingPassport)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>{editingPassport ? 'Tutup Edit Paspor' : 'Kelola Data Paspor'}</span>
            </button>
          </div>
        </div>

        {/* Passport Quick Edit Form if toggled */}
        {editingPassport && (
          <form
            onSubmit={handleSavePassport}
            className="my-4 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Perbarui Nomor & Masa Berlaku Paspor Jamaah</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Nomor Paspor
                </label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                  placeholder="Contoh: A1234567"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Masa Berlaku Hingga
                </label>
                <input
                  type="date"
                  value={passportExpiry}
                  onChange={(e) => setPassportExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingPassport(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingPassport}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {savingPassport ? 'Menyimpan...' : 'Simpan Data Paspor'}
              </button>
            </div>
          </form>
        )}

        {/* Package & Progress Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Paket */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Paket Terdaftar
            </span>
            <div className="font-semibold text-slate-900 dark:text-white text-sm mt-1 truncate">
              {pilgrim.package_name}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {pilgrim.departure_date
                  ? new Date(pilgrim.departure_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Belum dijadwalkan'}
              </span>
            </div>
          </div>

          {/* Card 2: Terverifikasi */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
              Dokumen Terverifikasi
            </span>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
              {verifiedCount} <span className="text-sm font-normal text-emerald-600">/ {totalStandard}</span>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              {percentage}% Lengkap
            </div>
          </div>

          {/* Card 3: Menunggu Review */}
          <div className="bg-sky-50/60 dark:bg-sky-950/20 p-4 rounded-xl border border-sky-200/80 dark:border-sky-800">
            <span className="text-[11px] font-medium text-sky-800 dark:text-sky-400 uppercase tracking-wider block">
              Menunggu Review
            </span>
            <div className="text-2xl font-bold text-sky-700 dark:text-sky-300 mt-1">
              {uploadedCount} <span className="text-sm font-normal text-sky-600">berkas</span>
            </div>
            <div className="text-xs text-sky-600 dark:text-sky-400 mt-1">
              {uploadedCount > 0 ? 'Perlu tindakan admin' : 'Tidak ada antrean'}
            </div>
          </div>

          {/* Card 4: Ditolak / Belum Upload */}
          <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/80 dark:border-amber-800">
            <span className="text-[11px] font-medium text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
              Ditolak / Belum Unggah
            </span>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
              {rejectedCount + pendingCount}{' '}
              <span className="text-sm font-normal text-amber-600">dokumen</span>
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {rejectedCount > 0 ? `${rejectedCount} dokumen ditolak` : `${pendingCount} belum diunggah`}
            </div>
          </div>
        </div>

        {/* Progress Bar Full Width */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <span>Status Verifikasi Dokumen Keseluruhan</span>
            <span className="font-bold text-slate-900 dark:text-white">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid 6 Standard Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              6 Dokumen Wajib Persyaratan Umroh & Haji
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola berkas scan asli untuk pengajuan visa dan manifest keberangkatan
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Total Dokumen: <strong>6 Item</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc, index) => {
            const stdConfig = STANDARD_DOCUMENTS.find((s) => s.type === doc.type)
            const hasFile = Boolean(doc.file_path || doc.original_name)

            // Status Badge
            let statusPill = (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Belum Diunggah
              </span>
            )

            if (doc.status === 'verified') {
              statusPill = (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Terverifikasi
                </span>
              )
            } else if (doc.status === 'uploaded') {
              statusPill = (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  Menunggu Verifikasi
                </span>
              )
            } else if (doc.status === 'rejected') {
              statusPill = (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Ditolak
                </span>
              )
            }

            return (
              <div
                key={doc.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all ${
                  doc.status === 'verified'
                    ? 'border-emerald-200/80 dark:border-emerald-900/40 hover:border-emerald-300'
                    : doc.status === 'rejected'
                    ? 'border-rose-200 dark:border-rose-900/40 hover:border-rose-300'
                    : doc.status === 'uploaded'
                    ? 'border-sky-200 dark:border-sky-900/40 hover:border-sky-300'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          doc.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : doc.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : doc.status === 'uploaded'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {doc.label}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {stdConfig?.description}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">{statusPill}</div>
                  </div>

                  {/* Uploaded File Info Box */}
                  {hasFile && (
                    <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]" title={doc.original_name || ''}>
                          {doc.original_name}
                        </span>
                        {doc.file_size && (
                          <span className="text-[11px] font-mono text-slate-500">
                            {(doc.file_size / 1024).toFixed(0)} KB
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                        {doc.uploaded_at && (
                          <span>
                            Unggah:{' '}
                            {new Date(doc.uploaded_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                        {doc.verifier_name && (
                          <span>• Diverifikasi oleh: <strong>{doc.verifier_name}</strong></span>
                        )}
                      </div>

                      {/* Admin note callout */}
                      {doc.note && (
                        <div
                          className={`mt-2 p-2 rounded-lg text-xs leading-relaxed ${
                            doc.status === 'rejected'
                              ? 'bg-rose-100/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : 'bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          <span className="font-bold">
                            {doc.status === 'rejected' ? 'Alasan Penolakan: ' : 'Catatan: '}
                          </span>
                          <span>{doc.note}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Passport Extra Info Pill */}
                  {doc.type === 'paspor' && pilgrim.passport_number && (
                    <div className="mb-3 p-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                      <div>
                        <span>No. Paspor: <strong className="font-mono">{pilgrim.passport_number}</strong></span>
                      </div>
                      {pilgrim.passport_expiry && (
                        <div className="text-[11px]">
                          Berlaku hingga:{' '}
                          <strong>
                            {new Date(pilgrim.passport_expiry).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons Toolbar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap mt-2">
                  <div className="flex items-center gap-1.5">
                    {hasFile ? (
                      <>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Lihat Pratinjau Dokumen"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                          <span>Pratinjau</span>
                        </button>
                        {doc.signed_url && (
                          <a
                            href={doc.signed_url}
                            download={doc.original_name || 'dokumen'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="Unduh Berkas"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteFile(doc.id)}
                          disabled={deletingId === doc.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Berkas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Berkas belum ada</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Upload / Re-upload Button */}
                    <button
                      onClick={() => setUploadDoc(doc)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        hasFile
                          ? 'text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
                          : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{hasFile ? 'Ganti Berkas' : 'Unggah Berkas'}</span>
                    </button>

                    {/* Admin Verification Button (Only when file uploaded) */}
                    {hasFile && (
                      <button
                        onClick={() => setVerifyDoc(doc)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verifikasi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
      />

      <DocumentUploadModal
        document={uploadDoc}
        pilgrimId={pilgrim.id}
        passportNumberDefault={pilgrim.passport_number}
        passportExpiryDefault={pilgrim.passport_expiry}
        departureDate={pilgrim.departure_date}
        isOpen={Boolean(uploadDoc)}
        onClose={() => setUploadDoc(null)}
        onSuccess={handleRefresh}
      />

      <DocumentVerificationModal
        document={verifyDoc}
        pilgrimId={pilgrim.id}
        isOpen={Boolean(verifyDoc)}
        onClose={() => setVerifyDoc(null)}
        onSuccess={handleRefresh}
      />
    </div>
  )
}
