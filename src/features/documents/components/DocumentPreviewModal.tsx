'use client'

import { useState } from 'react'
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import type { DocumentItem } from '../types'

interface DocumentPreviewModalProps {
  document: DocumentItem | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
}: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  if (!isOpen || !document || !document.signed_url) return null

  const isPdf =
    document.mime_type === 'application/pdf' ||
    document.original_name?.toLowerCase().endsWith('.pdf')

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360)
  const handleResetView = () => {
    setZoom(1)
    setRotation(0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                {document.label}
              </h3>
              {document.status === 'verified' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Terverifikasi
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {document.original_name} {document.file_size ? `• ${(document.file_size / 1024).toFixed(0)} KB` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Button */}
            <a
              href={document.signed_url}
              download={document.original_name || 'dokumen'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </a>

            {/* Close Button */}
            <button
              onClick={() => {
                handleResetView()
                onClose()
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar for Images */}
        {!isPdf && (
          <div className="px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                title="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                title="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] px-1">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleRotate}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors ml-2"
                title="Putar 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleResetView}
              className="text-[11px] hover:underline text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Reset Tampilan
            </button>
          </div>
        )}

        {/* Preview Content Area */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 overflow-auto flex items-center justify-center min-h-[400px]">
          {isPdf ? (
            <div className="w-full h-[65vh] flex flex-col items-center">
              <iframe
                src={`${document.signed_url}#toolbar=0`}
                className="w-full h-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white"
                title="Pratinjau PDF"
              />
            </div>
          ) : (
            <div className="overflow-auto max-h-[65vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={document.signed_url}
                alt={document.label}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out',
                }}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Footer Notes if any */}
        {document.note && (
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Catatan Verifikator: </span>
            <span>{document.note}</span>
          </div>
        )}
      </div>
    </div>
  )
}
