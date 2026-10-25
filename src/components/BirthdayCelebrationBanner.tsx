import { useState } from 'react';
import { Cake, Sparkles, PartyPopper, Calendar, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { VoicePartBadge } from '@/components/Badges';
import { getUpcomingBirthdays, type BirthdayInfo } from '@/lib/birthdays';
import type { Member } from '@/types';

interface BirthdayCelebrationBannerProps {
  members: Member[];
}

export function BirthdayCelebrationBanner({ members }: BirthdayCelebrationBannerProps) {
  const [showUpcoming, setShowUpcoming] = useState(false);
  const { today, upcoming } = getUpcomingBirthdays(members, 30);

  if (today.length === 0 && upcoming.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 1. TODAY'S BIRTHDAYS BANNER */}
      {today.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-pink-400/60 bg-gradient-to-br from-pink-500/15 via-rose-500/10 to-purple-500/15 p-5 shadow-lg shadow-pink-500/10 sm:p-6 dark:border-pink-500/40 dark:from-pink-950/40 dark:via-slate-900/90 dark:to-purple-950/30 animate-fade-in">
          <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-pink-400/20 blur-3xl" />
          <div className="pointer-events-none absolute left-1/3 -bottom-8 h-32 w-32 rounded-full bg-rose-400/15 blur-2xl" />

          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-300/40 dark:border-pink-800/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-white shadow-sm">
                  <PartyPopper className="h-3.5 w-3.5" />
                  <span>Today&apos;s Choir Birthday Celebration!</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 dark:bg-pink-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-pink-900 dark:text-pink-300">
                  <Sparkles className="h-3 w-3 text-pink-500 animate-pulse" />
                  Special Day
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {today.map((info: BirthdayInfo) => {
                const name = `${info.member.first_name} ${info.member.last_name}`;
                return (
                  <div
                    key={info.member.id}
                    className="flex items-center gap-4 rounded-2xl border border-pink-300/80 bg-white/90 p-4 shadow-md dark:border-pink-700/60 dark:bg-slate-900/90 backdrop-blur-xs transition-transform hover:scale-[1.02]"
                  >
                    <div className="relative shrink-0">
                      <div className="rounded-2xl p-1 bg-gradient-to-tr from-pink-500 via-rose-400 to-purple-500 shadow-md">
                        <Avatar
                          firstName={info.member.first_name}
                          lastName={info.member.last_name}
                          photoURL={info.member.photoURL}
                          size="lg"
                          className="ring-2 ring-white dark:ring-slate-900"
                        />
                      </div>
                      <div className="absolute -top-2.5 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md animate-bounce">
                        <Cake className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 dark:text-white text-base truncate">
                          {name}
                        </h4>
                        {info.member.voice_part && (
                          <VoicePartBadge part={info.member.voice_part} />
                        )}
                      </div>
                      <p className="text-xs font-medium text-pink-700 dark:text-pink-300 leading-snug">
                        🎉 Happy Birthday! Wishing you a blessed and wonderful day! 🎂
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. UPCOMING BIRTHDAYS (NEXT 30 DAYS) WIDGET */}
      {upcoming.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400">
                <Cake className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Upcoming Birthdays (Next 30 Days)</span>
                  <span className="rounded-full bg-pink-100 dark:bg-pink-950 px-2 py-0.5 text-xs font-bold text-pink-700 dark:text-pink-300">
                    {upcoming.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Stay informed and celebrate upcoming choir member birthdays ahead of time.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowUpcoming(!showUpcoming)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="h-3.5 w-3.5 text-pink-500" />
              <span>{showUpcoming ? 'Hide List' : 'View List'}</span>
              {showUpcoming ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showUpcoming && (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in pt-2 border-t border-slate-100 dark:border-slate-800">
              {upcoming.map((info: BirthdayInfo) => {
                const name = `${info.member.first_name} ${info.member.last_name}`;
                const countdownLabel = info.daysUntil === 1 ? 'Tomorrow' : `in ${info.daysUntil} days`;
                return (
                  <div
                    key={info.member.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <Avatar
                      firstName={info.member.first_name}
                      lastName={info.member.last_name}
                      photoURL={info.member.photoURL}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {name}
                        </h4>
                        {info.member.voice_part && (
                          <VoicePartBadge part={info.member.voice_part} />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-pink-600 dark:text-pink-400">
                          <Calendar className="h-3 w-3" />
                          {info.formattedDate}
                        </span>
                        <span>•</span>
                        <span className="rounded bg-pink-100 dark:bg-pink-950/60 px-1.5 py-0.2 text-[10px] font-bold text-pink-700 dark:text-pink-300">
                          {countdownLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
