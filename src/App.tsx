import { useState, useEffect } from 'react';
import type { User, Difficulty, Page, Question, QuizResult } from './types';
import {
  initializeData, getQuizQuestions, getCustomQuizQuestions,
  getSettings, getSubjectConfig, addResult, onDataChange,
} from './utils/storage';
import { debouncedSync } from './utils/fileSync';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Quiz } from './pages/Quiz';
import { Results } from './pages/Results';
import { Admin } from './pages/Admin';
import { History } from './pages/History';

interface LastResult {
  result: QuizResult;
  questions: Question[];
  answers: number[];
}

interface QuizConfig {
  subject: string;
  difficulty: Difficulty;
  selectedSubjects?: string[];
}

export function App() {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const boot = async () => {
      await initializeData();
      setReady(true);

      unsub = onDataChange(() => {
        debouncedSync();
      });
    };

    boot();

    return () => {
      unsub?.();
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    setQuizConfig(null);
    setQuizQuestions([]);
    setLastResult(null);
  };

  const handleNavigate = (page: Page) => {
    if (page === 'admin' && (!currentUser?.isAdmin)) return;
    setCurrentPage(page);
  };

  const handleStartQuiz = (subject: string, difficulty: Difficulty, selectedSubjects?: string[]) => {
    const globalSettings = getSettings();
    let questions: Question[];
    let count: number;

    if (subject === 'custom' && selectedSubjects && selectedSubjects.length > 0) {
      // Custom multi-subject quiz
      // Calculate average count from selected subjects
      const configs = selectedSubjects.map(id => getSubjectConfig(id)).filter(Boolean);
      count = configs.length > 0
        ? Math.round(configs.reduce((a, c) => a + (c?.questionsPerQuiz ?? globalSettings.questionsPerQuiz), 0) / configs.length)
        : globalSettings.questionsPerQuiz;
      questions = getCustomQuizQuestions(selectedSubjects, difficulty, count);
    } else {
      // Single subject or "combined" (all)
      const subjectCfg = getSubjectConfig(subject);
      count = subjectCfg?.questionsPerQuiz ?? globalSettings.questionsPerQuiz;
      questions = getQuizQuestions(subject, difficulty, count);
    }

    if (questions.length === 0) return;

    setQuizConfig({ subject, difficulty, selectedSubjects });
    setQuizQuestions(questions);
    setCurrentPage('quiz');
  };

  const handleQuizComplete = (result: QuizResult, questions: Question[], answers: number[]) => {
    if (currentUser) {
      result.username = currentUser.username;
    }
    addResult(result);
    setLastResult({ result, questions, answers });
    setCurrentPage('results');
  };

  // Get time limit from per-subject settings
  const getTimeLimit = (): number => {
    if (quizConfig) {
      if (quizConfig.subject === 'custom' && quizConfig.selectedSubjects) {
        // Average time limit of selected subjects
        const configs = quizConfig.selectedSubjects.map(id => getSubjectConfig(id)).filter(Boolean);
        if (configs.length > 0) {
          return Math.round(configs.reduce((a, c) => a + (c?.timePerQuiz ?? 10), 0) / configs.length);
        }
      }
      const subjectCfg = getSubjectConfig(quizConfig.subject);
      if (subjectCfg) return subjectCfg.timePerQuiz;
    }
    return getSettings().timePerQuiz;
  };

  // Show loading screen while fetching live.json
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-2xl shadow-violet-500/40 mb-6 animate-float">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            CodeQuiz
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            Loading data...
          </div>
        </div>
      </div>
    );
  }

  const showHeader = currentUser && currentPage !== 'quiz';
  const showFooter = currentUser && currentPage !== 'quiz' && currentPage !== 'login';

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && (
        <Header
          user={currentUser}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1">
        {currentPage === 'login' && (
          <Login onLogin={handleLogin} />
        )}

        {currentPage === 'dashboard' && currentUser && (
          <Dashboard
            user={currentUser}
            onNavigate={handleNavigate}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentPage === 'quiz' && currentUser && quizConfig && quizQuestions.length > 0 && (
          <Quiz
            user={currentUser}
            subject={quizConfig.subject}
            difficulty={quizConfig.difficulty}
            questions={quizQuestions}
            timeLimit={getTimeLimit()}
            selectedSubjects={quizConfig.selectedSubjects}
            onComplete={handleQuizComplete}
            onCancel={() => handleNavigate('dashboard')}
          />
        )}

        {currentPage === 'results' && lastResult && (
          <Results
            result={lastResult.result}
            questions={lastResult.questions}
            answers={lastResult.answers}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'admin' && currentUser?.isAdmin && (
          <Admin />
        )}

        {currentPage === 'history' && currentUser && (
          <History userId={currentUser.id} />
        )}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}
