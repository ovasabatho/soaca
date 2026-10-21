import type { MemberStatus, PaymentStatus, VoicePart } from '@/types';
import { normalizePaymentStatus } from '@/lib/dues';

const statusStyles: Record<MemberStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-500/30',
  Inactive: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
  'On Leave': 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-500/30',
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  Paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-500/30',
  Partial: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-500/30',
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-500/30',
  Waived: 'bg-slate-100 text-slate-500 ring-1 ring-slate-400/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700',
};

const voicePartStyles: Record<VoicePart, string> = {
  Soprano: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-500/30',
  Alto: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-500/30',
  Tenor: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-500/30',
  Bass: 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20 dark:bg-teal-950/50 dark:text-teal-300 dark:ring-teal-500/30',
};

export function StatusBadge({ status }: { status: MemberStatus }) {
  return <span className={`badge ${statusStyles[status]}`}>{status}</span>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus | string }) {
  const normalized = normalizePaymentStatus(status);
  return <span className={`badge ${paymentStatusStyles[normalized]}`}>{normalized}</span>;
}

export function VoicePartBadge({ part }: { part: VoicePart }) {
  return <span className={`badge ${voicePartStyles[part]}`}>{part}</span>;
}
