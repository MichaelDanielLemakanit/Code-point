import React from 'react';
import { motion } from 'framer-motion';
import { 
  Laptop, 
  MapPin, 
  Wifi, 
  Users, 
  Code2, 
  Briefcase, 
  Clock, 
  CheckCircle,
  Zap,
  Building2,
  CalendarCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SiteSettings, ProgressionStage } from '../types';

interface LearningModelProps {
  siteSettings?: SiteSettings;
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

export const LearningModel: React.FC<LearningModelProps> = ({ siteSettings }) => {
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
          glow: 'from-teal-500/10 to-transparent'
        };
      case 'indigo':
        return {
          badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          border: 'hover:border-indigo-500/40',
          glow: 'from-indigo-500/10 to-transparent'
        };
      case 'amber':
        return {
          badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          border: 'hover:border-amber-500/40',
          glow: 'from-amber-500/10 to-transparent'
        };
      case 'rose':
        return {
          badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          border: 'hover:border-rose-500/40',
          glow: 'from-rose-500/10 to-transparent'
        };
      case 'cyan':
        return {
          badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          border: 'hover:border-cyan-500/40',
          glow: 'from-cyan-500/10 to-transparent'
        };
      case 'violet':
        return {
          badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
          border: 'hover:border-violet-500/40',
          glow: 'from-violet-500/10 to-transparent'
        };
      case 'emerald':
      default:
        return {
          badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          border: 'hover:border-emerald-500/40',
          glow: 'from-emerald-500/10 to-transparent'
        };
    }
  };

  return (
    <section id="model" className="py-20 bg-slate-900 text-slate-100 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full theme-badge text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>The Code Point Kenya Hybrid Model</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Online-First Flexibility. Physical Campus Accountability.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            We built Code Point Kenya to solve the high dropout rates of purely remote courses and the inflexibility of traditional universities.
          </p>
        </div>

        {/* 2-Column Feature Breakdown: Online-First vs Physical Campus */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-14">
          
          {/* Pillar 1: Online-First Training */}
          <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl theme-icon-box flex items-center justify-center">
              <Laptop className="w-6 h-6 theme-text-primary" />
            </div>

            <div>
              <div className="text-xs font-mono theme-text-primary font-semibold uppercase tracking-wider">
                Anywhere in Kenya & Beyond
              </div>
              <h3 className="text-2xl font-bold text-white mt-1">
                Online-First Live Interactive Classes
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Attend interactive evening lectures from the comfort of your home or office. Never miss a concept with cloud-synced recordings, live coding demos, and instant mentor Q&A.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 theme-text-primary shrink-0 mt-0.5" />
                <span><strong className="text-white">Evening Schedules:</strong> 7:00 PM – 9:30 PM EAT classes designed for working professionals and university scholars.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 theme-text-primary shrink-0 mt-0.5" />
                <span><strong className="text-white">Active Community:</strong> Dedicated Discord and Slack workspaces with instant pair-programming rooms.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 theme-text-primary shrink-0 mt-0.5" />
                <span><strong className="text-white">Industry Instructors:</strong> Taught by senior developers currently working at top Kenyan tech firms.</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Physical Nairobi Campus & Lab */}
          <div className="p-8 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div 
              style={{ 
                backgroundColor: 'rgba(var(--secondary-rgb), 0.15)', 
                borderColor: 'rgba(var(--secondary-rgb), 0.3)', 
                color: 'var(--secondary-color)' 
              }}
              className="w-12 h-12 rounded-xl border flex items-center justify-center"
            >
              <MapPin className="w-6 h-6 theme-text-secondary" />
            </div>

            <div>
              <div className="text-xs font-mono theme-text-secondary font-semibold uppercase tracking-wider">
                Ngong Road, Teamshark, 5th Floor, Nairobi
              </div>
              <h3 className="text-2xl font-bold text-white mt-1">
                Physical Campus & Innovation Lab Access
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Need high-speed fiber internet, zero power interruptions, and a focused environment? All enrolled Code Point Kenya fellows get access to our vibrant physical tech lab.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <Wifi className="w-4 h-4 theme-text-secondary shrink-0 mt-0.5" />
                <span><strong className="text-white">Zero Power/Internet Worries:</strong> Uncapped high-speed fiber internet and continuous backup generator power.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <Users className="w-4 h-4 theme-text-secondary shrink-0 mt-0.5" />
                <span><strong className="text-white">Saturday Hackathons & Clinics:</strong> Meet mentors face-to-face for architectural reviews and code debugging.</span>
              </div>
              <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                <CalendarCheck className="w-4 h-4 theme-text-secondary shrink-0 mt-0.5" />
                <span><strong className="text-white">Hot-desking & Collaboration:</strong> Co-work alongside fellow engineers, data scientists, and startup founders.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Progression Pathway: Your Path from Learner to Hired Engineer */}
        <div className="mt-16 pt-12 border-t border-slate-800">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full theme-badge text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineered Career Acceleration</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Your Path from Learner to Hired Engineer</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
              A transparent, step-by-step career progression engineered for rapid transition into high-paying engineering roles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stages.map((stage, idx) => {
              const colorStyle = getColorClasses(stage.accent_color);
              return (
                <div 
                  key={stage.id || idx}
                  className={`p-6 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:-translate-y-1 ${colorStyle.border}`}
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorStyle.glow} rounded-full blur-2xl pointer-events-none -mr-10 -mt-10`} />

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${colorStyle.badge}`}>
                        {stage.step_number || `0${idx + 1}`}. {stage.stage_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                        Phase {idx + 1}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white tracking-tight">
                      {stage.title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Milestone {idx + 1} of {stages.length}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
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

