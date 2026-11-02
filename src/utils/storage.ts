import { Quiz, QuizResult, UserProfile, LiveActivityItem } from '../types';
import { INITIAL_QUIZZES, MOCK_LIVE_ACTIVITIES } from '../data/initialQuizzes';

const STORAGE_KEYS = {
  QUIZZES: 'quizpro_quizzes_v1',
  RESULTS: 'quizpro_results_v1',
  PROFILE: 'quizpro_profile_v1',
  LIVE: 'quizpro_live_v1',
};

export const getStoredQuizzes = (): Quiz[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
      return INITIAL_QUIZZES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_QUIZZES;
  } catch {
    return INITIAL_QUIZZES;
  }
};

export const saveQuizzes = (quizzes: Quiz[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  } catch {
    // ignore
  }
};

export const getStoredResults = (): QuizResult[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (!raw) {
      // Seed 2 default past attempts for immediate analytics visualization
      const defaultPastResults: QuizResult[] = [
        {
          id: 'res-seed-1',
          quizId: 'quiz-js-pro',
          quizTitle: 'JavaScript: От Замыканий до Event Loop',
          category: 'it',
          difficulty: 'Средний',
          score: 4,
          totalQuestions: 5,
          percentage: 80,
          timeSpentSeconds: 78,
          completedAt: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
          xpEarned: 160,
          answers: [
            { questionId: 'q-js-1', selectedIndex: 1, isCorrect: true, timeSpentSeconds: 12 },
            { questionId: 'q-js-2', selectedIndex: 2, isCorrect: true, timeSpentSeconds: 9 },
            { questionId: 'q-js-3', selectedIndex: 1, isCorrect: true, timeSpentSeconds: 15 },
            { questionId: 'q-js-4', selectedIndex: 0, isCorrect: false, timeSpentSeconds: 18 },
            { questionId: 'q-js-5', selectedIndex: 2, isCorrect: true, timeSpentSeconds: 24 },
          ],
        },
        {
          id: 'res-seed-2',
          quizId: 'quiz-science-space',
          quizTitle: 'Астрономия и Законы Вселенной',
          category: 'science',
          difficulty: 'Легкий',
          score: 4,
          totalQuestions: 4,
          percentage: 100,
          timeSpentSeconds: 52,
          completedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
          xpEarned: 200,
          answers: [
            { questionId: 'q-sci-1', selectedIndex: 1, isCorrect: true, timeSpentSeconds: 10 },
            { questionId: 'q-sci-2', selectedIndex: 1, isCorrect: true, timeSpentSeconds: 11 },
            { questionId: 'q-sci-3', selectedIndex: 2, isCorrect: true, timeSpentSeconds: 14 },
            { questionId: 'q-sci-4', selectedIndex: 1, isCorrect: true, timeSpentSeconds: 17 },
          ],
        },
      ];
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(defaultPastResults));
      return defaultPastResults;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveQuizResult = (result: QuizResult): QuizResult[] => {
  const current = getStoredResults();
  const updated = [result, ...current];
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
};

export const getStoredProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) {
      const defaultProfile: UserProfile = {
        name: 'Знаток Ума',
        avatar: '🚀',
        level: 2,
        totalXp: 360,
        streakDays: 3,
        soundEnabled: true,
      };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    return JSON.parse(raw);
  } catch {
    return {
      name: 'Знаток Ума',
      avatar: '🚀',
      level: 1,
      totalXp: 0,
      streakDays: 1,
      soundEnabled: true,
    };
  }
};

export const saveProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
};

export const getStoredLiveActivities = (): LiveActivityItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LIVE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LIVE, JSON.stringify(MOCK_LIVE_ACTIVITIES));
      return MOCK_LIVE_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch {
    return MOCK_LIVE_ACTIVITIES;
  }
};

export const saveLiveActivities = (activities: LiveActivityItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LIVE, JSON.stringify(activities.slice(0, 20)));
  } catch {
    // ignore
  }
};
