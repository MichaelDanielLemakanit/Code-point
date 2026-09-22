import React, { useState } from 'react';
import { 
  Palette, 
  Check, 
  Sparkles, 
  Sun, 
  Moon, 
  Laptop, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface ThemeCustomizerProps {
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (settings: SiteSettings) => Promise<boolean>;
  onSettingsUpdated?: () => void;
  showToast: (msg: string) => void;
}

interface PalettePreset {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  bgHex: string;
  badgeBg: string;
  badgeText: string;
}

const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: 'emerald',
    name: 'Nairobi Emerald & Slate',
    description: 'Code Point Kenya classic: high-contrast emerald green with cyan accents and deep slate background',
    primary: '#10B981',
    secondary: '#06B6D4',
    bgHex: '#020617',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeText: '#34D399'
  },
  {
    id: 'navy',
    name: 'Tech Navy & Cobalt',
    description: 'Corporate tech enterprise: electric cobalt blue with soft cyan highlights and midnight navy background',
    primary: '#3B82F6',
    secondary: '#60A5FA',
    bgHex: '#0B1120',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    badgeText: '#93C5FD'
  },
  {
    id: 'cyber',
    name: 'Applied AI Cyan & Violet',
    description: 'Modern AI lab atmosphere: luminous cyber cyan with deep violet accents and pitch obsidian canvas',
    primary: '#06B6D4',
    secondary: '#8B5CF6',
    bgHex: '#030712',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    badgeText: '#67E8F9'
  },
  {
    id: 'indigo',
    name: 'Global Silicon Indigo',
    description: 'Silicon Valley fintech: deep royal indigo paired with vivid rose accents and slate canvas',
    primary: '#6366F1',
    secondary: '#EC4899',
    bgHex: '#0F172A',
    badgeBg: 'rgba(99, 102, 241, 0.15)',
    badgeText: '#A5B4FC'
  },
  {
    id: 'amber',
    name: 'Savannah Gold & Obsidian',
    description: 'Kenyan Savannah warmth: vibrant amber gold paired with burnt orange and warm obsidian tones',
    primary: '#F59E0B',
    secondary: '#EF4444',
    bgHex: '#0C0A09',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeText: '#FCD34D'
  },
  {
    id: 'crimson',
    name: 'High-Impact Crimson',
    description: 'Dynamic accelerator energy: bold crimson scarlet with bright tangerine accents and dark carbon canvas',
    primary: '#EF4444',
    secondary: '#F97316',
    bgHex: '#18080A',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    badgeText: '#FCA5A5'
  }
];

