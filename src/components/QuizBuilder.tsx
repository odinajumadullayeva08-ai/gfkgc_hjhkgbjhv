import React, { useState } from 'react';
import { Quiz, Question, CategoryId } from '../types';
import { CATEGORIES } from '../data/initialQuizzes';
import { soundManager } from '../utils/audio';
import {
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  FileCode,
} from 'lucide-react';

interface QuizBuilderProps {
  onSaveQuiz: (newQuiz: Quiz) => void;
  onCancel: () => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  onSaveQuiz,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>('it');
  const [difficulty, setDifficulty] = useState<'Легкий' | 'Средний' | 'Сложный'>('Средний');
  const [timeLimit, setTimeLimit] = useState<number>(25);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q-custom-1`,
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
    },
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddQuestion = () => {
    soundManager.playTap();
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-custom-${Date.now()}-${prev.length + 1}`,
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    soundManager.playTap();
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text };
      return copy;
    });
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOpts = [...copy[qIndex].options];
      newOpts[optIndex] = text;
      copy[qIndex] = { ...copy[qIndex], options: newOpts };
      return copy;
    });
  };

  const handleCorrectIndexChange = (qIndex: number, optIndex: number) => {
    soundManager.playTap();
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIndex] = { ...copy[qIndex], correctIndex: optIndex };
      return copy;
    });
  };

  const handleExplanationChange = (index: number, explanation: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], explanation };
      return copy;
    });
  };

  const handleSave = () => {
    soundManager.playTap();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Пожалуйста, укажите название теста');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setErrorMsg(`Заполните формулировку вопроса №${i + 1}`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setErrorMsg(`Заполните вариант ответа ${String.fromCharCode(65 + j)} в вопросе №${i + 1}`);
          return;
        }
      }
    }

    const newQuiz: Quiz = {
      id: `quiz-custom-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'Пользовательский интерактивный тест',
      category,
      difficulty,
      timeLimitSeconds: timeLimit,
      timeMode: 'per_question',
      questions,
      icon: 'Custom',
      accentColor: '#6366f1',
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    soundManager.playCorrect();
    onSaveQuiz(newQuiz);
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 pb-8 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Конструктор Квизов
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Создайте свой собственный тест для проверки знаний
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Basic Settings */}
      <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Название теста
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Основы React или Тест по физике"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Краткое описание
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="О чем этот тест, для кого предназначен..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Категория
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Сложность
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'Легкий' | 'Средний' | 'Сложный')}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="Легкий">Легкий</option>
              <option value="Средний">Средний</option>
              <option value="Сложный">Сложный</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Время на вопрос: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{timeLimit} сек</span>
          </label>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            Вопросы теста ({questions.length})
          </span>
          <button
            onClick={handleAddQuestion}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить вопрос</span>
          </button>
        </div>

        {questions.map((q, qIdx) => (
          <div
            key={q.id}
            className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                Вопрос #{qIdx + 1}
              </span>
              {questions.length > 1 && (
                <button
                  onClick={() => handleRemoveQuestion(qIdx)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Удалить вопрос"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <input
                type="text"
                value={q.text}
                onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                placeholder="Введите текст вопроса..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-slate-500">
                Варианты ответа (отметьте правильный кружком):
              </span>

              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCorrectIndexChange(qIdx, optIdx)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      q.correctIndex === optIdx
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {q.correctIndex === optIdx && <div className="w-2 h-2 rounded-full bg-white" />}
                  </button>

                  <span className="text-xs font-mono text-slate-400 w-3">
                    {String.fromCharCode(65 + optIdx)}
                  </span>

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                    placeholder={`Вариант ${optIdx + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div>
              <input
                type="text"
                value={q.explanation}
                onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                placeholder="Пояснение к правильному ответу (необязательно)"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 focus:outline-none"
              />
            </div>
          </div>
        ))}

        <button
          onClick={handleAddQuestion}
          className="py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить еще вопрос</span>
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-98 transition-all"
      >
        <Save className="w-4 h-4" />
        <span>Сохранить и запустить квиз</span>
      </button>
    </div>
  );
};
