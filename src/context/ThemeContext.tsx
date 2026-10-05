import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';
import { 
  applyGlobalTheme, 
  hexToRgb, 
  resolveEffectiveMode, 
  ThemeMode 
} from '../utils/theme';

export interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  primaryRgb: string;
  secondaryRgb: string;
  palette: string;
  mode: ThemeMode;
  effectiveMode: 'dark' | 'light';
  canvasBg: string;
  setMode: (mode: ThemeMode) => void;
  setCanvasBg: (bg: string) => void;
  setTheme: (
    primary: string, 
    secondary: string, 
    palette?: string, 
    mode?: ThemeMode, 
    canvasBg?: string
  ) => void;
  saveThemeToCMS: (
    primary: string, 
    secondary: string, 
    palette?: string, 
    mode?: ThemeMode, 
    canvasBg?: string
  ) => Promise<boolean>;
  syncWithSettings: (settings?: SiteSettings) => void;
  // Dynamic CSS helper styles
  styles: {
    primaryBg: React.CSSProperties;
    secondaryBg: React.CSSProperties;
    primaryText: React.CSSProperties;
    secondaryText: React.CSSProperties;
    primaryBorder: React.CSSProperties;
    secondaryBorder: React.CSSProperties;
    gradientBg: React.CSSProperties;
    primaryBadge: React.CSSProperties;
    secondaryBadge: React.CSSProperties;
  };
}

