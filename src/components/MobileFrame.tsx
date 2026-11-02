import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Moon, Sun, Volume2, VolumeX, ShieldAlert, Wifi, BatteryCharging, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface MobileFrameProps {
  children: React.ReactNode;
  activeTab: string;
  onOpenProfile: () => void;
  userAvatar: string;
  userName: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  activeTab,
  onOpenProfile,
  userAvatar,
  userName,
  soundEnabled,
  onToggleSound,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile_frame' | 'responsive'>('mobile_frame');
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-0 sm:py-6 selection:bg-indigo-500 selection:text-white">
      {/* Top Utilities Header for Desktop/Tablet Viewports */}
      <div className="w-full max-w-4xl hidden sm:flex items-center justify-between px-4 pb-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-200">ВикторинаПро</span>
          <span>·</span>
          <span>Мобильная Квиз-Платформа</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={() => setDeviceMode('mobile_frame')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                deviceMode === 'mobile_frame'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Режим смартфона"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Смартфон</span>
            </button>
            <button
              onClick={() => setDeviceMode('responsive')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                deviceMode === 'responsive'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Широкий экран"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Широкий</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-slate-300 transition-colors"
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-slate-300 transition-colors"
            title={isDarkMode ? 'Светлая тема' : 'Темная тема'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User profile quick trigger */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg transition-colors text-slate-200"
          >
            <span className="text-sm">{userAvatar}</span>
            <span className="font-medium max-w-[100px] truncate">{userName}</span>
          </button>
        </div>
      </div>

      {/* Main Container - Either phone mockup or responsive width */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceMode === 'mobile_frame'
            ? 'sm:max-w-[420px] sm:h-[870px] sm:max-h-[92vh] sm:rounded-[46px] sm:border-[10px] sm:border-slate-800 sm:shadow-2xl sm:shadow-indigo-950/50 sm:ring-1 sm:ring-slate-700/50'
            : 'max-w-2xl sm:min-h-[850px] sm:rounded-2xl sm:border sm:border-slate-800'
        } bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden h-screen sm:h-auto`}
      >
        {/* Smartphone Status Bar (Simulated) */}
        <div className="shrink-0 h-10 w-full px-6 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 select-none z-30 pt-1">
          <span>{currentTime}</span>

          {/* Dynamic Island / Speaker Pill */}
          <div className="w-24 h-4 bg-slate-900 dark:bg-slate-800 rounded-full flex items-center justify-end px-2 gap-1 border border-slate-800/40">
            <div className="w-2 h-2 rounded-full bg-indigo-500/80 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">5G</span>
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono">98%</span>
              <BatteryCharging className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Content Viewport with mobile touch behavior */}
        <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain relative pb-20">
          {children}
        </div>

        {/* Bottom Home Indicator Bar (Mobile design gesture affordance) */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full pointer-events-none z-50 opacity-60" />
      </div>
    </div>
  );
};
