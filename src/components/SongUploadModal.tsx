import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Trash2,
  Music,
  Layers,
  ArrowUp,
  ArrowDown,
  Plus,
  FileText,
  Eye,
  ArrowUpDown,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  LITURGICAL_CATEGORIES,
  SONG_VOICE_PARTS,
  type SongVoicePart,
} from '@/types';
import { mergeImagesToPdf, naturalSortFileNames } from '@/lib/pdfUtils';

interface SelectedPageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

const uploadFileToCloudinary = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const safeFile = new File([arrayBuffer], file.name || 'sheet_music.pdf', {
    type: file.type || 'application/pdf',
  });

  if (safeFile.size === 0) {
    throw new Error('The selected file is empty or unreadable. Please save it to your device storage first.');
  }

  const formData = new FormData();
  formData.append('file', safeFile);
  formData.append('upload_preset', 'soaca_preset');
  formData.append('access_mode', 'public');

  // Let browser set multipart boundary automatically
  const response = await fetch('https://api.cloudinary.com/v1_1/lkeq71fq/auto/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

interface SongUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSong: (
    file: File,
    meta: {
      title: string;
      category: string;
      voicePart: string;
      notes?: string;
      fileUrl?: string;
      pageCount?: number | null;
      pages?: string[] | null;
    }
  ) => Promise<void>;
  currentUserName?: string | null;
}

