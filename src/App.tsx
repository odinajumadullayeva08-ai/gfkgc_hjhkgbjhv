import React, { useState, useEffect } from 'react';
import { Quiz, QuizResult, UserProfile, LiveActivityItem } from './types';
import {
  getStoredQuizzes,
  saveQuizzes,
  getStoredResults,
  saveQuizResult,
  getStoredProfile,
  saveProfile,
  getStoredLiveActivities,
  saveLiveActivities,
} from './utils/storage';
import { soundManager } from './utils/audio';
import { MobileFrame } from './components/MobileFrame';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { QuizCatalog } from './components/QuizCatalog';
import { QuizRunner } from './components/QuizRunner';
import { QuizSummary } from './components/QuizSummary';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { QuizBuilder } from './components/QuizBuilder';
import { ProfileModal } from './components/ProfileModal';

const RANDOM_NAMES = [
  'Алина Кузнецова',
  'Дмитрий Орлов',
  'Полина Морозова',
  'Иван Семенов',
  'София Новикова',
  'Роман Васильев',
  'Ксения Федорова',
  'Артур Багиров',
];

const RANDOM_AVATARS = ['👩‍🎓', '👨‍💻', '🎯', '⚡', '🦉', '🚀', '🧠', '🌟'];

export default function App() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(getStoredQuizzes);
  const [results, setResults] = useState<QuizResult[]>(getStoredResults);
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);
  const [liveActivities, setLiveActivities] = useState<LiveActivityItem[]>(getStoredLiveActivities);

  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [latestResult, setLatestResult] = useState<QuizResult | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Initialize theme and sound
  useEffect(() => {
    soundManager.setEnabled(profile.soundEnabled);

    // Apply dark mode class to html element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, profile.soundEnabled]);

  // Periodic simulated live quiz activity generator (Simulates real-time active platform)
  useEffect(() => {
    const interval = setInterval(() => {
      if (quizzes.length === 0) return;

      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
      const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
      const randomAvatar = RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
      const totalQ = randomQuiz.questions.length;
      // High probability of 70-100% score
      const score = Math.max(1, Math.floor(totalQ * (0.6 + Math.random() * 0.4)));
      const pct = Math.round((score / totalQ) * 100);

      const newActivity: LiveActivityItem = {
        id: `act-${Date.now()}`,
        userName: randomName,
        userAvatar: randomAvatar,
        quizTitle: randomQuiz.title,
        category: randomQuiz.category,
        score,
        totalQuestions: totalQ,
        percentage: pct,
        timestamp: 'Только что',
      };

      setLiveActivities((prev) => {
        const updated = [newActivity, ...prev.slice(0, 14)];
        saveLiveActivities(updated);
        return updated;
      });
    }, 14000);

    return () => clearInterval(interval);
  }, [quizzes]);

  // Handlers
  const handleSelectQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setLatestResult(null);
    setActiveTab('runner');
  };

  const handleFinishQuiz = (result: QuizResult) => {
    // Save result
    const updatedResults = saveQuizResult(result);
    setResults(updatedResults);
    setLatestResult(result);

    // Update Profile XP and level
    const newTotalXp = profile.totalXp + result.xpEarned;
    const newLevel = Math.max(1, Math.floor(newTotalXp / 300) + 1);
    const updatedProfile: UserProfile = {
      ...profile,
      totalXp: newTotalXp,
      level: newLevel,
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    // Push into Live Activities stream with current user highlight!
    const userLiveItem: LiveActivityItem = {
      id: `live-user-${Date.now()}`,
      userName: profile.name,
      userAvatar: profile.avatar,
      quizTitle: result.quizTitle,
      category: result.category,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: result.percentage,
      timestamp: 'Только что',
      isCurrentUser: true,
    };

    setLiveActivities((prev) => {
      const updated = [userLiveItem, ...prev.slice(0, 14)];
      saveLiveActivities(updated);
      return updated;
    });
  };

  const handleRetakeQuiz = (quizId?: string) => {
    const targetId = quizId || (activeQuiz ? activeQuiz.id : quizzes[0].id);
    const quizToRetake = quizzes.find((q) => q.id === targetId) || quizzes[0];
    setActiveQuiz(quizToRetake);
    setLatestResult(null);
    setActiveTab('runner');
  };

  const handleSaveCustomQuiz = (newQuiz: Quiz) => {
    const updatedQuizzes = [newQuiz, ...quizzes];
    setQuizzes(updatedQuizzes);
    saveQuizzes(updatedQuizzes);
    // Immediately start the new custom quiz!
    handleSelectQuiz(newQuiz);
  };

  const handleResetStats = () => {
    localStorage.removeItem('quizpro_results_v1');
    setResults([]);
    const freshProfile = {
      ...profile,
      totalXp: 0,
      level: 1,
    };
    setProfile(freshProfile);
    saveProfile(freshProfile);
  };

  const handleToggleSound = () => {
    const newVal = !profile.soundEnabled;
    const updated = { ...profile, soundEnabled: newVal };
    setProfile(updated);
    saveProfile(updated);
    soundManager.setEnabled(newVal);
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <MobileFrame
      activeTab={activeTab}
      onOpenProfile={() => setShowProfileModal(true)}
      userAvatar={profile.avatar}
      userName={profile.name}
      soundEnabled={profile.soundEnabled}
      onToggleSound={handleToggleSound}
      isDarkMode={isDarkMode}
      onToggleDarkMode={handleToggleDarkMode}
    >
      {/* View routing */}
      {activeTab === 'catalog' && (
        <QuizCatalog
          quizzes={quizzes}
          results={results}
          profile={profile}
          onSelectQuiz={handleSelectQuiz}
          onOpenCreate={() => setActiveTab('builder')}
          onOpenProfile={() => setShowProfileModal(true)}
        />
      )}

      {activeTab === 'runner' && (
        <>
          {activeQuiz ? (
            latestResult ? (
              <QuizSummary
                result={latestResult}
                quiz={activeQuiz}
                onRetake={() => handleRetakeQuiz(activeQuiz.id)}
                onGoToAnalytics={() => setActiveTab('analytics')}
                onGoToCatalog={() => {
                  setActiveQuiz(null);
                  setLatestResult(null);
                  setActiveTab('catalog');
                }}
              />
            ) : (
              <QuizRunner
                quiz={activeQuiz}
                onFinish={handleFinishQuiz}
                onCancel={() => {
                  setActiveQuiz(null);
                  setActiveTab('catalog');
                }}
              />
            )
          ) : (
            // No quiz active - prompt user to select one
            <div className="flex flex-col items-center justify-center p-8 text-center my-auto gap-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl">
                ⚡
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Тест не выбран
              </h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Выберите подходящую тему в каталоге или начните случайный тест для проверки знаний.
              </p>
              <button
                onClick={() => {
                  soundManager.playTap();
                  handleSelectQuiz(quizzes[0]);
                }}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl text-xs hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Начать рекомендованный тест
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard
          results={results}
          profile={profile}
          liveActivities={liveActivities}
          quizzes={quizzes}
          onRetakeQuiz={(quizId) => handleRetakeQuiz(quizId)}
          onRefreshLive={() => {}}
        />
      )}

      {activeTab === 'builder' && (
        <QuizBuilder
          onSaveQuiz={handleSaveCustomQuiz}
          onCancel={() => setActiveTab('catalog')}
        />
      )}

      {/* Profile and Settings Modal */}
      {showProfileModal && (
        <ProfileModal
          profile={profile}
          isDarkMode={isDarkMode}
          onSaveProfile={(updated) => {
            setProfile(updated);
            saveProfile(updated);
          }}
          onToggleDarkMode={handleToggleDarkMode}
          onResetStats={handleResetStats}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'runner' && !activeQuiz) {
            // Select default quiz if none active
            setActiveQuiz(quizzes[0]);
          }
          setActiveTab(tab);
        }}
        hasActiveQuiz={Boolean(activeQuiz && !latestResult)}
      />
    </MobileFrame>
  );
}
