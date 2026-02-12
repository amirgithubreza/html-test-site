import type { Question, User, QuizResult, QuizSettings, Difficulty, UserStats, SubjectConfig } from '../types';
import { initialQuestions } from '../data/questions';

const KEYS = {
  USERS: 'cq_users',
  QUESTIONS: 'cq_questions',
  RESULTS: 'cq_results',
  SETTINGS: 'cq_settings',
  SUBJECTS: 'cq_subjects',
  INIT: 'cq_initialized',
};

// ========== DEFAULT SUBJECTS ==========
const DEFAULT_SUBJECTS: SubjectConfig[] = [
  { id: 'html', name: 'HTML', icon: '🌐', gradient: 'from-orange-500 to-red-500', description: 'Markup & Structure', questionsPerQuiz: 10, timePerQuiz: 10 },
  { id: 'css', name: 'CSS', icon: '🎨', gradient: 'from-blue-500 to-cyan-500', description: 'Styling & Layout', questionsPerQuiz: 10, timePerQuiz: 10 },
  { id: 'javascript', name: 'JavaScript', icon: '⚡', gradient: 'from-yellow-500 to-amber-500', description: 'Logic & Interactivity', questionsPerQuiz: 10, timePerQuiz: 10 },
  { id: 'python', name: 'Python', icon: '🐍', gradient: 'from-green-500 to-emerald-500', description: 'General Purpose', questionsPerQuiz: 10, timePerQuiz: 10 },
  { id: 'csharp', name: 'C#', icon: '💎', gradient: 'from-purple-500 to-violet-500', description: 'Object-Oriented', questionsPerQuiz: 10, timePerQuiz: 10 },
];

// ========== CHANGE CALLBACK SYSTEM ==========
type ChangeCallback = () => void;
const changeCallbacks: ChangeCallback[] = [];

export function onDataChange(callback: ChangeCallback): () => void {
  changeCallbacks.push(callback);
  return () => {
    const idx = changeCallbacks.indexOf(callback);
    if (idx >= 0) changeCallbacks.splice(idx, 1);
  };
}

function notifyChange(): void {
  changeCallbacks.forEach(cb => {
    try { cb(); } catch (err) { console.error('Data change callback error:', err); }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('cq_')) {
      notifyChange();
    }
  });
}

// ========== SHUFFLE HELPER (Fisher-Yates) ==========
function shuffleWithMapping<T>(arr: T[]): { shuffled: T[]; map: number[] } {
  const indices = arr.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return {
    shuffled: indices.map(i => arr[i]),
    map: indices,
  };
}

/** Shuffle options of a question and update correctAnswer accordingly */
function shuffleQuestionOptions(q: Question): Question {
  const { shuffled, map } = shuffleWithMapping(q.options);
  const newCorrect = map.indexOf(q.correctAnswer);
  return { ...q, options: shuffled, correctAnswer: newCorrect };
}

// ========== INITIALIZATION (ASYNC — tries live.json first) ==========

/**
 * Initializes data:
 * 1. If localStorage already has data (cq_initialized flag), do nothing.
 * 2. If localStorage is empty, try to fetch /live.json for saved user accounts.
 * 3. If live.json is empty or fetch fails, fall back to hardcoded defaults.
 *
 * This means: if an admin exports the current state as live.json and places
 * it alongside index.html, all user accounts survive localStorage clears.
 */
export async function initializeData(): Promise<void> {
  // Already initialized — just ensure subjects key exists for older installs
  if (localStorage.getItem(KEYS.INIT)) {
    if (!localStorage.getItem(KEYS.SUBJECTS)) {
      localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
    }
    return;
  }

  // === Try loading from live.json ===
  let liveData: {
    users?: User[];
    questions?: Question[];
    results?: QuizResult[];
    settings?: QuizSettings;
    subjects?: SubjectConfig[];
  } | null = null;

  try {
    const response = await fetch('/live.json', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      // Only use it if it actually has user data (not just the empty default)
      if (data && data.users && Array.isArray(data.users) && data.users.length > 0) {
        liveData = data;
        console.log('[CodeQuiz] Loaded fallback data from live.json —', data.users.length, 'users found');
      }
    }
  } catch {
    console.log('[CodeQuiz] No live.json found or fetch failed — using defaults');
  }

  if (liveData) {
    // === Populate localStorage from live.json ===
    localStorage.setItem(KEYS.USERS, JSON.stringify(liveData.users || []));

    // If live.json has questions, use them; otherwise use built-in question bank
    const questions = (liveData.questions && liveData.questions.length > 0)
      ? liveData.questions
      : initialQuestions;
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));

    localStorage.setItem(KEYS.RESULTS, JSON.stringify(liveData.results || []));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(liveData.settings || { questionsPerQuiz: 10, timePerQuiz: 10 }));
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(liveData.subjects || DEFAULT_SUBJECTS));
  } else {
    // === Fallback: hardcoded defaults ===
    const admin: User = {
      id: 'admin-1',
      username: 'admin',
      password: 'admin123',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.USERS, JSON.stringify([admin]));
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(initialQuestions));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ questionsPerQuiz: 10, timePerQuiz: 10 }));
    localStorage.setItem(KEYS.RESULTS, JSON.stringify([]));
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(DEFAULT_SUBJECTS));
  }

  localStorage.setItem(KEYS.INIT, 'true');
  notifyChange();
}

