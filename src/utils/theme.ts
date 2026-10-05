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

  // 2. Resolve active background hex: prioritize explicitly chosen canvas hex,
  // falling back to mode defaults (#F8FAFC for light, #020617 for dark)
  let activeBg = (canvasBgHex || '').trim();
  if (!activeBg) {
    activeBg = effective === 'light' ? '#F8FAFC' : '#020617';
  } else if (!activeBg.startsWith('#')) {
    activeBg = `#${activeBg}`;
  }

  // 3. Compute luminance to adapt text and card contrast dynamically
  const rgb = hexToRgb(activeBg);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const isBright = luminance > 0.5;

  // 4. Toggle root classes for Tailwind and custom CSS rules
  if (isBright) {
    root.classList.add('light-theme');
    root.classList.remove('dark');
  } else {
    root.classList.remove('light-theme');
    root.classList.add('dark');
  }

  // 5. Adaptive text & card contrast variables
  const activeText = isBright ? '#0F172A' : '#F8FAFC';
  const activeMuted = isBright ? '#475569' : '#94A3B8';
  const activeHeading = isBright ? '#0F172A' : '#FFFFFF';
  const activeSurface = isBright ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.75)';
  const activeSurfaceAlt = isBright ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.02)';
  const activeBorder = isBright ? 'rgba(15, 23, 42, 0.12)' : 'rgba(51, 65, 85, 0.55)';
  const activeNavBg = isBright ? 'rgba(255, 255, 255, 0.92)' : 'rgba(2, 6, 23, 0.85)';

  root.style.setProperty('--color-canvas-bg', activeBg);
  root.style.setProperty('--canvas-bg', activeBg);
  root.style.setProperty('--color-text-main', activeText);
  root.style.setProperty('--color-canvas-text', activeText);
  root.style.setProperty('--color-canvas-muted', activeMuted);
  root.style.setProperty('--color-canvas-heading', activeHeading);
  root.style.setProperty('--color-canvas-surface', activeSurface);
  root.style.setProperty('--color-canvas-surface-alt', activeSurfaceAlt);
  root.style.setProperty('--color-canvas-border', activeBorder);
  root.style.setProperty('--nav-bg', activeNavBg);
  root.style.setProperty('--bg-dark', activeBg);

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
