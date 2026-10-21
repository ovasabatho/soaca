import { useAuth } from '@/lib/AuthContext';
import { useMemo, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Users as UsersIcon,
  Filter,
  X,
  Lock,
  Upload,
  Cake,
  LayoutGrid,
  Table as TableIcon,
  Calendar,
} from 'lucide-react';
import type { Member, VoicePart, MemberRole, MemberStatus } from '@/types';
import { VOICE_PARTS, MEMBER_ROLES, MEMBER_STATUSES } from '@/types';
import { formatDate, fullName, formatBirthday, isValidBirthday } from '@/lib/format';
import { canAddMember, canEditMember, canDeleteMember } from '@/lib/permissions';
import { StatusBadge, VoicePartBadge } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Avatar } from '@/components/Avatar';
import { BirthdaySelect } from '@/components/BirthdaySelect';

interface MembersViewProps {
  members: Member[];
  loading: boolean;
  userRole?: MemberRole;
  onAdd: (data: Omit<Member, 'id' | 'created_at'> & { password: string }) => Promise<void>;
  onUpdate: (id: string, data: Partial<Member>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type FormData = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  photoURL: string | null;
  voice_part: VoicePart;
  role: MemberRole;
  status: MemberStatus;
  join_date: string;
  birthDay: string;
  birthMonth: string;
  notes: string;
};

const emptyForm: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  phone: '',
  photoURL: null,
  voice_part: 'Soprano',
  role: 'Member',
  status: 'Active',
  join_date: new Date().toISOString().split('T')[0],
  birthDay: '',
  birthMonth: '',
  notes: '',
};

