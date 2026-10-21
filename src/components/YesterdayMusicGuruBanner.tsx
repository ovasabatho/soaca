import { useState } from 'react';
import {
  Trophy,
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PartyPopper,
  HelpCircle,
  Flame,
  Zap,
} from 'lucide-react';

import { Avatar } from '@/components/Avatar';
import { VoicePartBadge } from '@/components/Badges';
import type { DailyMusicGuru, GuruProfile, ReigningGuruData, VoicePart } from '@/types';

interface YesterdayMusicGuruBannerProps {
  guru?: DailyMusicGuru | null;
  guruData?: ReigningGuruData | null;
  onNavigateQuiz: () => void;
  hasNewRecordToday?: boolean;
}

export function YesterdayMusicGuruBanner({
  guru,
  guruData,
  onNavigateQuiz,
}: YesterdayMusicGuruBannerProps) {
  // Determine effective guru dataset
  const hasTodayGuru = guruData ? guruData.hasTodayGuru : !!(guru && guru.isToday);
  const todayGurus: GuruProfile[] = guruData
    ? guruData.todayGurus
    : (guru?.isToday ? [guru, ...(guru.tiedGurus || [])] : []);
  
  const previousGurus: GuruProfile[] = guruData
    ? guruData.previousGurus
    : (!guru?.isToday && guru ? [guru, ...(guru.tiedGurus || [])] : []);
  
  const previousGuru: GuruProfile | null = guruData
    ? guruData.previousGuru
    : (!guru?.isToday && guru ? guru : null);

  const isTie = todayGurus.length > 1;
  const topScore = guruData?.topScore ?? (todayGurus[0]?.score ?? (previousGuru?.score ?? 0));
  const topPercentage = guruData?.percentage ?? (todayGurus[0]?.percentage ?? (previousGuru?.percentage ?? 0));

  const [clapped, setClapped] = useState(false);
  const storageKey = `guru_claps_${todayGurus[0]?.dateKey || previousGuru?.dateKey || 'today'}`;
  const [clapCount, setClapCount] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseInt(saved, 10) : 28;
    }
    return 28;
  });

  const handleClap = () => {
    const newCount = clapCount + 1;
    setClapCount(newCount);
    setClapped(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newCount.toString());
    }
    setTimeout(() => setClapped(false), 800);
  };

  const getPraiseText = (g: GuruProfile | null) => {
    if (!g) return '';
    if (g.score === 10) {
      return 'Flawless 10/10 mastery! Demonstrating supreme knowledge of sacred choral repertoire, solfège, and music theory.';
    }
    if (g.score >= 8) {
      return `Outstanding choral knowledge with ${g.score}/${g.totalQuestions} correct answers!`;
    }
    if (g.score >= 5) {
      return `Leading today's choir challenge with ${g.score}/${g.totalQuestions} (${g.percentage}%) correct answers!`;
    }
    return `Holding the top spot for today with ${g.score}/${g.totalQuestions} (${g.percentage}%)!`;
  };

  // =========================================================================
  // STATE 1: TODAY HAS A TIE / TALLY (Multiple Joint Music Gurus for Today!)
  // =========================================================================
  if (hasTodayGuru && isTie) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/70 bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-orange-500/20 p-5 shadow-lg shadow-amber-500/10 sm:p-6 dark:border-amber-500/50 dark:from-amber-950/50 dark:via-slate-900/95 dark:to-orange-950/40 animate-fade-in">
        <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-amber-400/25 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-8 h-32 w-32 rounded-full bg-yellow-400/20 blur-2xl" />

        <div className="relative flex flex-col gap-5">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300/40 dark:border-amber-800/40 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-sm">
                <Crown className="h-3.5 w-3.5 fill-amber-950" />
                <span>Joint Music Gurus (Tied!)</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 dark:bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
                <Sparkles className="h-3 w-3 text-amber-500" />
                {todayGurus.length} Choristers Tied for Today&apos;s Crown
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-emerald-100 dark:bg-emerald-950/90 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Tied Score: {topScore}/10 ({topPercentage}%)
              </span>
            </div>
          </div>

          {/* Body: All Tied Gurus Side-by-Side */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  👑 Today&apos;s Co-Reigning Music Gurus
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                A dead heat at the top! {todayGurus.map((g) => g.userName).join(' & ')} both achieved the highest score today with {topScore}/10 ({topPercentage}%)!
              </p>

              {/* Grid of Tied Gurus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {todayGurus.map((g) => {
                  const parts = (g.userName || 'Choir Member').split(' ');
                  return (
                    <div
                      key={g.userId}
                      className="flex items-center gap-3 rounded-2xl border border-amber-300/80 bg-white/90 p-3 shadow-xs dark:border-amber-700/60 dark:bg-slate-900/90"
                    >
                      <div className="relative shrink-0">
                        <div className="rounded-xl p-0.5 bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-sm">
                          <Avatar
                            firstName={parts[0] || 'Choir'}
                            lastName={parts.slice(1).join(' ') || ''}
                            photoURL={g.userPhoto}
                            size="md"
                            className="ring-2 ring-white dark:ring-slate-900"
                          />
                        </div>
                        <div className="absolute -top-2 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-xs">
                          <Crown className="h-3.5 w-3.5 fill-amber-950" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                            {g.userName}
                          </h4>
                          {g.voicePart && <VoicePartBadge part={g.voicePart as VoicePart} />}
                        </div>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          {g.score}/10 Correct ({g.percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions: Cheer & Challenge */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center lg:flex-col lg:items-end">
              <button
                onClick={handleClap}
                title="Cheer and congratulate both gurus!"
                className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
                  clapped
                    ? 'scale-105 border-amber-400 bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-100'
                    : 'border-amber-300/80 bg-white/90 text-amber-900 hover:bg-amber-50 dark:border-amber-700/60 dark:bg-slate-900/90 dark:text-amber-300 dark:hover:bg-slate-800'
                }`}
              >
                <PartyPopper className={`h-4 w-4 text-amber-600 dark:text-amber-400 ${clapped ? 'animate-spin' : ''}`} />
                <span>Cheer Champions 👏</span>
                <span className="rounded-full bg-amber-200 dark:bg-amber-800 px-1.5 py-0.2 text-[10px] font-black text-amber-950 dark:text-amber-200">
                  {clapCount}
                </span>
              </button>

              <button
                onClick={onNavigateQuiz}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <span>Join the Tally or Beat Score</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE 2: TODAY HAS A SINGLE REIGNING MUSIC GURU
  // =========================================================================
  if (hasTodayGuru && todayGurus.length === 1) {
    const currentGuru = todayGurus[0];
    const nameParts = (currentGuru.userName || 'Choir Member').split(' ');
    const firstName = nameParts[0] || 'Choir';
    const lastName = nameParts.slice(1).join(' ') || '';

    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15 p-5 shadow-lg shadow-amber-500/10 sm:p-6 dark:border-amber-500/40 dark:bg-gradient-to-br dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/30 animate-fade-in">
        <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-8 h-32 w-32 rounded-full bg-yellow-400/15 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Avatar & Info */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative shrink-0 self-start sm:self-center">
              <div className="relative rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-md shadow-amber-500/30">
                <Avatar
                  firstName={firstName}
                  lastName={lastName}
                  photoURL={currentGuru.userPhoto}
                  size="xl"
                  className="ring-2 ring-white dark:ring-slate-900"
                />
              </div>
              <div className="absolute -top-3 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-md ring-2 ring-white dark:ring-slate-900 animate-bounce">
                <Crown className="h-4 w-4 fill-amber-900 text-amber-950" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-sm">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Today&apos;s Reigning Music Guru</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                  <Sparkles className="h-3 w-3 text-amber-500" />
                  Leading Today
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                  {currentGuru.userName}
                </h3>
                {currentGuru.voicePart && (
                  <VoicePartBadge part={currentGuru.voicePart as VoicePart} />
                )}
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {currentGuru.score}/{currentGuru.totalQuestions} Correct ({currentGuru.percentage}%)
                </span>
              </div>

              <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {getPraiseText(currentGuru)}
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center lg:flex-col lg:items-end">
            <button
              onClick={handleClap}
              title="Cheer and congratulate our Music Guru!"
              className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
                clapped
                  ? 'scale-105 border-amber-400 bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-100'
                  : 'border-amber-300/80 bg-white/80 text-amber-900 hover:bg-amber-50 dark:border-amber-700/60 dark:bg-slate-900/90 dark:text-amber-300 dark:hover:bg-slate-800'
              }`}
            >
              <PartyPopper className={`h-4 w-4 text-amber-600 dark:text-amber-400 ${clapped ? 'animate-spin' : ''}`} />
              <span>Congratulate 👏</span>
              <span className="rounded-full bg-amber-200/80 px-1.5 py-0.2 text-[10px] font-black text-amber-900 dark:bg-amber-800 dark:text-amber-200">
                {clapCount}
              </span>
            </button>

            <button
              onClick={onNavigateQuiz}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <span>Challenge or Tally Today</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE 3: NO RECORD TODAY YET (Fresh Day Reset / Waiting for Guru)
  // - Shows Big Question Mark Icon + "Who will be next reigning guru?" + "Go In & Try Now"
  // - If NO previous record exists, the previous champion container is completely removed!
  // - If a previous guru DOES exist from real past records, displays the previous guru card.
  // =========================================================================
  const hasPreviousRecord = !!previousGuru;

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15 p-5 shadow-lg shadow-amber-500/10 sm:p-6 dark:border-amber-500/40 dark:bg-gradient-to-br dark:from-amber-950/40 dark:via-slate-900/90 dark:to-orange-950/30 animate-fade-in">
      <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 -bottom-8 h-32 w-32 rounded-full bg-yellow-400/15 blur-2xl" />

      <div className="relative flex flex-col gap-5">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300/40 dark:border-amber-800/40 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-0.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-sm">
              <Trophy className="h-3.5 w-3.5" />
              <span>Daily Music Guru Challenge</span>
            </span>

            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 dark:bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 dark:text-amber-300">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Fresh Day • Throne Open
            </span>
          </div>

          <span className="text-xs font-medium text-amber-900/80 dark:text-amber-300/80 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-orange-500 animate-pulse" />
            <span>Refreshes daily at 12:00 AM • Even 1/10 (10%) takes the crown!</span>
          </span>
        </div>

        {/* Content: If previous record exists, 2-column grid; if no previous record, full-width with NO extra container */}
        <div className={hasPreviousRecord ? 'grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center' : 'w-full'}>
          {/* Question Mark + Who will be next reigning guru + Try Now CTA */}
          <div className={hasPreviousRecord ? 'lg:col-span-7 flex flex-col gap-4' : 'flex flex-col md:flex-row md:items-center md:justify-between gap-5'}>
            <div className="flex items-start gap-4 flex-1">
              {/* Big Question Mark Icon with Crown */}
              <div className="relative shrink-0">
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 text-slate-950 shadow-xl shadow-amber-500/30 ring-4 ring-white dark:ring-slate-800 transition-transform hover:scale-105">
                  <HelpCircle className="h-9 w-9 sm:h-12 sm:w-12 stroke-[2.5] text-slate-950 animate-pulse" />
                  <div className="absolute -top-3 -right-2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-950 shadow-md ring-2 ring-white dark:ring-slate-900 animate-bounce">
                    <Crown className="h-4 w-4 fill-amber-900 text-amber-950" />
                  </div>
                </div>
              </div>

              {/* Title & Question Write-up */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Who will be the next Reigning Music Guru?
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Today is refreshed and the crown is wide open! The first chorister to play today—even with a score of <strong>1/10 (10%)</strong>—is immediately crowned today&apos;s Music Guru. If there&apos;s a tie, all tied members share the crown!
                </p>
              </div>
            </div>

            {/* Offer Call-to-Action to Go In & Try Now */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1 ${hasPreviousRecord ? '' : 'shrink-0'}`}>
              <button
                onClick={onNavigateQuiz}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-6 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 hover:shadow-xl hover:from-amber-400 hover:to-yellow-300"
              >
                <Zap className="h-4 w-4 fill-slate-950" />
                <span>Go In & Try Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                10 questions • Instant answer feedback
              </span>
            </div>
          </div>

          {/* Right Column: ONLY rendered if a REAL previous record exists */}
          {hasPreviousRecord && previousGuru && (
            <div className="lg:col-span-5 rounded-2xl border border-amber-300/80 bg-white/90 p-4 shadow-md dark:border-amber-700/60 dark:bg-slate-900/90 backdrop-blur-xs flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2 border-b border-amber-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
                  <span>
                    {previousGurus.length > 1
                      ? 'Previous Reigning Champions (Tied)'
                      : 'Previous Reigning Champion'}
                  </span>
                </div>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  {previousGuru.dateLabel}
                </span>
              </div>

              <div className="space-y-2.5">
                {previousGurus.slice(0, 2).map((prev) => {
                  const parts = (prev.userName || 'Choir Member').split(' ');
                  return (
                    <div key={prev.userId} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="rounded-xl p-0.5 bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-xs">
                          <Avatar
                            firstName={parts[0] || 'Choir'}
                            lastName={parts.slice(1).join(' ') || ''}
                            photoURL={prev.userPhoto}
                            size="md"
                            className="ring-2 ring-white dark:ring-slate-900"
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                            {prev.userName}
                          </h4>
                          {prev.voicePart && <VoicePartBadge part={prev.voicePart as VoicePart} />}
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          <CheckCircle2 className="h-3 w-3" />
                          {prev.score}/{prev.totalQuestions} ({prev.percentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}

                {previousGurus.length > 2 && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    +{previousGurus.length - 2} more choristers tied with this score
                  </p>
                )}
              </div>

              {/* Interactive Cheer Button */}
              <div className="flex items-center justify-between pt-2 border-t border-amber-100/60 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Previous benchmark
                </span>

                <button
                  onClick={handleClap}
                  title="Cheer and congratulate previous champion"
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold transition-all ${
                    clapped
                      ? 'scale-105 border-amber-400 bg-amber-200 text-amber-950 dark:bg-amber-900 dark:text-amber-100'
                      : 'border-amber-200 bg-amber-50/70 text-amber-900 hover:bg-amber-100 dark:border-amber-800/80 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <PartyPopper className={`h-3.5 w-3.5 text-amber-600 dark:text-amber-400 ${clapped ? 'animate-spin' : ''}`} />
                  <span>Cheer 👏</span>
                  <span className="rounded-full bg-amber-200 dark:bg-amber-800 px-1.5 py-0.2 text-[10px] font-black text-amber-950 dark:text-amber-200">
                    {clapCount}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
