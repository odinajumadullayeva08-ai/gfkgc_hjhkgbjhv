import React, { useState } from 'react';
import { UserProfile } from '../types';
import { soundManager } from '../utils/audio';
import { X, Volume2, VolumeX, Moon, Sun, RotateCcw, Check, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  isDarkMode: boolean;
  onSaveProfile: (profile: UserProfile) => void;
  onToggleDarkMode: () => void;
  onResetStats: () => void;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['🚀', '👨‍💻', '👩‍🔬', '⚡', '🎯', '📚', '🧠', '🦉', '🏆', '🌟'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isDarkMode,
  onSaveProfile,
  onToggleDarkMode,
  onResetStats,
  onClose,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    soundManager.playTap();
    onSaveProfile({
      ...profile,
      name: name.trim() || 'Пользователь',
      avatar,
      soundEnabled,
    });
    soundManager.setEnabled(soundEnabled);
    onClose();
  };

  const handleSoundToggle = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    soundManager.setEnabled(newVal);
    if (newVal) {
      soundManager.playTap();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Профиль и Настройки
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Выберите аватар
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  soundManager.playTap();
                  setAvatar(emoji);
                }}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-transform active:scale-95 ${
                  avatar === emoji
                    ? 'bg-indigo-100 dark:bg-indigo-950/80 border-2 border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Display name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Имя пользователя
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>Звуковые эффекты</span>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Тёмная тема</span>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                isDarkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Danger zone / Reset stats */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить историю тестов и статистику</span>
            </button>
          ) : (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] flex flex-col gap-2">
              <span className="text-rose-700 dark:text-rose-300 font-semibold">
                Вы уверены? Это действие необратимо.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px]"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    onResetStats();
                    setShowResetConfirm(false);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-semibold"
                >
                  Да, сбросить всё
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-98 transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Сохранить настройки</span>
        </button>
      </div>
    </div>
  );
};
