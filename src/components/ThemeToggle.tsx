import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';

interface ThemeToggleProps {
  variant?: 'sidebar' | 'compact' | 'icon';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'sidebar', className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'compact' || variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white ${className}`}
        title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
        aria-label={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      >
        {isDark ? (
          <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform duration-300" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-sky-600 transition-transform duration-300" />
        )}
      </button>
    );
  }

  // Sidebar variant: full width nav item with switch indicator
  return (
    <div
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      className={`group flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
    >
      <div className="flex items-center gap-3">
        {isDark ? (
          <Sun className="h-5 w-5 text-amber-400 transition-transform duration-300" />
        ) : (
          <Moon className="h-5 w-5 text-slate-400 group-hover:text-sky-600 transition-transform duration-300" />
        )}
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </div>

      {/* Pill Switch */}
      <div
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          isDark ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            isDark ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </div>
  );
};
