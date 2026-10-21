import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  CalendarRange,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { NairaIcon } from '@/components/NairaIcon';
import type { DuesPeriod, DuesPayment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/format';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface PeriodsViewProps {
  periods: DuesPeriod[];
  payments: DuesPayment[];
  membersCount: number;
  loading: boolean;
  onAdd: (data: Omit<DuesPeriod, 'id' | 'created_at'>) => Promise<void>;
  onUpdate: (id: string, data: Partial<DuesPeriod>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type FormData = {
  name: string;
  amount: string;
  start_date: string;
  due_date: string;
  description: string;
  is_active: boolean;
};

const emptyForm: FormData = {
  name: '',
  amount: '',
  start_date: new Date().toISOString().split('T')[0],
  due_date: new Date().toISOString().split('T')[0],
  description: '',
  is_active: true,
};

export function PeriodsView({
  periods,
  payments,
  membersCount,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}: PeriodsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DuesPeriod | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DuesPeriod | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const getPeriodStats = (periodId: string) => {
    const periodPayments = payments.filter((p) => (p.periodId || p.period_id) === periodId);
    const collected = periodPayments.reduce(
      (sum, p) => sum + Number(p.amountPaid ?? p.amount_paid ?? 0),
      0
    );
    const paidCount = periodPayments.filter(
      (p) => p.status === 'Paid' || (typeof p.status === 'string' && p.status.toLowerCase() === 'paid')
    ).length;
    return { collected, paidCount, totalRecords: periodPayments.length };
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (period: DuesPeriod) => {
    setEditing(period);
    setForm({
      name: period.name,
      amount: period.amount.toString(),
      start_date: period.start_date,
      due_date: period.due_date,
      description: period.description ?? '',
      is_active: period.is_active,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Period name is required');
      return;
    }
    if (!form.amount || Number(form.amount) < 0) {
      setFormError('Amount must be a valid positive number');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const data = {
        name: form.name.trim(),
        amount: Number(form.amount),
        start_date: form.start_date,
        due_date: form.due_date,
        description: form.description.trim(),
        is_active: form.is_active,
      };
      if (editing) {
        await onUpdate(editing.id, data);
      } else {
        await onAdd(data);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save period');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dues Periods</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create and manage dues collection periods
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          New Period
        </Button>
      </div>

      {/* Periods Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
        </div>
      ) : sortedPeriods.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <CalendarRange className="h-6 w-6 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-900">No dues periods yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first dues collection period to start tracking payments
          </p>
          <Button onClick={openAdd} className="mt-4">
            <Plus className="h-4 w-4" />
            New Period
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedPeriods.map((period) => {
            const stats = getPeriodStats(period.id);
            const expected = membersCount * period.amount;
            const rate = expected > 0 ? (stats.collected / expected) * 100 : 0;
            return (
              <div
                key={period.id}
                className="card p-5 transition-all hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        period.is_active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {period.is_active ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{period.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {period.is_active ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(period)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-sky-600 dark:hover:bg-slate-800 dark:hover:text-sky-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(period)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(period.amount)}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">per member</span>
                </div>

                {/* Dates */}
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>Start: {formatDate(period.start_date)}</span>
                  <span>Due: {formatDate(period.due_date)}</span>
                </div>

                {period.description && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    {period.description}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Collected</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(stats.collected)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {stats.paidCount} paid · {stats.totalRecords} records
                    </span>
                    <span className="font-medium text-sky-600 dark:text-sky-400">
                      {rate.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-500"
                      style={{ width: `${Math.min(rate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Dues Period' : 'New Dues Period'}
        subtitle={editing ? 'Update period details' : 'Create a new dues collection period'}
      >
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden justify-between">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 touch-pan-y">
            {formError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Period Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                placeholder="e.g., Annual Dues 2025"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount per Member <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <NairaIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="input-field pl-10"
                  placeholder="12000"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Due Date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field min-h-[70px] resize-y"
                placeholder="Optional description…"
              />
            </div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">Active period (members can submit payments)</span>
            </label>
          </div>
          <div className="flex-none p-4 border-t bg-gray-50 flex justify-end gap-3 bg-white z-10">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Period'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Dues Period"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all payment records for this period. This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting…' : 'Delete Period'}
      />
    </div>
  );
}