const QUICK_COLORS = [
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Electric Cobalt', hex: '#3B82F6' },
  { name: 'Cyber Cyan', hex: '#06B6D4' },
  { name: 'Royal Indigo', hex: '#6366F1' },
  { name: 'Savannah Gold', hex: '#F59E0B' },
  { name: 'Rose', hex: '#EC4899' },
  { name: 'Scarlet', hex: '#EF4444' }
];

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  siteSettings,
  onUpdateSiteSettings,
  onSettingsUpdated,
  showToast
}) => {
  const [selectedPalette, setSelectedPalette] = useState<string>(
    siteSettings?.theme_palette || 'emerald'
  );
  const [selectedMode, setSelectedMode] = useState<string>(
    siteSettings?.theme_mode || 'dark'
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    siteSettings?.primary_cta_color || '#10B981'
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    siteSettings?.secondary_cta_color || '#06B6D4'
  );

  const [isSaving, setIsSaving] = useState(false);

  // Apply a preset palette
  const handleSelectPreset = (preset: PalettePreset) => {
    setSelectedPalette(preset.id);
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);

    // Apply immediate preview to document root
    document.documentElement.style.setProperty('--cpk-primary', preset.primary);
    document.documentElement.style.setProperty('--cpk-secondary', preset.secondary);
  };

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    document.documentElement.style.setProperty('--cpk-primary', color);
  };

  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
    document.documentElement.style.setProperty('--cpk-secondary', color);
  };

  const handleSaveTheme = async () => {
    setIsSaving(true);
    try {
      const updatedSettings: SiteSettings = {
        ...(siteSettings || {} as SiteSettings),
        theme_palette: selectedPalette,
        theme_mode: selectedMode,
        primary_cta_color: primaryColor,
        secondary_cta_color: secondaryColor
      };

      let success = false;
      if (typeof onUpdateSiteSettings === 'function') {
        success = await onUpdateSiteSettings(updatedSettings);
      } else {
        const res = await fetch('/api/site-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSettings)
        });
        success = res.ok;
      }

      if (typeof onSettingsUpdated === 'function') {
        onSettingsUpdated();
      }

      if (success) {
        showToast('Theme saved and applied across live public website!');
      } else {
        alert('Failed to save theme settings');
      }
    } catch (e) {
      console.error('Failed to save theme:', e);
      alert('Network error saving theme');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    handleSelectPreset(PALETTE_PRESETS[0]);
    setSelectedMode('dark');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Palette className="w-7 h-7 text-amber-500" />
            <span>Theme & Appearance Customizer</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Customize visual themes, color palettes, and primary CTA accents applied to the live Code Point Kenya public school website
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTheme}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-stone-900/20 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Save & Apply Theme</span>
          </button>
        </div>
      </div>

      {/* Grid: Settings Left, Live Preview Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Theme Controls (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Section 1: Preset Color Palettes */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Curated School Color Palettes</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Select a tailored branding palette for the website
                </p>
              </div>
              <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                6 Presets
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PALETTE_PRESETS.map((p) => {
                const isSelected = selectedPalette === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-2.5 relative ${
                      isSelected
                        ? 'border-stone-900 bg-stone-50/80 ring-2 ring-stone-900/10 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">{p.name}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-7 h-7 rounded-lg shadow-inner border border-black/10 flex items-center justify-center"
                        style={{ backgroundColor: p.primary }}
                      />
                      <div
                        className="w-7 h-7 rounded-lg shadow-inner border border-black/10 flex items-center justify-center"
                        style={{ backgroundColor: p.secondary }}
                      />
                      <div
                        className="w-7 h-7 rounded-lg shadow-inner border border-white/20 flex items-center justify-center text-[10px] font-mono text-stone-400"
                        style={{ backgroundColor: p.bgHex }}
                      >
                        Bg
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Custom CTA & Accent Color Picker */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Primary CTA & Accent Color Customizer</span>
              </h3>
              <p className="text-xs text-stone-500">
                Fine-tune the exact hex color for buttons, badges, highlights, and links
              </p>
            </div>

            {/* Quick Swatches */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Quick Swatches
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => handlePrimaryColorChange(c.hex)}
                    className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary & Secondary Color Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Primary Button & Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-stone-300 p-1 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-900 uppercase focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Secondary Highlight Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => handleSecondaryColorChange(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-stone-300 p-1 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => handleSecondaryColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-900 uppercase focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Visual Canvas Atmosphere */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                <span>Theme Canvas Atmosphere</span>
              </h3>
              <p className="text-xs text-stone-500">
                Choose the background contrast ratio and ambient depth
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'dark', label: 'Dark Studio', desc: 'Deep Slate #020617 (Recommended)' },
                { id: 'slate', label: 'Navy Slate', desc: 'Midnight Blue #0B1120' },
                { id: 'oled', label: 'Onyx OLED', desc: 'Pure Obsidian #030712' },
                { id: 'light', label: 'Studio Light', desc: 'Clean White & Stone' }
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                    selectedMode === m.id
                      ? 'border-stone-900 bg-stone-100 font-bold text-stone-900 ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5 truncate">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Live Interactive Mock Preview (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-xl border border-stone-800 space-y-5 sticky top-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                  Live Real-Time Theme Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Live Rendering
              </span>
            </div>

            {/* Mock Mini Website Header */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-slate-950 font-mono shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    CP
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-none">Code Point Kenya</div>
                    <div className="text-[9px] text-slate-400 font-mono">Nairobi Tech Institute</div>
                  </div>
                </div>

                <div
                  className="px-2 py-0.5 rounded text-[10px] font-bold"
                  style={{ 
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                    borderColor: `${primaryColor}40`,
                    borderWidth: 1
                  }}
                >
                  Ngong Rd Lab
                </div>
              </div>
            </div>

            {/* Mock Mini Hero Section */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3.5">
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ 
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor
                }}
              >
                <Zap className="w-3 h-3" />
                Online-First + Physical Campus Lab
              </span>

              <h4 className="text-base font-bold text-white tracking-tight leading-snug">
                Launch Your Tech Career in{' '}
                <span style={{ color: primaryColor }}>Software, Data, & AI</span>
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                Kenya’s premier career-accelerator coding school. Live evening online cohorts + 24/7 Ngong Road lab access.
              </p>

              {/* Action Buttons Mock */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  style={{ backgroundColor: primaryColor }}
                  className="px-4 py-2 rounded-lg text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium"
                >
                  Explore Programs
                </button>
              </div>
            </div>

            {/* Mock Mini Course Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${secondaryColor}25`, color: secondaryColor }}
                  >
                    Artificial Intelligence
                  </span>
                  <div className="text-xs font-bold text-white mt-1">Applied AI Engineering</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white font-mono">KES 95,000</div>
                  <div className="text-[10px] font-mono" style={{ color: primaryColor }}>
                    KES 20,500/mo
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveTheme}
                disabled={isSaving}
                style={{ backgroundColor: primaryColor }}
                className="w-full py-3 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:brightness-110 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Apply This Theme to Live Site</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
