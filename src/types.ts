export type CategoryId = 'it' | 'math' | 'science' | 'languages' | 'general';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  description: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  codeSnippet?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  difficulty: 'Легкий' | 'Средний' | 'Сложный';
  timeLimitSeconds: number; // total or per-question
  timeMode: 'per_question' | 'total';
  questions: Question[];
  icon: string;
  accentColor: string;
  createdAt: string;
  isCustom?: boolean;
}

export interface AnswerRecord {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  category: CategoryId;
  difficulty: 'Легкий' | 'Средний' | 'Сложный';
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  answers: AnswerRecord[];
  xpEarned: number;
}

export interface LiveActivityItem {
  id: string;
  userName: string;
  userAvatar: string;
  quizTitle: string;
  category: CategoryId;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: string;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  name: string;
  avatar: string;
  level: number;
  totalXp: number;
  streakDays: number;
  soundEnabled: boolean;
}
