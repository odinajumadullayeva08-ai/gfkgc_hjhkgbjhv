import React from 'react';
import { BookOpen, PlayCircle, BarChart3, PlusCircle } from 'lucide-react';
import { soundManager } from '../utils/audio';

export type TabType = 'catalog' | 'runner' | 'analytics' | 'builder';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasActiveQuiz: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  hasActiveQuiz,
}) => {
  const handleTabClick = (tab: TabType) => {
    soundManager.playTap();
    onTabChange(tab);
  };

  const navItems = [
    {
      id: 'catalog' as TabType,
      label: 'Тесты',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'runner' as TabType,
      label: hasActiveQuiz ? 'В процессе' : 'Пройти',
      icon: PlayCircle,
      badge: hasActiveQuiz ? '●' : null,
      highlight: hasActiveQuiz,
    },
    {
      id: 'analytics' as TabType,
      label: 'Аналитика',
      icon: BarChart3,
      badge: 'LIVE',
    },
    {
      id: 'builder' as TabType,
      label: 'Создать',
      icon: PlusCircle,
      badge: null,
    },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-2 pt-1 pb-3">
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center relative rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-3 text-[9px] px-1 py-0.2 rounded font-mono font-bold leading-none ${
                      item.highlight
                        ? 'text-amber-500 animate-pulse'
                        : 'bg-rose-500 text-white rounded-full px-1'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-1 whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
