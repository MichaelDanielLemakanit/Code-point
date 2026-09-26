import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Laptop, 
  Code,
  GraduationCap,
  Cloud,
  Terminal,
  Users,
  MapPin,
  Moon,
  Sun
} from 'lucide-react';
import { SiteSettings } from '../types';

interface ClassSchedulesSectionProps {
  onApply?: () => void;
  siteSettings?: SiteSettings;
}

interface TrackFeature {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface TrackConfig {
  id: string;
  type: 'evening' | 'weekend';
  title: string;
  days: string;
  time: string;
  features: TrackFeature[];
}

const TRACKS_DATA: TrackConfig[] = [
  {
    id: 'evening-track',
    type: 'evening',
    title: 'Evening Track',
    days: 'Mon - Fri',
    time: '6:00 PM - 9:00 PM EAT',
    features: [
      { icon: Laptop, label: 'Live Classes' },
      { icon: Code, label: 'Code Labs' },
      { icon: GraduationCap, label: 'Expert Mentors' },
      { icon: Cloud, label: 'Recordings' }
    ]
  },
  {
    id: 'weekend-track',
    type: 'weekend',
    title: 'Weekend Track',
    days: 'Sat & Sun',
    time: '8:00 AM - 4:00 PM EAT',
    features: [
      { icon: Calendar, label: 'Flexible Schedule' },
      { icon: Laptop, label: 'Hands-on Projects' },
      { icon: Terminal, label: 'Hackathons' },
      { icon: Users, label: 'Peer Reviews' }
    ]
  }
];

export const ClassSchedulesSection: React.FC<ClassSchedulesSectionProps> = ({ onApply, siteSettings }) => {
  const sectionTitle = siteSettings?.schedules_section_title || 'Flexible Class Schedules';
  const sectionSubtitle = siteSettings?.schedules_section_subtitle || 'Choose a timing track that fits into your daily work or school routine.';

  return (
    <motion.section 
      id="schedules" 
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: '-40px 0px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-full overflow-x-hidden py-20 bg-slate-950 text-slate-100 border-t border-slate-800 relative scroll-mt-20"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {/* Calendar Icon above Title */}
          <div 
            style={{ 
              backgroundColor: 'rgba(var(--primary-rgb), 0.12)', 
              borderColor: 'rgba(var(--primary-rgb), 0.3)', 
              color: 'var(--primary-color)',
              boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.15)'
            }}
            className="w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto shadow-sm"
          >
            <Calendar className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {sectionTitle}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* Track Cards Grid: Two side-by-side dark glassmorphic cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
          {TRACKS_DATA.map((track, index) => {
            const isEvening = track.type === 'evening';
            const trackColor = isEvening ? 'var(--primary-color)' : 'var(--secondary-color)';
            const trackRgb = isEvening ? 'var(--primary-rgb)' : 'var(--secondary-rgb)';

            return (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  borderColor: `rgba(${trackRgb}, 0.25)`
                }}
                className="rounded-2xl border bg-slate-900/60 p-6 backdrop-blur-md shadow-xl hover:bg-slate-900/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Subtle ambient gradient glow in corner */}
                <div 
                  style={{
                    backgroundColor: `rgba(${trackRgb}, 0.12)`
                  }}
                  className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 transition-opacity duration-300 group-hover:opacity-100 opacity-60"
                />

                <div className="relative z-10 space-y-2">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Circular gradient glowing badge + Title & Live Online Badge */}
                    <div className="flex items-center sm:items-start gap-4">
                      <div 
                        style={{
                          background: isEvening 
                            ? 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.22), rgba(var(--secondary-rgb), 0.12))'
                            : 'linear-gradient(135deg, rgba(var(--secondary-rgb), 0.22), rgba(var(--primary-rgb), 0.12))',
                          borderColor: `rgba(${trackRgb}, 0.35)`,
                          color: trackColor,
                          boxShadow: `0 0 18px rgba(${trackRgb}, 0.25)`
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105"
                      >
                        {isEvening ? (
                          <Moon className="w-6 h-6" />
                        ) : (
                          <Sun className="w-6 h-6" />
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {track.title}
                        </h3>
                        {/* Status Badge right under the title */}
                        <div className="mt-1.5">
                          <span 
                            style={{
                              backgroundColor: `rgba(${trackRgb}, 0.15)`,
                              color: trackColor,
                              borderColor: `rgba(${trackRgb}, 0.28)`
                            }}
                            className="inline-block text-xs px-3 py-1 rounded-full font-medium border shadow-sm"
                          >
                            Live Online
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Timing Pills */}
                    <div className="flex flex-wrap sm:flex-col sm:items-end gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-medium shadow-sm">
                        <Calendar style={{ color: 'var(--primary-color)' }} className="w-3.5 h-3.5 shrink-0" />
                        <span>{track.days}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-mono font-medium shadow-sm">
                        <Clock style={{ color: 'var(--secondary-color)' }} className="w-3.5 h-3.5 shrink-0" />
                        <span>{track.time}</span>
                      </span>
                    </div>
                  </div>

                  {/* 2x2 Feature Icon Grid (Replacing long text lists) */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 py-5 border-y border-slate-800/80 my-4">
                    {track.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950/70 border border-slate-800/60 transition-all text-center group/item"
                      >
                        <div 
                          style={{
                            backgroundColor: `rgba(${trackRgb}, 0.12)`,
                            borderColor: `rgba(${trackRgb}, 0.25)`,
                            color: trackColor,
                            boxShadow: `0 0 12px rgba(${trackRgb}, 0.15)`
                          }}
                          className="p-3 rounded-xl mx-auto w-fit mb-2 border group-hover/item:scale-110 transition-all flex items-center justify-center"
                        >
                          <feat.icon className="w-5 h-5 shrink-0" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 text-center tracking-wide">
                          {feat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="relative z-10 space-y-4 pt-1">
                  {/* Left Footer Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-medium">
                      <MapPin style={{ color: 'var(--primary-color)' }} className="w-3.5 h-3.5 shrink-0" />
                      <span>Online</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 text-xs font-medium">
                      <GraduationCap style={{ color: 'var(--secondary-color)' }} className="w-3.5 h-3.5 shrink-0" />
                      <span>Campus Access: Optional</span>
                    </span>
                  </div>

                  {/* Primary CTA Button: Gradient button with active theme colors */}
                  <button
                    onClick={onApply}
                    style={{
                      background: isEvening
                        ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
                        : 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))',
                      boxShadow: `0 10px 25px -5px rgba(${trackRgb}, 0.3)`
                    }}
                    className="w-full py-3.5 px-5 rounded-xl text-slate-950 font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group/btn"
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Apply for {track.title}</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 group-hover/btn:translate-x-1 transition-transform shrink-0" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
};
