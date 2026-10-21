import type { Member, DuesPeriod, DuesPayment, PaymentStatus } from '@/types';

export interface PeriodDuesSummary {
  period: DuesPeriod | null;
  activePeriodId: string;
  eligibleMembers: Member[];
  totalEligible: number;
  total: number;
  expected: number;
  collected: number;
  paidCount: number;
  partialCount: number;
  pendingCount: number;
  waivedCount: number;
  collectionRate: number;
  memberRows: Array<{ member: Member; payment: DuesPayment | undefined }>;
}

/**
 * Normalizes any payment status string (e.g. 'partial', 'PARTIAL', 'Partial', 'paid')
 * to the canonical PaymentStatus union ('Paid' | 'Partial' | 'Pending' | 'Waived').
 */
export function normalizePaymentStatus(status: unknown): PaymentStatus {
  if (!status || typeof status !== 'string') return 'Pending';
  const s = status.trim().toLowerCase();
  if (s === 'paid') return 'Paid';
  if (s === 'partial') return 'Partial';
  if (s === 'waived') return 'Waived';
  return 'Pending';
}

/**
 * Validates whether a payment status is verified for dues collection accounting.
 */
export function isVerifiedPaymentStatus(status: unknown): boolean {
  if (!status || typeof status !== 'string') return false;
  const s = status.trim().toLowerCase();
  return s === 'paid' || s === 'partial';
}

/**
 * Unified calculation function to ensure Dashboard and Dues Tracking (DuesView)
 * produce the exact same total collected, expected, and status breakdown figures
 * for any given dues period.
 */
export function calculatePeriodDuesSummary(
  members: Member[] = [],
  period: DuesPeriod | null,
  payments: DuesPayment[] = []
): PeriodDuesSummary {
  const safeMembers = members || [];
  const safePayments = payments || [];

  if (!period) {
    return {
      period: null,
      activePeriodId: '',
      eligibleMembers: [],
      totalEligible: 0,
      total: 0,
      expected: 0,
      collected: 0,
      paidCount: 0,
      partialCount: 0,
      pendingCount: 0,
      waivedCount: 0,
      collectionRate: 0,
      memberRows: [],
    };
  }

  const activePeriodId = period.id || '';
  // Eligible members: Active and On Leave (excluding Inactive members)
  const eligibleMembers = safeMembers.filter((m) => m && m.status !== 'Inactive');
  const expected = eligibleMembers.length * (period.amount || 0);

  let collected = 0;
  let paidCount = 0;
  let partialCount = 0;
  let pendingCount = 0;
  let waivedCount = 0;

  const memberRows = eligibleMembers.map((member) => {
    const payment = safePayments.find((p) => {
      if (!p) return false;
      const pPeriod = p.periodId || p.period_id;
      if (pPeriod !== activePeriodId) return false;
      const pMember = p.memberId || p.member_id;
      return (
        pMember === member.id ||
        (member.uid && pMember === member.uid) ||
        (member.user_id && pMember === member.user_id)
      );
    });

    let rowPayment: DuesPayment | undefined = undefined;

    if (!payment) {
      pendingCount++;
    } else {
      const normStatus = normalizePaymentStatus(payment.status);
      const amount = Number(payment.amountPaid ?? payment.amount_paid ?? 0);

      if (normStatus === 'Paid') {
        paidCount++;
        // If payment is marked Paid, use recorded amount or full period amount if amount was omitted
        collected += amount > 0 ? amount : period.amount;
      } else if (normStatus === 'Partial') {
        partialCount++;
        collected += amount;
      } else if (normStatus === 'Waived') {
        waivedCount++;
      } else {
        // Pending status
        pendingCount++;
      }

      rowPayment = {
        ...payment,
        status: normStatus,
      };
    }

    return { member, payment: rowPayment };
  });

  const collectionRate = expected > 0 ? (collected / expected) * 100 : 0;

  return {
    period,
    activePeriodId,
    eligibleMembers,
    totalEligible: eligibleMembers.length,
    total: eligibleMembers.length,
    expected,
    collected,
    paidCount,
    partialCount,
    pendingCount,
    waivedCount,
    collectionRate,
    memberRows,
  };
}
