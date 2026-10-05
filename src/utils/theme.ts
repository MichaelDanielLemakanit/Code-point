/**
 * Utility functions for dynamically binding and applying the CMS theme palette
 * to global CSS root variables.
 */

export type ThemeMode = 'system' | 'dark' | 'light';

export interface ThemeColors {
  primary: string;
  secondary: string;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = (hex || '').replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) {
    return { r: 16, g: 185, b: 129 }; // Default Nairobi Emerald
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Returns system OS color scheme preference
 */
export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolves effective mode ('dark' or 'light') considering 'system' auto-detection
 */
export function resolveEffectiveMode(mode: string = 'system'): 'dark' | 'light' {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode === 'light' ? 'light' : 'dark';
}

/**
 * Dynamically binds the active theme colors, modes, and canvas backgrounds across all CSS variables on :root
 */
export function applyGlobalTheme(
  primaryHex?: string, 
  secondaryHex?: string, 
  mode: string = 'system',
  canvasBgHex?: string
) {
  if (typeof document === 'undefined') return;

  const primary = primaryHex || '#10B981';
  const secondary = secondaryHex || '#06B6D4';

  const { r: r1, g: g1, b: b1 } = hexToRgb(primary);
  const { r: r2, g: g2, b: b2 } = hexToRgb(secondary);

  const root = document.documentElement;

  // Primary variables (canonical + standard aliases)
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--primary-color', primary);
  root.style.setProperty('--primary-rgb', `${r1}, ${g1}, ${b1}`);
  root.style.setProperty('--cpk-primary', primary);

  // Secondary & Accent variables
  root.style.setProperty('--secondary', secondary);
  root.style.setProperty('--secondary-color', secondary);
  root.style.setProperty('--secondary-rgb', `${r2}, ${g2}, ${b2}`);
  root.style.setProperty('--accent', secondary);
  root.style.setProperty('--accent-color', secondary);
  root.style.setProperty('--accent-rgb', `${r2}, ${g2}, ${b2}`);
  root.style.setProperty('--highlight-color', primary);
  root.style.setProperty('--cpk-secondary', secondary);

  // 1. Resolve effective mode (system, dark, or light)
  const normalizedMode: ThemeMode = (mode === 'light' || mode === 'dark') ? mode : 'system';
  const effective = resolveEffectiveMode(normalizedMode);
  const isDark = effective === 'dark';

  // 2. Toggle Tailwind's dark class on <html>
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 3. Set root CSS variable --color-canvas-bg to the active background hex
  // (or fall back to #020617 for Dark / #FFFFFF for Light when no custom hex is set)
  let activeBg = (canvasBgHex || '').trim();
  if (!activeBg) {
    activeBg = isDark ? '#020617' : '#FFFFFF';
  } else {
    // Validate brightness compatibility with current mode
    const rgb = hexToRgb(activeBg);
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    if (isDark && luminance > 0.6) {
      activeBg = '#020617';
    } else if (!isDark && luminance < 0.35) {
      activeBg = '#FFFFFF';
    }
  }

  // 4. Set root CSS variable --color-text-main to #F8FAFC for dark mode and #0F172A for light mode
  const activeText = isDark ? '#F8FAFC' : '#0F172A';

  root.style.setProperty('--color-canvas-bg', activeBg);
  root.style.setProperty('--color-text-main', activeText);
  root.style.setProperty('--bg-dark', isDark ? activeBg : '#020617');

  // Badge & Status Pills variables
  root.style.setProperty('--badge-bg', `rgba(${r1}, ${g1}, ${b1}, 0.12)`);
  root.style.setProperty('--badge-text', primary);
  root.style.setProperty('--badge-border', `rgba(${r1}, ${g1}, ${b1}, 0.28)`);

  // Secondary/Accent badge variables
  root.style.setProperty('--accent-badge-bg', `rgba(${r2}, ${g2}, ${b2}, 0.12)`);
  root.style.setProperty('--accent-badge-text', secondary);
  root.style.setProperty('--accent-badge-border', `rgba(${r2}, ${g2}, ${b2}, 0.28)`);

  // Card Borders & Glows
  root.style.setProperty('--card-highlight-border', `rgba(${r1}, ${g1}, ${b1}, 0.35)`);
  root.style.setProperty('--card-highlight-glow', `rgba(${r1}, ${g1}, ${b1}, 0.16)`);
  root.style.setProperty('--card-accent-border', `rgba(${r2}, ${g2}, ${b2}, 0.35)`);
  root.style.setProperty('--card-accent-glow', `rgba(${r2}, ${g2}, ${b2}, 0.16)`);
  root.style.setProperty('--focus-ring', `rgba(${r1}, ${g1}, ${b1}, 0.4)`);

  // Persist to localStorage under cpk_theme_mode and cpk_canvas_bg
  try {
    localStorage.setItem('cpk_theme_primary', primary);
    localStorage.setItem('cpk_theme_secondary', secondary);
    localStorage.setItem('cpk_theme_mode', normalizedMode);
    localStorage.setItem('cpk_canvas_bg', activeBg);
  } catch (_) {}
}
