import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteSettings } from '../types';
import { applyGlobalTheme, hexToRgb } from '../utils/theme';

export interface ThemeState {
  primaryColor: string;
  secondaryColor: string;
  primaryRgb: string;
  secondaryRgb: string;
  palette: string;
  mode: string;
  setTheme: (primary: string, secondary: string, palette?: string, mode?: string) => void;
  saveThemeToCMS: (primary: string, secondary: string, palette?: string, mode?: string) => Promise<boolean>;
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

  const [mode, setMode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cpk_theme_mode') || initialSettings?.theme_mode || 'dark';
    }
    return initialSettings?.theme_mode || 'dark';
  });

  // Apply immediately upon component creation
  useEffect(() => {
    applyGlobalTheme(primaryColor, secondaryColor, mode);
  }, [primaryColor, secondaryColor, mode]);

  const setTheme = useCallback((newPrimary: string, newSecondary: string, newPalette?: string, newMode?: string) => {
    setPrimaryColor(newPrimary);
    setSecondaryColor(newSecondary);
    if (newPalette) setPalette(newPalette);
    if (newMode) setMode(newMode);

    // Apply to :root immediately
    applyGlobalTheme(newPrimary, newSecondary, newMode || mode);

    try {
      localStorage.setItem('cpk_theme_primary', newPrimary);
      localStorage.setItem('cpk_theme_secondary', newSecondary);
      if (newPalette) localStorage.setItem('cpk_theme_palette', newPalette);
      if (newMode) localStorage.setItem('cpk_theme_mode', newMode);
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('cpk_theme_updated', {
      detail: { primary: newPrimary, secondary: newSecondary, palette: newPalette, mode: newMode }
    }));
  }, [mode]);

  const saveThemeToCMS = useCallback(async (
    newPrimary: string, 
    newSecondary: string, 
    newPalette?: string, 
    newMode?: string
  ): Promise<boolean> => {
    setTheme(newPrimary, newSecondary, newPalette, newMode);

    try {
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_cta_color: newPrimary,
          secondary_cta_color: newSecondary,
          theme_palette: newPalette || palette,
          theme_mode: newMode || mode
        })
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to save theme to CMS:', e);
      return false;
    }
  }, [setTheme, palette, mode]);

  const syncWithSettings = useCallback((settings?: SiteSettings) => {
    if (!settings) return;
    const p = settings.primary_cta_color;
    const s = settings.secondary_cta_color;
    const pal = settings.theme_palette;
    const m = settings.theme_mode;

    if (p && p !== primaryColor) setPrimaryColor(p);
    if (s && s !== secondaryColor) setSecondaryColor(s);
    if (pal && pal !== palette) setPalette(pal);
    if (m && m !== mode) setMode(m);

    if (p || s) {
      applyGlobalTheme(p || primaryColor, s || secondaryColor, m || mode);
    }
  }, [primaryColor, secondaryColor, palette, mode]);

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
      mode: 'dark',
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
