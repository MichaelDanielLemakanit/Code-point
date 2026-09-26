import React from 'react';
import { 
  Laptop, 
  MapPin, 
  Globe, 
  Radio, 
  PlayCircle, 
  Smartphone, 
  Monitor, 
  Users, 
  Building2, 
  Star, 
  Cpu, 
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Terminal,
  Code2,
  GitBranch,
  Layers,
  Database,
  Cloud,
  CheckCircle2,
  Rocket,
  Trophy,
  Briefcase,
  FileCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { SiteSettings, ProgressionStage } from '../types';

interface StageIconBadge {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface StageVisualConfig {
  mainIcon: React.ComponentType<{ className?: string }>;
  sublabel: string;
  badges: StageIconBadge[];
  highlight: string;
}

const STAGE_VISUAL_MAP: Record<number, StageVisualConfig> = {
  0: {
    mainIcon: Terminal,
    sublabel: 'Syntax • Git • Daily Reps',
    badges: [
      { icon: Code2, label: 'Syntax & Logic' },
      { icon: GitBranch, label: 'Git Workflows' },
      { icon: Cpu, label: 'Data Modeling' },
      { icon: Zap, label: 'Daily Reps' }
    ],
    highlight: 'Daily Mentorship'
  },
  1: {
    mainIcon: Layers,
    sublabel: 'APIs • Databases • Cloud',
    badges: [
      { icon: Monitor, label: 'Frontend Apps' },
      { icon: Database, label: 'Postgres & APIs' },
      { icon: Cloud, label: 'Cloud Deploy' },
      { icon: CheckCircle2, label: 'PR Audits' }
    ],
    highlight: 'Production Shipping'
  },
  2: {
    mainIcon: Rocket,
    sublabel: 'Agile • Capstone • Demo Day',
    badges: [
      { icon: Users, label: 'Agile Sprints' },
      { icon: Rocket, label: 'Live Systems' },
      { icon: Trophy, label: 'Demo Day' },
      { icon: Star, label: 'Partner Pitch' }
    ],
    highlight: 'Demo Showcase'
  },
  3: {
    mainIcon: Briefcase,
    sublabel: 'Interviews • CVs • Hired',
    badges: [
      { icon: FileCheck, label: 'CV & GitHub' },
      { icon: Zap, label: 'Mock Tech Tests' },
      { icon: Users, label: 'Hiring Partners' },
      { icon: GraduationCap, label: 'Job Ready' }
    ],
    highlight: 'Hiring Pipeline'
  }
};

interface LearningModelProps {
  siteSettings?: SiteSettings;
  onApply?: () => void;
  onExplorePrograms?: () => void;
  onVisitCampus?: () => void;
}

const DEFAULT_STAGES: ProgressionStage[] = [
  {
    id: 'stage-01',
    step_number: '01',
    stage_name: 'Immersion',
    title: 'Foundations & Code',
    description: 'Master language syntax, algorithms, data modeling, and modern Git workflows through daily coding reps.',
    accent_color: 'emerald'
  },
  {
    id: 'stage-02',
    step_number: '02',
    stage_name: 'Production',
    title: 'Full-Stack Systems',
    description: 'Build real-world client and backend microservices with real databases, tests, and cloud deployments.',
    accent_color: 'teal'
  },
  {
    id: 'stage-03',
    step_number: '03',
    stage_name: 'Capstone',
    title: 'Team Project Demo',
    description: 'Ship a comprehensive end-to-end product presented during Code Point Kenya’s Demo Day to hiring partners.',
    accent_color: 'indigo'
  },
  {
    id: 'stage-04',
    step_number: '04',
    stage_name: 'Placement',
    title: 'Career & Mentorship',
    description: 'Resume optimization, GitHub audit, technical mock interviews, and direct introductions to hiring companies.',
    accent_color: 'amber'
  }
];

export const LearningModel: React.FC<LearningModelProps> = ({ 
  siteSettings,
  onApply,
  onExplorePrograms,
  onVisitCampus
}) => {
  // Parse stages from siteSettings or use defaults
  const stages: ProgressionStage[] = React.useMemo(() => {
    if (siteSettings?.progression_stages_json) {
      try {
        const parsed = JSON.parse(siteSettings.progression_stages_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse progression_stages_json:', e);
      }
    }
    return DEFAULT_STAGES;
  }, [siteSettings?.progression_stages_json]);

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'teal':
        return {
          badge: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
          border: 'hover:border-teal-500/40',
          glow: 'from-teal-500/10 to-transparent',
          iconBox: 'from-teal-500/20 via-cyan-500/15 to-transparent border-teal-500/30 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.25)]'
        };
      case 'indigo':
        return {
          badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          border: 'hover:border-indigo-500/40',
          glow: 'from-indigo-500/10 to-transparent',
          iconBox: 'from-indigo-500/20 via-purple-500/15 to-transparent border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
        };
      case 'amber':
        return {
          badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          border: 'hover:border-amber-500/40',
          glow: 'from-amber-500/10 to-transparent',
          iconBox: 'from-amber-500/20 via-orange-500/15 to-transparent border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
        };
      case 'rose':
        return {
          badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          border: 'hover:border-rose-500/40',
          glow: 'from-rose-500/10 to-transparent',
          iconBox: 'from-rose-500/20 via-pink-500/15 to-transparent border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
        };
      case 'cyan':
        return {
          badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          border: 'hover:border-cyan-500/40',
          glow: 'from-cyan-500/10 to-transparent',
          iconBox: 'from-cyan-500/20 via-blue-500/15 to-transparent border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
        };
      case 'violet':
        return {
          badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
          border: 'hover:border-violet-500/40',
          glow: 'from-violet-500/10 to-transparent',
          iconBox: 'from-violet-500/20 via-purple-500/15 to-transparent border-violet-500/30 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
        };
      case 'emerald':
      default:
        return {
          badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          border: 'hover:border-emerald-500/40',
          glow: 'from-emerald-500/10 to-transparent',
          iconBox: 'from-emerald-500/20 via-teal-500/15 to-transparent border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
        };
    }
  };

  const handleJoinOnline = () => {
    if (onApply) {
      onApply();
    } else {
      const el = document.getElementById('programs');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleVisitCampus = () => {
    if (onVisitCampus) {
      onVisitCampus();
    } else {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="campus" className="w-full max-w-full overflow-x-hidden py-20 bg-slate-900 text-slate-100 border-y border-slate-800 scroll-mt-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {/* Top Badge: [📍 TWO WAYS TO LEARN] */}
          <div 
            style={{ 
              backgroundColor: 'rgba(var(--primary-rgb), 0.1)', 
              borderColor: 'rgba(var(--primary-rgb), 0.25)', 
              color: 'var(--primary-color)' 
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm uppercase tracking-wider mx-auto"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>TWO WAYS TO LEARN</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Online-First Flexibility. Physical Campus Accountability.
          </h2>

          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Learn from anywhere. Grow with real support.
          </p>
        </div>

        {/* 2-Column Feature Breakdown: Online-First vs Physical Campus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 max-w-6xl mx-auto">
          
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

          {/* Card 2: Physical Campus */}
          <div 
            style={{
              borderColor: 'rgba(var(--secondary-rgb), 0.25)'
            }}
            className="p-6 sm:p-8 rounded-2xl bg-slate-950/80 border hover:bg-slate-900/90 bg-slate-900/60 backdrop-blur-md space-y-5 relative overflow-hidden group shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Ambient secondary glow */}
            <div 
              style={{
                backgroundColor: 'rgba(var(--secondary-rgb), 0.12)'
              }}
              className="absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:opacity-100 opacity-60 transition-opacity" 
            />

            <div className="relative z-10 space-y-4">
              {/* Card Header: Icon + Top Badge */}
              <div className="flex items-center justify-between gap-3">
                <div 
                  style={{
                    background: 'linear-gradient(135deg, rgba(var(--secondary-rgb), 0.25), rgba(var(--primary-rgb), 0.12))',
                    borderColor: 'rgba(var(--secondary-rgb), 0.35)',
                    color: 'var(--secondary-color)',
                    boxShadow: '0 0 18px rgba(var(--secondary-rgb), 0.25)'
                  }}
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"
                >
                  <Building2 className="w-6 h-6" />
                </div>

                <span 
                  style={{
                    backgroundColor: 'rgba(var(--secondary-rgb), 0.15)',
                    color: 'var(--secondary-color)',
                    borderColor: 'rgba(var(--secondary-rgb), 0.3)'
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>On-Campus</span>
                </span>
              </div>

              {/* Headline & Subtext */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Physical Campus & Innovation Lab Access
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                  Hands-on labs. Real collaboration.
                </p>
              </div>

              {/* 3-Column Icon Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-4 border-y border-slate-800/80 my-4">
                {/* Item 1: Modern Labs */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center hover:bg-slate-900/90 transition-all">
                  <div 
                    style={{
                      backgroundColor: 'rgba(var(--secondary-rgb), 0.12)',
                      borderColor: 'rgba(var(--secondary-rgb), 0.25)',
                      color: 'var(--secondary-color)'
                    }}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center mb-1.5 shadow-sm"
                  >
                    <Monitor className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    Modern Labs
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Industry tools
                  </span>
                </div>

                {/* Item 2: Peer Learning */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center hover:bg-slate-900/90 transition-all">
                  <div 
                    style={{
                      backgroundColor: 'rgba(var(--secondary-rgb), 0.12)',
                      borderColor: 'rgba(var(--secondary-rgb), 0.25)',
                      color: 'var(--secondary-color)'
                    }}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center mb-1.5 shadow-sm"
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    Peer Learning
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Build together
                  </span>
                </div>

                {/* Item 3: Campus Access */}
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center hover:bg-slate-900/90 transition-all">
                  <div 
                    style={{
                      backgroundColor: 'rgba(var(--secondary-rgb), 0.12)',
                      borderColor: 'rgba(var(--secondary-rgb), 0.25)',
                      color: 'var(--secondary-color)'
                    }}
                    className="w-8 h-8 rounded-lg border flex items-center justify-center mb-1.5 shadow-sm"
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    Campus Access
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Study & network
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar: Metrics + Action Button */}
            <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Left: Metrics */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                  <Building2 style={{ color: 'var(--secondary-color)' }} className="w-3.5 h-3.5 shrink-0" />
                  <span>5+ Labs & Facilities</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                  <Cpu style={{ color: 'var(--secondary-color)' }} className="w-3.5 h-3.5 shrink-0" />
                  <span>100% Practical Focus</span>
                </span>
              </div>

              {/* Right: Primary Action Button */}
              <button
                onClick={handleVisitCampus}
                style={{
                  background: 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))',
                  boxShadow: '0 10px 25px -5px rgba(var(--secondary-rgb), 0.3)'
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] cursor-pointer"
              >
                <span>Visit Campus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic Progression Pathway: Your Path from Learner to Hired Engineer */}
        <div className="mt-16 pt-12 border-t border-slate-800">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Your Path from Learner to Hired Engineer</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
              A transparent, step-by-step career progression engineered for rapid transition into high-paying engineering roles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map((stage, idx) => {
              const colorStyle = getColorClasses(stage.accent_color);
              const visualConfig = STAGE_VISUAL_MAP[idx % 4];
              const MainIcon = visualConfig.mainIcon;

              return (
                <div 
                  key={stage.id || idx}
                  className={`p-5 rounded-2xl bg-slate-950/85 border border-slate-800 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/90 shadow-xl group ${colorStyle.border}`}
                >
                  <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${colorStyle.glow} rounded-full blur-2xl pointer-events-none -mr-12 -mt-12 transition-opacity`} />

                  <div className="relative z-10 space-y-3">
                    {/* Header row: Main Icon container + Phase step badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0 ${colorStyle.iconBox}`}>
                        <MainIcon className="w-5 h-5" />
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border shadow-sm ${colorStyle.badge}`}>
                        {stage.step_number || `0${idx + 1}`}. {stage.stage_name}
                      </span>
                    </div>

                    {/* Stage Title and Punchy Subtitle */}
                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight group-hover:text-white transition-colors">
                        {stage.title}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5 tracking-wide">
                        {visualConfig.sublabel}
                      </p>
                    </div>

                    {/* 2x2 Icon-First Badges Grid */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800/80 my-2">
                      {visualConfig.badges.map((b, bIdx) => {
                        const BIcon = b.icon;
                        return (
                          <div 
                            key={bIdx}
                            className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:bg-slate-850 hover:border-slate-700 transition-all text-left"
                          >
                            <div className="w-6 h-6 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0 group-hover:text-white transition-colors">
                              <BIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-200 leading-tight truncate">
                              {b.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Bar: Highlight + Milestone indicator */}
                  <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-850/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{visualConfig.highlight}</span>
                    </span>
                    <span className="text-slate-500 font-semibold shrink-0">
                      Phase {idx + 1}/{stages.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
