import { useState, useMemo } from 'react';
import type { QuizResult, Question, Page } from '../types';
import { getSubjects } from '../utils/storage';

interface ResultsProps {
  result: QuizResult;
  questions: Question[];
  answers: number[];
  onNavigate: (page: Page) => void;
}

export function Results({ result, questions, answers, onNavigate }: ResultsProps) {
  const [showReview, setShowReview] = useState(false);

  const subjectName = useMemo(() => {
    if (result.subject === 'combined') return 'Combined';
    const subs = getSubjects();
    return subs.find(s => s.id === result.subject)?.name ?? result.subject;
  }, [result.subject]);

  const pct = result.percentage;
  const grade = pct >= 90
    ? { text: 'Excellent!', emoji: '🏆', color: 'text-yellow-400', bg: 'from-yellow-500/20 to-amber-500/20' }
    : pct >= 70
    ? { text: 'Great Job!', emoji: '⭐', color: 'text-emerald-400', bg: 'from-emerald-500/20 to-green-500/20' }
    : pct >= 50
    ? { text: 'Good Effort!', emoji: '👍', color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' }
    : { text: 'Keep Practicing!', emoji: '💪', color: 'text-orange-400', bg: 'from-orange-500/20 to-red-500/20' };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  const circumference = 2 * Math.PI * 80;
  const offset = circumference * (1 - pct / 100);
  const strokeColor = pct >= 70 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
      <div className={`glass-light rounded-3xl p-8 sm:p-12 text-center mb-8 animate-fade-in bg-gradient-to-br ${grade.bg}`}>
        <span className="text-6xl block mb-4 animate-float">{grade.emoji}</span>
        <h1 className={`text-3xl sm:text-4xl font-extrabold ${grade.color} mb-2`}>{grade.text}</h1>
        <p className="text-gray-400 mb-8">You completed the quiz!</p>

        <div className="inline-block mb-8">
          <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-2xl">
            <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle
              cx="100" cy="100" r="80" fill="none"
              stroke={strokeColor} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 100 100)"
              className="animate-score"
              style={{ filter: `drop-shadow(0 0 8px ${strokeColor}40)` }}
            />
            <text x="100" y="90" textAnchor="middle" fill="white" fontSize="42" fontWeight="800">{pct}%</text>
            <text x="100" y="118" textAnchor="middle" fill="#9ca3af" fontSize="16" fontWeight="500">
              {result.score} / {result.total}
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { label: 'Subject', value: subjectName, icon: '📚' },
            { label: 'Difficulty', value: result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1), icon: '🎯' },
            { label: 'Time Taken', value: formatTime(result.timeTaken), icon: '⏱️' },
            { label: 'Correct', value: `${result.score}/${result.total}`, icon: '✅' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-4">
              <span className="text-xl block mb-1">{s.icon}</span>
              <p className="text-white font-bold text-sm">{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold hover:from-violet-600 hover:to-indigo-600 transition-all shadow-lg shadow-violet-500/25 active:scale-[0.98]"
        >
          🏠 Back to Dashboard
        </button>
        <button
          onClick={() => setShowReview(!showReview)}
          className="flex-1 py-4 rounded-2xl glass-light text-white font-bold hover:bg-white/15 transition-all"
        >
          {showReview ? '🔼 Hide Review' : '🔍 Review Answers'}
        </button>
      </div>

      {showReview && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
            Answer Review
          </h2>

          {questions.map((q, qi) => {
            const userAnswer = answers[qi];
            const isCorrect = userAnswer === q.correctAnswer;
            const wasSkipped = userAnswer === -1;

            return (
              <div
                key={q.id}
                className={`glass-card rounded-2xl p-6 border-l-4 ${
                  wasSkipped ? 'border-l-gray-500' : isCorrect ? 'border-l-emerald-500' : 'border-l-red-500'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    wasSkipped ? 'bg-gray-500/20 text-gray-400' :
                    isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {wasSkipped ? '—' : isCorrect ? '✓' : '✗'}
                  </span>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Question {qi + 1}</p>
                    <p className="text-white font-medium">{q.question}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-11">
                  {q.options.map((opt, oi) => {
                    const isThisCorrect = oi === q.correctAnswer;
                    const isThisSelected = oi === userAnswer;

                    return (
                      <div
                        key={oi}
                        className={`px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 ${
                          isThisCorrect
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isThisSelected && !isThisCorrect
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        <span className="font-bold text-xs">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                        {isThisCorrect && <span className="ml-auto">✅</span>}
                        {isThisSelected && !isThisCorrect && <span className="ml-auto">❌</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
