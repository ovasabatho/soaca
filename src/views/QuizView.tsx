import { useState, useMemo, useCallback } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Music,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
  Crown,
} from 'lucide-react';
import { MUSICAL_QUESTIONS } from '@/data/musicalQuestions';
import { recordQuizScore, logActivity } from '@/lib/firestore';
import type { Member } from '@/types';


interface ShuffledQuestion {
  id: number;
  question: string;
  category: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface UserAnswer {
  questionId: number;
  questionText: string;
  category: string;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

// Utility to shuffle an array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Prepare 10 random questions from the pool of 200+ with randomized option order
function generateQuizRound(count = 10): ShuffledQuestion[] {
  const shuffledPool = shuffleArray(MUSICAL_QUESTIONS);
  const selectedPool = shuffledPool.slice(0, Math.min(count, shuffledPool.length));

  return selectedPool.map((q) => {
    const correctOptionText = q.options[q.correctIndex];
    const shuffledOptions = shuffleArray(q.options);
    const newCorrectIndex = shuffledOptions.indexOf(correctOptionText);

    return {
      id: q.id,
      question: q.question,
      category: q.category,
      options: shuffledOptions,
      correctIndex: newCorrectIndex,
      explanation: q.explanation,
    };
  });
}

interface QuizViewProps {
  currentMember?: Member | null;
}

export function QuizView({ currentMember }: QuizViewProps) {
  const [gameState, setGameState] = useState<'intro' | 'active' | 'summary'>('intro');
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [scoreRegistered, setScoreRegistered] = useState(false);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('choir_quiz_high_score');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });


  // Start or restart a fresh 10-question test
  const handleStartNewTest = useCallback(() => {
    const newQuestions = generateQuizRound(10);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setStartTime(Date.now());
    setScoreRegistered(false);
    setGameState('active');
  }, []);

  const currentQuestion = questions[currentIndex];
  const isAnswered = selectedOption !== null;

  // Handle user clicking an answer option
  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOption(index);
    const isCorrect = index === currentQuestion.correctIndex;

