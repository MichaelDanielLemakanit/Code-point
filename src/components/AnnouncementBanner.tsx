import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  X, 
  Clock, 
  Flame, 
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import { SiteSettings } from '../types';

interface AnnouncementBannerProps {
  siteSettings?: SiteSettings;
  onApplyNow: () => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  siteSettings,
  onApplyNow
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if banner is disabled in settings
  const isEnabled = siteSettings?.announcement_banner_enabled !== 'false' && 
                    siteSettings?.announcement_banner_enabled !== false;

  const intakeDate = siteSettings?.next_intake_date || 'October 15, 2026';
  const deadline = siteSettings?.registration_deadline || 'October 10, 2026';
  const status = siteSettings?.intake_status || 'Enrollment Open';
  const announcementText = siteSettings?.announcement_banner_text || 'Early Bird 10% Discount Available for the Upcoming Cohort — Limited Campus & Online Seats!';

  // Calculate days remaining if parseable
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    try {
      const targetDate = new Date(deadline);
      if (!isNaN(targetDate.getTime())) {
        const now = new Date();
        const diffMs = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          setDaysRemaining(diffDays);
        } else {
          setDaysRemaining(0);
        }
      } else {
        setDaysRemaining(null);
      }
    } catch {
      setDaysRemaining(null);
    }
  }, [deadline]);

  if (!isEnabled || isDismissed) {
    return null;
  }

  const getStatusBadgeStyle = () => {
    const s = (status || '').toLowerCase();
    if (s.includes('closed')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
    if (s.includes('limit') || s.includes('few')) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
    return 'theme-badge font-bold';
  };

  return (
    <div 
      id="top-intake-announcement-banner"
      style={{ borderBottomColor: 'var(--card-highlight-border)' }}
      className="relative z-50 bg-slate-950 border-b text-slate-100 shadow-md transition-all animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Left / Center Info */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs">
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadgeStyle()}`}>
            <span className="relative flex h-2 w-2">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: 'var(--primary-color)' }}
              />
              <span 
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: 'var(--primary-color)' }}
              />
            </span>
            <span>{status}</span>
          </span>

          {/* Next Intake & Deadline */}
          <div className="flex items-center gap-2 text-slate-200 font-medium">
            <span className="flex items-center gap-1 text-white">
              <Calendar className="w-3.5 h-3.5 theme-text-primary" />
              <span>Next Cohort: <strong className="theme-text-primary font-bold">{intakeDate}</strong></span>
            </span>

            <span className="text-slate-600 hidden md:inline">•</span>

            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Deadline: <strong className="text-amber-300 font-semibold">{deadline}</strong></span>
            </span>
          </div>

          {/* Countdown indicator */}
          {daysRemaining !== null && daysRemaining > 0 && (
            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded theme-badge text-[10px] font-mono">
              <Flame className="w-3 h-3 theme-text-primary" />
              <span>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left to register</span>
            </span>
          )}

          {/* Highlight Message */}
          {announcementText && (
            <>
              <span className="text-slate-600 hidden xl:inline">•</span>
              <span className="text-slate-300 text-xs hidden xl:inline truncate max-w-md">
                {announcementText}
              </span>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onApplyNow}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-slate-950 text-xs font-bold shadow-sm transition-all hover:scale-105 hover:brightness-110 cursor-pointer"
          >
            <span>Apply for Intake</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss announcement"
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
