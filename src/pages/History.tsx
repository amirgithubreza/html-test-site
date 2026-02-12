import { useState, useEffect, useMemo } from 'react';
import type { QuizResult, SubjectConfig } from '../types';
import { getUserResults, getSubjects } from '../utils/storage';

interface HistoryProps {
  userId: string;
}

export function History({ userId }: HistoryProps) {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);

  useEffect(() => {
    setResults(getUserResults(userId).reverse());
    setSubjects(getSubjects());
  }, [userId]);

  const subjectName = useMemo(() => {
    const map: Record<string, string> = { combined: 'Combined' };
    subjects.forEach(s => { map[s.id] = s.name; });
    return (id: string) => map[id] ?? id;
  }, [subjects]);

  const filtered = filterSubject === 'all'
    ? results
    : results.filter(r => r.subject === filterSubject);

  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((a, r) => a + r.percentage, 0) / filtered.length)
    : 0;
  const bestScore = filtered.length > 0 ? Math.max(...filtered.map(r => r.percentage)) : 0;
  const totalQuestions = filtered.reduce((a, r) => a + r.total, 0);
  const totalCorrect = filtered.reduce((a, r) => a + r.score, 0);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  // Build filter buttons from subjects
  const filterOptions = [
    { id: 'all', label: '📋 All' },
    ...subjects.map(s => ({ id: s.id, label: `${s.icon} ${s.name}` })),
    { id: 'combined', label: '🔀 Combined' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <h1 className="text-3xl font-extrabold text-white mb-2 animate-fade-in">📊 Quiz History</h1>
      <p className="text-gray-400 mb-8 animate-fade-in">Track your progress across all quizzes</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Quizzes', value: filtered.length, icon: '📝', color: 'from-violet-500/20 to-indigo-500/20' },
          { label: 'Average Score', value: `${avgScore}%`, icon: '📈', color: 'from-cyan-500/20 to-blue-500/20' },
          { label: 'Best Score', value: `${bestScore}%`, icon: '🏆', color: 'from-amber-500/20 to-yellow-500/20' },
          { label: 'Questions Answered', value: `${totalCorrect}/${totalQuestions}`, icon: '✅', color: 'from-emerald-500/20 to-green-500/20' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="glass-card rounded-2xl p-5 animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {filterOptions.map(s => (
          <button
            key={s.id}
            onClick={() => setFilterSubject(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filterSubject === s.id
                ? 'bg-violet-500/20 text-violet-300'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium">#</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Subject</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Difficulty</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Score</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Percentage</th>
                  <th className="text-left px-5 py-3.5 text-gray-500 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 text-gray-600">{i + 1}</td>
                    <td className="px-5 py-3.5 text-gray-300">
                      {new Date(r.date).toLocaleDateString()}{' '}
                      <span className="text-gray-600">{new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-5 py-3.5 text-white font-medium">{subjectName(r.subject)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        r.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                        r.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {r.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white font-medium">{r.score}/{r.total}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              r.percentage >= 70 ? 'bg-emerald-500' :
                              r.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${r.percentage}%` }}
                          />
                        </div>
                        <span className={`font-bold text-sm ${
                          r.percentage >= 70 ? 'text-emerald-400' :
                          r.percentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {r.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{formatTime(r.timeTaken)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-16 text-center animate-fade-in">
          <span className="text-6xl block mb-4">📭</span>
          <h3 className="text-xl font-bold text-white mb-2">No Results Yet</h3>
          <p className="text-gray-400">Complete some quizzes to see your history here.</p>
        </div>
      )}
    </div>
  );
}
