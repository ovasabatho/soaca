import { Calendar } from 'lucide-react';
import { MONTHS, DAYS } from '@/lib/constants';

interface BirthdaySelectProps {
  day: string;
  month: string;
  onDayChange: (day: string) => void;
  onMonthChange: (month: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export function BirthdaySelect({
  day,
  month,
  onDayChange,
  onMonthChange,
  disabled = false,
  required = false,
  className = '',
  size = 'md',
}: BirthdaySelectProps) {
  const selectClasses = size === 'sm'
    ? 'select-field text-xs sm:text-sm py-1.5'
    : 'select-field';

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="grid grid-cols-2 gap-3">
        {/* Day Dropdown */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Day {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              value={day}
              onChange={(e) => onDayChange(e.target.value)}
              disabled={disabled}
              required={required}
              className={selectClasses}
            >
              <option value="">-- Select Day --</option>
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Month Dropdown */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Month {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              disabled={disabled}
              required={required}
              className={selectClasses}
            >
              <option value="">-- Select Month --</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
        <Calendar className="h-3 w-3 flex-shrink-0" />
        <span>Used to celebrate your birthday with the choir (Year is not required)</span>
      </p>
    </div>
  );
}
