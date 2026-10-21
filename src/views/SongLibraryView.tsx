import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Eye,
  Music,
  FileText,
  Image as ImageIcon,
  Tag,
  Upload,
  Calendar,
  Layers,
  Loader2,
  X,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import type { Song, MemberRole } from '@/types';
import { formatDate } from '@/lib/format';
import { canManageMusic, isAdmin } from '@/lib/permissions';
import { SongUploadModal } from '@/components/SongUploadModal';
import { DailyMusicQuoteBanner } from '@/components/DailyMusicQuoteBanner';

const SONG_CATEGORIES = [
  'Entrance hymns',
  'Kyrie',
  'Gloria',
  'Credo',
  'Offertory',
  'Sanctus',
  'Consecration',
  'Agnus Dei',
  'Communion',
  'Dismissal/Recessional',
  'Marian Hymns',
  'Choral Anthems',
  'Psalms & Canticles',
  'General/Other',
];

const VOICE_PARTS = ['All', 'Soprano', 'Alto', 'Tenor', 'Bass'];

const getCategoryBadgeStyle = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('entrance'))
    return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
  if (cat.includes('kyrie') || cat.includes('sanctus') || cat.includes('agnus'))
    return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
  if (cat.includes('gloria') || cat.includes('credo'))
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
  if (cat.includes('offertory') || cat.includes('communion'))
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
  if (cat.includes('recessional') || cat.includes('dismissal'))
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
  if (cat.includes('marian'))
    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
  if (cat.includes('anthem'))
    return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300';
  return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
};

const getPreviewUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    if (url.toLowerCase().endsWith('.pdf')) {
      const page1Url = url.replace('/upload/', '/upload/w_600,h_800,c_fill,pg_1,f_jpg/');
      return page1Url.replace(/\.pdf$/i, '.jpg');
    }
    return url.replace('/upload/', '/upload/w_600,h_800,c_fill,q_auto/');
  }
  return url;
};

