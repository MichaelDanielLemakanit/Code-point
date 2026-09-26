import React from 'react';
import { 
  GraduationCap,
  Zap, 
  Code2, 
  ShieldCheck, 
  Users, 
  Clock, 
  Target, 
  Package, 
  Cloud, 
  Star, 
  Briefcase, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '../types';

interface WhyStudySectionProps {
  siteSettings?: SiteSettings;
  onApply?: () => void;
  onExplorePrograms?: () => void;
}

interface BadgeItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface WhyStudyCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  topPill: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
  };
  title: string;
  sublabel: string;
  badges: BadgeItem[];
  action: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtext: string;
  };
  accentColor: 'emerald' | 'blue' | 'purple';
}

const CARDS_DATA: WhyStudyCard[] = [
  {
    id: 'mentorship',
    icon: Users,
    topPill: {
      icon: Zap,
      text: '1-on-1 Support'
    },
    title: '1-on-1 Mentorship',
    sublabel: 'Learn from industry experts',
    badges: [
      { icon: Users, label: 'Expert Mentors' },
      { icon: Clock, label: 'Flexible Hours' },
      { icon: Target, label: 'Career Guidance' }
    ],
    action: {
      icon: Users,
      title: 'Get Matched',
      subtext: 'Find your mentor'
    },
    accentColor: 'emerald'
  },
  {
    id: 'projects',
    icon: Code2,
    topPill: {
      icon: Code2,
      text: 'Real Projects'
    },
    title: 'Practical Portfolio Projects',
    sublabel: 'Build real-world experience',
    badges: [
      { icon: Package, label: 'Real Projects' },
      { icon: Cloud, label: 'Modern Stack' },
      { icon: Star, label: 'Showcase Ready' }
    ],
    action: {
      icon: Code2,
      title: 'Explore Projects',
      subtext: 'Build your portfolio'
    },
    accentColor: 'blue'
  },
  {
    id: 'certificate',
    icon: ShieldCheck,
    topPill: {
      icon: ShieldCheck,
      text: 'Verified'
    },
    title: 'Verified Certificate',
    sublabel: 'Prove your skills. Grow your career.',
    badges: [
      { icon: ShieldCheck, label: 'Blockchain Verified' },
      { icon: Briefcase, label: 'Globally Recognized' },
      { icon: Star, label: 'Career Ready' }
    ],
    action: {
      icon: GraduationCap,
      title: 'Get Certified',
      subtext: 'Showcase your skills'
    },
    accentColor: 'purple'
  }
];

export const WhyStudySection: React.FC<WhyStudySectionProps> = ({ 
  siteSettings,
  onApply,
  onExplorePrograms
}) => {
  const sectionTitle = siteSettings?.why_study_section_title || 'Why Study at CodePoint Kenya';
  const sectionSubtitle = siteSettings?.why_study_section_subtitle || 'Real support • Hands-on practice • Industry ready';

  const handleCardClick = (cardId: string) => {
    if (cardId === 'projects') {
      if (onExplorePrograms) {
        onExplorePrograms();
      } else {
        const el = document.getElementById('programs');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      if (onApply) {
        onApply();
      } else {
        const el = document.getElementById('programs');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="why-codepoint" className="w-full max-w-full overflow-x-hidden py-20 bg-slate-900 text-slate-100 border-t border-slate-800 relative scroll-mt-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {/* Top Pill Badge */}
          <div 
            style={{ 
              backgroundColor: 'rgba(var(--primary-rgb), 0.1)', 
              borderColor: 'rgba(var(--primary-rgb), 0.25)', 
              color: 'var(--primary-color)' 
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm uppercase tracking-wider mx-auto"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>LEARN • BUILD • GROW</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {sectionTitle}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
          {CARDS_DATA.map((card, idx) => {
            const Icon = card.icon;
            const PillIcon = card.topPill.icon;
            const ActionIcon = card.action.icon;

            const isCard1 = idx === 0;
            const isCard2 = idx === 1;
            const cardColor = isCard1 
              ? 'var(--primary-color)' 
              : isCard2 
              ? 'var(--secondary-color)' 
              : 'var(--primary-color)';
            const cardRgb = isCard1 
              ? 'var(--primary-rgb)' 
              : isCard2 
              ? 'var(--secondary-rgb)' 
              : 'var(--primary-rgb)';

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                style={{
                  borderColor: `rgba(${cardRgb}, 0.25)`
                }}
                className="p-6 sm:p-7 rounded-2xl bg-slate-950/80 border hover:bg-slate-900/90 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden shadow-xl cursor-pointer"
              >
                {/* Subtle top-right ambient glow */}
                <div 
                  style={{
                    backgroundColor: `rgba(${cardRgb}, 0.12)`
                  }}
                  className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12 transition-opacity group-hover:opacity-100 opacity-60"
                />

                <div className="relative z-10 space-y-4">
                  {/* Card Header Row: Icon container + Top Right Pill */}
                  <div className="flex items-center justify-between gap-3">
                    <div 
                      style={{
                        background: isCard1
                          ? 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.25), rgba(var(--secondary-rgb), 0.12))'
                          : isCard2
                          ? 'linear-gradient(135deg, rgba(var(--secondary-rgb), 0.25), rgba(var(--primary-rgb), 0.12))'
                          : 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--secondary-rgb), 0.2))',
                        borderColor: `rgba(${cardRgb}, 0.35)`,
                        color: cardColor,
                        boxShadow: `0 0 18px rgba(${cardRgb}, 0.25)`
                      }}
                      className="w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0"
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span 
                      style={{
                        backgroundColor: `rgba(${cardRgb}, 0.15)`,
                        color: cardColor,
                        borderColor: `rgba(${cardRgb}, 0.3)`
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border shadow-sm"
                    >
                      <PillIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{card.topPill.text}</span>
                    </span>
                  </div>

                  {/* Title & 1-line sub-label */}
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                      {card.sublabel}
                    </p>
                  </div>

                  {/* 3-Column Horizontal Icon Badge Strip */}
                  <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-slate-800/80 my-3">
                    {card.badges.map((b, bIdx) => {
                      const BIcon = b.icon;
                      return (
                        <div
                          key={bIdx}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-center transition-all"
                        >
                          <div 
                            style={{ color: cardColor }}
                            className="p-1 rounded-lg bg-slate-950/60 mb-1 transition-colors"
                          >
                            <BIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-200 leading-tight text-center">
                            {b.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="relative z-10 pt-3 border-t border-slate-850/80 flex items-center justify-between gap-3 group-hover:border-slate-800 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-white shrink-0">
                      <ActionIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div 
                        style={{ color: 'var(--primary-color)' }}
                        className="text-xs font-bold transition-colors truncate"
                      >
                        {card.action.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {card.action.subtext}
                      </div>
                    </div>
                  </div>

                  <div 
                    style={{
                      borderColor: `rgba(${cardRgb}, 0.35)`
                    }}
                    className="w-8 h-8 rounded-full bg-slate-900 border flex items-center justify-center text-slate-300 group-hover:bg-[var(--primary-color)] group-hover:text-slate-950 group-hover:border-[var(--primary-color)] group-hover:scale-105 transition-all shadow-md shrink-0"
                  >
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
