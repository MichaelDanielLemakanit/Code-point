import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Moon, Sun, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../utils/theme';

interface ThemeModeToggleProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  showLabels?: boolean;
  variant?: 'auto' | 'header' | 'dark' | 'light';
  layout?: 'dropdown' | 'segmented';
}

export const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  className = '',
  size = 'sm',
  showLabels = true,
  variant = 'auto',
  layout = 'dropdown'
}) => {
  const { mode, effectiveMode, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleModeClick = (newMode: ThemeMode) => {
    // Direct root DOM update on click
    const root = document.documentElement;
    if (newMode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light-theme');
      root.style.setProperty('--color-canvas-bg', '#FFFFFF');
      root.style.setProperty('--canvas-bg', '#FFFFFF');
      root.style.setProperty('--color-text-main', '#0F172A');
    } else if (newMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light-theme');
      root.style.setProperty('--color-canvas-bg', '#020617');
      root.style.setProperty('--canvas-bg', '#020617');
      root.style.setProperty('--color-text-main', '#F8FAFC');
    } else {
      const isSystemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        root.classList.add('dark');
        root.classList.remove('light-theme');
        root.style.setProperty('--color-canvas-bg', '#020617');
        root.style.setProperty('--canvas-bg', '#020617');
        root.style.setProperty('--color-text-main', '#F8FAFC');
      } else {
        root.classList.remove('dark');
        root.classList.add('light-theme');
        root.style.setProperty('--color-canvas-bg', '#FFFFFF');
        root.style.setProperty('--canvas-bg', '#FFFFFF');
        root.style.setProperty('--color-text-main', '#0F172A');
      }
    }

    setMode(newMode);
  };

  const activeOption = options.find((opt) => opt.id === mode) || options[0];
  const ActiveIcon = activeOption.icon;

  // Dropdown Mode (Default)
  if (layout === 'dropdown') {
    const sizeButtonClasses = {
      xs: 'px-2 py-1 gap-1 text-[11px]',
      sm: 'px-2.5 py-1.5 gap-1.5 text-xs',
      md: 'px-3 py-2 gap-2 text-sm'
    }[size];

    const iconSizes = {
      xs: 'w-3 h-3',
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4'
    }[size];

    return (
      <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
        {/* Dropdown Trigger Button */}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center rounded-xl font-medium cursor-pointer transition-all duration-150 select-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 ${sizeButtonClasses}`}
          title={`Theme: ${activeOption.label}. Click to select mode.`}
        >
          <ActiveIcon className={`${iconSizes} theme-text-primary shrink-0`} />
          {showLabels && (
            <span className="whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
              {activeOption.label}
            </span>
          )}
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu Panel */}
        {isOpen && (
          <div
            role="listbox"
            aria-label="Theme mode selection"
            className="absolute right-0 top-full mt-2 w-44 z-50 py-1 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl shadow-black/10 dark:shadow-black/40 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
              Theme Mode
            </div>
            <div className="p-1 space-y-0.5">
              {options.map((opt) => {
                const isSelected = mode === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      handleModeClick(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'theme-text-primary' : 'text-slate-400'}`} />
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 theme-text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Segmented layout fallback
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

  const getContainerStyle = () => {
    if (variant === 'light') {
      return 'bg-stone-100 border border-stone-200 text-stone-600';
    }
    if (variant === 'dark') {
      return 'bg-slate-900/90 border border-slate-800 text-slate-300 shadow-inner';
    }
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
            onClick={() => handleModeClick(opt.id)}
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