// ========== SUBJECTS ==========
export function getSubjects(): SubjectConfig[] {
  const d = localStorage.getItem(KEYS.SUBJECTS);
  return d ? JSON.parse(d) : DEFAULT_SUBJECTS;
}

export function saveSubjects(subjects: SubjectConfig[]): void {
  localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
  notifyChange();
}

export function addSubject(subject: SubjectConfig): boolean {
  const subjects = getSubjects();
  if (subjects.find(s => s.id === subject.id)) return false;
  subjects.push(subject);
  saveSubjects(subjects);
  return true;
}

export function updateSubject(id: string, updates: Partial<SubjectConfig>): void {
  const subjects = getSubjects();
  const idx = subjects.findIndex(s => s.id === id);
  if (idx >= 0) {
    subjects[idx] = { ...subjects[idx], ...updates };
    saveSubjects(subjects);
  }
}

export function removeSubject(id: string): void {
  const subjects = getSubjects().filter(s => s.id !== id);
  saveSubjects(subjects);
  // Also remove questions for that subject
  const questions = getQuestions().filter(q => q.subject !== id);
  saveQuestions(questions);
}

export function getSubjectConfig(subjectId: string): SubjectConfig | null {
  return getSubjects().find(s => s.id === subjectId) ?? null;
}

// ========== USERS ==========
export function getUsers(): User[] {
  const d = localStorage.getItem(KEYS.USERS);
  return d ? JSON.parse(d) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  notifyChange();
}

export function findUser(username: string, password: string): User | null {
  return getUsers().find(u => u.username === username && u.password === password) ?? null;
}

