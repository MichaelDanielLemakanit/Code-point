import React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../utils/theme';

interface ThemeModeToggleProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  showLabels?: boolean;
  variant?: 'auto' | 'header' | 'dark' | 'light';
}

export const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  className = '',
  size = 'sm',
  showLabels = true,
  variant = 'auto'
}) => {
  const { mode, effectiveMode, setMode } = useTheme();

  const options: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }>; title: string }[] = [
    {
      id: 'system',
      label: 'Auto',
      icon: Monitor,
      title: 'Auto (System OS)'
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      title: 'Dark Mode'
    },
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      title: 'Light Mode'
    }
  ];

  // Sizing definitions
  const sizeClasses = {
    xs: {
      container: 'p-0.5 gap-0.5 rounded-lg text-[10px]',
      btn: 'px-2 py-1 gap-1',
      icon: 'w-3 h-3'
    },
    sm: {
      container: 'p-1 gap-1 rounded-xl text-xs',
      btn: 'px-2.5 py-1.5 gap-1.5',
      icon: 'w-3.5 h-3.5'
    },
    md: {
      container: 'p-1.5 gap-1.5 rounded-2xl text-xs sm:text-sm',
      btn: 'px-3.5 py-2 gap-2',
      icon: 'w-4 h-4'
    }
  }[size];

  // Theme variant styling for container
  const getContainerStyle = () => {
    if (variant === 'light') {
      return 'bg-stone-100 border border-stone-200 text-stone-600';
    }
    if (variant === 'dark') {
      return 'bg-slate-900/90 border border-slate-800 text-slate-300 shadow-inner';
    }
    // 'auto' or 'header' adapts based on context/effectiveMode
    return effectiveMode === 'dark'
      ? 'bg-slate-900/80 border border-slate-800 text-slate-300 shadow-inner'
      : 'bg-stone-100/90 border border-stone-200 text-stone-600 shadow-xs';
  };

  const getActiveBtnStyle = (isActive: boolean) => {
    if (!isActive) {
      return 'text-slate-400 hover:text-slate-100 dark:hover:text-white hover:bg-white/5 dark:hover:bg-white/5';
    }

    if (variant === 'light' || (variant === 'auto' && effectiveMode === 'light')) {
      return 'bg-white text-stone-900 font-bold shadow-xs border border-stone-200/80';
    }

    return 'bg-slate-800 text-emerald-400 font-bold shadow-sm border border-slate-700/80';
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme mode selector"
      className={`inline-flex items-center select-none transition-colors duration-200 ${sizeClasses.container} ${getContainerStyle()} ${className}`}
    >
      {options.map((opt) => {
        const isActive = mode === opt.id;
        const Icon = opt.icon;

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={opt.title}
            onClick={() => setMode(opt.id)}
            className={`flex items-center justify-center rounded-lg font-medium transition-all duration-150 cursor-pointer ${
              sizeClasses.btn
            } ${getActiveBtnStyle(isActive)}`}
          >
            <Icon className={`${sizeClasses.icon} shrink-0 ${isActive ? (effectiveMode === 'dark' ? 'text-emerald-400' : 'text-stone-900') : 'opacity-70'}`} />
            {showLabels && <span className="whitespace-nowrap">{opt.label}</span>}
          </button>
        );
      })}
    </div>
  );
};
