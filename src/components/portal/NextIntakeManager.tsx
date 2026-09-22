import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  Tag, 
  Megaphone, 
  Database, 
  Check, 
  Flame, 
  Users, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SiteSettings, IntakeConfig } from '../../types';

interface NextIntakeManagerProps {
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (newSettings: SiteSettings) => Promise<boolean>;
  onSettingsUpdated?: () => void;
  showToast: (msg: string) => void;
}

export const NextIntakeManager: React.FC<NextIntakeManagerProps> = ({
  siteSettings,
  onUpdateSiteSettings,
  onSettingsUpdated,
  showToast
}) => {
  const [formData, setFormData] = useState<IntakeConfig>({
    next_intake_date: siteSettings?.next_intake_date || 'October 15, 2026',
    registration_deadline: siteSettings?.registration_deadline || 'October 10, 2026',
    intake_status: siteSettings?.intake_status || 'Enrollment Open',
    announcement_banner_text: siteSettings?.announcement_banner_text || 'Early Bird 10% Discount Available for the Upcoming Cohort — Limited Campus & Online Seats!',
    announcement_banner_enabled: siteSettings?.announcement_banner_enabled !== 'false' && siteSettings?.announcement_banner_enabled !== false
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dbProvider, setDbProvider] = useState<string>('Detecting database...');

  useEffect(() => {
    if (siteSettings) {
      setFormData({
        next_intake_date: siteSettings.next_intake_date || 'October 15, 2026',
        registration_deadline: siteSettings.registration_deadline || 'October 10, 2026',
        intake_status: siteSettings.intake_status || 'Enrollment Open',
        announcement_banner_text: siteSettings.announcement_banner_text || 'Early Bird 10% Discount Available for the Upcoming Cohort — Limited Campus & Online Seats!',
        announcement_banner_enabled: siteSettings.announcement_banner_enabled !== 'false' && siteSettings.announcement_banner_enabled !== false
      });
    }
  }, [siteSettings]);

  // Fetch db-status diagnostic to confirm Neon / PostgreSQL connectivity
  useEffect(() => {
    fetch('/api/admin/db-status')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          if (d.type === 'postgres') {
            setDbProvider('Neon PostgreSQL (Active & Connected)');
          } else {
            setDbProvider(d.provider || 'SQLite / Serverless Local DB');
          }
        }
      })
      .catch(() => setDbProvider('Database Online'));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      // 1. Direct API call to update intake settings in backend
      const res = await fetch('/api/intake-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          next_intake_date: formData.next_intake_date.trim(),
          registration_deadline: formData.registration_deadline.trim(),
          intake_status: formData.intake_status.trim(),
          announcement_banner_text: formData.announcement_banner_text.trim(),
          announcement_banner_enabled: formData.announcement_banner_enabled ? 'true' : 'false'
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save intake configuration');
      }

      // 2. Also propagate through parent onUpdateSiteSettings if provided
      if (onUpdateSiteSettings && siteSettings) {
        await onUpdateSiteSettings({
          ...siteSettings,
          next_intake_date: formData.next_intake_date.trim(),
          registration_deadline: formData.registration_deadline.trim(),
          intake_status: formData.intake_status.trim(),
          announcement_banner_text: formData.announcement_banner_text.trim(),
          announcement_banner_enabled: formData.announcement_banner_enabled ? 'true' : 'false'
        });
      }

      if (onSettingsUpdated) {
        onSettingsUpdated();
      }

      setSaveSuccess(true);
      showToast('Upcoming Intake & Cohort configuration saved live to database!');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving intake settings:', err);
      setErrorMessage(err.message || 'Error updating settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { 
      label: 'Enrollment Open', 
      desc: 'Active admissions, accepting applicants for physical & online cohorts',
      colorClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    },
    { 
      label: 'Limited Seats', 
      desc: 'High demand, few desks remaining at Ngong Road Campus',
      colorClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    },
    { 
      label: 'Registration Closed', 
      desc: 'Cohort fully subscribed or intake window ended',
      colorClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    }
  ];

  const quickBannerPresets = [
    'Early Bird 10% Discount Available for the Upcoming Cohort — Limited Campus & Online Seats!',
    'Limited Desks Remaining at Ngong Road Campus Lab — Apply Before Registration Closes!',
    'Next Cohort Kickoff Approaching! Flexible 5-Month Installment Plans from KES 16,500/mo.',
    'Scholarship Applications Open for Female Software Engineers & Tech Career Changers!'
  ];

  return (
    <div id="next-intake-manager-panel" className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>Next Intake & Cohort Control</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Upcoming Intake & Next Cohort Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Configure the active cohort start date, registration deadline, admissions status badge, and public announcement banner. Changes sync live to the database and update the public landing page immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Storage: <strong className="text-emerald-400">{dbProvider}</strong></span>
            </div>

            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Live...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved Live!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {saveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Success: Intake dates and public announcement settings updated live across all landing page sections!</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Main Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Intake Dates & Status */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cohort Dates & Admissions Status</h3>
              <p className="text-xs text-slate-400">Specify when the upcoming training cohort kicks off and the deadline for prospective applicants.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Field 1: Next Intake Date */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Next Intake Date <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.next_intake_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, next_intake_date: e.target.value }))}
                  placeholder="e.g. October 15, 2026"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Displayed prominently in the Hero section, course cards, and enrollment section.
              </p>

              {/* Quick Date Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">Quick Set:</span>
                {['October 15, 2026', 'November 03, 2026', 'January 12, 2027', 'February 02, 2027'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, next_intake_date: preset }))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer border border-slate-700"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Registration Deadline */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Registration Deadline <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_deadline: e.target.value }))}
                  placeholder="e.g. October 10, 2026"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Signals admissions urgency to encourage prompt student applications.
              </p>

              {/* Quick Deadline Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-mono text-slate-400">Quick Set:</span>
                {['October 10, 2026', 'October 28, 2026', 'January 05, 2027', 'Rolling Admissions'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, registration_deadline: preset }))}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors cursor-pointer border border-slate-700"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Field 3: Intake Status Badge */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-200">
              Intake Status Badge <span className="text-emerald-400">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {statusOptions.map((opt) => {
                const isSelected = formData.intake_status === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, intake_status: opt.label }))}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-950 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${opt.colorClass}`}>
                        {opt.label}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2.5 leading-snug">
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom status input */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-slate-400">Or type custom status:</span>
              <input
                type="text"
                value={formData.intake_status}
                onChange={(e) => setFormData(prev => ({ ...prev, intake_status: e.target.value }))}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white max-w-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Top-Bar Announcement Banner */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Top-Bar Announcement Banner</h3>
                <p className="text-xs text-slate-400">Control the prominent highlight banner rendered at the top of the entire public website.</p>
              </div>
            </div>

            {/* Toggle Active Switch */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <span className="text-xs font-semibold text-slate-300">
                {formData.announcement_banner_enabled ? 'Banner Active' : 'Banner Disabled'}
              </span>
              <div 
                onClick={() => setFormData(prev => ({ ...prev, announcement_banner_enabled: !prev.announcement_banner_enabled }))}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  formData.announcement_banner_enabled ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <div 
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    formData.announcement_banner_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} 
                />
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Announcement Highlight Message (Optional)
              </label>
              <div className="relative">
                <Megaphone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={2}
                  value={formData.announcement_banner_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, announcement_banner_text: e.target.value }))}
                  placeholder="e.g. Early Bird 10% Discount Available for the Upcoming Cohort — Limited Campus & Online Seats!"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-slate-400">Suggested Announcement Copy:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickBannerPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, announcement_banner_text: preset, announcement_banner_enabled: true }))}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 text-left text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Live Public Display Preview */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Live Public Display Preview</h3>
            </div>
            <span className="text-[11px] text-slate-400">Real-time preview of public UI elements</span>
          </div>

          {/* Top Banner Mock Preview */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Top Announcement Banner:</span>
            {formData.announcement_banner_enabled ? (
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 text-xs text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {formData.intake_status}
                  </span>
                  <span className="font-semibold text-white">
                    Next Intake: <strong className="text-emerald-300">{formData.next_intake_date}</strong>
                  </span>
                  <span className="hidden md:inline text-slate-500">•</span>
                  <span className="text-slate-300">
                    Registration Deadline: <strong className="text-amber-300">{formData.registration_deadline}</strong>
                  </span>
                  {formData.announcement_banner_text && (
                    <>
                      <span className="hidden lg:inline text-slate-500">•</span>
                      <span className="text-emerald-200/90 hidden sm:inline">{formData.announcement_banner_text}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-bold shadow-sm">
                    Apply Now
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 italic text-center">
                Announcement banner is currently disabled. Toggle "Banner Active" above to display it on the public site.
              </div>
            )}
          </div>

          {/* Hero Badge Mock Preview */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Hero Section Intake Badge:</span>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Next Cohort: {formData.next_intake_date}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {formData.intake_status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Registration Deadline: {formData.registration_deadline} • Ngong Road Campus & Online
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] text-emerald-400 font-mono">
                {formData.announcement_banner_text || 'Early Bird Tuition Options Available'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            All updates are saved persistently to your database and take effect across the entire website instantly.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Live...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes Live</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
