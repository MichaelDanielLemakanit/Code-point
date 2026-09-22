import React from 'react';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Laptop, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { SiteSettings, ClassSchedulesSectionData, ScheduleTrackItem } from '../types';
import { renderCmsIcon } from '../utils/cmsIcons';

interface ClassSchedulesSectionProps {
  onApply?: () => void;
  siteSettings?: SiteSettings;
}

const DEFAULT_SCHEDULES_DATA: ClassSchedulesSectionData = {
  badge_text: 'Structured Timetable Tracks',
  title: 'Flexible Class Schedules',
  subtitle: 'Choose a timing track that fits into your daily work or school routine.',
  items: [
    {
      id: 'evening-track',
      title: 'Evening Track',
      schedule: 'Monday – Thursday',
      time_badge: '2:00 PM – 4:00 PM EAT',
      accent_badge: 'Weekday Momentum',
      recommended_for: 'Working Professionals & Students',
      description: 'Ideal for full-time employees and university students who want to study after hours.',
      icon_name: 'Moon',
      highlights: [
        'Live online lecture streaming & code walkthroughs',
        'Daily mentor Q&A and active code review channels',
        'Full recordings stored in student portal',
        'Optional Ngong Road campus lab access'
      ],
      campus_note: 'Ngong Rd Lab Included',
      online_note: 'Live Online Sync',
      display_order: 1,
      is_visible: true
    },
    {
      id: 'weekend-track',
      title: 'Weekend Track',
      schedule: 'Saturdays Only',
      time_badge: '9:00 AM – 4:00 PM EAT',
      accent_badge: 'High-Impact Immersion',
      recommended_for: 'Busy Weekday Professionals',
      description: 'Intensive weekend coding lab designed for busy professionals during weekdays.',
      icon_name: 'Sun',
      highlights: [
        'Full-day Saturday immersive coding labs & sprint reviews',
        '1-on-1 architecture clinics at our Ngong Road campus',
        'Weekly asynchronous assignments with midweek feedback',
        'Collaborative peer hackathons & team project building'
      ],
      campus_note: 'Ngong Rd Lab Included',
      online_note: 'Live Online Sync',
      display_order: 2,
      is_visible: true
    }
  ]
};

export const ClassSchedulesSection: React.FC<ClassSchedulesSectionProps> = ({ onApply, siteSettings }) => {
  let sectionData: ClassSchedulesSectionData = DEFAULT_SCHEDULES_DATA;

  if (siteSettings?.class_schedules_section_json) {
    try {
      const parsed = JSON.parse(siteSettings.class_schedules_section_json);
      if (parsed && Array.isArray(parsed.items)) {
        sectionData = {
          badge_text: parsed.badge_text || DEFAULT_SCHEDULES_DATA.badge_text,
          title: parsed.title || DEFAULT_SCHEDULES_DATA.title,
          subtitle: parsed.subtitle || DEFAULT_SCHEDULES_DATA.subtitle,
          items: parsed.items
        };
      }
    } catch (e) {
      console.warn('Failed to parse class_schedules_section_json:', e);
    }
  }

  const visibleItems = (sectionData.items || [])
    .filter(item => item.is_visible !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return (
    <section id="schedules" className="py-20 bg-slate-950 text-slate-100 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{sectionData.badge_text}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {sectionData.title}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {sectionData.subtitle}
          </p>
        </div>

        {/* Track Cards Grid */}
        <div className={`grid grid-cols-1 ${visibleItems.length > 1 ? 'md:grid-cols-2' : 'max-w-2xl'} gap-8 max-w-5xl mx-auto mt-14`}>
          {visibleItems.map((track) => (
            <div
              key={track.id}
              className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850/90 transition-all duration-200 flex flex-col justify-between space-y-6 relative overflow-hidden group shadow-lg"
            >
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors" />

              <div className="space-y-5">
                {/* Header row: Icon & Track Type Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 transition-all">
                    {renderCmsIcon(track.icon_name, 'w-6 h-6 text-emerald-400')}
                  </div>
                  {track.accent_badge && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      {track.accent_badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                    {track.title}
                  </h3>

                  {/* Schedule & Time Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {track.schedule && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium text-xs">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        {track.schedule}
                      </span>
                    )}
                    {track.time_badge && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-semibold text-xs">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        {track.time_badge}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mt-4">
                    {track.description}
                  </p>
                </div>

                {/* Track Feature Highlights */}
                {track.highlights && track.highlights.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <div className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
                      Track Includes:
                    </div>
                    {track.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button & Campus Access Note */}
              <div className="pt-6 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {track.campus_note || 'Ngong Rd Lab Included'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                    {track.online_note || 'Live Online Sync'}
                  </span>
                </div>

                {onApply && (
                  <button
                    onClick={onApply}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group/btn cursor-pointer"
                  >
                    <span>Apply for {track.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 max-w-2xl mx-auto">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              Hybrid Flexibility:
            </span>
            <span>All students can switch timing tracks or review session recordings on demand via the student portal.</span>
          </div>
        </div>

      </div>
    </section>
  );
};
