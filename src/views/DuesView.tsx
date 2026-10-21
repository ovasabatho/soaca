import { useMemo, useState, type ComponentType } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Wallet,
  Download,
  Filter,
  X,
} from 'lucide-react';
import { NairaIcon } from '@/components/NairaIcon';
import type {
  Member,
  DuesPeriod,
  DuesPayment,
  PaymentMethod,
  PaymentStatus,
  MemberRole,
} from '@/types';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '@/types';
import { formatCurrency, formatDate, fullName } from '@/lib/format';
import { canViewFinances, canEditFinances } from '@/lib/permissions';
import { VoicePartBadge, StatusBadge, PaymentStatusBadge } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/lib/AuthContext';
import { calculatePeriodDuesSummary, normalizePaymentStatus } from '@/lib/dues';

interface DuesViewProps {
  members: Member[];
  periods: DuesPeriod[];
  payments: DuesPayment[];
  loading: boolean;
  userRole: MemberRole;
  userEmail?: string | null;
  currentMemberId: string | null;
  onUpsertPayment: (
    memberId: string,
    periodId: string,
    data: {
      amount_paid?: number;
      amountPaid?: number;
      memberId?: string;
      periodId?: string;
      payment_date: string | null;
      payment_method: PaymentMethod;
      status: PaymentStatus | string;
      reference_number: string;
      notes: string;
    }
  ) => Promise<void>;
  onClearPayment: (paymentId: string) => Promise<void>;
}

type PaymentFormData = {
  amount_paid: string;
  payment_date: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference_number: string;
  notes: string;
};

