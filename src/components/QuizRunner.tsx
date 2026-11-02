import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quiz, AnswerRecord, QuizResult } from '../types';
import { soundManager } from '../utils/audio';
import {
  X,
  Clock,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Grid3X3,
  AlertCircle,
} from 'lucide-react';

interface QuizRunnerProps {
  quiz: Quiz;
  onFinish: (result: QuizResult) => void;
  onCancel: () => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  quiz,
  onFinish,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Time state
  const [timeLeft, setTimeLeft] = useState<number>(quiz.timeLimitSeconds);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [questionTimeStart, setQuestionTimeStart] = useState<number>(Date.now());
  const [questionDurations, setQuestionDurations] = useState<Record<number, number>>({});

  const currentQuestion = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;
  const isCurrentAnswered = selectedAnswers[currentIndex] !== undefined;
  const selectedOptionIndex = selectedAnswers[currentIndex];

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save timing when leaving current question
  const recordQuestionTime = useCallback(() => {
    const elapsed = Math.round((Date.now() - questionTimeStart) / 1000);
    setQuestionDurations((prev) => ({
      ...prev,
      [currentIndex]: (prev[currentIndex] || 0) + elapsed,
    }));
    setQuestionTimeStart(Date.now());
  }, [currentIndex, questionTimeStart]);