export function SongUploadModal({
  isOpen,
  onClose,
  onUploadSong,
}: SongUploadModalProps) {
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('Entrance hymns');
  const [uploadVoicePart, setUploadVoicePart] = useState<string>('All');
  const [uploadNotes, setUploadNotes] = useState('');

  // Single PDF state
  const [singlePdfFile, setSinglePdfFile] = useState<File | null>(null);

  // Multi-image pages state
  const [imagePages, setImagePages] = useState<SelectedPageItem[]>([]);

  // Page zoom preview modal state
  const [previewingPage, setPreviewingPage] = useState<SelectedPageItem | null>(null);

  // Upload & processing state
  const [isProcessingPdf, setIsProcessingPdf] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const imagePagesRef = useRef<SelectedPageItem[]>([]);
  imagePagesRef.current = imagePages;

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setUploadTitle('');
      setUploadCategory('Entrance hymns');
      setUploadVoicePart('All');
      setUploadNotes('');
      setSinglePdfFile(null);
      setImagePages([]);
      setPreviewingPage(null);
      setIsProcessingPdf(false);
      setProcessingStatus('');
      setUploadProgress(0);
      setIsUploading(false);
      setIsDragOver(false);
      setUploadError('');
      setUploadSuccess(false);
    } else {
      // Clean up object URLs
      imagePagesRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    }
  }, [isOpen]);

  // Clean auto-title helper
  const deriveCleanTitle = (fileName: string): string => {
    return fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/page\s*\d+/gi, '')
      .replace(/pg\s*\d+/gi, '')
      .replace(/\(\d+\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Helper to append new image files
  const handleAddFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploadError('');

    // Check if any PDF is among files
    const pdfs = fileArray.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    const images = fileArray.filter((f) => f.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(f.name));

    if (pdfs.length > 0) {
      // If user uploaded a PDF
      const pdf = pdfs[0];
      setSinglePdfFile(pdf);
      // Clean up existing images
      imagePages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setImagePages([]);

      if (!uploadTitle.trim()) {
        setUploadTitle(deriveCleanTitle(pdf.name));
      }
      return;
    }

    if (images.length > 0) {
      // Reset any single PDF
      setSinglePdfFile(null);

      const newItems: SelectedPageItem[] = images.map((f, idx) => ({
        id: `page-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      }));

      setImagePages((prev) => {
        const combined = [...prev, ...newItems];
        if (!uploadTitle.trim() && combined.length > 0) {
          setUploadTitle(deriveCleanTitle(combined[0].name));
        }
        return combined;
      });
    } else {
      setUploadError('Please select valid PDF documents or image files (JPG, PNG, WebP).');
    }
  };

  // Move page up in sequence
  const movePageUp = (index: number) => {
    if (index <= 0) return;
    setImagePages((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move page down in sequence
  const movePageDown = (index: number) => {
    if (index >= imagePages.length - 1) return;
    setImagePages((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Remove a single page
  const removePage = (index: number) => {
    setImagePages((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      const copy = prev.filter((_, i) => i !== index);
      return copy;
    });
  };

  // Sort pages alphabetically / numerically
  const sortPages = () => {
    setImagePages((prev) => naturalSortFileNames(prev));
  };

  // Clear all selected files
  const clearSelection = () => {
    imagePages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setImagePages([]);
    setSinglePdfFile(null);
    setUploadProgress(0);
    setUploadError('');
    setUploadSuccess(false);
  };

  // Process and upload compiled PDF or single PDF to Cloudinary
  const processAndUpload = async (): Promise<{ secureUrl: string; finalFile: File; pageCountNum: number }> => {
    setIsUploading(true);
    setUploadError('');

    let fileToUpload: File;
    let computedPageCount = 1;

    if (singlePdfFile) {
      // 1. Single PDF file selected
      fileToUpload = singlePdfFile;
      computedPageCount = 1;
      setProcessingStatus('Uploading PDF score sheet...');
      setUploadProgress(30);
    } else if (imagePages.length > 0) {
      // 2. Multiple or single image pages -> Merge to pristine PDF
      setIsProcessingPdf(true);
      setProcessingStatus(`Compiling ${imagePages.length} pages into a multi-page PDF...`);
      setUploadProgress(15);

      const files = imagePages.map((p) => p.file);
      computedPageCount = imagePages.length;

      try {
        fileToUpload = await mergeImagesToPdf(
          files,
          uploadTitle.trim() || 'sheet_music',
          (pct, msg) => {
            setUploadProgress(Math.min(pct, 70));
            setProcessingStatus(msg);
          }
        );
      } catch (compileErr) {
        setIsProcessingPdf(false);
        throw new Error(compileErr instanceof Error ? compileErr.message : 'Could not compile images into PDF.');
      }

      setIsProcessingPdf(false);
      setProcessingStatus('Uploading compiled PDF to Cloud Storage...');
      setUploadProgress(75);
    } else {
      throw new Error('Please select at least one score sheet file or image page.');
    }

    if (fileToUpload.size > 30 * 1024 * 1024) {
      throw new Error('Total score size exceeds 30MB. Please use smaller or compressed score images.');
    }

    // Upload to Cloudinary with fallback
    let secureUrl: string;
    try {
      secureUrl = await uploadFileToCloudinary(fileToUpload);
    } catch (uploadErr) {
      const errorMsg = uploadErr instanceof Error ? uploadErr.message : '';
      if (errorMsg.includes('Access mode') || errorMsg.includes('preset')) {
        const safeFile = new File([await fileToUpload.arrayBuffer()], fileToUpload.name, {
          type: fileToUpload.type || 'application/pdf',
        });
        const fallbackData = new FormData();
        fallbackData.append('file', safeFile);
        fallbackData.append('upload_preset', 'soaca_preset');
        const fallbackRes = await fetch('https://api.cloudinary.com/v1_1/lkeq71fq/auto/upload', {
          method: 'POST',
          body: fallbackData,
        });
        if (!fallbackRes.ok) {
          const fallbackError = await fallbackRes.json().catch(() => ({}));
          throw new Error(fallbackError?.error?.message || 'Upload failed');
        }
        const data = await fallbackRes.json();
        secureUrl = data.secure_url;
      } else {
        throw uploadErr;
      }
    }

    setUploadProgress(100);
    setProcessingStatus('Upload complete!');
    return { secureUrl, finalFile: fileToUpload, pageCountNum: computedPageCount };
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a song title.');
      return;
    }

    if (!singlePdfFile && imagePages.length === 0) {
      setUploadError('Please select score sheet pages (PDF or multiple JPG/PNG images).');
      return;
    }

    try {
      const { secureUrl, finalFile, pageCountNum } = await processAndUpload();

      // Save record to Firestore via onUploadSong
      await onUploadSong(finalFile, {
        title: uploadTitle.trim(),
        category: uploadCategory,
        voicePart: uploadVoicePart,
        notes: uploadNotes.trim() || undefined,
        fileUrl: secureUrl,
        pageCount: pageCountNum,
      });

      setUploadSuccess(true);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error('Error uploading/saving song:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to save song. Please try again.');
    } finally {
      setIsUploading(false);
      setIsProcessingPdf(false);
    }
  };

  if (!isOpen) return null;

  const totalPagesSelected = imagePages.length;
  const isMultiPageImageMode = totalPagesSelected > 0;
  const isSinglePdfMode = !!singlePdfFile;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 sm:p-4 sm:items-center sm:justify-center overflow-hidden animate-fade-in">
      {/* Backdrop overlay for desktop click outside */}
      <div
        className="fixed inset-0 -z-10 hidden sm:block"
        onClick={() => !isUploading && onClose()}
        aria-hidden="true"
      />

      {/* Modal Card Wrapper */}
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-white dark:bg-slate-900 sm:rounded-2xl border border-transparent dark:border-slate-800 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/60 dark:text-sky-300 flex-shrink-0">
              <Upload className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  Upload Sheet Music
                </h3>
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-950/60 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-300 ring-1 ring-inset ring-sky-700/10">
                  <Layers className="h-3 w-3 inline text-sky-600 dark:text-sky-400" />
                  Multi-Page Support
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                Upload single PDFs or select multiple JPG/PNG images to compile as one song
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden justify-between">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 touch-pan-y">
            {uploadError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>Score sheet saved successfully to music library!</span>
              </div>
            )}

            {/* Song Title */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Song Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g. O Magnify The Lord, Panis Angelicus, Missa de Angelis"
                className="input-field text-sm"
                disabled={isUploading}
              />
            </div>

            {/* Category & Voice Part Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Liturgical Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="input-field text-sm"
                  disabled={isUploading}
                >
                  {LITURGICAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Voice Part
                </label>
                <select
                  value={uploadVoicePart}
                  onChange={(e) => setUploadVoicePart(e.target.value as SongVoicePart)}
                  className="input-field text-sm"
                  disabled={isUploading}
                >
                  {SONG_VOICE_PARTS.map((part) => (
                    <option key={part} value={part}>
                      {part === 'All' ? 'All Voices (SATB)' : `${part} Section`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sheet Music File Selection Section */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Score Sheet Files (PDF or multiple JPG/PNG pages) <span className="text-red-500">*</span>
                </label>
                {totalPagesSelected > 1 && (
                  <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
                    {totalPagesSelected} Pages will be merged into 1 PDF
                  </span>
                )}
              </div>

              {/* Progress Indicator when uploading / converting */}
              {isUploading && (
                <div className="rounded-xl border-2 border-sky-400 bg-sky-50/70 dark:bg-sky-950/40 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Loader2 className="h-5 w-5 animate-spin text-sky-600 dark:text-sky-400" />
                    <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
                      {isProcessingPdf ? 'Compiling Score Pages...' : 'Uploading to Cloudinary...'} ({uploadProgress}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-2.5 truncate font-medium">
                    {processingStatus || 'Preparing score sheets…'}
                  </p>
                  <div className="w-full bg-sky-200 dark:bg-sky-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-600 dark:bg-sky-400 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${Math.max(uploadProgress, 5)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* State A: Single PDF Selected */}
              {!isUploading && isSinglePdfMode && singlePdfFile && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex-shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {singlePdfFile.name}
                        </span>
                        <span className="rounded bg-emerald-200/60 dark:bg-emerald-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-200 flex-shrink-0">
                          PDF Document
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {(singlePdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearSelection}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 transition-colors flex-shrink-0"
                    title="Change file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* State B: Multiple Image Pages Selected (Interactive Reorder Organizer) */}
              {!isUploading && isMultiPageImageMode && (
                <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 p-3.5">
                  {/* Organizer Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        Pages in Sequence ({totalPagesSelected})
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        (Order: Top to Bottom)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {totalPagesSelected > 1 && (
                        <button
                          type="button"
                          onClick={sortPages}
                          className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                          title="Sort pages alphabetically by file name (e.g., page1, page2)"
                        >
                          <ArrowUpDown className="h-3 w-3" />
                          <span>Sort by Name</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => addMoreInputRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/80 px-2 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors shadow-2xs"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add More Pages</span>
                      </button>

                      <button
                        type="button"
                        onClick={clearSelection}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title="Clear all pages"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Hidden input for adding more pages */}
                  <input
                    ref={addMoreInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files) handleAddFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />

                  {/* Page Cards List */}
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1 touch-pan-y">
                    {imagePages.map((page, index) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xs hover:border-sky-300 dark:hover:border-sky-700 transition-all"
                      >
                        {/* Page Preview & Number */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            onClick={() => setPreviewingPage(page)}
                            className="relative h-12 w-10 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 group/thumb"
                            title="Click to zoom preview"
                          >
                            <img
                              src={page.previewUrl}
                              alt={page.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="h-3 w-3" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-sky-100 dark:bg-sky-950/80 px-1.5 py-0.2 text-[10px] font-bold text-sky-800 dark:text-sky-300">
                                Page {index + 1}
                              </span>
                              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                {page.name}
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {(page.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>

                        {/* Reorder and Delete Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => movePageUp(index)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Move Page Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            disabled={index === imagePages.length - 1}
                            onClick={() => movePageDown(index)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            title="Move Page Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removePage(index)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors ml-1"
                            title="Remove this page"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Auto Compilation Notice */}
                  <div className="rounded-lg bg-sky-50/80 dark:bg-sky-950/50 p-2.5 flex items-start gap-2 text-[11px] text-sky-800 dark:text-sky-300">
                    <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
                    <span>
                      {totalPagesSelected === 1
                        ? '1 image page selected. You can click "+ Add More Pages" above if this song has additional pages, or save as is.'
                        : `All ${totalPagesSelected} image pages will be seamlessly unified into a single multi-page PDF score sheet upon saving.`}
                    </span>
                  </div>
                </div>
              )}

              {/* State C: Empty Dropzone (Select Multiple Files or PDF) */}
              {!isUploading && !isSinglePdfMode && !isMultiPageImageMode && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const droppedFiles = e.dataTransfer.files;
                    if (droppedFiles && droppedFiles.length > 0) {
                      handleAddFiles(droppedFiles);
                    }
                  }}
                  className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                    isDragOver
                      ? 'border-sky-500 bg-sky-50/70 scale-[0.99] dark:border-sky-400 dark:bg-sky-950/40'
                      : 'border-slate-300 bg-slate-50/70 hover:border-sky-400 hover:bg-slate-100/70 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-sky-500 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-2.5 group-hover:scale-105 transition-transform dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs">
                    <Music className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isDragOver ? 'Drop score sheet pages here…' : 'Select Score Sheet or multiple JPG/PNG pages'}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
                    Select a multi-page PDF or <strong>select multiple JPG/PNG images</strong> to combine all pages into one song score.
                  </p>

                  <label
                    htmlFor="multi-sheet-file-input"
                    className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-transparent text-xs font-semibold rounded-xl shadow-xs text-white bg-sky-600 hover:bg-sky-700 mt-3 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Choose File(s)</span>
                    <input
                      id="multi-sheet-file-input"
                      type="file"
                      multiple
                      accept="application/pdf,image/png,image/jpeg,image/webp,image/jpg"
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files) handleAddFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Liturgical Notes / Comments */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Notes / Liturgical Season / Arrangement (Optional)
              </label>
              <textarea
                rows={2}
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="e.g. 3-page Sol-fa score, Easter Vigil arrangement, SATB 4-part..."
                className="input-field text-xs resize-none"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex-none p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {totalPagesSelected > 1
                  ? `${totalPagesSelected} pages will be saved as 1 file`
                  : 'Files are stored on secure cloud storage'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                disabled={isUploading}
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUploading || (!singlePdfFile && imagePages.length === 0)}
                className="btn-primary inline-flex items-center gap-2 text-xs px-5 py-2.5 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isProcessingPdf ? 'Compiling PDF…' : 'Uploading…'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>
                      {totalPagesSelected > 1
                        ? `Compile & Save (${totalPagesSelected} Pages)`
                        : 'Save to Music Library'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Page Zoom Preview Modal */}
      {previewingPage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[90vh] max-w-2xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 text-white">
              <span className="text-xs font-bold truncate pr-2">
                Page Preview: {previewingPage.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewingPage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 overflow-auto max-h-[80vh] flex items-center justify-center bg-slate-950">
              <img
                src={previewingPage.previewUrl}
                alt={previewingPage.name}
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