export function DuesView({
  members,
  periods,
  payments,
  loading,
  userRole,
  userEmail,
  currentMemberId,
  onUpsertPayment,
  onClearPayment,
}: DuesViewProps) {
  const { user } = useAuth();
  const currentUid = user?.uid;
  const canEdit = canEditFinances(userRole, userEmail);
  const showChoirWide = canViewFinances(userRole, userEmail);
  const [activeTab, setActiveTab] = useState<'choir' | 'personal'>('choir');
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'All' | 'None'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [existingPayment, setExistingPayment] = useState<DuesPayment | null>(null);
  const [form, setForm] = useState<PaymentFormData>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [clearTarget, setClearTarget] = useState<DuesPayment | null>(null);
  const [clearing, setClearing] = useState(false);

  const selectedPeriod = useMemo(() => {
    if (!selectedPeriodId && periods.length > 0) {
      return periods.find((p) => p.is_active) ?? periods[0] ?? null;
    }
    return periods.find((p) => p.id === selectedPeriodId) ?? null;
  }, [periods, selectedPeriodId]);

  const summary = useMemo(() => {
    return calculatePeriodDuesSummary(members, selectedPeriod, payments);
  }, [members, selectedPeriod, payments]);

  const rows = useMemo(() => {
    if (!selectedPeriod || !summary) return [];
    return summary.memberRows
      .filter((row) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q || fullName(row.member.first_name, row.member.last_name).toLowerCase().includes(q);

        if (filterStatus === 'All') return matchesSearch;
        if (filterStatus === 'None') return matchesSearch && !row.payment;

        // Normalize status to ensure case-insensitive matching (e.g. 'partial' vs 'Partial')
        const rowStatus = row.payment?.status ? normalizePaymentStatus(row.payment.status) : null;
        const matchesFilter = rowStatus === filterStatus;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => a.member.last_name.localeCompare(b.member.last_name));
  }, [selectedPeriod, summary, search, filterStatus]);

  const hasActiveFilters = filterStatus !== 'All';

  const openModal = (member: Member, payment: DuesPayment | null) => {
    setEditingMember(member);
    setExistingPayment(payment);
    if (payment) {
      setForm({
        amount_paid: (payment.amountPaid ?? payment.amount_paid).toString(),
        payment_date: payment.payment_date ?? payment.paymentDate ?? '',
        payment_method: payment.payment_method,
        status: normalizePaymentStatus(payment.status),
        reference_number: payment.reference_number ?? '',
        notes: payment.notes ?? '',
      });
    } else {
      setForm({
        ...defaultForm(),
        amount_paid: selectedPeriod ? selectedPeriod.amount.toString() : '',
        status: 'Paid',
      });
    }
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSaving(true);
    setFormError('');
    try {
      // Current target dues period ID (selectedPeriod, active period, or first available)
      const targetPeriodId = selectedPeriod?.id ?? periods.find((p) => p.is_active)?.id ?? periods[0]?.id ?? '';

      // Selected member's user UID
      const targetMemberUid = editingMember.uid || editingMember.user_id || editingMember.id;

      const amountPaid = Number(form.amount_paid) || 0;
      const paymentDate = form.payment_date || new Date().toISOString().split('T')[0];
      const status = normalizePaymentStatus(form.status || (amountPaid > 0 ? 'Paid' : 'Pending'));

      // Ensure newly created or updated document includes memberId, periodId, amountPaid, paymentDate, and status
      await onUpsertPayment(targetMemberUid, targetPeriodId, {
        memberId: targetMemberUid,
        periodId: targetPeriodId,
        amountPaid,
        amount_paid: amountPaid,
        paymentDate,
        payment_date: paymentDate,
        status,
        payment_method: form.payment_method,
        reference_number: form.reference_number.trim(),
        notes: form.notes.trim(),
      });
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!clearTarget) return;
    setClearing(true);
    try {
      await onClearPayment(clearTarget.id);
      setClearTarget(null);
    } finally {
      setClearing(false);
    }
  };

  const exportCSV = () => {
    if (!selectedPeriod || rows.length === 0) return;
    const headers = ['Name', 'Voice Part', 'Status', 'Amount Due', 'Amount Paid', 'Payment Status', 'Payment Date', 'Method', 'Reference'];
    const lines = rows.map((r) => [
      fullName(r.member.first_name, r.member.last_name),
      r.member.voice_part,
      r.member.status,
      selectedPeriod.amount.toString(),
      r.payment ? Number(r.payment.amount_paid).toString() : '0',
      r.payment ? r.payment.status : 'None',
      r.payment?.payment_date ? formatDate(r.payment.payment_date) : '',
      r.payment?.payment_method ?? '',
      r.payment?.reference_number ?? '',
    ].join(','));

    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dues-${selectedPeriod.name.replace(/\s+/g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Wallet className="h-6 w-6 text-slate-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-900">No dues periods available</p>
        <p className="mt-1 text-sm text-slate-500">
          Create a dues period first before tracking payments
        </p>
      </div>
    );
  }

  // Render personal dues view if the user is a non-privileged member OR has toggled to personal tab
  if (!showChoirWide || activeTab === 'personal') {
    const myPayments = payments
      .filter((p) => {
        const targetMid = p.memberId || p.member_id;
        return (
          (currentMemberId && targetMid === currentMemberId) ||
          (currentUid && targetMid === currentUid)
        );
      })
      .sort((a, b) => (b.payment_date ?? '').localeCompare(a.payment_date ?? ''));

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {showChoirWide ? 'My Personal Dues' : 'My Dues'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your dues balance and payment history</p>
          </div>

          {showChoirWide && (
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setActiveTab('choir')}
                className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                All Member Records
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className="rounded-md bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 transition-colors"
              >
                My Dues
              </button>
            </div>
          )}
        </div>

        {/* My Dues Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {periods
            .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
            .map((period) => {
              const payment = myPayments.find((p) => (p.periodId || p.period_id) === period.id);
              const paid = payment ? Number(payment.amountPaid ?? payment.amount_paid) : 0;
              const isPaid = (payment?.status && (typeof payment.status === 'string' && payment.status.toLowerCase() === 'paid')) || paid >= period.amount;
              const balance = isPaid ? 0 : Math.max(period.amount - paid, 0);
              return (
                <div key={period.id} className="card p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{period.name}</h3>
                    {period.is_active ? (
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="flex h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                    )}
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Amount Due</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(period.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Amount Paid</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(paid)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Balance</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(balance)}</span>
                    </div>
                  </div>
                  {payment && (
                    <div className="mt-3">
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Payment History */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white">Payment History</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">All your recorded payments</p>
          <div className="mt-4 space-y-2">
            {myPayments.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No payments recorded yet
              </div>
            ) : (
              myPayments.map((payment) => {
                const targetPid = payment.periodId || payment.period_id;
                const period = periods.find((p) => p.id === targetPid);
                return (
                  <div
                    key={payment.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800/80 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {period ? period.name : 'Unknown period'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {payment.payment_date ? formatDate(payment.payment_date) : '—'} · {payment.payment_method}
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
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dues Tracking</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Record, edit, and track member dues payments by period
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab('choir')}
              className="rounded-md bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 transition-colors"
            >
              All Member Records
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className="rounded-md px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              My Dues
            </button>
          </div>
          <Button variant="secondary" onClick={exportCSV} disabled={rows.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-3">
        {periods
          .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
          .map((period) => {
            const isSelected = (selectedPeriodId || (periods.find((p) => p.is_active)?.id ?? periods[0]?.id)) === period.id;
            return (
              <button
                key={period.id}
                onClick={() => setSelectedPeriodId(period.id)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {period.name}
                {period.is_active && (
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
      </div>

      {selectedPeriod && summary && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <SummaryCard label="Expected" value={formatCurrency(summary.expected)} icon={NairaIcon} color="slate" />
            <SummaryCard label="Collected" value={formatCurrency(summary.collected)} icon={NairaIcon} color="emerald" />
            <SummaryCard
              label="Paid"
              value={summary.paidCount.toString()}
              icon={CheckCircle2}
              color="emerald"
              subtext={`of ${summary.total}`}
              active={filterStatus === 'Paid'}
              onClick={() => {
                setFilterStatus(filterStatus === 'Paid' ? 'All' : 'Paid');
                setShowFilters(true);
              }}
            />
            <SummaryCard
              label="Pending"
              value={summary.pendingCount.toString()}
              icon={XCircle}
              color="amber"
              subtext={`of ${summary.total}`}
              active={filterStatus === 'Pending'}
              onClick={() => {
                setFilterStatus(filterStatus === 'Pending' ? 'All' : 'Pending');
                setShowFilters(true);
              }}
            />
            <SummaryCard
              label="Partial"
              value={summary.partialCount.toString()}
              icon={NairaIcon}
              color="sky"
              subtext={`of ${summary.total}`}
              active={filterStatus === 'Partial'}
              onClick={() => {
                setFilterStatus(filterStatus === 'Partial' ? 'All' : 'Partial');
                setShowFilters(true);
              }}
            />
          </div>

          {/* Progress bar */}
          <div className="card p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Overall Collection Progress</span>
              <span className="font-semibold text-sky-600">
                {summary.expected > 0
                  ? `${((summary.collected / summary.expected) * 100).toFixed(0)}%`
                  : '0%'}
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-500"
                style={{
                  width: `${Math.min((summary.collected / summary.expected) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{formatCurrency(summary.collected)} collected</span>
              <span>{formatCurrency(summary.expected)} expected</span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search members…"
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
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4" />
              Filter
              {hasActiveFilters && <span className="ml-1 flex h-2 w-2 rounded-full bg-sky-500" />}
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 animate-slide-in dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status:</span>
              <FilterChip label="All" count={summary.total} active={filterStatus === 'All'} onClick={() => setFilterStatus('All')} />
              <FilterChip label="Paid" count={summary.paidCount} active={filterStatus === 'Paid'} onClick={() => setFilterStatus('Paid')} />
              <FilterChip label="Partial" count={summary.partialCount} active={filterStatus === 'Partial'} onClick={() => setFilterStatus('Partial')} />
              <FilterChip label="Pending" count={summary.pendingCount} active={filterStatus === 'Pending'} onClick={() => setFilterStatus('Pending')} />
              <FilterChip label="Waived" count={summary.waivedCount} active={filterStatus === 'Waived'} onClick={() => setFilterStatus('Waived')} />
              <FilterChip label="No Record" count={summary.memberRows.filter((r) => !r.payment).length} active={filterStatus === 'None'} onClick={() => setFilterStatus('None')} />
            </div>
          )}

          {/* Payments Table */}
          <div className="card overflow-hidden">
            {rows.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                No members match your search
              </div>
            ) : (
              <>
                {/* Desktop table with horizontal scroll and sticky actions */}
                <div className="w-full overflow-x-auto scrollbar-thin">
                  <table className="hidden w-full md:table min-w-[760px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[200px]">Member</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[120px]">Remaining Due</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[110px]">Paid</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[110px]">Status</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[120px]">Date</th>
                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[110px]">Method</th>
                        {canEdit && (
                          <th className="sticky right-0 z-20 bg-slate-50 dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] dark:shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.3)] min-w-[110px]">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {rows.map(({ member, payment }) => (
                        <tr key={member.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar firstName={member.first_name} lastName={member.last_name} photoURL={member.photoURL} size="sm" />
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                  {fullName(member.first_name, member.last_name)}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <VoicePartBadge part={member.voice_part} />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                            {(() => {
                              const totalExpected = selectedPeriod.amount;
                              const paidAmount = payment ? Number(payment.amountPaid ?? payment.amount_paid) : 0;
                              const remainingDue = Math.max(0, totalExpected - paidAmount);
                              return remainingDue === 0 ? (
                                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(0)} (Cleared)
                                </span>
                              ) : (
                                formatCurrency(remainingDue)
                              );
                            })()}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                            {payment ? formatCurrency(Number(payment.amountPaid ?? payment.amount_paid)) : '—'}
                          </td>
                          <td className="px-6 py-4">
                            {payment ? (
                              <PaymentStatusBadge status={payment.status} />
                            ) : (
                              <span className="badge bg-slate-100 text-slate-500 ring-1 ring-slate-400/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                                No Record
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {payment?.payment_date ? formatDate(payment.payment_date) : '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {payment?.payment_method ?? '—'}
                          </td>
                          {canEdit && (
                            <td className="sticky right-0 z-10 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 px-6 py-4 text-right shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] dark:shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.3)]">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => openModal(member, payment ?? null)}
                                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-slate-800"
                                >
                                  {payment ? 'Edit' : 'Record'}
                                </button>
                                {payment && (
                                  <button
                                    onClick={() => setClearTarget(payment)}
                                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                    title="Clear payment"
                                  >
                                    <X className="h-4 w-4" />
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

                {/* Mobile cards */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
                  {rows.map(({ member, payment }) => (
                    <div key={member.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar firstName={member.first_name} lastName={member.last_name} photoURL={member.photoURL} size="md" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {fullName(member.first_name, member.last_name)}
                            </p>
                            <VoicePartBadge part={member.voice_part} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {payment ? (
                            <PaymentStatusBadge status={payment.status} />
                          ) : (
                            <span className="badge bg-slate-100 text-slate-500 ring-1 ring-slate-400/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                              No Record
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <div>
                          <span className="text-slate-400">Due: </span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {(() => {
                              const totalExpected = selectedPeriod.amount;
                              const paidAmount = payment ? Number(payment.amountPaid ?? payment.amount_paid) : 0;
                              const remainingDue = Math.max(0, totalExpected - paidAmount);
                              return remainingDue === 0 ? '₦0 (Cleared)' : formatCurrency(remainingDue);
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">Paid: </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {payment ? formatCurrency(Number(payment.amountPaid ?? payment.amount_paid)) : '—'}
                          </span>
                        </div>
                      </div>
                      {payment?.payment_date && (
                        <p className="mt-2 text-xs text-slate-400">
                          Paid {formatDate(payment.payment_date)} via {payment.payment_method}
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        {canEdit && (
                          <button
                            onClick={() => openModal(member, payment ?? null)}
                            className="flex-1 rounded-lg bg-sky-50 px-3 py-2 text-xs font-medium text-sky-600 hover:bg-sky-100"
                          >
                            {payment ? 'Edit Payment' : 'Record Payment'}
                          </button>
                        )}
                        {canEdit && payment && (
                          <button
                            onClick={() => setClearTarget(payment)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Payment Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={existingPayment ? 'Edit Payment' : 'Record Payment'}
        subtitle={
          editingMember && selectedPeriod
            ? `${fullName(editingMember.first_name, editingMember.last_name)} — ${selectedPeriod.name}`
            : ''
        }
      >
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden justify-between">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 touch-pan-y">
            {formError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            {editingMember && (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <Avatar firstName={editingMember.first_name} lastName={editingMember.last_name} photoURL={editingMember.photoURL} size="sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {fullName(editingMember.first_name, editingMember.last_name)}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <VoicePartBadge part={editingMember.voice_part} />
                    <StatusBadge status={editingMember.status} />
                  </div>
                </div>
                {selectedPeriod && (
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Amount Due</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(selectedPeriod.amount)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Amount Paid
                </label>
                <div className="relative">
                  <NairaIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount_paid}
                    onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                    className="input-field pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Date</label>
                <input
                  type="date"
                  value={form.payment_date}
                  onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Payment Method</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value as PaymentMethod })}
                  className="select-field"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}
                  className="select-field"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Reference Number</label>
              <input
                type="text"
                value={form.reference_number}
                onChange={(e) => setForm({ ...form, reference_number: e.target.value })}
                className="input-field"
                placeholder="Check #, transaction ID, etc."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="input-field min-h-[60px] resize-y"
                placeholder="Optional notes…"
              />
            </div>
          </div>

          <div className="flex-none p-4 border-t bg-gray-50 flex justify-end gap-3 bg-white z-10">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : existingPayment ? 'Update Payment' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Clear Payment Confirmation */}
      <ConfirmDialog
        open={!!clearTarget}
        onClose={() => setClearTarget(null)}
        onConfirm={handleClear}
        title="Clear Payment Record"
        message="This will remove the payment record for this member and period. The member will show as having no payment on file. This action cannot be undone."
        confirmLabel={clearing ? 'Clearing…' : 'Clear Record'}
      />
    </div>
  );
}

function defaultForm(): PaymentFormData {
  return {
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    status: 'Paid',
    reference_number: '',
    notes: '',
  };
}

const summaryColors = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-600/20 dark:ring-emerald-500/30' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-600/20 dark:ring-amber-500/30' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-600/20 dark:ring-sky-500/30' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', ring: 'ring-slate-400/20 dark:ring-slate-700' },
};

function SummaryCard({
  label,
  value,
  subtext,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: ComponentType<{ className?: string }>;
  color: keyof typeof summaryColors;
  active?: boolean;
  onClick?: () => void;
}) {
  const c = summaryColors[color];
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`card p-4 transition-all ${
        isClickable
          ? 'cursor-pointer hover:border-sky-300 hover:shadow-xs active:scale-[0.99] select-none dark:hover:border-slate-700'
          : ''
      } ${
        active
          ? 'ring-2 ring-sky-500 border-transparent bg-sky-50/20 dark:bg-sky-950/20'
          : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${c.bg} ${c.text} ring-1 ${c.ring}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        </div>
        {active && (
          <span className="flex h-2 w-2 rounded-full bg-sky-500" title="Filter active" />
        )}
      </div>
      <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      {subtext && <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-400">{subtext}</p>}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
        active
          ? 'bg-sky-600 text-white shadow-xs'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
            active
              ? 'bg-sky-700 text-white'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
