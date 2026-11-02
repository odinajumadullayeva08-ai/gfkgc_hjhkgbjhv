import React, { useState } from 'react';
import { Quiz, CategoryId, QuizResult, UserProfile } from '../types';
import { CATEGORIES } from '../data/initialQuizzes';
import { Search, Flame, Award, Clock, ArrowRight, CheckCircle2, Shuffle, Plus } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface QuizCatalogProps {
  quizzes: Quiz[];
  results: QuizResult[];
  profile: UserProfile;
  onSelectQuiz: (quiz: Quiz) => void;
  onOpenCreate: () => void;
  onOpenProfile: () => void;
}

export const QuizCatalog: React.FC<QuizCatalogProps> = ({
  quizzes,
  results,
  profile,
  onSelectQuiz,
  onOpenCreate,
  onOpenProfile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Map quizId -> best score
  const bestScores = results.reduce<Record<string, number>>((acc, res) => {
    if (!acc[res.quizId] || res.percentage > acc[res.quizId]) {
      acc[res.quizId] = res.percentage;
    }
    return acc;
  }, {});

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredQuiz = quizzes[0];

  const handleRandomStart = () => {
    soundManager.playTap();
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    onSelectQuiz(quizzes[randomIndex]);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 pb-6">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 text-left active:scale-98 transition-transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-xl shrink-0 shadow-sm">
            {profile.avatar}
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">С возвращением,</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>{profile.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Lvl {profile.level}
              </span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* Daily Streak Indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span className="tabular-nums">{profile.streakDays} дн</span>
          </div>

          <button
            onClick={handleRandomStart}
            className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
            title="Случайный квиз"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск тестов по темам и ключевым словам..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
      </div>

      {/* Featured Banner (if not searching) */}
      {!searchQuery && selectedCategory === 'all' && featuredQuiz && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-4 relative overflow-hidden shadow-md shadow-indigo-500/10">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-2">
            <div className="text-xs font-medium text-indigo-200 flex items-center gap-1.5">
              <span>Тест Дня</span>
              <span>·</span>
              <span>{featuredQuiz.questions.length} вопросов</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {featuredQuiz.title}
            </h3>
            <p className="text-xs text-indigo-100 line-clamp-2 leading-relaxed">
              {featuredQuiz.description}
            </p>

            <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/15">
              <span className="text-xs text-indigo-200">~{featuredQuiz.questions.length * 0.5} мин</span>
              <button
                onClick={() => {
                  soundManager.playTap();
                  onSelectQuiz(featuredQuiz);
                }}
                className="px-4 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
              >
                <span>Начать</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Interactive Horizontal Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Категории
          </span>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {filteredQuizzes.length} тестов
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          <button
            onClick={() => {
              soundManager.playTap();
              setSelectedCategory('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Все темы
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playTap();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes List */}
      <div className="flex flex-col gap-3">
        {filteredQuizzes.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-lg">
              🔍
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Тесты не найдены
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              Попробуйте изменить поисковый запрос или создайте собственный тест прямо сейчас.
            </p>
            <button
              onClick={onOpenCreate}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Создать свой квиз</span>
            </button>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => {
            const best = bestScores[quiz.id];
            const categoryObj = CATEGORIES.find((c) => c.id === quiz.category);

            return (
              <div
                key={quiz.id}
                onClick={() => {
                  soundManager.playTap();
                  onSelectQuiz(quiz);
                }}
                className="group relative rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/50 dark:hover:border-indigo-600/50 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {/* Quiet metadata line without pills */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {categoryObj?.name || 'Квиз'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{quiz.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{quiz.questions.length} вопр.</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {quiz.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>

                  {/* Best score badge or start arrow */}
                  <div className="flex flex-col items-end shrink-0 gap-1.5">
                    {best !== undefined ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/70">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{best}%</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer specs */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/70">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{quiz.timeLimitSeconds} сек/вопрос</span>
                  </div>

                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs group-hover:underline">
                    {best !== undefined ? 'Пройти снова' : 'Начать тест →'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
