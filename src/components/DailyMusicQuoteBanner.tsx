import { useState, useMemo } from 'react';
import { Sparkles, Music2, Quote, Copy, Check } from 'lucide-react';
import { getDailyQuote } from '@/lib/musicQuotes';

interface DailyMusicQuoteBannerProps {
  className?: string;
}

export function DailyMusicQuoteBanner({
  className = '',
}: DailyMusicQuoteBannerProps) {
  const currentQuote = useMemo(() => getDailyQuote(), []);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const textToCopy = `“${currentQuote.quote}” — ${currentQuote.author}${
        currentQuote.context ? ` (${currentQuote.context})` : ''
      }`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Format today's date nicely: e.g. "Saturday, Sep 26"
  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-indigo-600 to-blue-700 p-5 sm:p-6 text-white shadow-md transition-all duration-300 dark:from-slate-900 dark:via-sky-950/80 dark:to-indigo-950/80 dark:border dark:border-sky-800/40 dark:shadow-none ${className}`}
    >
      {/* Subtle decorative background watermarks */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-10 text-white transition-transform duration-500 group-hover:scale-105">
        <Music2 className="h-44 w-44" />
      </div>
      <div className="pointer-events-none absolute left-1/2 -top-8 -translate-x-1/2 opacity-5 text-white">
        <Quote className="h-32 w-32" />
      </div>

      <div className="relative z-10 flex flex-col justify-between gap-4">
        {/* Top bar with tag & interactive action (Only Copy button) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm dark:bg-sky-500/20 dark:text-sky-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              Daily Music Quote
            </span>
            <span className="hidden text-xs text-sky-100/80 sm:inline dark:text-slate-400">
              • {formattedToday}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white active:scale-95"
              title="Copy quote to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                  <span className="text-emerald-300 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 opacity-80" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quote body */}
        <div>
          <blockquote className="text-base sm:text-lg font-medium leading-relaxed tracking-tight text-white drop-shadow-sm font-serif italic">
            “{currentQuote.quote}”
          </blockquote>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-sky-100 dark:text-sky-200">
              — {currentQuote.author}
            </span>
            {currentQuote.context && (
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs text-sky-100/90 backdrop-blur-sm dark:bg-white/10 dark:text-slate-300">
                {currentQuote.context}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyMusicQuoteBanner;
