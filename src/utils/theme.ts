/**
 * Utility functions for dynamically binding and applying the CMS theme palette
 * to global CSS root variables.
 */

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
 * Dynamically binds the active theme colors across all CSS variables on :root
 */
export function applyGlobalTheme(primaryHex?: string, secondaryHex?: string, mode?: string) {
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

  // Background atmosphere variable
  const bgDark = mode === 'slate' ? '#0B1120' : mode === 'oled' ? '#030712' : '#020617';
  root.style.setProperty('--bg-dark', bgDark);

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

  // Persist to localStorage for zero-latency instant rendering on refresh
  try {
    localStorage.setItem('cpk_theme_primary', primary);
    localStorage.setItem('cpk_theme_secondary', secondary);
    if (mode) localStorage.setItem('cpk_theme_mode', mode);
  } catch (_) {}
}
