import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Cake, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { BirthdaySelect } from '@/components/BirthdaySelect';
import { isValidBirthday } from '@/lib/format';

interface BirthdayPromptModalProps {
  open: boolean;
  userName?: string | null;
  onSave: (birthdate: string) => Promise<void>;
}

export function BirthdayPromptModal({ open, userName, onSave }: BirthdayPromptModalProps) {
  const [mounted, setMounted] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!day || !month) {
      setError('Please select both your birth day and month');
      return;
    }

    const birthdate = `${day}-${month}`;
    if (!isValidBirthday(birthdate)) {
      setError('Please provide a valid day (01-31) and month (01-12)');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave(birthdate);
    } catch (err: unknown) {
      console.error('Failed to save birthday:', err);
      const msg = err instanceof Error ? err.message : 'Could not save birthday. Please try again.';
      setError(msg);
      setSaving(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="birthday-modal-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-8 animate-scale-up">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500" />

        {/* Icon & Heading */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950">
            <Cake className="h-8 w-8 text-white" />
            <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-300 animate-pulse" />
          </div>

          <h2
            id="birthday-modal-title"
            className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl"
          >
            Update Your Date of Birth
          </h2>

          {userName && (
            <p className="mt-0.5 text-xs font-medium text-sky-600 dark:text-sky-400">
              Welcome, {userName}!
            </p>
          )}

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Please select your birth day and month so the choir community can celebrate with you!
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <BirthdaySelect
            day={day}
            month={month}
            onDayChange={(val) => {
              setDay(val);
              if (error) setError('');
            }}
            onMonthChange={(val) => {
              setMonth(val);
              if (error) setError('');
            }}
            required
            disabled={saving}
          />

          <button
            type="submit"
            disabled={saving || !day || !month}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Birthday…
              </>
            ) : (
              <>
                <Cake className="h-4 w-4" />
                Save Birthday
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
