import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Difficulty, Question, QuizResult, User } from '../types';
import { getSubjects } from '../utils/storage';

export interface QuizProps {
  user: User;
  subject: string;
  difficulty: Difficulty;
  questions: Question[];
  timeLimit: number; // minutes
  selectedSubjects?: string[];
  onComplete: (result: QuizResult, questions: Question[], answers: number[]) => void;
  onCancel: () => void;
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Quiz({ user, subject, difficulty, questions, timeLimit, selectedSubjects, onComplete, onCancel }: QuizProps) {
  const totalTime = timeLimit * 60;

  const subjectName = useMemo(() => {
    if (subject === 'custom' && selectedSubjects && selectedSubjects.length > 0) {
      const subs = getSubjects();
      const names = selectedSubjects.map(id => subs.find(s => s.id === id)?.name ?? id);
      return names.length <= 3 ? names.join(' + ') : `${names.slice(0, 2).join(' + ')} +${names.length - 2}`;
    }
    if (subject === 'combined') return 'All Combined';
    const subs = getSubjects();
    return subs.find(s => s.id === subject)?.name ?? subject;
  }, [subject, selectedSubjects]);

  const { shuffledQuestions, shuffleMaps } = useMemo(() => {
    const shuffledQs = fisherYatesShuffle(questions);
    const maps = shuffledQs.map(q => {
      const indices = q.options.map((_, i) => i);
      return fisherYatesShuffle(indices);
    });
    return { shuffledQuestions: shuffledQs, shuffleMaps: maps };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => new Array(shuffledQuestions.length).fill(-1));
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const answersRef = useRef(answers);
  const submittedRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => { answersRef.current = answers; }, [answers]);

  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const finalAnswers = answersRef.current;
    let score = 0;
    shuffledQuestions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctAnswer) score++;
    });

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    const result: QuizResult = {
      id: `r-${Date.now()}`,
      userId: user.id,
      subject,
      difficulty,
      score,
      total: shuffledQuestions.length,
      percentage: shuffledQuestions.length > 0 ? Math.round((score / shuffledQuestions.length) * 100) : 0,
      date: new Date().toISOString(),
      timeTaken,
    };

    onComplete(result, shuffledQuestions, finalAnswers);
  }, [shuffledQuestions, user.id, subject, difficulty, onComplete]);

  useEffect(() => {
    if (submittedRef.current) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [doSubmit]);

  const handleAnswer = (originalOptIdx: number) => {
    const newA = [...answers];
    newA[currentIndex] = originalOptIdx;
    setAnswers(newA);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const question = shuffledQuestions[currentIndex];
  const optionMap = shuffleMaps[currentIndex];
  const progress = ((currentIndex + 1) / shuffledQuestions.length) * 100;
  const answered = answers.filter(a => a !== -1).length;
  const timePercent = (timeLeft / totalTime) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 relative">
      {/* Top bar */}
      <div className="glass-light rounded-2xl p-5 mb-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 text-sm font-semibold text-white">
              {subjectName}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
              difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {difficulty.toUpperCase()}
            </span>
            <span className="text-sm text-gray-400">
              {answered}/{shuffledQuestions.length} answered
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-500/20 text-violet-300 tracking-wider">
              🔀 SHUFFLED
            </span>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${
            timeLeft <= 30 ? 'bg-red-500/20 text-red-400 animate-pulse' :
            timeLeft <= 120 ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-white/5 text-white'
          }`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-500 w-12">Q {currentIndex + 1}/{shuffledQuestions.length}</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timePercent > 50 ? 'bg-emerald-500/50' :
              timePercent > 20 ? 'bg-yellow-500/50' :
              'bg-red-500/50'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-card rounded-3xl p-8 mb-6 animate-slide-up" key={currentIndex}>
        <div className="flex items-start gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {currentIndex + 1}
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white leading-relaxed">{question.question}</h2>
        </div>

        <div className="space-y-3">
          {optionMap.map((origIdx, displayIdx) => (
            <button
              key={displayIdx}
              onClick={() => handleAnswer(origIdx)}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.01] group ${
                answers[currentIndex] === origIdx
                  ? 'border-violet-500 bg-violet-500/15 text-white shadow-lg shadow-violet-500/10'
                  : 'border-white/8 text-gray-300 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold shrink-0 transition-all ${
                  answers[currentIndex] === origIdx
                    ? 'bg-violet-500 text-white shadow-md'
                    : 'bg-white/8 text-gray-500 group-hover:bg-white/15'
                }`}>
                  {String.fromCharCode(65 + displayIdx)}
                </span>
                <span className="text-sm sm:text-base">{question.options[origIdx]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setShowConfirmCancel(true)}
          className="px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          ✕ Cancel
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl bg-white/8 text-white font-medium hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
          >
            ← Prev
          </button>

          {currentIndex === shuffledQuestions.length - 1 ? (
            <button
              onClick={doSubmit}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-500/25 text-sm"
            >
              ✅ Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(p => Math.min(shuffledQuestions.length - 1, p + 1))}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium hover:from-violet-600 hover:to-indigo-600 transition-all text-sm"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs text-gray-500 mb-3 font-medium">Question Navigator</p>
        <div className="flex flex-wrap gap-2">
          {shuffledQuestions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 ${
                i === currentIndex
                  ? 'bg-violet-500 text-white scale-110 shadow-lg shadow-violet-500/30'
                  : answers[i] !== -1
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-light rounded-3xl p-8 max-w-md w-full animate-fade-in">
            <div className="text-center">
              <span className="text-5xl mb-4 block">⚠️</span>
              <h3 className="text-xl font-bold text-white mb-2">Cancel Quiz?</h3>
              <p className="text-gray-400 text-sm mb-6">Your progress will be lost. Are you sure?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 border border-red-500/30 transition-all"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