const ThemeContext = createContext<ThemeState | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialSettings?: SiteSettings }> = ({ 
  children,
  initialSettings 
}) => {
  // Synchronous read from localStorage to avoid any render flash
  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cpk_theme_primary') || initialSettings?.primary_cta_color || '#10B981';
    }
    return initialSettings?.primary_cta_color || '#10B981';
  });

  const [secondaryColor, setSecondaryColor] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cpk_theme_secondary') || initialSettings?.secondary_cta_color || '#06B6D4';
    }
    return initialSettings?.secondary_cta_color || '#06B6D4';
  });

  const [palette, setPalette] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cpk_theme_palette') || initialSettings?.theme_palette || 'emerald';
    }
    return initialSettings?.theme_palette || 'emerald';
  });

  // Supports: 'system', 'dark', 'light'
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cpk_theme_mode');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
      const setting = initialSettings?.theme_mode;
      if (setting === 'light' || setting === 'dark' || setting === 'system') {
        return setting;
      }
    }
    return 'system';
  });

  // Active canvas background hex
  const [canvasBg, setCanvasBgState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cpk_canvas_bg') || initialSettings?.canvas_bg || '';
    }
    return initialSettings?.canvas_bg || '';
  });

  const [effectiveMode, setEffectiveMode] = useState<'dark' | 'light'>(() => {
    return resolveEffectiveMode(mode);
  });

  // Apply immediately upon component creation or dependency changes
  useEffect(() => {
    applyGlobalTheme(primaryColor, secondaryColor, mode, canvasBg);
    setEffectiveMode(resolveEffectiveMode(mode));
  }, [primaryColor, secondaryColor, mode, canvasBg]);

  // Window event listener for (prefers-color-scheme: dark) to dynamically adapt when mode === 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemSchemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (mode === 'system') {
        const nextEffective = e.matches ? 'dark' : 'light';
        setEffectiveMode(nextEffective);
        applyGlobalTheme(primaryColor, secondaryColor, 'system', canvasBg);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemSchemeChange as any);
      return () => mediaQuery.removeEventListener('change', handleSystemSchemeChange as any);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleSystemSchemeChange);
      return () => (mediaQuery as any).removeListener(handleSystemSchemeChange);
    }
  }, [mode, primaryColor, secondaryColor, canvasBg]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    applyGlobalTheme(primaryColor, secondaryColor, newMode, canvasBg);
    setEffectiveMode(resolveEffectiveMode(newMode));

    try {
      localStorage.setItem('cpk_theme_mode', newMode);
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('cpk_theme_updated', {
      detail: { primary: primaryColor, secondary: secondaryColor, palette, mode: newMode, canvasBg }
    }));
  }, [primaryColor, secondaryColor, palette, canvasBg]);

  const setCanvasBg = useCallback((newBg: string) => {
    setCanvasBgState(newBg);
    applyGlobalTheme(primaryColor, secondaryColor, mode, newBg);

    try {
      localStorage.setItem('cpk_canvas_bg', newBg);
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('cpk_theme_updated', {
      detail: { primary: primaryColor, secondary: secondaryColor, palette, mode, canvasBg: newBg }
    }));
  }, [primaryColor, secondaryColor, palette, mode]);

  const setTheme = useCallback((
    newPrimary: string, 
    newSecondary: string, 
    newPalette?: string, 
    newMode?: ThemeMode,
    newCanvasBg?: string
  ) => {
    setPrimaryColor(newPrimary);
    setSecondaryColor(newSecondary);
    if (newPalette) setPalette(newPalette);
    const m = newMode || mode;
    if (newMode) setModeState(newMode);
    const bg = newCanvasBg !== undefined ? newCanvasBg : canvasBg;
    if (newCanvasBg !== undefined) setCanvasBgState(newCanvasBg);

    // Apply to :root immediately
    applyGlobalTheme(newPrimary, newSecondary, m, bg);
    setEffectiveMode(resolveEffectiveMode(m));

    try {
      localStorage.setItem('cpk_theme_primary', newPrimary);
      localStorage.setItem('cpk_theme_secondary', newSecondary);
      if (newPalette) localStorage.setItem('cpk_theme_palette', newPalette);
      if (newMode) localStorage.setItem('cpk_theme_mode', newMode);
      if (newCanvasBg !== undefined) localStorage.setItem('cpk_canvas_bg', newCanvasBg);
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('cpk_theme_updated', {
      detail: { primary: newPrimary, secondary: newSecondary, palette: newPalette, mode: m, canvasBg: bg }
    }));
  }, [mode, canvasBg]);

  const saveThemeToCMS = useCallback(async (
    newPrimary: string, 
    newSecondary: string, 
    newPalette?: string, 
    newMode?: ThemeMode,
    newCanvasBg?: string
  ): Promise<boolean> => {
    const m = newMode || mode;
    const bg = newCanvasBg !== undefined ? newCanvasBg : canvasBg;
    setTheme(newPrimary, newSecondary, newPalette, m, bg);

    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_cta_color: newPrimary,
          secondary_cta_color: newSecondary,
          theme_palette: newPalette || palette,
          theme_mode: m,
          canvas_bg: bg
        })
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to save theme to CMS:', e);
      return false;
    }
  }, [setTheme, palette, mode, canvasBg]);

  const syncWithSettings = useCallback((settings?: SiteSettings) => {
    if (!settings) return;
    const p = settings.primary_cta_color;
    const s = settings.secondary_cta_color;
    const pal = settings.theme_palette;
    const m = settings.theme_mode as ThemeMode | undefined;
    const bg = settings.canvas_bg;

    if (p && p !== primaryColor) setPrimaryColor(p);
    if (s && s !== secondaryColor) setSecondaryColor(s);
    if (pal && pal !== palette) setPalette(pal);
    if (m && m !== mode) {
      setModeState(m);
      setEffectiveMode(resolveEffectiveMode(m));
    }
    if (bg && bg !== canvasBg) setCanvasBgState(bg);

    applyGlobalTheme(
      p || primaryColor, 
      s || secondaryColor, 
      m || mode, 
      bg !== undefined ? bg : canvasBg
    );
  }, [primaryColor, secondaryColor, palette, mode, canvasBg]);

  // Compute RGB strings
  const pRgb = hexToRgb(primaryColor);
  const sRgb = hexToRgb(secondaryColor);
  const primaryRgb = `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`;
  const secondaryRgb = `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`;

  const styles = {
    primaryBg: { backgroundColor: primaryColor },
    secondaryBg: { backgroundColor: secondaryColor },
    primaryText: { color: primaryColor },
    secondaryText: { color: secondaryColor },
    primaryBorder: { borderColor: primaryColor },
    secondaryBorder: { borderColor: secondaryColor },
    gradientBg: { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` },
    primaryBadge: {
      backgroundColor: `rgba(${primaryRgb}, 0.12)`,
      color: primaryColor,
      borderColor: `rgba(${primaryRgb}, 0.28)`
    },
    secondaryBadge: {
      backgroundColor: `rgba(${secondaryRgb}, 0.12)`,
      color: secondaryColor,
      borderColor: `rgba(${secondaryRgb}, 0.28)`
    }
  };

  return (
    <ThemeContext.Provider value={{
      primaryColor,
      secondaryColor,
      primaryRgb,
      secondaryRgb,
      palette,
      mode,
      effectiveMode,
      canvasBg,
      setMode,
      setCanvasBg,
      setTheme,
      saveThemeToCMS,
      syncWithSettings,
      styles
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeState => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback if used outside provider
    const pRgb = hexToRgb('#10B981');
    const sRgb = hexToRgb('#06B6D4');
    return {
      primaryColor: '#10B981',
      secondaryColor: '#06B6D4',
      primaryRgb: `${pRgb.r}, ${pRgb.g}, ${pRgb.b}`,
      secondaryRgb: `${sRgb.r}, ${sRgb.g}, ${sRgb.b}`,
      palette: 'emerald',
      mode: 'system',
      effectiveMode: 'dark',
      canvasBg: '#020617',
      setMode: () => {},
      setCanvasBg: () => {},
      setTheme: () => {},
      saveThemeToCMS: async () => false,
      syncWithSettings: () => {},
      styles: {
        primaryBg: { backgroundColor: '#10B981' },
        secondaryBg: { backgroundColor: '#06B6D4' },
        primaryText: { color: '#10B981' },
        secondaryText: { color: '#06B6D4' },
        primaryBorder: { borderColor: '#10B981' },
        secondaryBorder: { borderColor: '#06B6D4' },
        gradientBg: { background: 'linear-gradient(135deg, #10B981, #06B6D4)' },
        primaryBadge: { backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.28)' },
        secondaryBadge: { backgroundColor: 'rgba(6, 182, 212, 0.12)', color: '#06B6D4', borderColor: 'rgba(6, 182, 212, 0.28)' }
      }
    };
  }
  return context;
};