  // Main countdown timer
  useEffect(() => {
    setTimeLeft(quiz.timeLimitSeconds);
    setQuestionTimeStart(Date.now());

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this question
          soundManager.playWrong();
          handleAutoNextOnTimeout();
          return 0;
        }
        if (prev <= 6) {
          soundManager.playTick();
        }
        return prev - 1;
      });
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, quiz.timeLimitSeconds]);

  // Handle timeout auto-advance
  const handleAutoNextOnTimeout = () => {
    if (selectedAnswers[currentIndex] === undefined) {
      setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: -1 }));
    }
    if (isLastQuestion) {
      handleFinalSubmit();
    } else {
      setCurrentIndex((i) => i + 1);
      setShowExplanation(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isCurrentAnswered) return; // Locked once answered
    soundManager.playTap();

    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: index }));
    const isCorrect = index === currentQuestion.correctIndex;

    if (isCorrect) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }

    // Auto show explanation
    setShowExplanation(true);
  };

  const handleNext = () => {
    soundManager.playTap();
    recordQuestionTime();
    setShowExplanation(false);

    if (isLastQuestion) {
      handleFinalSubmit();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    soundManager.playTap();
    recordQuestionTime();
    setShowExplanation(false);
    setCurrentIndex((prev) => prev - 1);
  };

  const toggleBookmark = () => {
    soundManager.playTap();
    setBookmarked((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
  };

  const handleFinalSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    recordQuestionTime();

    let correctCount = 0;
    const answerRecords: AnswerRecord[] = quiz.questions.map((q, idx) => {
      const selected = selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1;
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selectedIndex: selected,
        isCorrect,
        timeSpentSeconds: questionDurations[idx] || 15,
      };
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    const xp = correctCount * 40 + (percentage === 100 ? 50 : 0);

    const result: QuizResult = {
      id: `res-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      score: correctCount,
      totalQuestions: quiz.questions.length,
      percentage,
      timeSpentSeconds: totalTimeSpent,
      completedAt: new Date().toISOString(),
      answers: answerRecords,
      xpEarned: xp,
    };

    onFinish(result);
  };

  const progressPercentage = Math.round(((currentIndex + 1) / quiz.questions.length) * 100);
  const timeProgressPercentage = Math.round((timeLeft / quiz.timeLimitSeconds) * 100);
  const isTimeCritical = timeLeft <= 5;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
      {/* Top Header Bar */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors"
          title="Выйти из теста"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {quiz.title}
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            Вопрос {currentIndex + 1} из {quiz.questions.length}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleBookmark}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmarked[currentIndex]
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Отметить вопрос"
          >
            {bookmarked[currentIndex] ? (
              <BookmarkCheck className="w-5 h-5 fill-amber-500" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setShowDrawer(true)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors"
            title="Карта вопросов"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 relative">
        <div
          className="bg-indigo-600 h-1 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Timer Bar */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-50 dark:border-slate-800/40">
        <div className="flex items-center gap-1.5">
          <Clock
            className={`w-4 h-4 ${
              isTimeCritical ? 'text-rose-500 animate-pulse' : 'text-slate-400'
            }`}
          />
          <span
            className={`font-mono font-bold tabular-nums ${
              isTimeCritical ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
            }`}
          >
            00:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="w-32 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isTimeCritical ? 'bg-rose-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${timeProgressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Question Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Question Text */}
        <div className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {currentQuestion.text}
        </div>

        {/* Code Snippet (if available) */}
        {currentQuestion.codeSnippet && (
          <div className="rounded-xl bg-slate-900 text-slate-100 p-3 text-xs font-mono border border-slate-800 overflow-x-auto shadow-inner leading-relaxed">
            <pre>
              <code>{currentQuestion.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Option Cards */}
        <div className="flex flex-col gap-2.5 mt-1">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = selectedOptionIndex === idx;
            const isCorrect = idx === currentQuestion.correctIndex;

            let cardStyles =
              'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600';
            let badgeStyles =
              'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

            if (isCurrentAnswered) {
              if (isCorrect) {
                cardStyles =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-sm';
                badgeStyles = 'bg-emerald-500 text-white font-bold';
              } else if (isSelected) {
                cardStyles =
                  'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 shadow-sm';
                badgeStyles = 'bg-rose-500 text-white font-bold';
              } else {
                cardStyles = 'opacity-50 border-slate-200 dark:border-slate-800';
              }
            } else if (isSelected) {
              cardStyles =
                'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm';
              badgeStyles = 'bg-indigo-600 text-white font-bold';
            }

            return (
              <button
                key={idx}
                disabled={isCurrentAnswered}
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 active:scale-[0.99] min-h-[54px] ${cardStyles}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${badgeStyles}`}
                >
                  {letter}
                </div>

                <div className="flex-1 text-sm font-medium pt-0.5 leading-snug">
                  {option}
                </div>

                {isCurrentAnswered && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                )}
                {isCurrentAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card (shows after answer) */}
        {showExplanation && (
          <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Разбор правильного ответа:</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="px-4 py-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed text-slate-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {isCurrentAnswered ? (
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-98 transition-all"
          >
            <span>{isLastQuestion ? 'Завершить тест' : 'Следующий вопрос'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              // Skip question
              handleSelectOption(-1);
            }}
            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
          >
            <span>Пропустить вопрос</span>
          </button>
        )}
      </div>

      {/* Question Map Bottom Sheet */}
      {showDrawer && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 max-h-[80%] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Карта вопросов квиза
              </h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {quiz.questions.map((q, idx) => {
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isSelected = idx === currentIndex;
                const isBookmarked = bookmarked[idx];

                let btnStyles =
                  'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                if (isAnswered) {
                  btnStyles = 'bg-indigo-600 text-white font-bold';
                }
                if (isSelected) {
                  btnStyles += ' ring-2 ring-indigo-400 ring-offset-2';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      recordQuestionTime();
                      setCurrentIndex(idx);
                      setShowDrawer(false);
                      setShowExplanation(false);
                    }}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center relative text-xs transition-transform active:scale-95 ${btnStyles}`}
                  >
                    <span>{idx + 1}</span>
                    {isBookmarked && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1.5 right-1.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-around">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-indigo-600" />
                <span>Отвечено</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                <span>Не отвечено</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span>С флажком</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 max-w-xs w-full shadow-2xl flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Прервать прохождение теста?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ваш текущий прогресс не будет сохранен в итоговой аналитике.
            </p>
            <div className="flex items-center gap-2 w-full pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Продолжить
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onCancel();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
