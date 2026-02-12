export type Difficulty = 'easy' | 'medium' | 'hard';
export type Page = 'login' | 'dashboard' | 'quiz' | 'results' | 'admin' | 'history';

export interface SubjectConfig {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  description: string;
  questionsPerQuiz: number;
  timePerQuiz: number; // minutes
}

export interface Question {
  id: string;
  subject: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
  isGuest?: boolean;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  username?: string;
  subject: string;
  difficulty: Difficulty;
  score: number;
  total: number;
  percentage: number;
  date: string;
  timeTaken: number;
}

export interface QuizSettings {
  questionsPerQuiz: number;
  timePerQuiz: number;
}

export interface UserStats {
  user: User;
  totalQuizzes: number;
  avgScore: number;
  bestScore: number;
  totalCorrect: number;
  totalQuestions: number;
  lastActive: string;
  results: QuizResult[];
}
