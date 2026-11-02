import React, { useEffect, useState } from 'react';
import { QuizResult, Quiz } from '../types';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import {
  RotateCcw,
  BarChart3,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';

interface QuizSummaryProps {
  result: QuizResult;
  quiz: Quiz;
  onRetake: () => void;
  onGoToAnalytics: () => void;
  onGoToCatalog: () => void;
}

export const QuizSummary: React.FC<QuizSummaryProps> = ({
  result,
  quiz,
  onRetake,
  onGoToAnalytics,
  onGoToCatalog,
}) => {
  const [showReview, setShowReview] = useState<boolean>(true);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  useEffect(() => {
    if (result.percentage >= 70) {
      soundManager.playFanfare();
      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981'],
        });
      } catch {
        // ignore
      }
    } else {
      soundManager.playCorrect();
    }
  }, [result.percentage]);

  const getVerdict = (pct: number) => {
    if (pct === 100) return { title: 'Идеально! 100%', sub: 'Безупречное знание темы, ни одной ошибки!', color: 'text-emerald-500' };
    if (pct >= 80) return { title: 'Отличный результат!', sub: 'Вы отлично ориентируетесь в материале.', color: 'text-indigo-500' };
    if (pct >= 60) return { title: 'Хороший уровень!', sub: 'Неплохо, но есть пара деталей для закрепления.', color: 'text-amber-500' };
    return { title: 'Стоит повторить', sub: 'Изучите разбор вопросов ниже и попробуйте снова.', color: 'text-rose-500' };
  };

  const verdict = getVerdict(result.percentage);
  const avgSecPerQuestion = Math.round(result.timeSpentSeconds / result.totalQuestions);

  const handleShare = () => {
    soundManager.playTap();
    const shareText = `Я прошел тест «${result.quizTitle}» на платформе ВикторинаПро с результатом ${result.percentage}% (${result.score}/${result.totalQuestions})! 🧠`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-8 text-slate-900 dark:text-slate-100">
      {/* Top Banner & Grade */}
      <div className="rounded-3xl p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center gap-3 relative shadow-sm">
        {/* Score Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center my-1">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`${
                result.percentage >= 80
                  ? 'text-emerald-500'
                  : result.percentage >= 60
                  ? 'text-indigo-500'
                  : 'text-rose-500'
              } transition-all duration-1000`}
              strokeDasharray={`${result.percentage}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tracking-tight tabular-nums font-mono">
              {result.percentage}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {result.score} из {result.totalQuestions}
            </span>
          </div>
        </div>

        <div>
          <h2 className={`text-lg font-bold ${verdict.color}`}>{verdict.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
            {verdict.sub}
          </p>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedShare ? 'Скопировано в буфер!' : 'Поделиться результатом'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Опыт (XP)</span>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            +{result.xpEarned}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Время</span>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {result.timeSpentSeconds} с
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Темп</span>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {avgSecPerQuestion} с/в
          </span>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            soundManager.playTap();
            onRetake();
          }}
          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
        >
          <RotateCcw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Пройти снова</span>
        </button>

        <button
          onClick={() => {
            soundManager.playTap();
            onGoToAnalytics();
          }}
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md shadow-indigo-600/20"
        >
          <BarChart3 className="w-4 h-4" />
          <span>В Аналитику</span>
        </button>
      </div>

      {/* Detailed Question Review Accordion */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 mt-2">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Разбор всех {quiz.questions.length} вопросов
            </span>
          </div>
          {showReview ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showReview && (
          <div className="p-4 pt-0 flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800/60 divide-y divide-slate-100 dark:divide-slate-800/60">
            {quiz.questions.map((q, idx) => {
              const answerRec = result.answers.find((a) => a.questionId === q.id);
              const isCorrect = answerRec?.isCorrect;
              const selectedIdx = answerRec?.selectedIndex;

              return (
                <div key={q.id} className="pt-3 flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {idx + 1}. {q.text}
                    </span>
                  </div>

                  <div className="pl-6 flex flex-col gap-1 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === q.correctIndex;
                      const isOptionSelected = selectedIdx === oIdx;

                      let rowClass = 'text-slate-500 dark:text-slate-400';
                      if (isOptionCorrect) {
                        rowClass = 'text-emerald-600 dark:text-emerald-400 font-semibold';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        rowClass = 'text-rose-600 dark:text-rose-400 line-through';
                      }

                      return (
                        <div key={oIdx} className={`flex items-center gap-1.5 ${rowClass}`}>
                          <span className="font-mono text-[10px] w-4">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span>{opt}</span>
                          {isOptionCorrect && (
                            <span className="text-[10px] text-emerald-500 font-sans ml-1">
                              (Верно)
                            </span>
                          )}
                          {isOptionSelected && !isOptionCorrect && (
                            <span className="text-[10px] text-rose-500 font-sans ml-1">
                              (Ваш выбор)
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {/* Explanation */}
                    <div className="mt-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-200/60 dark:border-slate-700/40">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Пояснение:{' '}
                      </span>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back to Catalog Button */}
      <button
        onClick={() => {
          soundManager.playTap();
          onGoToCatalog();
        }}
        className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        <span>Выбрать другой тест</span>
      </button>
    </div>
  );
};
