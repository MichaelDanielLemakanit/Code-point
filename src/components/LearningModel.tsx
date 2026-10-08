import React from 'react';
import { 
  Laptop, 
  Globe, 
  Radio, 
  PlayCircle, 
  Smartphone, 
  Users, 
  Star, 
  ArrowRight
} from 'lucide-react';
import { SiteSettings } from '../types';

interface LearningModelProps {
  siteSettings?: SiteSettings;
  onApply?: () => void;
  onExplorePrograms?: () => void;
  onVisitCampus?: () => void;
}

export const LearningModel: React.FC<LearningModelProps> = ({ 
  siteSettings,
  onApply,
  onExplorePrograms,
  onVisitCampus
}) => {
  const handleJoinOnline = () => {
    if (onApply) {
      onApply();
    } else {
      const el = document.getElementById('programs');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="campus" 
      className="w-full max-w-full overflow-x-hidden py-20 text-slate-900 dark:text-slate-100 border-y border-slate-200/80 dark:border-slate-800/80 scroll-mt-24 transition-colors duration-300"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Online-First Flexibility. Physical Campus Accountability.
          </h2>

          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Learn from anywhere. Grow with real support.
          </p>
        </div>

        {/* Feature Breakdown: Online-First */}
        <div className="mt-12 max-w-3xl mx-auto">
          {/* Card 1: Online-First */}
          <div 
            style={{
              borderColor: 'rgba(var(--primary-rgb), 0.25)'
            }}
            className="p-6 sm:p-8 rounded-2xl bg-slate-950/80 border hover:bg-slate-900/90 bg-slate-900/60 backdrop-blur-md space-y-5 relative overflow-hidden group shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Ambient primary glow */}
            <div 
              style={{
                backgroundColor: 'rgba(var(--primary-rgb), 0.12)'
              }}
              className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:opacity-100 opacity-60 transition-opacity" 
            />

            <div className="relative z-10 space-y-4">
              {/* Card Header: Icon + Top Badge */}
              <div className="flex items-center justify-between gap-3">
                <div 
                  style={{
                    background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.25), rgba(var(--secondary-rgb), 0.12))',
                    borderColor: 'rgba(var(--primary-rgb), 0.35)',
                    color: 'var(--primary-color)',
                    boxShadow: '0 0 18px rgba(var(--primary-rgb), 0.25)'
                  }}
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
                >
                  <Laptop className="w-6 h-6" />
                </div>

                <span 
                  style={{
                    backgroundColor: 'rgba(var(--primary-rgb), 0.15)',
                    color: 'var(--primary-color)',
                    borderColor: 'rgba(var(--primary-rgb), 0.3)'
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>100% Online</span>
                </span>
              </div>

              {/* Headline & Subtext */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Online-First Live Interactive Classes
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                  Learn, ask, build — in real time.
                </p>
              </div>

              {/* 3-Column Icon Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-4 border-y border-slate-800/80 my-4">
                {/* Item 1: Live Sessions */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center hover:bg-slate-900/90 transition-all">
                  <div 
                    style={{
                      backgroundColor: 'rgba(var(--primary-rgb), 0.12)',
                      borderColor: 'rgba(var(--primary-rgb), 0.25)',
                      color: 'var(--primary-color)'
                    }}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center mb-1.5 shadow-sm"
                  >
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    Live Sessions
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Real-time support
                  </span>
                </div>

                {/* Item 2: Recorded */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center hover:bg-slate-900/90 transition-all">
                  <div 
                    style={{
                      backgroundColor: 'rgba(var(--primary-rgb), 0.12)',
                      borderColor: 'rgba(var(--primary-rgb), 0.25)',
                      color: 'var(--primary-color)'
                    }}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center mb-1.5 shadow-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    Recorded
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Learn anytime
                  </span>
                </div>

                {/* Item 3: Any Device */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center hover:bg-slate-900/90 transition-all">
                  <div 
                    style={{
                      backgroundColor: 'rgba(var(--primary-rgb), 0.12)',
                      borderColor: 'rgba(var(--primary-rgb), 0.25)',
                      color: 'var(--primary-color)'
                    }}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center mb-1.5 shadow-sm"
                  >
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    Any Device
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    From anywhere
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Metrics + Action Button */}
            <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left: Metrics */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                  <Users style={{ color: 'var(--primary-color)' }} className="w-3.5 h-3.5 shrink-0" />
                  <span>1,200+ Active Learners</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  <span>4.9/5 Rating</span>
                </span>
              </div>

              {/* Right: Primary Action Button */}
              <button
                onClick={handleJoinOnline}
                style={{
                  background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                  boxShadow: '0 10px 25px -5px rgba(var(--primary-rgb), 0.3)'
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] cursor-pointer"
              >
                <span>Join Online</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
