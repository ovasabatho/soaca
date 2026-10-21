import { useState, useEffect, useMemo, type ComponentType } from 'react';
import {
  Users,
  UserCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Cake,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AnnouncementBoard } from '@/components/AnnouncementBoard';
import { NairaIcon } from '@/components/NairaIcon';
import { Avatar } from '@/components/Avatar';
import type { Member, DuesPeriod, DuesPayment, VoicePart, Announcement, OrderOfMass, MemberRole, PaymentStatus } from '@/types';
import { formatCurrency, formatDate, fullName, formatBirthday, isValidBirthday } from '@/lib/format';
import { canViewFinances, isAdmin } from '@/lib/permissions';
import { StatusBadge, VoicePartBadge, PaymentStatusBadge } from '@/components/Badges';
import { useAuth } from '@/lib/AuthContext';
import { subscribeToMemberPaymentsByUid } from '@/lib/firestore';
import { calculatePeriodDuesSummary } from '@/lib/dues';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { DailyMusicQuoteBanner } from '@/components/DailyMusicQuoteBanner';
import { YesterdayMusicGuruBanner } from '@/components/YesterdayMusicGuruBanner';
import { subscribeToQuizScores, getYesterdayMusicGuru, getReigningMusicGuruData } from '@/lib/firestore';
import { getTodayDateKey } from '@/lib/format';
import type { QuizScore } from '@/types';
import type { ViewName } from '@/components/Sidebar';


interface DashboardProps {
  members: Member[];
  periods: DuesPeriod[];
  payments: DuesPayment[];
  loading: boolean;
  onNavigate: (view: ViewName) => void;
  userEmail?: string | null;
  announcement: Announcement | null;
  orderOfMass: OrderOfMass | null;
  onSaveAnnouncement: (title: string, content: string) => Promise<void>;
  onSaveOrderOfMass: (title: string, content: string, massDate: string | null) => Promise<void>;
}