const SongThumbnail: React.FC<{ song: Song }> = ({ song }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const previewUrl = useMemo(() => {
    return getPreviewUrl(song.fileUrl);
  }, [song.fileUrl]);

  if (!previewUrl || hasError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950/80 p-4 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300 shadow-2xs transition-transform group-hover:scale-105">
          <Music className="h-5 w-5" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {song.fileType === 'pdf' ? (song.pageCount && song.pageCount > 1 ? `${song.pageCount}-Page Score` : 'PDF Sheet Music') : 'Sheet Music'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-10">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      )}
      <img
        src={previewUrl}
        alt={song.title}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        className={`h-full w-full object-cover object-top transition-all duration-300 group-hover:scale-105 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {song.pageCount && song.pageCount > 1 && !isLoading && !hasError && (
        <span className="absolute top-2 left-2 rounded-md bg-sky-900/85 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white backdrop-blur-xs shadow-2xs flex items-center gap-1">
          <Layers className="h-2.5 w-2.5" />
          {song.pageCount} Pages
        </span>
      )}
      {song.fileType === 'pdf' && !isLoading && !hasError && (
        <span className="absolute bottom-2 right-2 rounded-md bg-slate-900/75 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
          PDF Score
        </span>
      )}
    </div>
  );
};

interface SongLibraryViewProps {
  songs: Song[];
  loading: boolean;
  userRole: MemberRole;
  userEmail?: string | null;
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
  onDeleteSong: (id: string, storagePath?: string | null) => Promise<void>;
}

export const SongLibraryView: React.FC<SongLibraryViewProps> = ({
  songs = [],
  loading,
  userRole,
  userEmail,
  onUploadSong,
  onDeleteSong,
}) => {
  const isManager = canManageMusic(userRole, userEmail) || isAdmin(userRole, userEmail);

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVoicePart, setSelectedVoicePart] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal & action states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [songToDelete, setSongToDelete] = useState<Song | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered list
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesSearch =
        !searchTerm.trim() ||
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.notes && song.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' ||
        song.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesVoicePart =
        selectedVoicePart === 'All' ||
        song.voicePart === 'All' ||
        song.voicePart.toLowerCase() === selectedVoicePart.toLowerCase();

      return matchesSearch && matchesCategory && matchesVoicePart;
    });
  }, [songs, searchTerm, selectedCategory, selectedVoicePart]);

  // Open PDF / score sheet directly in the browser viewer
  const handleViewSong = (song: Song, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!song.fileUrl) return;

    if (song.fileUrl.startsWith('data:')) {
      try {
        const arr = song.fileUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || (song.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg');
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        return;
      } catch (err) {
        console.warn('Could not parse data URI:', err);
      }
    }

    const link = document.createElement('a');
    link.href = song.fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Confirm and execute song deletion across cloud & all users
  const handleConfirmDelete = async () => {
    if (!songToDelete) return;
    try {
      setDeletingId(songToDelete.id);
      await onDeleteSong(songToDelete.id, songToDelete.storagePath);
      showToast(`"${songToDelete.title}" was permanently removed from the cloud library.`);
      setSongToDelete(null);
    } catch (err) {
      console.error('Error deleting song:', err);
      alert('Could not delete song. Please check your connection and try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to convert Cloudinary URL to direct download attachment URL
  const getAttachmentUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  // Direct Download Trigger (forces download dialog instead of opening new tab / viewer)
  const handleDirectDownload = async (song: Song, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!song.fileUrl) return;

    setDownloadingId(song.id);

    const safeTitle = (song.title || 'sheet_music').replace(/[/\\?%*:|"<>]/g, '_').trim();
    const ext = song.fileType === 'image' ? 'jpg' : 'pdf';
    let targetFileName = song.fileName ? song.fileName.trim() : `${safeTitle}.${ext}`;
    if (!/\.(pdf|jpg|jpeg|png|webp)$/i.test(targetFileName)) {
      targetFileName = `${targetFileName}.${ext}`;
    }

    const downloadUrl = getAttachmentUrl(song.fileUrl);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = targetFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      console.warn('Direct blob download failed, falling back to attachment link:', err);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = targetFileName;
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-60 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-2xl border border-slate-700 animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Music Library</h2>
            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
              {songs.length} {songs.length === 1 ? 'Sheet' : 'Sheets'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Choir sheet music, Sol-fa notations, mass ordinaries, and hymns for practice and rehearsals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="btn-primary inline-flex items-center gap-2 self-start shadow-sm sm:self-auto"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Sheet Music</span>
        </button>
      </div>

      {/* Daily Music Quote Banner */}
      <DailyMusicQuoteBanner />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <Music className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Total Songs</span>
          </div>
          <p className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">{songs.length}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <FileText className="h-4 w-4 text-red-500" />
            <span>PDF Sheets</span>
          </div>
          <p className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
            {songs.filter((s) => s.fileType === 'pdf').length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <ImageIcon className="h-4 w-4 text-emerald-500" />
            <span>Image Scores</span>
          </div>
          <p className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
            {songs.filter((s) => s.fileType === 'image').length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <Tag className="h-4 w-4 text-violet-500" />
            <span>Categories</span>
          </div>
          <p className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
            {new Set(songs.map((s) => s.category)).size}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, category, or notes…"
              className="input-field pl-9 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Liturgical Category Dropdown Select */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field text-xs font-semibold py-2 px-3 bg-slate-50 border-slate-200 text-slate-800 rounded-lg cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <option value="All">All Categories ({songs.length})</option>
              {SONG_CATEGORIES.map((cat) => {
                const count = songs.filter((s) => s.category.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>

            {/* Voice Part Filter */}
            <select
              value={selectedVoicePart}
              onChange={(e) => setSelectedVoicePart(e.target.value)}
              className="input-field text-xs font-semibold py-2 px-3 bg-slate-50 border-slate-200 text-slate-800 rounded-lg cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              {VOICE_PARTS.map((part) => (
                <option key={part} value={part}>
                  {part === 'All' ? 'All Voices' : `${part} Section`}
                </option>
              ))}
            </select>

            {/* Grid / List View Toggle */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs touch-pan-x">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`rounded-full px-3 py-1 font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All ({songs.length})
          </button>
          {SONG_CATEGORIES.map((cat) => {
            const count = songs.filter((s) => s.category.toLowerCase() === cat.toLowerCase()).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      selectedCategory === cat ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300">
            <Music className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
            {searchTerm || selectedCategory !== 'All' || selectedVoicePart !== 'All'
              ? 'No matching song sheets found'
              : 'The music library is currently empty'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchTerm || selectedCategory !== 'All' || selectedVoicePart !== 'All'
              ? 'Try changing your search keywords or resetting the category and voice part filters.'
              : isManager
                ? 'Upload your first score or hymn sheet in PDF or image format for choir members to view and practice.'
                : 'Your choir directors have not uploaded score sheets yet. Check back soon.'}
          </p>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="btn-primary mt-5 inline-flex items-center gap-2 text-xs"
          >
            <Plus className="h-4 w-4" />
            Upload Sheet Music
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Songs Grid View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-600"
            >
              {/* Header preview & category */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wide ${getCategoryBadgeStyle(
                      song.category
                    )}`}
                  >
                    {song.category}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {song.pageCount && song.pageCount > 1 && (
                      <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800 flex items-center gap-1 shadow-2xs">
                        <Layers className="h-2.5 w-2.5" />
                        {song.pageCount} Pgs
                      </span>
                    )}

                    {song.voicePart && song.voicePart !== 'All' ? (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {song.voicePart}
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700">
                        All Voices
                      </span>
                    )}

                    {/* Admin/Director Quick Delete Button */}
                    {isManager && (
                      <button
                        type="button"
                        onClick={() => setSongToDelete(song)}
                        title="Delete song from library and cloud"
                        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Thumbnail / Preview Box */}
                <a
                  href={song.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (song.fileUrl.startsWith('data:')) {
                      e.preventDefault();
                      handleViewSong(song, e);
                    }
                  }}
                  className="mt-3 flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 transition-colors group-hover:bg-slate-100/80 dark:group-hover:bg-slate-800/80"
                  title={`Open ${song.title} in viewer`}
                >
                  <SongThumbnail song={song} />
                </a>

                {/* Title & Notes */}
                <div className="mt-3">
                  <a
                    href={song.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (song.fileUrl.startsWith('data:')) {
                        e.preventDefault();
                        handleViewSong(song, e);
                      }
                    }}
                    className="font-bold text-slate-900 hover:text-sky-600 dark:text-white dark:hover:text-sky-400 transition-colors line-clamp-2 leading-snug block"
                    title={song.title}
                  >
                    {song.title}
                  </a>
                  {song.notes && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {song.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                <div className="flex items-center gap-1 truncate" title={song.createdAt}>
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{formatDate(song.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={song.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (song.fileUrl.startsWith('data:')) {
                        e.preventDefault();
                        handleViewSong(song, e);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/60 transition-colors cursor-pointer"
                    title="Open in viewer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </a>

                  <button
                    type="button"
                    disabled={downloadingId === song.id}
                    onClick={(e) => handleDirectDownload(song, e)}
                    title="Download Score"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors disabled:opacity-50"
                  >
                    {downloadingId === song.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {/* Prominent Admin Delete Button */}
                  {isManager && (
                    <button
                      type="button"
                      onClick={() => setSongToDelete(song)}
                      title="Delete song permanently"
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50/70 p-1.5 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Songs List View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 sm:pl-6">Score Title</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5">Voice Part</th>
                  <th className="px-3 py-3.5">Pages</th>
                  <th className="px-3 py-3.5">Date Added</th>
                  <th className="py-3.5 pl-3 pr-4 sm:pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSongs.map((song) => (
                  <tr key={song.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-4 pr-3 sm:pl-6 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300 flex-shrink-0">
                          <Music className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate font-bold text-slate-900 dark:text-white">
                            {song.title}
                          </span>
                          {song.notes && (
                            <span className="block text-xs text-slate-400 truncate max-w-xs font-normal">
                              {song.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${getCategoryBadgeStyle(song.category)}`}>
                        {song.category}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {song.voicePart || 'All Voices'}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {song.pageCount && song.pageCount > 1 ? `${song.pageCount} Pages` : '1 Page'}
                    </td>
                    <td className="px-3 py-3.5 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(song.createdAt)}
                    </td>
                    <td className="py-3.5 pl-3 pr-4 sm:pr-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={song.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (song.fileUrl.startsWith('data:')) {
                              e.preventDefault();
                              handleViewSong(song, e);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 dark:bg-sky-950/60 dark:text-sky-300 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View</span>
                        </a>

                        <button
                          type="button"
                          disabled={downloadingId === song.id}
                          onClick={(e) => handleDirectDownload(song, e)}
                          title="Download Score"
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        >
                          {downloadingId === song.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Admin Delete Action */}
                        {isManager && (
                          <button
                            type="button"
                            onClick={() => setSongToDelete(song)}
                            title="Delete song permanently"
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/80 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {songToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Sheet Music
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Permanent removal from cloud library
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {songToDelete.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{songToDelete.category}</span>
                <span>•</span>
                <span>{songToDelete.voicePart || 'All Voices'}</span>
                {songToDelete.pageCount && songToDelete.pageCount > 1 && (
                  <>
                    <span>•</span>
                    <span>{songToDelete.pageCount} Pages</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3.5 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Instant Real-Time Removal</span>
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                This score sheet will be deleted immediately and removed across all choir members&apos; accounts in real time.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deletingId === songToDelete.id}
                onClick={() => setSongToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deletingId === songToDelete.id}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {deletingId === songToDelete.id ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Song Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Song Sheet Modal (Cloudinary Unsigned Upload) */}
      <SongUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSong={onUploadSong}
      />
    </div>
  );
};