export function MembersView({ members, loading, userRole, onAdd, onUpdate, onDelete }: MembersViewProps) {
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const normalizedEmail = user?.email?.trim().toLowerCase();
  const currentMember = members.find(
    (m) =>
      (m.id && user?.uid && m.id === user.uid) ||
      (m.uid && user?.uid && m.uid === user.uid) ||
      (m.user_id && user?.uid && m.user_id === user.uid) ||
      (m.email && normalizedEmail && m.email.trim().toLowerCase() === normalizedEmail)
  );
  const activeRole = userRole ?? (isAdmin(currentMember?.role, user?.email) ? 'Admin' : currentMember?.role ?? 'Member');
  const canAdd = canAddMember(activeRole, user?.email);
  const canEdit = canEditMember(activeRole, user?.email);
  const canDelete = canDeleteMember(activeRole, user?.email);
  const canEditOrDelete = canEdit || canDelete;
  const [filterVoice, setFilterVoice] = useState<VoicePart | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<MemberStatus | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soaca_members_view_mode');
      if (saved === 'cards' || saved === 'table') return saved;
      return window.innerWidth >= 1024 ? 'table' : 'cards';
    }
    return 'cards';
  });

  const handleViewModeChange = (mode: 'cards' | 'table') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('soaca_members_view_mode', mode);
    }
  };

  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return members
      .filter((m) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          fullName(m.first_name, m.last_name).toLowerCase().includes(q) ||
          (m.email ?? '').toLowerCase().includes(q) ||
          (m.phone ?? '').includes(q);
        const matchesVoice = filterVoice === 'All' || m.voice_part === filterVoice;
        const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
        return matchesSearch && matchesVoice && matchesStatus;
      })
      .sort((a, b) => a.last_name.localeCompare(b.last_name));
  }, [members, search, filterVoice, filterStatus]);

  const hasActiveFilters = filterVoice !== 'All' || filterStatus !== 'All';

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditing(member);
    let birthDay = '';
    let birthMonth = '';
    if (member.birthdate && isValidBirthday(member.birthdate)) {
      const parts = member.birthdate.split('-');
      birthDay = parts[0] || '';
      birthMonth = parts[1] || '';
    }
    setForm({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email ?? '',
      password: '',
      phone: member.phone ?? '',
      photoURL: member.photoURL ?? null,
      voice_part: member.voice_part,
      role: member.role,
      status: member.status,
      join_date: member.join_date ?? new Date().toISOString().split('T')[0],
      birthDay,
      birthMonth,
      notes: member.notes ?? '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormError('First name and last name are required');
      return;
    }
    if (!editing) {
      if (!form.email.trim()) {
        setFormError('Email is required to create a member account');
        return;
      }
      if (form.password.length < 6) {
        setFormError('Password must be at least 6 characters');
        return;
      }
    }

    let birthdate: string | null = null;
    if (form.birthDay && form.birthMonth) {
      birthdate = `${form.birthDay}-${form.birthMonth}`;
      if (!isValidBirthday(birthdate)) {
        setFormError('Please select a valid day and month');
        return;
      }
    }

    setSaving(true);
    setFormError('');
    try {
      const data: Partial<Member> = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        photoURL: form.photoURL,
        voice_part: form.voice_part,
        role: form.role,
        status: form.status,
        join_date: form.join_date || null,
        birthdate,
        notes: form.notes.trim(),
      };
      if (editing) {
        await onUpdate(editing.id, data);
      } else {
        await onAdd({ ...(data as Omit<Member, 'id' | 'created_at'>), email: form.email.trim(), password: form.password });
      }
      setModalOpen(false);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      let msg = 'Failed to save member';
      if (code === 'auth/email-already-in-use') msg = 'A user with this email already exists';
      else if (code === 'auth/invalid-email') msg = 'The email address is not valid';
      else if (code === 'auth/weak-password') msg = 'Password is too weak (min. 6 characters)';
      else if (code === 'auth/network-request-failed') msg = 'Network error. Check your connection and try again';
      else if (err instanceof Error && err.message) msg = err.message;
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) { height = (height * maxDim) / width; width = maxDim; }
        } else {
          if (height > maxDim) { width = (width * maxDim) / height; height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setForm({ ...form, photoURL: reader.result as string }); return; }
        ctx.drawImage(img, 0, 0, width, height);
        setForm({ ...form, photoURL: canvas.toDataURL('image/jpeg', 0.8) });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterVoice('All');
    setFilterStatus('All');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Members</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} of {members.length} members
          </p>
        </div>
        {canAdd && (
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => handleViewModeChange('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-sky-50 text-sky-700 shadow-sm dark:bg-sky-950/70 dark:text-sky-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Cards View (No horizontal scrolling)"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-sky-50 text-sky-700 shadow-sm dark:bg-sky-950/70 dark:text-sky-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="ml-1 flex h-2 w-2 rounded-full bg-sky-500" />
            )}
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 animate-slide-in">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Voice Part</label>
            <select
              value={filterVoice}
              onChange={(e) => setFilterVoice(e.target.value as VoicePart | 'All')}
              className="select-field py-2 text-sm"
            >
              <option value="All">All Parts</option>
              {VOICE_PARTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as MemberStatus | 'All')}
              className="select-field py-2 text-sm"
            >
              <option value="All">All Statuses</option>
              {MEMBER_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Members Display */}
      {loading ? (
        <div className="card flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <UsersIcon className="h-6 w-6 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">
            {members.length === 0 ? 'No members yet' : 'No members match your filters'}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {members.length === 0 ? 'Add your first choir member to get started' : 'Try adjusting your search or filters'}
          </p>
          {members.length === 0 && canAdd && (
            <Button onClick={openAdd} className="mt-4">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View: fully responsive, zero horizontal scroll needed */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => (
            <div
              key={member.id}
              className="card group relative flex flex-col justify-between p-4.5 transition-all hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700"
            >
              <div>
                {/* Top Row: Avatar, Name, Role, and Top-Right Action Buttons */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      firstName={member.first_name}
                      lastName={member.last_name}
                      photoURL={member.photoURL}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        {fullName(member.first_name, member.last_name)}
                      </h3>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {member.role}
                      </p>
                    </div>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  {canEditOrDelete && (
                    <div className="flex items-center gap-1 flex-shrink-0 rounded-lg border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-800/80">
                      {canEdit && (
                        <button
                          onClick={() => openEdit(member)}
                          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-sky-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-sky-400 shadow-none hover:shadow-sm"
                          title="Edit member"
                          aria-label={`Edit ${fullName(member.first_name, member.last_name)}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(member)}
                          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-red-400 shadow-none hover:shadow-sm"
                          title="Delete member"
                          aria-label={`Delete ${fullName(member.first_name, member.last_name)}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Middle Badges Row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <VoicePartBadge part={member.voice_part} />
                  <StatusBadge status={member.status} />
                </div>

                {/* Key Details: Birthday & Join Date */}
                <div className="mt-3.5 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Cake className="h-3.5 w-3.5 text-pink-500" />
                      Birthday
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {member.birthdate && isValidBirthday(member.birthdate)
                        ? formatBirthday(member.birthdate)
                        : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Joined
                    </span>
                    <span>{formatDate(member.join_date)}</span>
                  </div>
                </div>
              </div>

              {/* Contact Links Bar */}
              {(member.email || member.phone) && (
                <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-sky-300 truncate max-w-[200px]"
                      title={member.email}
                    >
                      <Mail className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{member.email}</span>
                    </a>
                  )}
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-emerald-300"
                    >
                      <Phone className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                      <span>{member.phone}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Table View: Smooth horizontal scroll with sticky right actions column */
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-between">
            <span>Showing {filtered.length} members</span>
            <span className="text-[11px] text-slate-400 md:hidden">
              Swipe table left/right → Actions are pinned
            </span>
          </div>
          <div className="w-full overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[840px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[220px]">
                    Member
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[120px]">
                    Voice Part
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[120px]">
                    Role
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[110px]">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[130px]">
                    Birthday
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[120px]">
                    Joined
                  </th>
                  {canEditOrDelete && (
                    <th className="sticky right-0 z-20 bg-slate-50 dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] dark:shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.3)] min-w-[110px]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          firstName={member.first_name}
                          lastName={member.last_name}
                          photoURL={member.photoURL}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {fullName(member.first_name, member.last_name)}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="flex items-center gap-1 hover:text-sky-600 truncate max-w-[160px]"
                              >
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </a>
                            )}
                            {member.phone && (
                              <a
                                href={`tel:${member.phone}`}
                                className="flex items-center gap-1 hover:text-emerald-600 flex-shrink-0"
                              >
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                {member.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <VoicePartBadge part={member.voice_part} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {member.role}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={member.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {member.birthdate && isValidBirthday(member.birthdate) ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                          <Cake className="h-3.5 w-3.5 text-pink-500 flex-shrink-0" />
                          {formatBirthday(member.birthdate)}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(member.join_date)}
                    </td>
                    {canEditOrDelete && (
                      <td className="sticky right-0 z-10 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 px-6 py-4 text-right shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] dark:shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.3)]">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit && (
                            <button
                              onClick={() => openEdit(member)}
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-sky-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sky-400"
                              title="Edit member"
                              aria-label={`Edit ${fullName(member.first_name, member.last_name)}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget(member)}
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                              title="Delete member"
                              aria-label={`Delete ${fullName(member.first_name, member.last_name)}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Member' : 'Add New Member'}
        subtitle={editing ? 'Update member information' : 'Add a new choir member — account will be created with details below'}
        size="compact"
      >
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden justify-between">
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-0 touch-pan-y">
            {formError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {formError}
              </div>
            )}
            {/* Passport Photo Upload */}
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5">
              <div className="relative">
                <Avatar
                  firstName={form.first_name || '?'}
                  lastName={form.last_name || ''}
                  photoURL={form.photoURL}
                  size="lg"
                />
                {form.photoURL && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, photoURL: null })}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600"
                    title="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700">Passport Photo</p>
                <p className="text-[11px] text-slate-500 truncate">
                  JPG/PNG, max 5MB.
                </p>
                <div className="mt-1.5 flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="text-xs py-1 px-2.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1 inline" />
                    {form.photoURL ? 'Change' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Field label="First Name" required>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="input-field text-xs sm:text-sm py-1.5"
                  placeholder="Jane"
                  required
                />
              </Field>
              <Field label="Last Name" required>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="input-field text-xs sm:text-sm py-1.5"
                  placeholder="Smith"
                  required
                />
              </Field>
              <Field label="Email" required={!editing}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field text-xs sm:text-sm py-1.5"
                  placeholder="jane@email.com"
                  required={!editing}
                />
              </Field>
              {!editing && (
                <Field label="Password" required>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field pl-8 text-xs sm:text-sm py-1.5"
                      placeholder="Min. 6 chars"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </Field>
              )}
              <Field label="Phone">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field text-xs sm:text-sm py-1.5"
                  placeholder="555-0100"
                />
              </Field>
              <Field label="Voice Part">
                <select
                  value={form.voice_part}
                  onChange={(e) => setForm({ ...form, voice_part: e.target.value as VoicePart })}
                  className="select-field text-xs sm:text-sm py-1.5"
                >
                  {VOICE_PARTS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Role">
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as MemberRole })}
                  className="select-field text-xs sm:text-sm py-1.5"
                >
                  {MEMBER_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as MemberStatus })}
                  className="select-field text-xs sm:text-sm py-1.5"
                >
                  {MEMBER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Join Date">
                <input
                  type="date"
                  value={form.join_date}
                  onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                  className="input-field text-xs sm:text-sm py-1.5"
                />
              </Field>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-800/40">
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Birthday (Day & Month)
              </label>
              <BirthdaySelect
                day={form.birthDay}
                month={form.birthMonth}
                onDayChange={(val) => setForm({ ...form, birthDay: val })}
                onMonthChange={(val) => setForm({ ...form, birthMonth: val })}
                size="sm"
              />
            </div>
            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field min-h-[60px] resize-y text-xs sm:text-sm py-1.5"
                placeholder="Optional notes about this member…"
              />
            </Field>
          </div>
          <div className="flex-none px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5 bg-white dark:bg-slate-900 z-10">
            <Button type="button" variant="secondary" className="text-xs py-1.5 px-3.5" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="text-xs py-1.5 px-3.5" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${deleteTarget ? fullName(deleteTarget.first_name, deleteTarget.last_name) : ''}? This will also remove all their dues payment records. This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting…' : 'Delete Member'}
      />
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