export function createUser(username: string, password: string): User | null {
  const users = getUsers();
  if (users.find(u => u.username === username)) return null;
  const user: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    username,
    password,
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function createGuestUser(): User {
  const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const guest: User = {
    id: guestId,
    username: `Guest_${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    password: '',
    isAdmin: false,
    isGuest: true,
    createdAt: new Date().toISOString(),
  };
  const users = getUsers();
  users.push(guest);
  saveUsers(users);
  return guest;
}

export function deleteUser(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  const results = getResults().filter(r => r.userId !== userId);
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
  notifyChange();
}

// ========== QUESTIONS ==========
export function getQuestions(): Question[] {
  const d = localStorage.getItem(KEYS.QUESTIONS);
  return d ? JSON.parse(d) : [];
}

export function saveQuestions(questions: Question[]): void {
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  notifyChange();
}

/** Add a single question — options are shuffled before storing */
export function addQuestion(question: Question): void {
  const qs = getQuestions();
  qs.push(shuffleQuestionOptions(question));
  saveQuestions(qs);
}

/** Add multiple questions — each one's options are shuffled before storing */
export function addQuestions(newQs: Question[]): void {
  const qs = getQuestions();
  newQs.forEach(q => qs.push(shuffleQuestionOptions(q)));
  saveQuestions(qs);
}

export function deleteQuestion(id: string): void {
  saveQuestions(getQuestions().filter(q => q.id !== id));
}

export function getQuizQuestions(subject: string, difficulty: Difficulty, count: number): Question[] {
  const all = getQuestions();
  const filtered = subject === 'combined'
    ? all.filter(q => q.difficulty === difficulty)
    : all.filter(q => q.subject === subject && q.difficulty === difficulty);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** Get questions from multiple selected subjects with a specific difficulty */
export function getCustomQuizQuestions(subjectIds: string[], difficulty: Difficulty, count: number): Question[] {
  const all = getQuestions();
  const filtered = all.filter(q => subjectIds.includes(q.subject) && q.difficulty === difficulty);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** Count available questions for a custom multi-subject + difficulty combination */
export function countCustomQuizQuestions(subjectIds: string[], difficulty: Difficulty): number {
  const all = getQuestions();
  return all.filter(q => subjectIds.includes(q.subject) && q.difficulty === difficulty).length;
}

// ========== RESULTS ==========
export function getResults(): QuizResult[] {
  const d = localStorage.getItem(KEYS.RESULTS);
  return d ? JSON.parse(d) : [];
}

export function saveResults(results: QuizResult[]): void {
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
  notifyChange();
}

export function addResult(result: QuizResult): void {
  const rs = getResults();
  rs.push(result);
  saveResults(rs);
}

export function getUserResults(userId: string): QuizResult[] {
  return getResults().filter(r => r.userId === userId);
}

// ========== SETTINGS ==========
export function getSettings(): QuizSettings {
  const d = localStorage.getItem(KEYS.SETTINGS);
  return d ? JSON.parse(d) : { questionsPerQuiz: 10, timePerQuiz: 10 };
}

export function saveSettings(settings: QuizSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  notifyChange();
}

// ========== ADMIN STATS ==========
export function getAllUserStats(): UserStats[] {
  const users = getUsers();
  const results = getResults();

  return users.map(user => {
    const userResults = results.filter(r => r.userId === user.id);
    const totalQuizzes = userResults.length;
    const avgScore = totalQuizzes > 0
      ? Math.round(userResults.reduce((a, r) => a + r.percentage, 0) / totalQuizzes)
      : 0;
    const bestScore = totalQuizzes > 0
      ? Math.max(...userResults.map(r => r.percentage))
      : 0;
    const totalCorrect = userResults.reduce((a, r) => a + r.score, 0);
    const totalQuestions = userResults.reduce((a, r) => a + r.total, 0);
    const lastActive = totalQuizzes > 0
      ? userResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
      : user.createdAt;

    return {
      user,
      totalQuizzes,
      avgScore,
      bestScore,
      totalCorrect,
      totalQuestions,
      lastActive,
      results: userResults,
    };
  });
}

// ========== EXPORT HELPERS ==========
function csvQ(val: string | number): string {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function exportUsersCSV(): string {
  const BOM = '\uFEFF';
  const stats = getAllUserStats();
  const header = 'Username,Password,Role,Type,Registered,Total Quizzes,Avg Score %,Best Score %,Total Correct,Total Questions,Last Active';
  const rows = stats.map(s => {
    const role = s.user.isAdmin ? 'Admin' : 'User';
    const type = s.user.isGuest ? 'Guest' : 'Registered';
    return [
      csvQ(s.user.username), csvQ(s.user.password || '(none)'), role, type,
      csvQ(new Date(s.user.createdAt).toLocaleString()),
      s.totalQuizzes, s.avgScore, s.bestScore, s.totalCorrect, s.totalQuestions,
      s.totalQuizzes > 0 ? csvQ(new Date(s.lastActive).toLocaleString()) : 'N/A',
    ].join(',');
  });
  return BOM + [header, ...rows].join('\n');
}

export function exportResultsCSV(): string {
  const BOM = '\uFEFF';
  const results = getResults();
  const users = getUsers();
  const header = 'Username,Subject,Difficulty,Score,Total,Percentage,Time (seconds),Date';
  const rows = results.map(r => {
    const user = users.find(u => u.id === r.userId);
    return [
      csvQ(user?.username || r.username || 'Unknown'),
      r.subject, r.difficulty, r.score, r.total, r.percentage + '%',
      r.timeTaken, csvQ(new Date(r.date).toLocaleString()),
    ].join(',');
  });
  return BOM + [header, ...rows].join('\n');
}

export function exportUsersJSON(): string {
  const stats = getAllUserStats();
  const data = stats.map(s => ({
    username: s.user.username,
    password: s.user.password || '(none)',
    role: s.user.isAdmin ? 'Admin' : 'User',
    type: s.user.isGuest ? 'Guest' : 'Registered',
    registered: s.user.createdAt,
    stats: {
      totalQuizzes: s.totalQuizzes, avgScore: s.avgScore, bestScore: s.bestScore,
      totalCorrect: s.totalCorrect, totalQuestions: s.totalQuestions, lastActive: s.lastActive,
    },
    results: s.results.map(r => ({
      subject: r.subject, difficulty: r.difficulty, score: r.score, total: r.total,
      percentage: r.percentage, timeTaken: r.timeTaken, date: r.date,
    })),
  }));
  return JSON.stringify(data, null, 2);
}

export function exportFullDataJSON(): string {
  return JSON.stringify({
    appName: 'CodeQuiz',
    lastUpdated: new Date().toISOString(),
    users: getUsers(),
    questions: getQuestions(),
    results: getResults(),
    settings: getSettings(),
    subjects: getSubjects(),
  }, null, 2);
}

/**
 * Export current state as live.json format.
 * Admin downloads this and places it next to index.html.
 * When localStorage is cleared, the app will load this file automatically.
 */
export function exportLiveJSON(): string {
  return JSON.stringify({
    appName: 'CodeQuiz',
    description: 'Live fallback data — place this file as live.json next to index.html',
    lastUpdated: new Date().toISOString(),
    users: getUsers(),
    questions: getQuestions(),
    results: getResults(),
    settings: getSettings(),
    subjects: getSubjects(),
  }, null, 2);
}