    const answerRecord: UserAnswer = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      category: currentQuestion.category,
      options: currentQuestion.options,
      selectedIndex: index,
      correctIndex: currentQuestion.correctIndex,
      isCorrect,
      explanation: currentQuestion.explanation,
    };

    setAnswers((prev) => [...prev, answerRecord]);
  };

  // Move to next question or end the quiz after question 10
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      // End of quiz round (10th question finished)
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const elapsedSeconds = startTime ? Math.round((Date.now() - startTime) / 1000) : undefined;
      
      if (correctCount > highScore) {
        setHighScore(correctCount);
        if (typeof window !== 'undefined') {
          localStorage.setItem('choir_quiz_high_score', correctCount.toString());
        }
      }
      setGameState('summary');

      // Save to Firestore Daily Leaderboard
      recordQuizScore({
        score: correctCount,
        totalQuestions: 10,
        timeTakenSeconds: elapsedSeconds,
        member: currentMember || null,
      })
        .then(() => {
          setScoreRegistered(true);
        })
        .catch((err) => {
          console.error('Failed to record quiz score in Firestore:', err);
        });

      const memberName = currentMember ? `${currentMember.first_name} ${currentMember.last_name}` : 'Choir Member';
      logActivity({
        type: 'quiz_completed',
        actor_id: currentMember?.id || null,
        actor_name: memberName,
        actor_email: currentMember?.email,
        actor_role: currentMember?.role,
        target_name: 'Daily Music Quiz',
        action: `${memberName} completed the Daily Music Quiz (${correctCount}/10 • ${Math.round((correctCount / 10) * 100)}%)`,
        details: {
          score: correctCount,
          total_questions: 10,
          percentage: Math.round((correctCount / 10) * 100),
          time_taken_seconds: elapsedSeconds,
        },
        timestamp: new Date().toISOString(),
      }).catch(console.warn);
    }
  };


  const score = useMemo(() => answers.filter((a) => a.isCorrect).length, [answers]);
  const percentage = useMemo(() => Math.round((score / 10) * 100), [score]);

  // Performance feedback based on final score
  const performanceEvaluation = useMemo(() => {
    if (score === 10) {
      return {
        title: 'Maestro! Flawless Mastery! 🏆',
        badge: 'Perfect 10/10 Score',
        color: 'text-amber-500 dark:text-amber-400',
        bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
        message: 'Magnificent! You possess an extraordinary mastery of music theory, choral terminology, conducting gestures, and classical literature.',
      };
    }
    if (score >= 8) {
      return {
        title: 'Choir Virtuoso! ⭐',
        badge: 'Excellent Performance',
        color: 'text-sky-600 dark:text-sky-400',
        bg: 'bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800',
        message: 'Outstanding job! Your deep musical knowledge and acute understanding of choral performance shine through.',
      };
    }
    if (score >= 6) {
      return {
        title: 'Harmony Scholar! 🎵',
        badge: 'Solid Understanding',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
        message: 'Well done! You have a solid grasp of music fundamentals. Check the corrections below to polish the remaining nuances.',
      };
    }
    if (score >= 4) {
      return {
        title: 'Melody Apprentice! 🎶',
        badge: 'Good Effort',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
        message: 'Good effort! Review the detailed explanations below and take another test to expand your musical vocabulary.',
      };
    }
    return {
      title: 'Aspiring Chorister! 📖',
      badge: 'Keep Practicing',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800',
      message: 'Every great choir director and chorister starts here. Study the corrections below and give it another try!',
    };
  }, [score]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-300">
              <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
              <span>Choir Musical Knowledge Trainer</span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Music Theory & Choral Quiz</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-300">
              Test and sharpen your mastery of musical terms, tempo markings, dynamics, solfège, vocal registers, and sacred choral literature.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 backdrop-blur-md">
              <div className="text-xs text-slate-300">Question Pool</div>
              <div className="flex items-center gap-1.5 text-lg font-bold text-white">
                <BookOpen className="h-4 w-4 text-sky-400" />
                <span>{MUSICAL_QUESTIONS.length}+ Questions</span>
              </div>
            </div>

            {highScore > 0 && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 backdrop-blur-md">
                <div className="text-xs text-amber-200">High Score</div>
                <div className="flex items-center gap-1.5 text-lg font-bold text-amber-300">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>{highScore} / 10</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative background note glow */}
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* ========================================================= */}
      {/* 1. INTRO / START SCREEN */}
      {/* ========================================================= */}
      {gameState === 'intro' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <Music className="h-8 w-8" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
              Ready to Test Your Musical Ear & Knowledge?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Each round randomly selects <strong>10 questions</strong> from our extensive collection of over 200+ musical, vocal, and liturgical questions.
            </p>

            {/* Feature Pills */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-left dark:border-slate-800/80 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Flame className="h-4 w-4 text-rose-500" />
                  <span className="text-xs">Randomized Every Time</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  10 fresh, shuffled questions every time you start.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-left dark:border-slate-800/80 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs">Instant Color Feedback</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Immediate green/red visual response upon selecting answers.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-left dark:border-slate-800/80 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="text-xs">Detailed Summary</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Complete round analysis with explanations and corrections.
                </p>
              </div>
            </div>

            {/* Categories Covered Preview */}
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left dark:bg-slate-800/40">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Topics & Domains Included:
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[
                  'Tempo & Markings (Allegro, Andante, Presto...)',
                  'Dynamics (Pianissimo, Fortissimo, Sforzando...)',
                  'Music Theory & Clefs (Treble, Bass, Key Signatures)',
                  'Intervals, Chords & Scales',
                  'Vocal & Choral Registers (SATB, Head Voice, Falsetto)',
                  'Choral Techniques (Intonation, Blend, Diction, Solfège)',
                  'Sacred Liturgy & Mass Forms (Kyrie, Gloria, Requiem)',
                  'Great Choral Composers (Handel, Bach, Mozart, Tallis)',
                  'Conducting Gestures & Beat Patterns',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm dark:bg-slate-700 dark:text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleStartNewTest}
                className="inline-flex items-center gap-2.5 rounded-xl bg-sky-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-sky-600/30 transition-all hover:bg-sky-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start 10-Question Quiz</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ACTIVE QUIZ ROUND (Questions 1 to 10) */}
      {/* ========================================================= */}
      {gameState === 'active' && currentQuestion && (
        <div className="space-y-6">
          {/* Top Progress & Score Tracker */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  {currentIndex + 1}
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Score: {score} / {currentIndex + (isAnswered ? 1 : 0)}
                </span>
                <button
                  onClick={handleStartNewTest}
                  title="Restart test with 10 fresh questions"
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restart</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300 ease-out"
                style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            {/* Category Tag */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                {currentQuestion.category}
              </span>
            </div>

            {/* Question Text */}
            <h2 className="mt-3 text-lg font-bold text-slate-900 sm:text-xl md:text-2xl dark:text-white leading-snug">
              {currentQuestion.question}
            </h2>

            {/* Options List */}
            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((optionText, optionIdx) => {
                const isSelected = selectedOption === optionIdx;
                const isCorrectOption = optionIdx === currentQuestion.correctIndex;

                // Determine option styling based on selection state:
                // Rule: Red on wrong answer, Green on correct answer
                let optionStyle =
                  'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:hover:border-slate-600 dark:text-slate-200';
                let badgeStyle =
                  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
                let iconComponent = null;

                if (isAnswered) {
                  if (isSelected && isCorrectOption) {
                    // Selected AND Correct: Green highlight
                    optionStyle =
                      'border-emerald-500 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200';
                    badgeStyle = 'bg-emerald-600 text-white';
                    iconComponent = <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                  } else if (isSelected && !isCorrectOption) {
                    // Selected AND Wrong: Red highlight
                    optionStyle =
                      'border-rose-500 bg-rose-50/80 text-rose-900 ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-200';
                    badgeStyle = 'bg-rose-600 text-white';
                    iconComponent = <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />;
                  } else if (isCorrectOption) {
                    // Not selected, but is the correct answer: Green highlight
                    optionStyle =
                      'border-emerald-500 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200';
                    badgeStyle = 'bg-emerald-600 text-white';
                    iconComponent = <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                  } else {
                    // Other unselected wrong options: Dimmed
                    optionStyle =
                      'border-slate-200/60 bg-slate-50/40 text-slate-400 opacity-60 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-500';
                    badgeStyle = 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600';
                  }
                }

                const letterLabel = ['A', 'B', 'C', 'D'][optionIdx] || `${optionIdx + 1}`;

                return (
                  <button
                    key={optionIdx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(optionIdx)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left text-sm font-medium transition-all ${optionStyle} ${
                      !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${badgeStyle}`}
                      >
                        {letterLabel}
                      </span>
                      <span className="text-sm font-medium leading-normal">{optionText}</span>
                    </div>

                    {iconComponent}
                  </button>
                );
              })}
            </div>

            {/* Feedback Box & Next Button (appears once answered) */}
            {isAnswered && (
              <div className="mt-6 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                {/* Educational Explanation Box */}
                <div
                  className={`rounded-xl p-4 border text-sm ${
                    selectedOption === currentQuestion.correctIndex
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {selectedOption === currentQuestion.correctIndex ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold">
                        {selectedOption === currentQuestion.correctIndex
                          ? 'Correct Answer!'
                          : `Incorrect — The correct answer is: ${currentQuestion.options[currentQuestion.correctIndex]}`}
                      </p>
                      <p className="mt-1 text-xs opacity-90 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Continue / Next Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-sky-600/20 transition-all hover:bg-sky-700 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>{currentIndex + 1 === questions.length ? 'View Summary Corrections' : 'Next Question'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. QUIZ SUMMARY & CORRECTIONS (After Question 10) */}
      {/* ========================================================= */}
      {gameState === 'summary' && (
        <div className="space-y-6">
          {/* Final Score Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-inner ${
                  score >= 8
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                    : score >= 5
                    ? 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
                    : 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                }`}
              >
                {score === 10 ? '🏆' : score >= 8 ? '⭐' : score >= 5 ? '🎵' : '📖'}
              </div>

              <h2 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
                {performanceEvaluation.title}
              </h2>

              <p className="mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
                {performanceEvaluation.message}
              </p>

              {/* Score Numbers */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-center dark:border-slate-700 dark:bg-slate-800">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                    Final Score
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {score} <span className="text-base font-normal text-slate-400">/ 10</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-center dark:border-slate-700 dark:bg-slate-800">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                    Accuracy
                  </div>
                  <div className={`text-2xl font-extrabold ${score >= 8 ? 'text-emerald-600 dark:text-emerald-400' : score >= 5 ? 'text-sky-600 dark:text-sky-400' : 'text-slate-900 dark:text-white'}`}>
                    {percentage}%
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-center dark:border-slate-700 dark:bg-slate-800">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
                    High Score
                  </div>
                  <div className="text-2xl font-extrabold text-amber-500">
                    {highScore} <span className="text-base font-normal text-slate-400">/ 10</span>
                  </div>
                </div>
              </div>

              {/* Daily Leaderboard Registration Banner */}
              <div className="mt-6 flex max-w-xl items-center gap-3 rounded-2xl border border-amber-300/70 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 p-4 text-left shadow-sm dark:border-amber-700/60 dark:bg-amber-950/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="text-xs sm:text-sm">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {scoreRegistered ? '🎯 Score Registered for Today’s Leaderboard!' : 'Recording Score for Today’s Leaderboard...'}
                  </p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300 text-xs">
                    The member with the highest score today will be crowned <strong>Yesterday’s Top Music Guru</strong> at 12:00 AM midnight at the top of the dashboard for everyone to see!
                  </p>
                </div>
              </div>

              {/* Primary Action Button to Start Another Test */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleStartNewTest}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-sky-600/30 transition-all hover:bg-sky-700 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Take Another Test (10 New Questions)</span>
                </button>
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* DETAILED SUMMARY CORRECTIONS */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Quiz Summary Corrections & Solutions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review the full breakdown of all 10 questions with correct musical answers and explanations.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {score} Correct • {10 - score} Incorrect
              </span>
            </div>

            <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
              {answers.map((ans, idx) => {
                const userSelectedText = ans.options[ans.selectedIndex];
                const correctOptionText = ans.options[ans.correctIndex];

                return (
                  <div key={idx} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {idx + 1}
                        </span>
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {ans.category}
                        </span>
                      </div>

                      {ans.isCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                          <XCircle className="h-3.5 w-3.5" />
                          Incorrect
                        </span>
                      )}
                    </div>

                    {/* Question */}
                    <h4 className="mt-2 text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
                      {ans.questionText}
                    </h4>

                    {/* Answers Comparison */}
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div
                        className={`rounded-lg border p-2.5 text-xs ${
                          ans.isCorrect
                            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200'
                            : 'border-rose-200 bg-rose-50/50 text-rose-900 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-200'
                        }`}
                      >
                        <div className="font-semibold text-[11px] opacity-75">Your Answer:</div>
                        <div className="mt-0.5 font-medium flex items-center gap-1.5">
                          {ans.isCorrect ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          )}
                          <span>{userSelectedText}</span>
                        </div>
                      </div>

                      {!ans.isCorrect && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                          <div className="font-semibold text-[11px] opacity-75">Correct Answer:</div>
                          <div className="mt-0.5 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{correctOptionText}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    <div className="mt-2.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Explanation: </span>
                      {ans.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Button to Start New Test */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center dark:border-slate-800">
              <button
                onClick={handleStartNewTest}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-sky-600/30 transition-all hover:bg-sky-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Take Another Test (10 New Questions)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
