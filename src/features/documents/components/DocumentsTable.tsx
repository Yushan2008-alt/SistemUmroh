'use client'

import Link from 'next/navigation'
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileX2,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Plane,
} from 'lucide-react'
import type { PilgrimWithDocumentsSummary } from '../types'

interface DocumentsTableProps {
  items: PilgrimWithDocumentsSummary[]
}

export function DocumentsTable({ items }: DocumentsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Tidak ada data dokumen jamaah
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Tidak ditemukan jamaah dengan kriteria pencarian atau status dokumen yang dipilih.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Nama Jamaah & NIK</th>
              <th className="py-3.5 px-4">Paket & Keberangkatan</th>
              <th className="py-3.5 px-4 w-56">Progres Dokumen (6 Wajib)</th>
              <th className="py-3.5 px-4 text-center">Status Verifikasi</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            {items.map((pilgrim) => {
              // Status Pill configuration
              let statusBadge = (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <FileX2 className="w-3.5 h-3.5 text-slate-400" />
                  Belum Lengkap
                </span>
              )

              if (pilgrim.overall_status === 'complete') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Lengkap (6/6)
                  </span>
                )
              } else if (pilgrim.overall_status === 'rejected') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Ada Ditolak ({pilgrim.rejected_count})
                  </span>
                )
              } else if (pilgrim.overall_status === 'in_review') {
                statusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    Perlu Verifikasi ({pilgrim.uploaded_count})
                  </span>
                )
              }

              // Color of progress bar
              let progressColor = 'bg-slate-300 dark:bg-slate-700'
              if (pilgrim.completion_percentage === 100) {
                progressColor = 'bg-emerald-500'
              } else if (pilgrim.rejected_count > 0) {
                progressColor = 'bg-rose-500'
              } else if (pilgrim.uploaded_count > 0) {
                progressColor = 'bg-sky-500'
              } else if (pilgrim.completion_percentage > 0) {
                progressColor = 'bg-amber-500'
              }

              return (
                <tr
                  key={pilgrim.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Pilgrim Name & NIK */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{pilgrim.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        {pilgrim.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>NIK: {pilgrim.nik}</span>
                      <span>•</span>
                      <span>HP: {pilgrim.phone}</span>
                    </div>
                    {pilgrim.passport_number && (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                        Paspor: {pilgrim.passport_number}
                      </div>
                    )}
                  </td>

                  {/* Package & Departure */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {pilgrim.package_name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      {pilgrim.departure_date ? (
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(pilgrim.departure_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Belum ada jadwal</span>
                      )}
                      {pilgrim.registration_code && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {pilgrim.registration_code}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Progress Bar & Ratio */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {pilgrim.verified_count} dari {pilgrim.total_documents} Terverifikasi
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {pilgrim.completion_percentage}%
                      </span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: `${pilgrim.completion_percentage}%` }}
                      />
                    </div>
                    {/* Mini pill counts */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
                      {pilgrim.uploaded_count > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-medium">
                          {pilgrim.uploaded_count} Tunggu Review
                        </span>
                      )}
                      {pilgrim.rejected_count > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-medium">
                          {pilgrim.rejected_count} Ditolak
                        </span>
                      )}
                      {pilgrim.pending_count > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {pilgrim.pending_count} Belum Upload
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-center">{statusBadge}</td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`/documents/pilgrim/${pilgrim.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-lg transition-colors group"
                    >
                      <span>Kelola Dokumen</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
