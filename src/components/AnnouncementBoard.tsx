import { useState } from 'react';
import { Megaphone, Church, Pencil, Loader2, Save, X, AlertCircle, Calendar } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { formatDate, formatDateTime } from '@/lib/format';
import type { Announcement, OrderOfMass, MemberRole } from '@/types';

interface AnnouncementBoardProps {
  announcement: Announcement | null;
  orderOfMass: OrderOfMass | null;
  userRole: MemberRole;
  userName?: string | null;
  onSaveAnnouncement: (title: string, content: string) => Promise<void>;
  onSaveOrderOfMass: (title: string, content: string, massDate: string | null) => Promise<void>;
}

export function AnnouncementBoard({
  announcement,
  orderOfMass,
  userRole,
  onSaveAnnouncement,
  onSaveOrderOfMass,
}: AnnouncementBoardProps) {
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [editingOrder, setEditingOrder] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [orderTitle, setOrderTitle] = useState('');
  const [orderContent, setOrderContent] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [savingAnn, setSavingAnn] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [annError, setAnnError] = useState('');
  const [orderError, setOrderError] = useState('');

  const canEditAnnouncement = userRole === 'Admin';
  const canEditOrder = userRole === 'Admin' || userRole === 'Director';

  const openEditAnnouncement = () => {
    setAnnTitle(announcement?.title ?? '');
    setAnnContent(announcement?.content ?? '');
    setAnnError('');
    setEditingAnnouncement(true);
  };

  const openEditOrder = () => {
    setOrderTitle(orderOfMass?.title ?? 'Sunday Mass — Order of Service');
    setOrderContent(orderOfMass?.content ?? '');
    setOrderDate(orderOfMass?.mass_date ?? '');
    setOrderError('');
    setEditingOrder(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      setAnnError('Title and content are required');
      return;
    }
    setSavingAnn(true);
    setAnnError('');
    try {
      await onSaveAnnouncement(annTitle.trim(), annContent.trim());
      setEditingAnnouncement(false);
    } catch (err) {
      setAnnError(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setSavingAnn(false);
    }
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderTitle.trim() || !orderContent.trim()) {
      setOrderError('Title and content are required');
      return;
    }
    setSavingOrder(true);
    setOrderError('');
    try {
      await onSaveOrderOfMass(orderTitle.trim(), orderContent.trim(), orderDate || null);
      setEditingOrder(false);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to save order of mass');
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Announcement Card */}
      <div className="card overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-slate-50 px-6 py-4 dark:border-slate-800 dark:from-sky-950/40 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 ring-1 ring-sky-600/20 dark:bg-sky-900/60 dark:text-sky-300">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Announcement</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {announcement ? `Updated ${formatDateTime(announcement.updated_at)}` : 'No announcement posted yet'}
              </p>
            </div>
          </div>
          {canEditAnnouncement && (
            <button
              onClick={openEditAnnouncement}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-sky-600 transition-colors hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-sky-950/60"
            >
              <Pencil className="h-3.5 w-3.5" />
              {announcement ? 'Edit' : 'Post'}
            </button>
          )}
        </div>
        <div className="px-6 py-4">
          {announcement ? (
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{announcement.title}</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {announcement.content}
              </p>
              {announcement.updated_by && (
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">— {announcement.updated_by}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-2 text-sm text-slate-400 dark:text-slate-500">
              <AlertCircle className="h-4 w-4" />
              {canEditAnnouncement
                ? 'No announcement yet. Click "Post" to create one.'
                : 'No announcement has been posted yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Order of Mass Card */}
      <div className="card overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-slate-50 px-6 py-4 dark:border-slate-800 dark:from-amber-950/40 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 ring-1 ring-amber-600/20 dark:bg-amber-900/60 dark:text-amber-300">
              <Church className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Order of Mass</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {orderOfMass
                  ? orderOfMass.mass_date
                    ? `For ${formatDate(orderOfMass.mass_date)} · Updated ${formatDateTime(orderOfMass.updated_at)}`
                    : `Updated ${formatDateTime(orderOfMass.updated_at)}`
                  : 'No order of mass posted yet'}
              </p>
            </div>
          </div>
          {canEditOrder && (
            <button
              onClick={openEditOrder}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/60"
            >
              <Pencil className="h-3.5 w-3.5" />
              {orderOfMass ? 'Edit' : 'Add'}
            </button>
          )}
        </div>
        <div className="px-6 py-4">
          {orderOfMass ? (
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">{orderOfMass.title}</h4>
                {orderOfMass.mass_date && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300">
                    <Calendar className="h-3 w-3" />
                    {formatDate(orderOfMass.mass_date)}
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {orderOfMass.content}
              </p>
              {orderOfMass.updated_by && (
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">— {orderOfMass.updated_by}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-2 text-sm text-slate-400 dark:text-slate-500">
              <AlertCircle className="h-4 w-4" />
              {canEditOrder
                ? 'No order of mass yet. Click "Add" to create one.'
                : 'No order of mass has been posted yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Edit Announcement Modal */}
      <Modal
        open={editingAnnouncement}
        onClose={() => !savingAnn && setEditingAnnouncement(false)}
        title="Edit Announcement"
        subtitle="Visible to all members on their dashboard"
        size="lg"
      >
        <form onSubmit={handleSaveAnnouncement} className="flex-1 flex flex-col min-h-0 overflow-hidden justify-between">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 touch-pan-y">
            {annError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{annError}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. Rehearsal Schedule Change"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Content</label>
              <textarea
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="input-field min-h-[180px] resize-y"
                placeholder="Write your announcement here…"
              />
            </div>
          </div>
          <div className="flex-none p-4 border-t bg-gray-50 flex justify-end gap-3 bg-white z-10">
            <Button type="button" variant="secondary" onClick={() => setEditingAnnouncement(false)} disabled={savingAnn}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={savingAnn}>
              {savingAnn ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savingAnn ? 'Saving…' : 'Save Announcement'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Order of Mass Modal */}
      <Modal
        open={editingOrder}
        onClose={() => !savingOrder && setEditingOrder(false)}
        title="Edit Order of Mass"
        subtitle="Visible to all members — editable by Directors and Admin"
        size="lg"
      >
        <form onSubmit={handleSaveOrder} className="flex-1 flex flex-col min-h-0 overflow-hidden justify-between">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 touch-pan-y">
            {orderError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{orderError}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                value={orderTitle}
                onChange={(e) => setOrderTitle(e.target.value)}
                className="input-field"
                placeholder="e.g. Sunday Mass — Order of Service"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Mass Date (optional)</label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Order of Service</label>
              <textarea
                value={orderContent}
                onChange={(e) => setOrderContent(e.target.value)}
                className="input-field min-h-[220px] resize-y"
                placeholder={"Entrance Hymn…\nPenitential Rite…\nGloria…\nFirst Reading…\nResponsorial Psalm…\nSecond Reading…\nGospel…\nHomily…\nCreed…\nPrayers of the Faithful…\nOffertory…\nSanctus…\nCommunion…\nRecessional Hymn…"}
              />
              <p className="mt-1 text-xs text-slate-400">Each line break is preserved.</p>
            </div>
          </div>
          <div className="flex-none p-4 border-t bg-gray-50 flex justify-end gap-3 bg-white z-10">
            <Button type="button" variant="secondary" onClick={() => setEditingOrder(false)} disabled={savingOrder}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={savingOrder}>
              {savingOrder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savingOrder ? 'Saving…' : 'Save Order of Mass'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
