import React, { useState, useMemo, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Download,
  Plus,
  UserCheck,
  UserPlus,
  UserX,
  CreditCard,
  Music,
  HelpCircle,
  Bell,
  Calendar,
  LogIn,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
} from 'lucide-react';
import type { ActivityLog, ActivityType, Member, DuesPayment, DuesPeriod, Song, QuizScore } from '@/types';
import { Modal } from '@/components/Modal';
import { logActivity, subscribeToActivityLogs, synthesizeHistoricalActivities } from '@/lib/firestore';

interface ActivityLogViewProps {
  members: Member[];
  payments: DuesPayment[];
  periods: DuesPeriod[];
  songs: Song[];
  quizScores?: QuizScore[];
  userEmail: string | null;
  userName?: string | null;
}

type CategoryFilter = 'all' | 'members' | 'finances' | 'music' | 'quiz' | 'auth' | 'system';

export function ActivityLogView({
  members,
  payments,
  periods,
  songs,
  quizScores = [],
  userEmail,
  userName = 'Admin',
}: ActivityLogViewProps) {
  const [firestoreLogs, setFirestoreLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualAction, setManualAction] = useState('');
  const [manualType, setManualType] = useState<ActivityType>('manual_log');
  const [manualTargetMemberId, setManualTargetMemberId] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  // Subscribe to real-time firestore logs
  useEffect(() => {
    const unsub = subscribeToActivityLogs((logs) => {
      setFirestoreLogs(logs);
    }, 200);
    return () => unsub();
  }, []);

  // Synthesize historical activities from existing collections so initial log is never empty
  const synthesizedLogs = useMemo(() => {
    return synthesizeHistoricalActivities(members, payments, periods, songs, quizScores);
  }, [members, payments, periods, songs, quizScores]);

  // Merge Firestore logs with synthesized logs, deduplicating any overlapping actions
  const allLogs = useMemo(() => {
    const firestoreTargetMap = new Set<string>();
    for (const fl of firestoreLogs) {
      if (fl.target_id && fl.type) {
        firestoreTargetMap.add(`${fl.type}:${fl.target_id}`);
      }
    }

    const merged: ActivityLog[] = [...firestoreLogs];
    for (const sl of synthesizedLogs) {
      const key = `${sl.type}:${sl.target_id}`;
      if (!firestoreTargetMap.has(key)) {
        merged.push(sl);
      }
    }

    return merged.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [firestoreLogs, synthesizedLogs]);

  // Compute stats
  const stats = useMemo(() => {
    let memberCount = 0;
    let financeCount = 0;
    let musicCount = 0;
    let quizCount = 0;

    for (const log of allLogs) {
      if (['member_registered', 'member_created', 'member_updated', 'member_deleted'].includes(log.type)) {
        memberCount++;
      } else if (['payment_recorded', 'payment_updated', 'payment_cleared', 'period_created', 'period_updated', 'period_deleted'].includes(log.type)) {
        financeCount++;
      } else if (['song_uploaded', 'song_deleted'].includes(log.type)) {
        musicCount++;
      } else if (log.type === 'quiz_completed') {
        quizCount++;
      }
    }

    return {
      total: allLogs.length,
      members: memberCount,
      finances: financeCount,
      music: musicCount,
      quiz: quizCount,
    };
  }, [allLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    return allLogs.filter((log) => {
      // 1. Category Filter
      if (categoryFilter === 'members') {
        if (!['member_registered', 'member_created', 'member_updated', 'member_deleted'].includes(log.type)) return false;
      } else if (categoryFilter === 'finances') {
        if (!['payment_recorded', 'payment_updated', 'payment_cleared', 'period_created', 'period_updated', 'period_deleted'].includes(log.type)) return false;
      } else if (categoryFilter === 'music') {
        if (!['song_uploaded', 'song_deleted'].includes(log.type)) return false;
      } else if (categoryFilter === 'quiz') {
        if (log.type !== 'quiz_completed') return false;
      } else if (categoryFilter === 'auth') {
        if (log.type !== 'login') return false;
      } else if (categoryFilter === 'system') {
        if (!['manual_log', 'announcement_updated', 'order_of_mass_updated'].includes(log.type)) return false;
      }

      // 2. Member Filter
      if (memberFilter !== 'all') {
        const actorMatches = log.actor_id === memberFilter || log.actor_name === memberFilter;
        const targetMatches = log.target_id === memberFilter || log.target_name === memberFilter;
        if (!actorMatches && !targetMatches) return false;
      }

      // 3. Time Filter
      if (timeFilter !== 'all') {
        const logTime = new Date(log.timestamp).getTime();
        const diff = now - logTime;
        if (timeFilter === 'today' && diff > oneDay) return false;
        if (timeFilter === '7days' && diff > 7 * oneDay) return false;
        if (timeFilter === '30days' && diff > 30 * oneDay) return false;
      }

      // 4. Search Filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const actor = (log.actor_name || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const target = (log.target_name || '').toLowerCase();
        const detailsStr = log.details ? JSON.stringify(log.details).toLowerCase() : '';
        if (!actor.includes(q) && !action.includes(q) && !target.includes(q) && !detailsStr.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [allLogs, categoryFilter, memberFilter, timeFilter, search]);

  const toggleExpand = (id: string) => {
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Timestamp', 'Type', 'Actor', 'Target', 'Action', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.type}"`,
      `"${l.actor_name || l.actor_email || ''}"`,
      `"${l.target_name || ''}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.details ? JSON.stringify(l.details).replace(/"/g, '""') : ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `choir_activity_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAction.trim()) return;
    setSubmittingManual(true);
    try {
      const targetMember = members.find((m) => m.id === manualTargetMemberId || m.uid === manualTargetMemberId);
      const targetName = targetMember ? `${targetMember.first_name} ${targetMember.last_name}` : null;

      await logActivity({
        type: manualType,
        actor_name: userName || userEmail || 'Admin',
        actor_email: userEmail,
        actor_role: 'Admin',
        target_id: manualTargetMemberId || null,
        target_name: targetName,
        action: manualAction.trim(),
        timestamp: new Date().toISOString(),
      });

      setManualAction('');
      setManualTargetMemberId('');
      setManualModalOpen(false);
    } catch (err) {
      console.error('Error logging manual activity:', err);
    } finally {
      setSubmittingManual(false);
    }
  };

  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'login':
        return {
          icon: LogIn,
          bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          label: 'Login',
        };
      case 'member_registered':
      case 'member_created':
        return {
          icon: UserPlus,
          bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          label: 'Member Added',
        };
      case 'member_updated':
        return {
          icon: UserCheck,
          bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          label: 'Member Updated',
        };
      case 'member_deleted':
        return {
          icon: UserX,
          bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          label: 'Member Removed',
        };
      case 'payment_recorded':
      case 'payment_updated':
        return {
          icon: CreditCard,
          bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          label: 'Dues Payment',
        };
      case 'payment_cleared':
        return {
          icon: CreditCard,
          bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          label: 'Payment Cleared',
        };
      case 'period_created':
      case 'period_updated':
      case 'period_deleted':
        return {
          icon: Calendar,
          bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
          label: 'Dues Period',
        };
      case 'song_uploaded':
      case 'song_deleted':
        return {
          icon: Music,
          bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          label: 'Music Library',
        };
      case 'quiz_completed':
        return {
          icon: HelpCircle,
          bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          label: 'Quiz Completed',
        };
      case 'announcement_updated':
      case 'order_of_mass_updated':
        return {
          icon: Bell,
          bg: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
          label: 'Liturgical Notice',
        };
      case 'manual_log':
      default:
        return {
          icon: ClipboardList,
          bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          label: 'Admin Log',
        };
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHrs = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Log</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Audited timeline of member actions, registrations, dues payments, and library activity.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setManualModalOpen(true)}
            className="btn-primary inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Log Note</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          onClick={() => setCategoryFilter('all')}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            categoryFilter === 'all'
              ? 'border-sky-500 bg-sky-50/60 shadow-xs dark:border-sky-500/80 dark:bg-sky-950/30'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Events</span>
            <ClipboardList className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          <p className="mt-0.5 text-xs text-slate-400">Audited records</p>
        </div>

        <div
          onClick={() => setCategoryFilter('members')}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            categoryFilter === 'members'
              ? 'border-emerald-500 bg-emerald-50/60 shadow-xs dark:border-emerald-500/80 dark:bg-emerald-950/30'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Member Events</span>
            <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.members}</p>
          <p className="mt-0.5 text-xs text-slate-400">Joins & updates</p>
        </div>

        <div
          onClick={() => setCategoryFilter('finances')}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            categoryFilter === 'finances'
              ? 'border-blue-500 bg-blue-50/60 shadow-xs dark:border-blue-500/80 dark:bg-blue-950/30'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Dues Actions</span>
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.finances}</p>
          <p className="mt-0.5 text-xs text-slate-400">Payments & periods</p>
        </div>

        <div
          onClick={() => setCategoryFilter('music')}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            categoryFilter === 'music'
              ? 'border-amber-500 bg-amber-50/60 shadow-xs dark:border-amber-500/80 dark:bg-amber-950/30'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Music & Quizzes</span>
            <Music className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stats.music + stats.quiz}</p>
          <p className="mt-0.5 text-xs text-slate-400">Uploads & scores</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search member, payment, song, or event details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-sky-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Member Dropdown Filter */}
          <div className="w-full sm:w-60">
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-sky-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            >
              <option value="all">All Members ({members.length})</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name} ({m.voice_part})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="w-full sm:w-40">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as 'all' | 'today' | '7days' | '30days')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-sky-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-slate-400 mr-1">Category:</span>
          {(
            [
              { id: 'all', label: 'All Activities' },
              { id: 'members', label: 'Members' },
              { id: 'finances', label: 'Dues & Finance' },
              { id: 'music', label: 'Music Library' },
              { id: 'quiz', label: 'Music Quiz' },
              { id: 'auth', label: 'Logins' },
              { id: 'system', label: 'System & Notes' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                categoryFilter === tab.id
                  ? 'bg-sky-500 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Audit Stream ({filteredLogs.length})
            </span>
          </div>
          {(categoryFilter !== 'all' || memberFilter !== 'all' || search || timeFilter !== 'all') && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setMemberFilter('all');
                setSearch('');
                setTimeFilter('all');
              }}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">No activity records found</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {search || categoryFilter !== 'all' || memberFilter !== 'all'
                ? 'Try adjusting your search query or removing filters to view more events.'
                : 'Activities performed by choir members will automatically stream here in real time.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredLogs.map((log) => {
              const badge = getActivityBadge(log.type);
              const BadgeIcon = badge.icon;
              const isExpanded = expandedLogIds.has(log.id);
              const hasDetails = log.details && Object.keys(log.details).length > 0;

              return (
                <div
                  key={log.id}
                  className="group flex flex-col p-4 sm:p-5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Event Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${badge.bg} shadow-2xs mt-0.5`}
                    >
                      <BadgeIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {log.actor_name || 'System'}
                        </span>

                        {log.actor_role && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {log.actor_role}
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>

                        <span
                          className="ml-auto text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap"
                          title={new Date(log.timestamp).toLocaleString()}
                        >
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>

                      {/* Main Action Narrative */}
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                        {log.action}
                      </p>

                      {/* Details toggle if details exist */}
                      {hasDetails && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(log.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>

                          {isExpanded && log.details && (
                            <div className="mt-2.5 rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                                {Object.entries(log.details).map(([key, value]) => {
                                  if (value === null || value === undefined || value === '') return null;
                                  return (
                                    <div key={key} className="flex items-center gap-2">
                                      <span className="font-semibold text-slate-500 dark:text-slate-400 capitalize">
                                        {key.replace(/_/g, ' ')}:
                                      </span>
                                      <span className="truncate font-mono text-slate-800 dark:text-slate-200">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Activity Log Modal */}
      <Modal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        title="Add Activity Record / Note"
        subtitle="Record a rehearsal note, choir meeting milestone, or administrative action."
      >
        <form onSubmit={handleCreateManualLog} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Event Description *
            </label>
            <textarea
              required
              rows={3}
              value={manualAction}
              onChange={(e) => setManualAction(e.target.value)}
              placeholder="e.g. Conducted weekly choir rehearsal with all voice sections in attendance"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as ActivityType)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="manual_log">Admin Note</option>
                <option value="announcement_updated">Announcement / Meeting</option>
                <option value="order_of_mass_updated">Liturgical Mass Notice</option>
                <option value="member_updated">Member Note</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associated Member (Optional)
              </label>
              <select
                value={manualTargetMemberId}
                onChange={(e) => setManualTargetMemberId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">None / General Choir</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setManualModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingManual || !manualAction.trim()}
              className="btn-primary"
            >
              {submittingManual ? 'Saving...' : 'Save Activity Entry'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
