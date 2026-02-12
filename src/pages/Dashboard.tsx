import { useState, useEffect } from 'react';
import type { Difficulty, User, Page, QuizResult, SubjectConfig } from '../types';
import { getQuestions, getSubjects, getUserResults, countCustomQuizQuestions } from '../utils/storage';

interface DashboardProps {
  user: User;
  onNavigate: (page: Page) => void;
  onStartQuiz: (subject: string, difficulty: Difficulty, selectedSubjects?: string[]) => void;
}

const difficulties: { id: Difficulty; name: string; icon: string; desc: string; activeClass: string }[] = [
  { id: 'easy', name: 'Easy', icon: '🟢', desc: 'Beginner friendly', activeClass: 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-emerald-500/20' },
  { id: 'medium', name: 'Medium', icon: '🟡', desc: 'Intermediate level', activeClass: 'border-yellow-500 bg-yellow-500/15 text-yellow-400 shadow-yellow-500/20' },
  { id: 'hard', name: 'Hard', icon: '🔴', desc: 'Expert challenge', activeClass: 'border-red-500 bg-red-500/15 text-red-400 shadow-red-500/20' },
];

export function Dashboard({ user, onNavigate, onStartQuiz }: DashboardProps) {
  // Mode: 'single' = pick one subject, 'custom' = pick multiple subjects
  const [mode, setMode] = useState<'single' | 'custom'>('single');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [recentResults, setRecentResults] = useState<QuizResult[]>([]);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);

  useEffect(() => {
    const subs = getSubjects();
    setSubjects(subs);

    const questions = getQuestions();
    const counts: Record<string, number> = {};
    subs.forEach(s => {
      counts[s.id] = questions.filter(q => q.subject === s.id).length;
    });
    counts['combined'] = questions.length;
    setQuestionCounts(counts);

    const results = getUserResults(user.id);
    setRecentResults(results.slice(-5).reverse());
    setTotalQuizzes(results.length);
    if (results.length > 0) {
      setAvgScore(Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length));
      setBestScore(Math.max(...results.map(r => r.percentage)));
    }
  }, [user.id]);

  const subjectLabel = (id: string) => {
    if (id === 'combined') return 'Combined';
    if (id === 'custom') return 'Custom Mix';
    return subjects.find(s => s.id === id)?.name ?? id;
  };

  // Toggle a subject in multi-select mode
  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Select all / deselect all
  const selectAllSubjects = () => {
    if (selectedSubjects.length === subjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(subjects.map(s => s.id));
    }
  };

  // Calculate available questions based on mode
  const allQuestions = getQuestions();
  let availableCount = 0;
  let quizCount = 10;
  let timeLimit = 10;

  if (mode === 'single' && selectedSubject) {
    availableCount = selectedSubject === 'combined'
      ? allQuestions.filter(q => q.difficulty === selectedDifficulty).length
      : allQuestions.filter(q => q.subject === selectedSubject && q.difficulty === selectedDifficulty).length;
    const selectedConfig = selectedSubject !== 'combined' ? subjects.find(s => s.id === selectedSubject) : null;
    quizCount = Math.min(selectedConfig?.questionsPerQuiz ?? 10, availableCount);
    timeLimit = selectedConfig?.timePerQuiz ?? 10;
  } else if (mode === 'custom' && selectedSubjects.length > 0) {
    availableCount = countCustomQuizQuestions(selectedSubjects, selectedDifficulty);
    // For custom, use average settings of selected subjects
    const selectedConfigs = subjects.filter(s => selectedSubjects.includes(s.id));
    if (selectedConfigs.length > 0) {
      quizCount = Math.min(
        Math.round(selectedConfigs.reduce((a, s) => a + s.questionsPerQuiz, 0) / selectedConfigs.length),
        availableCount
      );
      timeLimit = Math.round(selectedConfigs.reduce((a, s) => a + s.timePerQuiz, 0) / selectedConfigs.length);
    }
    quizCount = Math.min(quizCount, availableCount);
  }

  const handleStartQuiz = () => {
    if (mode === 'single' && selectedSubject) {
      onStartQuiz(selectedSubject, selectedDifficulty);
    } else if (mode === 'custom' && selectedSubjects.length > 0) {
      onStartQuiz('custom', selectedDifficulty, selectedSubjects);
    }
  };

  const canStart = mode === 'single'
    ? (selectedSubject && availableCount > 0)
    : (selectedSubjects.length > 0 && availableCount > 0);

  // Per-subject question counts for difficulty in custom mode
  const getSubjectDifficultyCount = (subId: string) =>
    allQuestions.filter(q => q.subject === subId && q.difficulty === selectedDifficulty).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Welcome */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            {user.username}
          </span>{' '}
          👋
        </h1>
        <p className="text-gray-400 mt-2">Choose subjects and difficulty to start your quiz</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Quizzes Taken', value: totalQuizzes, icon: '📝', color: 'from-violet-500/20 to-indigo-500/20' },
          { label: 'Average Score', value: `${avgScore}%`, icon: '📈', color: 'from-cyan-500/20 to-blue-500/20' },
          { label: 'Best Score', value: `${bestScore}%`, icon: '🏆', color: 'from-amber-500/20 to-yellow-500/20' },
          { label: 'Questions Bank', value: allQuestions.length, icon: '📚', color: 'from-emerald-500/20 to-green-500/20' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="glass-card rounded-2xl p-5 animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 animate-fade-in">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
          Quiz Mode
        </h2>
        <div className="flex bg-white/5 rounded-2xl p-1.5 max-w-md">
          <button
            onClick={() => { setMode('single'); setSelectedSubjects([]); }}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'single'
                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📘 Single Subject
          </button>
          <button
            onClick={() => { setMode('custom'); setSelectedSubject(null); }}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              mode === 'custom'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔀 Custom Mix
          </button>
        </div>
      </div>

      {/* Subject Selection */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-cyan-500 to-blue-500" />
            {mode === 'single' ? 'Select Subject' : 'Select Subjects to Combine'}
          </h2>
          {mode === 'custom' && (
            <div className="flex items-center gap-3">
              <button
                onClick={selectAllSubjects}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-all"
              >
                {selectedSubjects.length === subjects.length ? '✕ Deselect All' : '✓ Select All'}
              </button>
              {selectedSubjects.length > 0 && (
                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500/20 text-pink-400 border border-pink-500/20">
                  {selectedSubjects.length} selected
                </span>
              )}
            </div>
          )}
        </div>

        {subjects.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <span className="text-4xl mb-3 block">📭</span>
            <p className="text-gray-400">No subjects configured yet. Ask admin to add subjects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject, i) => {
              const isSelectedSingle = mode === 'single' && selectedSubject === subject.id;
              const isSelectedCustom = mode === 'custom' && selectedSubjects.includes(subject.id);
              const isSelected = isSelectedSingle || isSelectedCustom;
              const diffCount = getSubjectDifficultyCount(subject.id);

              return (
                <button
                  key={subject.id}
                  onClick={() => {
                    if (mode === 'single') setSelectedSubject(subject.id);
                    else toggleSubject(subject.id);
                  }}
                  className={`glass-card rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-slide-up group relative overflow-hidden ${
                    isSelected
                      ? mode === 'custom'
                        ? 'ring-2 ring-pink-500/70 bg-pink-500/10 shadow-lg shadow-pink-500/10'
                        : 'ring-2 ring-violet-500/70 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                      : 'hover:bg-white/5'
                  }`}
                  style={{ animationDelay: `${(i + 4) * 0.08}s` }}
                >
                  {/* Checkbox for custom mode */}
                  {mode === 'custom' && (
                    <div className={`absolute top-4 right-4 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelectedCustom
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : 'border-white/20 bg-white/5'
                    }`}>
                      {isSelectedCustom && <span className="text-xs font-bold">✓</span>}
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{subject.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{subject.name}</h3>
                  <p className="text-sm text-gray-500">{subject.description}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-violet-500/60" />
                      <span className="text-xs text-gray-500">{questionCounts[subject.id] || 0} total</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      diffCount > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {diffCount} {selectedDifficulty}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* "All Combined" card — only in single mode */}
            {mode === 'single' && (
              <button
                key="combined"
                onClick={() => setSelectedSubject('combined')}
                className={`glass-card rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-slide-up group ${
                  selectedSubject === 'combined'
                    ? 'ring-2 ring-violet-500/70 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                    : 'hover:bg-white/5'
                }`}
                style={{ animationDelay: `${(subjects.length + 4) * 0.08}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔀</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">All Combined</h3>
                <p className="text-sm text-gray-500">All subjects mixed together</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-pink-500/60" />
                  <span className="text-xs text-gray-500">{questionCounts['combined'] || 0} total</span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Custom Mix Summary */}
      {mode === 'custom' && selectedSubjects.length > 0 && (
        <div className="glass-light rounded-2xl p-5 mb-6 animate-fade-in border border-pink-500/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔀</span>
            <h3 className="text-sm font-bold text-white">Your Custom Mix</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map(subId => {
              const sub = subjects.find(s => s.id === subId);
              if (!sub) return null;
              const count = getSubjectDifficultyCount(subId);
              return (
                <div
                  key={subId}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 group"
                >
                  <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${sub.gradient} flex items-center justify-center text-sm`}>
                    {sub.icon}
                  </span>
                  <span className="text-sm text-white font-medium">{sub.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    count > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {count}
                  </span>
                  <button
                    onClick={() => toggleSubject(subId)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xs ml-1"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Difficulty */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
          Select Difficulty
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {difficulties.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDifficulty(d.id)}
              className={`py-5 px-4 rounded-2xl border-2 transition-all duration-300 font-semibold text-center ${
                selectedDifficulty === d.id
                  ? `${d.activeClass} shadow-lg`
                  : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">{d.icon}</span>
              <span className="block text-base">{d.name}</span>
              <span className="block text-[10px] text-gray-500 mt-1">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start Section */}
      {canStart && (
        <div className={`glass-light rounded-3xl p-8 mb-10 animate-fade-in border ${
          mode === 'custom' ? 'border-pink-500/20' : 'border-white/5'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {mode === 'custom' ? '🔀 Custom Mix Ready!' : '🚀 Ready to Start?'}
              </h3>
              <div className="flex flex-wrap gap-3 text-sm mb-3">
                <span className="px-3 py-1.5 rounded-full bg-white/5 text-gray-400">
                  📋 {quizCount} questions
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 text-gray-400">
                  ⏱️ {timeLimit} minutes
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 text-gray-400">
                  📂 {availableCount} available
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  selectedDifficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                  selectedDifficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-400' :
                  'bg-red-500/15 text-red-400'
                }`}>
                  {selectedDifficulty.toUpperCase()}
                </span>
              </div>
              {mode === 'custom' && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubjects.map(subId => {
                    const sub = subjects.find(s => s.id === subId);
                    return sub ? (
                      <span key={subId} className={`px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${sub.gradient} bg-clip-text text-transparent border border-white/10`}>
                        {sub.icon} {sub.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              {availableCount === 0 && (
                <p className="text-red-400 text-sm mt-2">⚠️ No questions available for this combination.</p>
              )}
            </div>
            <button
              onClick={handleStartQuiz}
              disabled={availableCount === 0}
              className={`px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-200 shadow-xl active:scale-[0.98] whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === 'custom'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/25 hover:shadow-2xl hover:shadow-pink-500/30'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/30'
              }`}
            >
              🚀 Start Quiz
            </button>
          </div>
        </div>
      )}

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-green-500" />
              Recent Results
            </h2>
            <button
              onClick={() => onNavigate('history')}
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              View All →
            </button>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Subject</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Difficulty</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Score</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResults.map(r => (
                    <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-white font-medium">{subjectLabel(r.subject)}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                          r.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {r.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`font-bold ${
                          r.percentage >= 70 ? 'text-emerald-400' :
                          r.percentage >= 50 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {r.percentage}%
                        </span>
                        <span className="text-gray-600 ml-1.5">({r.score}/{r.total})</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{new Date(r.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