export function Dashboard({ members = [], periods = [], payments = [], loading, onNavigate, userEmail, announcement, orderOfMass, onSaveAnnouncement, onSaveOrderOfMass }: DashboardProps) {
  const { user } = useAuth();
  const currentUserUid = user?.uid || '';
  const normalizedEmail = userEmail?.trim().toLowerCase();
  const currentMember = (members || []).find(
    (m) =>
      (m?.id && currentUserUid && m.id === currentUserUid) ||
      (m?.uid && currentUserUid && m.uid === currentUserUid) ||
      (m?.email && normalizedEmail && m.email.trim().toLowerCase() === normalizedEmail)
  );
  const userRole: MemberRole = isAdmin(currentMember?.role, userEmail)
    ? 'Admin'
    : (currentMember?.role ?? 'Member');
  const userName = currentMember ? fullName(currentMember.first_name, currentMember.last_name) : null;
  const showFinances = canViewFinances(userRole, userEmail);

  // Directly query payments where memberId == currentUser.uid in real time
  const [queriedPayments, setQueriedPayments] = useState<DuesPayment[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [currentDateKey, setCurrentDateKey] = useState(() => getTodayDateKey());

  useEffect(() => {
    if (!currentUserUid) {
      setQueriedPayments([]);
      return;
    }

    const unsub = subscribeToMemberPaymentsByUid(currentUserUid, (userDocs) => {
      setQueriedPayments(userDocs || []);
    });

    return () => unsub();
  }, [currentUserUid]);

  // Subscribe in real-time to quiz scores for Daily Leaderboard
  useEffect(() => {
    const unsub = subscribeToQuizScores((scores) => {
      setQuizScores(scores || []);
    });
    return () => unsub();
  }, []);

  // Automatic 12:00 AM midnight rollover detection: updates currentDateKey every 30s
  useEffect(() => {
    const checkMidnight = () => {
      const today = getTodayDateKey();
      if (today !== currentDateKey) {
        setCurrentDateKey(today);
      }
    };

    const interval = setInterval(checkMidnight, 30000);
    return () => clearInterval(interval);
  }, [currentDateKey]);

  // Derive Daily Music Guru data with refreshed criteria and tie/tally handling
  const reigningGuruData = useMemo(() => {
    return getReigningMusicGuruData(quizScores, members, currentDateKey);
  }, [quizScores, members, currentDateKey]);

  const yesterdayGuru = useMemo(() => {
    return getYesterdayMusicGuru(quizScores, members, currentDateKey);
  }, [quizScores, members, currentDateKey]);



  // Member Dues Calculation: computed directly from payments where memberId == currentUser.uid
  const personalDues = useMemo(() => {
    const safePeriods = periods || [];
    const safePayments = payments || [];
    const activePeriods = safePeriods.filter((p) => p && p.is_active);
    const activePeriod = activePeriods[0] ?? safePeriods[0] ?? null;

    // Combine real-time queried payments where memberId == currentUser.uid with any passed in payments
    const combinedPayments = [...(queriedPayments || [])];
    if (safePayments.length > 0) {
      for (const p of safePayments) {
        if (!p) continue;
        const isCurrent =
          (currentUserUid && (p.memberId === currentUserUid || p.member_id === currentUserUid)) ||
          (currentMember && (p.member_id === currentMember.id || p.memberId === currentMember.id));
        if (isCurrent && !combinedPayments.some((cp) => cp && cp.id === p.id)) {
          combinedPayments.push(p);
        }
      }
    }

    if (!activePeriod) {
      return {
        activePeriod: null,
        duesAmount: 0,
        amountPaid: 0,
        balance: 0,
        status: 'Pending' as PaymentStatus,
        payment: null,
      };
    }

    const periodPayments = combinedPayments.filter(
      (p) => p && (p.period_id === activePeriod.id || p.periodId === activePeriod.id)
    );

    const amountPaid = periodPayments.reduce(
      (sum, p) => sum + Number(p.amountPaid ?? p.amount_paid ?? 0),
      0
    );

    const isExplicitlyPaid = periodPayments.some(
      (p) => typeof p.status === 'string' && p.status.toLowerCase() === 'paid'
    );

    const periodAmount = activePeriod.amount || 0;
    const isPaidInFull = isExplicitlyPaid || amountPaid >= periodAmount;
    const balance = isPaidInFull ? 0 : Math.max(0, periodAmount - amountPaid);

    const status: PaymentStatus = isPaidInFull
      ? 'Paid'
      : amountPaid > 0
        ? 'Partial'
        : 'Pending';

    const latestPayment = periodPayments[0] ?? null;

    return {
      activePeriod,
      duesAmount: periodAmount,
      amountPaid,
      balance,
      status,
      payment: latestPayment,
    };
  }, [periods, queriedPayments, payments, currentUserUid, currentMember]);

  const stats = useMemo(() => {
    const safeMembers = members || [];
    const safePeriods = periods || [];
    const safePayments = payments || [];
    const activePeriod = safePeriods.find((p) => p && p.is_active) ?? safePeriods[0] ?? null;
    const duesSummary = calculatePeriodDuesSummary(safeMembers, activePeriod, safePayments);

    const periodPayments = activePeriod
      ? safePayments.filter((p) => p && (p.period_id === activePeriod.id || p.periodId === activePeriod.id))
      : [];

    const voicePartCounts: Record<VoicePart, number> = {
      Soprano: 0,
      Alto: 0,
      Tenor: 0,
      Bass: 0,
    };
    safeMembers.forEach((m) => {
      if (m?.voice_part && voicePartCounts[m.voice_part] !== undefined) {
        voicePartCounts[m.voice_part]++;
      }
    });

    const maxVoicePart = Math.max(...Object.values(voicePartCounts), 1);

    return {
      totalMembers: safeMembers.length,
      activeMembers: duesSummary.totalEligible,
      currentPeriod: activePeriod,
      activePeriodId: duesSummary.activePeriodId,
      paid: duesSummary.paidCount,
      partial: duesSummary.partialCount,
      pending: duesSummary.pendingCount,
      waived: duesSummary.waivedCount,
      totalExpected: duesSummary.expected,
      totalCollected: duesSummary.collected,
      collectionRate: duesSummary.collectionRate,
      voicePartCounts,
      maxVoicePart,
      periodPayments,
      activeMembersList: duesSummary.eligibleMembers,
    };
  }, [members, periods, payments]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overview of your choir and dues collection status
          </p>
        </div>
        {currentMember && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Avatar
              firstName={currentMember.first_name}
              lastName={currentMember.last_name}
              photoURL={currentMember.photoURL}
              size="lg"
            />
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {fullName(currentMember.first_name, currentMember.last_name)}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center justify-end gap-2">
                <VoicePartBadge part={currentMember.voice_part} />
                <span className="text-xs text-slate-500 dark:text-slate-400">{currentMember.role}</span>
                {currentMember.birthdate && isValidBirthday(currentMember.birthdate) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-600 dark:bg-pink-950/50 dark:text-pink-300">
                    <Cake className="h-3 w-3" />
                    {formatBirthday(currentMember.birthdate)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Daily Reigning Music Guru Spotlight Banner */}
      <YesterdayMusicGuruBanner
        guruData={reigningGuruData}
        guru={yesterdayGuru}
        onNavigateQuiz={() => onNavigate('quiz')}
      />

      {/* Daily Music Quote Banner */}
      <DailyMusicQuoteBanner />


      {/* Announcement Board */}
      <AnnouncementBoard
        announcement={announcement}
        orderOfMass={orderOfMass}
        userRole={userRole}
        userName={userName}
        onSaveAnnouncement={onSaveAnnouncement}
        onSaveOrderOfMass={onSaveOrderOfMass}
      />

      {/* Musical Knowledge Quiz Shortcut Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 p-5 shadow-sm sm:p-6 dark:border-sky-900/50 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Music Theory & Choral Quiz</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  200+ Questions
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                Sharpen your ear and theory knowledge with 10 random musical questions, instant answer feedback, and detailed corrections.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('quiz')}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Take Musical Quiz</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Member Dues & Balance Section — Live query where memberId == currentUser.uid */}
      <div className="card p-6 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-600/20 dark:bg-sky-950/60 dark:text-sky-300">
              <NairaIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">My Dues & Balance</h3>
                {personalDues.activePeriod && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {personalDues.activePeriod.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {personalDues.activePeriod
                  ? `Due ${formatDate(personalDues.activePeriod.due_date)}`
                  : 'No active dues period currently'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('dues')}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 transition-colors sm:self-auto"
          >
            <span>View payment history</span>
            <span>→</span>
          </button>
        </div>

        {personalDues.activePeriod ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Outstanding Balance */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                personalDues.balance === 0 && personalDues.status === 'Paid'
                  ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/30'
                  : personalDues.status === 'Partial'
                    ? 'border-sky-200 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/30'
                    : 'border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Outstanding Balance
                </span>
                {personalDues.balance === 0 && personalDues.status === 'Paid' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : personalDues.status === 'Partial' ? (
                  <AlertCircle className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <p
                className={`mt-2 text-2xl font-black ${
                  personalDues.balance === 0 && personalDues.status === 'Paid'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : personalDues.status === 'Partial'
                      ? 'text-sky-700 dark:text-sky-300'
                      : 'text-amber-800 dark:text-amber-300'
                }`}
              >
                {formatCurrency(personalDues.balance)}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <PaymentStatusBadge status={personalDues.status} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {personalDues.status === 'Paid'
                    ? 'All caught up'
                    : personalDues.status === 'Partial'
                      ? 'Partially settled'
                      : 'Pending payment'}
                </span>
              </div>
            </div>

            {/* Total Amount Paid */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Amount Paid
              </span>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(personalDues.amountPaid)}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {personalDues.payment?.paymentDate || personalDues.payment?.payment_date
                  ? `Last payment: ${formatDate((personalDues.payment.paymentDate || personalDues.payment.payment_date)!)} (${personalDues.payment.payment_method})`
                  : 'No payment recorded for this period'}
              </p>
            </div>

            {/* Period Dues Required */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Period Required Dues
              </span>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(personalDues.duesAmount)}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Standard rate per active choir member
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No active dues period configured currently.
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Members"
          value={stats.totalMembers.toString()}
          subtext={`${stats.activeMembers} active`}
          icon={Users}
          color="sky"
        />
        <StatCard
          label="Active Members"
          value={stats.activeMembers.toString()}
          subtext={`${stats.totalMembers - stats.activeMembers} inactive / on leave`}
          icon={UserCheck}
          color="emerald"
        />
        {showFinances && (
          <StatCard
            label="Total Collected"
            value={formatCurrency(stats.totalCollected)}
            subtext={stats.currentPeriod ? stats.currentPeriod.name : 'No active period'}
            icon={NairaIcon}
            color="amber"
          />
        )}
        {showFinances && (
          <StatCard
            label="Collection Rate"
            value={`${stats.collectionRate.toFixed(0)}%`}
            subtext={`of ${formatCurrency(stats.totalExpected)} expected`}
            icon={TrendingUp}
            color="violet"
          />
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Payment Status Breakdown — Admin/Director/Section Leader only */}
        {showFinances && (
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Dues Collection Status</h3>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {stats.currentPeriod
                  ? `${stats.currentPeriod.name} — due ${formatDate(stats.currentPeriod.due_date)}`
                  : 'No active dues period'}
              </p>
            </div>
            {stats.currentPeriod && (
              <button
                onClick={() => onNavigate('dues')}
                className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
              >
                View all →
              </button>
            )}
          </div>

          {/* Progress bar */}
          {stats.currentPeriod && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {formatCurrency(stats.totalCollected)} collected
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {formatCurrency(stats.totalExpected)} expected
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-500"
                  style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Payment status grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PaymentStatusCard
              icon={CheckCircle2}
              label="Paid"
              count={stats.paid}
              total={stats.activeMembers}
              color="emerald"
            />
            <PaymentStatusCard
              icon={AlertCircle}
              label="Partial"
              count={stats.partial}
              total={stats.activeMembers}
              color="sky"
            />
            <PaymentStatusCard
              icon={Clock}
              label="Pending"
              count={stats.pending}
              total={stats.activeMembers}
              color="amber"
            />
            <PaymentStatusCard
              icon={XCircle}
              label="Waived"
              count={stats.waived}
              total={stats.activeMembers}
              color="slate"
            />
          </div>
        </div>
        )}

        {/* Voice Part Distribution — all roles */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white">Voice Part Distribution</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Members by section</p>

          <div className="mt-5 space-y-4">
            {(['Soprano', 'Alto', 'Tenor', 'Bass'] as VoicePart[]).map((part) => (
              <div key={part}>
                <div className="flex items-center justify-between text-sm">
                  <VoicePartBadge part={part} />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {stats.voicePartCounts?.[part] ?? 0}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${((stats.voicePartCounts?.[part] ?? 0) / (stats.maxVoicePart || 1)) * 100}%`,
                      backgroundColor:
                        part === 'Soprano'
                          ? '#f43f5e'
                          : part === 'Alto'
                            ? '#8b5cf6'
                            : part === 'Tenor'
                              ? '#0ea5e9'
                              : '#14b8a6',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments & Members Needing Attention — Admin/Director/Section Leader only */}
      {showFinances && (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Payments</h3>
            <button
              onClick={() => onNavigate('dues')}
              className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              View all →
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {(stats.periodPayments || [])
              .filter((p) => p?.payment_date)
              .sort((a, b) => (b.payment_date ?? '').localeCompare(a.payment_date ?? ''))
              .slice(0, 5)
              .map((payment) => {
                const targetMid = payment.memberId || payment.member_id;
                const member = (members || []).find(
                  (m) => m?.id === targetMid || (m?.uid && m.uid === targetMid) || (m?.user_id && m.user_id === targetMid)
                );
                if (!member) return null;
                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800/80 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <Avatar firstName={member.first_name} lastName={member.last_name} photoURL={member.photoURL} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {fullName(member.first_name, member.last_name)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(payment.payment_date)} · {payment.payment_method}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(Number(payment.amountPaid ?? payment.amount_paid))}
                      </span>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                  </div>
                );
              })}
            {(stats.periodPayments || []).filter((p) => p?.payment_date).length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">
                No payments recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Members Needing Follow-up</h3>
            <button
              onClick={() => onNavigate('dues')}
              className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Manage →
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {(stats.activeMembersList || [])
              .filter((m) => {
                const payment = (stats.periodPayments || []).find(
                  (p) =>
                    (p?.memberId && (p.memberId === m.id || (m.uid && p.memberId === m.uid))) ||
                    (p?.member_id && (p.member_id === m.id || (m.uid && p.member_id === m.uid)))
                );
                return !payment || payment.status === 'Pending' || payment.status === 'Partial';
              })
              .slice(0, 6)
              .map((member) => {
                const payment = (stats.periodPayments || []).find(
                  (p) => p?.member_id === member.id || p?.memberId === member.id || (member.uid && (p?.memberId === member.uid || p?.member_id === member.uid))
                );
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800/80 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <Avatar firstName={member.first_name} lastName={member.last_name} photoURL={member.photoURL} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {fullName(member.first_name, member.last_name)}
                      </p>
                      <div className="flex items-center gap-2">
                        <VoicePartBadge part={member.voice_part} />
                        <StatusBadge status={member.status} />
                      </div>
                    </div>
                    {payment ? (
                      <PaymentStatusBadge status={payment.status} />
                    ) : (
                      <span className="badge bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-500/30">
                        No record
                      </span>
                    )}
                  </div>
                );
              })}
            {(stats.activeMembersList || []).filter((m) => {
              const payment = (stats.periodPayments || []).find(
                (p) => p?.member_id === m.id || p?.memberId === m.id || (m.uid && (p?.memberId === m.uid || p?.member_id === m.uid))
              );
              return !payment || payment.status === 'Pending' || payment.status === 'Partial';
            }).length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">
                All members are up to date!
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* In-App PWA Install Card / Banner */}
      <div className="pt-2">
        <PWAInstallButton variant="card" />
      </div>
    </div>
  );
}

const colorMap = {
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-600/20 dark:ring-sky-500/30' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-600/20 dark:ring-emerald-500/30' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-600/20 dark:ring-amber-500/30' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-600/20 dark:ring-violet-500/30' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', ring: 'ring-slate-400/20 dark:ring-slate-700' },
};

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: ComponentType<{ className?: string }>;
  color: keyof typeof colorMap;
}) {
  const c = colorMap[color];
  return (
    <div className="card p-5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} ${c.text} ring-1 ${c.ring}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">{subtext}</p>
    </div>
  );
}

function PaymentStatusCard({
  icon: Icon,
  label,
  count,
  total,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  count: number;
  total: number;
  color: keyof typeof colorMap;
}) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border border-slate-100 dark:border-slate-800 p-4 ${c.bg}`}>
      <div className={`flex items-center gap-2 ${c.text}`}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-400">of {total} active</p>
    </div>
  );
}
