'use client'

import { useState, useRef } from 'react'
import {
  X,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { uploadDocumentFile } from '../actions'
import type { DocumentItem } from '../types'

interface DocumentUploadModalProps {
  document: DocumentItem | null
  pilgrimId: number
  passportNumberDefault?: string | null
  passportExpiryDefault?: string | null
  departureDate?: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DocumentUploadModal({
  document,
  pilgrimId,
  passportNumberDefault = '',
  passportExpiryDefault = '',
  departureDate,
  isOpen,
  onClose,
  onSuccess,
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [passportNumber, setPassportNumber] = useState(passportNumberDefault || '')
  const [passportExpiry, setPassportExpiry] = useState(passportExpiryDefault || '')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !document) return null

  const isPassport = document.type === 'paspor'

  const handleFileChange = (file: File | null) => {
    if (!file) return

    // 1. Validation size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      toast.error('Ukuran berkas melebihi 5 MB. Harap pilih berkas yang lebih kecil.')
      return
    }

    // 2. Format validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type)) {
      toast.error('Format berkas tidak didukung. Harap unggah JPG, PNG, WEBP, atau PDF.')
      return
    }

    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Silakan pilih berkas yang ingin diunggah.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      if (isPassport) {
        if (passportNumber.trim()) {
          formData.append('passport_number', passportNumber.trim().toUpperCase())
        }
        if (passportExpiry) {
          formData.append('passport_expiry', passportExpiry)
        }
      }

      const res = await uploadDocumentFile(pilgrimId, document.id, formData)

      if (res.success) {
        toast.success(res.message || 'Berkas berhasil diunggah')
        setSelectedFile(null)
        onSuccess()
        onClose()
      } else {
        toast.error(res.message || 'Gagal mengunggah berkas')
      }
    } catch (err: any) {
      console.error('Upload submit error:', err)
      toast.error(err.message || 'Terjadi kesalahan sistem saat unggah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">
              Unggah {document.label}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Format didukung: JPG, PNG, WEBP, atau PDF (Maks. 5 MB)
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Dropzone Area */}
          <div
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(false)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(true)
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                : selectedFile
                ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-slate-50/60 dark:hover:bg-slate-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Klik untuk ganti berkas
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-2">
                  <UploadCloud className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Tarik & Lepas Berkas ke Sini
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  atau <span className="text-emerald-600 font-medium underline">Pilih Berkas dari Komputer</span>
                </div>
              </div>
            )}
          </div>

          {/* Special Passport Inputs */}
          {isPassport && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Detail Informasi Paspor Jamaah</span>
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
                    placeholder="Contoh: X1234567"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
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
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                * Ketentuan Imigrasi Arab Saudi mensyaratkan masa berlaku paspor minimal 7 bulan terhitung sejak tanggal keberangkatan.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Mengunggah...' : 'Unggah Sekarang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
