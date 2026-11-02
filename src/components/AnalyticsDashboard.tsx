import React, { useState, useEffect } from 'react';
import { QuizResult, UserProfile, LiveActivityItem, Quiz } from '../types';
import { CATEGORIES, INITIAL_LEADERBOARD } from '../data/initialQuizzes';
import { soundManager } from '../utils/audio';
import {
  TrendingUp,
  Award,
  Zap,
  Clock,
  Activity,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Sparkles,
  BarChart2,
  Users,
  Target,
  ArrowUpRight,
  Radio,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  results: QuizResult[];
  profile: UserProfile;
  liveActivities: LiveActivityItem[];
  quizzes: Quiz[];
  onRetakeQuiz: (quizId: string) => void;
  onRefreshLive: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  results,
  profile,
  liveActivities,
  quizzes,
  onRetakeQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'live' | 'leaderboard' | 'history'>('overview');
  const [selectedHistoryFilter, setSelectedHistoryFilter] = useState<'all' | 'high' | 'low'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Compute metrics
  const totalPassed = results.length;
  const avgAccuracy = totalPassed > 0
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / totalPassed)
    : 0;
  const bestScore = totalPassed > 0
    ? Math.max(...results.map((r) => r.percentage))
    : 0;
  const totalTimeSeconds = results.reduce((sum, r) => sum + r.timeSpentSeconds, 0);
  const totalTimeMinutes = Math.round(totalTimeSeconds / 60);

  // Category breakdown
  const categoryStats = CATEGORIES.map((cat) => {
    const catResults = results.filter((r) => r.category === cat.id);
    const count = catResults.length;
    const catAvg = count > 0
      ? Math.round(catResults.reduce((sum, r) => sum + r.percentage, 0) / count)
      : 0;
    return {
      ...cat,
      count,
      avg: catAvg,
    };
  });

  const strongCategory = [...categoryStats].filter(c => c.count > 0).sort((a, b) => b.avg - a.avg)[0];
  const weakCategory = [...categoryStats].filter(c => c.count > 0).sort((a, b) => a.avg - b.avg)[0];

  // History filtered
  const filteredHistory = results.filter((r) => {
    if (selectedHistoryFilter === 'high') return r.percentage >= 80;
    if (selectedHistoryFilter === 'low') return r.percentage < 60;
    return true;
  });

  // Chart data (take last 6 results in chronological order)
  const chartResults = [...results].reverse().slice(-6);

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 pb-8 text-slate-900 dark:text-slate-100">
      {/* Header with Live Status Indicator */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Аналитический Центр
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>РЕАЛЬНОЕ ВРЕМЯ</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Мониторинг прогресса, точности и активности
          </p>
        </div>
      </div>

      {/* Segmented Sub-Navigation */}
      <div className="grid grid-cols-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => {
            soundManager.playTap();
            setActiveTab('overview');
          }}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Обзор
        </button>
        <button
          onClick={() => {
            soundManager.playTap();
            setActiveTab('live');
          }}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'live'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Эфир</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
        </button>
        <button
          onClick={() => {
            soundManager.playTap();
            setActiveTab('leaderboard');
          }}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Лидеры
        </button>
        <button
          onClick={() => {
            soundManager.playTap();
            setActiveTab('history');
          }}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          История
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-4">
          {/* 4 Big KPI Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">Точность</span>
                <Target className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {avgAccuracy}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {avgAccuracy >= 80 ? 'Высокий уровень' : 'В процессе роста'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">Пройдено</span>
                <Award className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {totalPassed}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Рекордов: {results.filter((r) => r.percentage === 100).length}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">Время</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {totalTimeMinutes} <span className="text-xs font-sans font-normal text-slate-400">мин</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Инвестировано в знания
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">Лучший балл</span>
                <Sparkles className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {bestScore}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Максимальный результат
              </div>
            </div>
          </div>

          {/* SVG Score Trend Chart */}
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Динамика успеваемости
                </h4>
                <div className="text-[10px] text-slate-400">
                  Процент правильных ответов по последним попыткам
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-indigo-500" />
            </div>

            {chartResults.length > 1 ? (
              <div className="relative pt-2">
                {/* SVG Line Chart */}
                <svg className="w-full h-32 overflow-visible" viewBox="0 0 300 100">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" strokeDasharray="3 3" className="text-slate-100 dark:text-slate-800" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" strokeDasharray="3 3" className="text-slate-100 dark:text-slate-800" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" strokeDasharray="3 3" className="text-slate-100 dark:text-slate-800" />

                  {/* Polyline */}
                  {(() => {
                    const step = 300 / (chartResults.length - 1 || 1);
                    const points = chartResults
                      .map((r, i) => {
                        const x = i * step;
                        // y ranges: 100% -> y=10, 0% -> y=90
                        const y = 90 - (r.percentage / 100) * 80;
                        return `${x},${y}`;
                      })
                      .join(' ');

                    const firstX = 0;
                    const lastX = (chartResults.length - 1) * step;
                    const areaPoints = `${points} ${lastX},95 ${firstX},95`;

                    return (
                      <>
                        {/* Shaded Area */}
                        <polygon
                          points={areaPoints}
                          className="fill-indigo-500/10 dark:fill-indigo-500/20"
                        />
                        {/* Line */}
                        <polyline
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                        {/* Circles on Points */}
                        {chartResults.map((r, i) => {
                          const x = i * step;
                          const y = 90 - (r.percentage / 100) * 80;
                          const isHovered = hoveredPoint === i;

                          return (
                            <g
                              key={r.id}
                              onMouseEnter={() => setHoveredPoint(i)}
                              onMouseLeave={() => setHoveredPoint(null)}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={x}
                                cy={y}
                                r={isHovered ? 6 : 4}
                                className="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2 transition-all"
                              />
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>

                {/* Hover Details Card */}
                {hoveredPoint !== null && chartResults[hoveredPoint] && (
                  <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-lg border border-slate-700 animate-in fade-in">
                    <div className="font-bold">{chartResults[hoveredPoint].quizTitle}</div>
                    <div className="text-indigo-300 font-mono">
                      Результат: {chartResults[hoveredPoint].percentage}% ({chartResults[hoveredPoint].score}/{chartResults[hoveredPoint].totalQuestions})
                    </div>
                  </div>
                )}

                {/* X-axis labels */}
                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
                  {chartResults.map((r, i) => (
                    <span key={r.id} className="tabular-nums">
                      #{i + 1} ({r.percentage}%)
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Пройдите еще хотя бы 1 тест для построения графика динамики
              </div>
            )}
          </div>

          {/* Competency by Categories */}
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Компетенции по направлениям
            </h4>

            <div className="flex flex-col gap-3">
              {categoryStats.map((cat) => (
                <div key={cat.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {cat.name}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {cat.count > 0 ? `${cat.avg}%` : 'Нет данных'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        cat.avg >= 80
                          ? 'bg-emerald-500'
                          : cat.avg >= 50
                          ? 'bg-indigo-500'
                          : cat.avg > 0
                          ? 'bg-amber-500'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${cat.avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses Intelligence */}
          {strongCategory && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  Сильная сторона
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {strongCategory.name}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  Точность: {strongCategory.avg}%
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Зона роста
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {weakCategory ? weakCategory.name : '—'}
                </div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                  {weakCategory && weakCategory.count > 0 ? `Точность: ${weakCategory.avg}%` : 'Рекомендуется пройти'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REAL-TIME LIVE ACTIVITY STREAM */}
      {activeTab === 'live' && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex items-center justify-between shadow-md">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mb-1">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>ЖИВОЙ ПОТОК РЕЗУЛЬТАТОВ</span>
              </div>
              <h3 className="text-sm font-bold">Активность участников в реальном времени</h3>
              <p className="text-[11px] text-indigo-200 mt-0.5">
                Каждые несколько секунд фиксируются завершенные тесты платформы
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {liveActivities.map((act) => (
              <div
                key={act.id}
                className={`p-3 rounded-2xl border transition-all ${
                  act.isCurrentUser
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 ring-1 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base shrink-0">
                      {act.userAvatar}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {act.userName}
                        </span>
                        {act.isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-bold">
                            ВЫ
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
                        {act.quizTitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-mono font-bold ${
                        act.percentage >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : act.percentage >= 60
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {act.percentage}% ({act.score}/{act.totalQuestions})
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {act.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="flex flex-col gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Топ знатоков платформы за текущую неделю по суммарному баллу и точности.
          </div>

          <div className="flex flex-col gap-2">
            {INITIAL_LEADERBOARD.map((user) => {
              const isFirst = user.rank === 1;
              const isSecond = user.rank === 2;
              const isThird = user.rank === 3;

              let rankBadge = `${user.rank}`;
              if (isFirst) rankBadge = '🥇';
              if (isSecond) rankBadge = '🥈';
              if (isThird) rankBadge = '🥉';

              return (
                <div
                  key={user.rank}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center text-xs font-bold font-mono text-slate-500">
                      {rankBadge}
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                      {user.avatar}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Тестов: {user.quizzesPassed} · Точность: {user.accuracy}%
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                      {user.score} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User's position card */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 mt-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                #7
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center text-lg">
                {profile.avatar}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <span>{profile.name} (Вы)</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  Тестов: {totalPassed} · Точность: {avgAccuracy}%
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                {profile.totalXp} XP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORY */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-3">
          {/* History Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedHistoryFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedHistoryFilter === 'all'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Все попытки ({results.length})
            </button>
            <button
              onClick={() => setSelectedHistoryFilter('high')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedHistoryFilter === 'high'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Высокий балл (80%+)
            </button>
            <button
              onClick={() => setSelectedHistoryFilter('low')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedHistoryFilter === 'low'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Требуют повтора (&lt;60%)
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {filteredHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                В этой категории нет попыток
              </div>
            ) : (
              filteredHistory.map((res) => {
                const dateStr = new Date(res.completedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {res.quizTitle}
                        </h4>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{dateStr}</span>
                          <span>·</span>
                          <span>{res.timeSpentSeconds} сек</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`text-sm font-mono font-bold ${
                            res.percentage >= 80
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : res.percentage >= 60
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-rose-500'
                          }`}
                        >
                          {res.percentage}%
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {res.score} / {res.totalQuestions}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                      <span className="text-amber-600 dark:text-amber-400 font-semibold font-mono">
                        +{res.xpEarned} XP
                      </span>

                      <button
                        onClick={() => {
                          soundManager.playTap();
                          onRetakeQuiz(res.quizId);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Пересдать</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
