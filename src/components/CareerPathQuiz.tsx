import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Terminal, 
  Database, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  Laptop, 
  Brain, 
  Lock, 
  Server, 
  KeyRound, 
  Briefcase, 
  Zap, 
  Calendar, 
  Layers, 
  HelpCircle, 
  TrendingUp 
} from 'lucide-react';
import { Course, SiteSettings } from '../types';

interface TrackDefinition {
  id: 'software-engineering' | 'data-science-ai' | 'cybersecurity-microservices';
  courseId: string;
  slug: string;
  title: string;
  badge: string;
  badgeColor: string;
  accentColor: string;
  borderGlow: string;
  bgGradient: string;
  icon: React.ReactNode;
  tagline: string;
  whyFit: string;
  technologies: string[];
  careerRoles: string[];
  startingSalary: string;
  duration: string;
  campusMode: string;
}

const TRACKS: Record<string, TrackDefinition> = {
  'software-engineering': {
    id: 'software-engineering',
    courseId: 'course-software-engineering',
    slug: 'full-stack-software-engineering',
    title: 'Full-Stack Software Engineering',
    badge: 'High Demand • Web & Mobile Systems',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    accentColor: 'text-emerald-400',
    borderGlow: 'border-emerald-500/40 shadow-emerald-950/50',
    bgGradient: 'from-emerald-950/40 via-slate-900/90 to-slate-950',
    icon: <Terminal className="w-8 h-8 text-emerald-400" />,
    tagline: 'Architect and build modern web applications, interactive user experiences, and scalable cloud microservices.',
    whyFit: 'You thrive on seeing your ideas come alive as tangible products and love building end-to-end features that real people interact with every day. You enjoy turning designs into responsive user interfaces, creating robust backend APIs, and deploying modern cloud microservices.',
    technologies: [
      'React 19 & Next.js',
      'TypeScript & ES6+',
      'Node.js & Express',
      'Python & Flask',
      'PostgreSQL & Prisma',
      'Docker Containers',
      'M-Pesa Daraja API',
      'Git Workflows & CI/CD'
    ],
    careerRoles: [
      'Full-Stack Developer',
      'Frontend Software Engineer',
      'Backend API Architect',
      'Fintech Systems Developer'
    ],
    startingSalary: 'KES 90,000 – KES 180,000/mo (Kenya) | $2,000 – $4,500/mo (Global Remote)',
    duration: '16 Weeks • Part-Time Evening or Weekend',
    campusMode: 'Live Online Sessions + 24/7 Access to Ngong Road Campus Lab'
  },
  'data-science-ai': {
    id: 'data-science-ai',
    courseId: 'course-data-science-ai',
    slug: 'data-science-applied-ai',
    title: 'Data Science & Applied AI',
    badge: 'Fastest Growing • AI & Analytics',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    accentColor: 'text-cyan-400',
    borderGlow: 'border-cyan-500/40 shadow-cyan-950/50',
    bgGradient: 'from-cyan-950/40 via-slate-900/90 to-slate-950',
    icon: <Cpu className="w-8 h-8 text-cyan-400" />,
    tagline: 'Extract high-value business intelligence, build predictive models, and deploy generative AI & LLM systems.',
    whyFit: 'You have a deep analytical curiosity and love digging beneath the surface to find hidden patterns, automate complex decisions, and build intelligent algorithms. You are fascinated by the frontier of generative AI, large language models, and predictive data modeling.',
    technologies: [
      'Python for Data Science',
      'Pandas & NumPy',
      'Relational SQL & PostgreSQL',
      'Scikit-Learn Machine Learning',
      'Gemini API & LLMs',
      'RAG & Vector Databases',
      'FastAPI Model Serving',
      'Data Visualization & Dashboards'
    ],
    careerRoles: [
      'Data Scientist',
      'Applied AI Engineer',
      'Machine Learning Specialist',
      'Business Intelligence Analyst'
    ],
    startingSalary: 'KES 95,000 – KES 200,000/mo (Kenya) | $2,200 – $5,000/mo (Global Remote)',
    duration: '16 Weeks • Part-Time Evening or Weekend',
    campusMode: 'Live Online Sessions + 24/7 Access to Ngong Road Campus Lab'
  },
  'cybersecurity-microservices': {
    id: 'cybersecurity-microservices',
    courseId: 'course-cybersecurity-microservices',
    slug: 'cyber-security-microservices',
    title: 'Cyber Security & Microservices',
    badge: 'Critical Infrastructure • Defense & Cloud',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    accentColor: 'text-amber-400',
    borderGlow: 'border-amber-500/40 shadow-amber-950/50',
    bgGradient: 'from-amber-950/40 via-slate-900/90 to-slate-950',
    icon: <ShieldCheck className="w-8 h-8 text-amber-400" />,
    tagline: 'Fortify cloud microservices, audit enterprise infrastructure, and master offensive and defensive ethical hacking.',
    whyFit: 'You think critically about safety, resilience, and digital defense. You love understanding how systems communicate under the hood, pinpointing vulnerabilities before malicious attackers do, and architecting resilient microservices that never go down.',
    technologies: [
      'Linux Server Hardening',
      'Network Security & Wireshark',
      'OWASP Top 10 Pentesting',
      'Docker & Container Security',
      'Microservices Defense & Gateways',
      'SIEM & Incident Drills',
      'Zero-Trust Architecture',
      'Security+ & CEH Preparation'
    ],
    careerRoles: [
      'Cybersecurity Analyst',
      'Cloud Security Engineer',
      'SOC Incident Responder',
      'Junior Penetration Tester'
    ],
    startingSalary: 'KES 85,000 – KES 190,000/mo (Kenya) | $2,000 – $4,800/mo (Global Remote)',
    duration: '16 Weeks • Part-Time Evening or Weekend',
    campusMode: 'Live Online Sessions + 24/7 Access to Ngong Road Campus Lab'
  }
};

interface QuestionOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  scores: {
    'software-engineering': number;
    'data-science-ai': number;
    'cybersecurity-microservices': number;
  };
}

interface Question {
  id: number;
  category: string;
  question: string;
  subtitle: string;
  options: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Work Style & Creative Focus',
    question: 'When you imagine your ideal day in tech, which activity excites you the most?',
    subtitle: 'Think about what energizes you and makes time fly when working on a computer.',
    options: [
      {
        id: 'q1-build',
        title: 'Building Interactive User Products & Apps',
        description: 'Writing code that creates tangible web & mobile interfaces, seeing users interact with buttons, forms, and sleek real-time features.',
        icon: <Laptop className="w-5 h-5 text-emerald-400" />,
        scores: { 'software-engineering': 4, 'data-science-ai': 1, 'cybersecurity-microservices': 0 }
      },
      {
        id: 'q1-data',
        title: 'Uncovering Patterns, Training Models & Automating with AI',
        description: 'Digging into datasets, generating charts, training intelligent algorithms, and building smart conversational assistants or predictive tools.',
        icon: <Brain className="w-5 h-5 text-cyan-400" />,
        scores: { 'software-engineering': 1, 'data-science-ai': 4, 'cybersecurity-microservices': 0 }
      },
      {
        id: 'q1-cyber',
        title: 'Fortifying Systems, Cloud Architecture & Defending Against Threats',
        description: 'Discovering security flaws, hardening Linux servers, setting up firewalls, and making sure critical systems cannot be hacked or breached.',
        icon: <Lock className="w-5 h-5 text-amber-400" />,
        scores: { 'software-engineering': 0, 'data-science-ai': 0, 'cybersecurity-microservices': 4 }
      }
    ]
  },
  {
    id: 2,
    category: 'Favorite Problem-Solving Arena',
    question: 'Which real-world engineering challenge sounds most satisfying to solve?',
    subtitle: 'Choose the challenge you would eagerly spend a weekend hacking on.',
    options: [
      {
        id: 'q2-fullstack',
        title: 'Connecting a Live M-Pesa Payment Checkout & Web Service',
        description: 'Creating end-to-end database schemas in PostgreSQL, building REST endpoints, and processing payments with automated instant receipts.',
        icon: <Server className="w-5 h-5 text-emerald-400" />,
        scores: { 'software-engineering': 4, 'data-science-ai': 1, 'cybersecurity-microservices': 1 }
      },
      {
        id: 'q2-aimodel',
        title: 'Building an Enterprise AI Assistant with RAG & Machine Learning',
        description: 'Feeding internal documents into an LLM with vector embeddings so teams get instant, factual, AI-powered answers and predictions.',
        icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
        scores: { 'software-engineering': 1, 'data-science-ai': 4, 'cybersecurity-microservices': 0 }
      },
      {
        id: 'q2-defense',
        title: 'Simulating a Cyber Attack & Securing Containerized Microservices',
        description: 'Performing ethical penetration testing on an API gateway, patching vulnerabilities, and setting up zero-trust access controls.',
        icon: <KeyRound className="w-5 h-5 text-amber-400" />,
        scores: { 'software-engineering': 1, 'data-science-ai': 0, 'cybersecurity-microservices': 4 }
      }
    ]
  },
  {
    id: 3,
    category: 'Primary Tech Career Goal',
    question: 'Where do you see yourself making your biggest professional mark over the next 1–2 years?',
    subtitle: 'Select the career destination that aligns with your ambition in Kenya or globally.',
    options: [
      {
        id: 'q3-se',
        title: 'Full-Stack Software Engineer',
        description: 'Shipping scalable commercial web applications for fast-paced tech startups, telecom giants, or well-compensated international remote teams.',
        icon: <Terminal className="w-5 h-5 text-emerald-400" />,
        scores: { 'software-engineering': 4, 'data-science-ai': 0, 'cybersecurity-microservices': 0 }
      },
      {
        id: 'q3-ai',
        title: 'Applied AI Specialist or Data Scientist',
        description: 'Leading data-informed decision making, implementing machine learning models, and building modern generative AI solutions for enterprises.',
        icon: <Cpu className="w-5 h-5 text-cyan-400" />,
        scores: { 'software-engineering': 0, 'data-science-ai': 4, 'cybersecurity-microservices': 0 }
      },
      {
        id: 'q3-cyber',
        title: 'Cyber Defense & Cloud Security Specialist',
        description: 'Protecting vital financial and enterprise infrastructure, conducting security audits, and serving as a trusted digital guardian.',
        icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
        scores: { 'software-engineering': 0, 'data-science-ai': 0, 'cybersecurity-microservices': 4 }
      }
    ]
  }
];

interface CareerPathQuizProps {
  courses?: Course[];
  onApplyCourse: (courseId: string) => void;
  onExplorePrograms?: () => void;
  siteSettings?: SiteSettings;
}

export const CareerPathQuiz: React.FC<CareerPathQuizProps> = ({
  courses = [],
  onApplyCourse,
  onExplorePrograms,
  siteSettings
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0: Intro, 1: Q1, 2: Q2, 3: Q3, 4: Result
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    track: TrackDefinition;
    matchScore: number;
    secondaryTrack?: TrackDefinition;
    secondaryScore?: number;
  } | null>(null);

  const totalQuestions = QUESTIONS.length;
  const nextIntakeDate = siteSettings?.next_intake_date || 'October 15, 2026';

  // Handle selecting an option
  const handleSelectOption = (questionId: number, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Move to next step or compute result
  const handleNext = () => {
    if (currentStep < totalQuestions) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Compute points
      computeResults();
    }
  };

  // Move back
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  // Reset quiz
  const handleRetake = () => {
    setSelectedAnswers({});
    setMatchResult(null);
    setCurrentStep(1);
  };

  // Compute final track points
  const computeResults = () => {
    setIsCalculating(true);

    const scores = {
      'software-engineering': 0,
      'data-science-ai': 0,
      'cybersecurity-microservices': 0
    };

    QUESTIONS.forEach(q => {
      const selectedOptionId = selectedAnswers[q.id];
      if (selectedOptionId) {
        const option = q.options.find(o => o.id === selectedOptionId);
        if (option) {
          scores['software-engineering'] += option.scores['software-engineering'];
          scores['data-science-ai'] += option.scores['data-science-ai'];
          scores['cybersecurity-microservices'] += option.scores['cybersecurity-microservices'];
        }
      }
    });

    // Sort tracks by score
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winnerKey = sorted[0][0];
    const winnerScoreRaw = sorted[0][1];
    const secondaryKey = sorted[1][0];
    const secondaryScoreRaw = sorted[1][1];

    // Total possible max score is 12 (4 pts * 3 questions)
    const matchPercentage = Math.min(96, Math.max(84, Math.round(80 + (winnerScoreRaw / 12) * 16)));
    const secondaryPercentage = Math.min(82, Math.max(68, Math.round(65 + (secondaryScoreRaw / 12) * 15)));

    setTimeout(() => {
      setMatchResult({
        track: TRACKS[winnerKey],
        matchScore: matchPercentage,
        secondaryTrack: TRACKS[secondaryKey],
        secondaryScore: secondaryPercentage
      });
      setIsCalculating(false);
      setCurrentStep(totalQuestions + 1);
    }, 450);
  };

  // Find matching course ID from courses prop or track courseId
  const getEnrollmentCourseId = (track: TrackDefinition): string => {
    if (!courses || courses.length === 0) return track.courseId;

    // 1. Direct match by id
    const exact = courses.find(c => c.id === track.courseId);
    if (exact) return exact.id;

    // 2. Match by slug
    const bySlug = courses.find(c => c.slug === track.slug);
    if (bySlug) return bySlug.id;

    // 3. Match by keyword
    if (track.id === 'software-engineering') {
      const se = courses.find(c => c.title.toLowerCase().includes('software') || c.slug.includes('software'));
      if (se) return se.id;
    } else if (track.id === 'data-science-ai') {
      const ds = courses.find(c => c.title.toLowerCase().includes('data') || c.title.toLowerCase().includes('ai') || c.slug.includes('data'));
      if (ds) return ds.id;
    } else if (track.id === 'cybersecurity-microservices') {
      const cs = courses.find(c => c.title.toLowerCase().includes('cyber') || c.title.toLowerCase().includes('security') || c.slug.includes('cyber'));
      if (cs) return cs.id;
    }

    return courses[0].id;
  };

  const handleEnrollClick = (track: TrackDefinition) => {
    const courseId = getEnrollmentCourseId(track);
    onApplyCourse(courseId);
  };

  return (
    <motion.section 
      id="career-quiz" 
      aria-label="Interactive Career Path Quiz"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: '-40px 0px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-full overflow-x-hidden py-16 sm:py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative border-b border-slate-800/80 scroll-mt-20"
    >
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-4xl mx-auto">
        
        {/* ============================================================== */}
        {/* STEP 0: QUIZ INTRO / CALL-TO-ACTION CARD */}
        {/* ============================================================== */}
        <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div 
            key="quiz-intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ borderColor: 'var(--card-highlight-border)' }}
            className="bg-slate-900/90 border rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />

            <div className="space-y-4">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Not Sure Where to Start in Tech? <br />
                <span className="theme-gradient-text">
                  Find Your Perfect Engineering Track
                </span>
              </h2>
            </div>

            {/* Quick 3 Tracks Teaser */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg theme-icon-box flex items-center justify-center shrink-0">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Software Engineering</h4>
                  <p className="text-[11px] text-slate-400">Full-Stack & Web Apps</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg theme-icon-box-accent flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Data Science & AI</h4>
                  <p className="text-[11px] text-slate-400">LLMs, Python & RAG</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cybersecurity</h4>
                  <p className="text-[11px] text-slate-400">Defense & Microservices</p>
                </div>
              </div>
            </div>

            {/* CTA to start quiz */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 theme-text-primary" />
                <span>Takes less than 1 minute • 3 multiple-choice questions</span>
              </div>

              <button
                onClick={() => setCurrentStep(1)}
                style={{ backgroundColor: 'var(--primary-color)' }}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-slate-950 font-bold text-sm shadow-lg hover:brightness-110 transition-all cursor-pointer group"
              >
                <span>Take 60-Second Match Quiz</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* STEPS 1 to 3: INTERACTIVE QUIZ QUESTIONS */}
        {/* ============================================================== */}
        {currentStep >= 1 && currentStep <= totalQuestions && (
          <motion.div 
            key={`quiz-step-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative"
          >
            
            {/* Top Progress bar and Header */}
            <div className="space-y-3 pb-6 border-b border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold theme-text-primary uppercase tracking-wider">
                  Question {currentStep} of {totalQuestions}
                </span>
                <span className="text-slate-400 font-medium">
                  {QUESTIONS[currentStep - 1].category}
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full theme-progress-bar transition-all duration-300 rounded-full"
                  style={{ width: `${(currentStep / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Question */}
            <div className="mt-6 space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {QUESTIONS[currentStep - 1].question}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                {QUESTIONS[currentStep - 1].subtitle}
              </p>
            </div>

            {/* Options List */}
            <div className="mt-6 space-y-3.5">
              {QUESTIONS[currentStep - 1].options.map((option) => {
                const isSelected = selectedAnswers[currentStep] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(currentStep, option.id)}
                    style={isSelected ? { 
                      borderColor: 'var(--primary-color)', 
                      backgroundColor: 'rgba(var(--primary-rgb), 0.1)' 
                    } : undefined}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? 'shadow-lg'
                        : 'bg-slate-950/70 hover:bg-slate-850/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div 
                      style={isSelected ? { 
                        backgroundColor: 'var(--primary-color)', 
                        borderColor: 'var(--primary-color)',
                        color: '#020617' 
                      } : undefined}
                      className={`p-2.5 rounded-xl border mt-0.5 shrink-0 transition-colors ${
                        isSelected 
                          ? '' 
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {option.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm sm:text-base font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {option.title}
                        </span>
                        <div 
                          style={isSelected ? { 
                            borderColor: 'var(--primary-color)', 
                            backgroundColor: 'var(--primary-color)',
                            color: '#020617' 
                          } : undefined}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                            isSelected 
                              ? '' 
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Bar (Back / Next) */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs sm:text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  disabled={!selectedAnswers[currentStep] || isCalculating}
                  onClick={handleNext}
                  className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedAnswers[currentStep]
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  }`}
                >
                  {isCalculating ? (
                    <span>Calculating Match...</span>
                  ) : currentStep === totalQuestions ? (
                    <>
                      <span>View My Personalized Match</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: PERSONALIZED RESULT CARD */}
        {/* ============================================================== */}
        {currentStep > totalQuestions && matchResult && (
          <motion.div 
            key="quiz-results"
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div 
              style={{ borderColor: 'var(--card-highlight-border)' }}
              className={`bg-gradient-to-br ${matchResult.track.bgGradient} border rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden`}
            >
              
              {/* Top Banner Tag */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800/80">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 theme-text-primary" />
                  <span>Personalized Career Assessment Result</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full theme-badge text-xs font-extrabold tracking-wide">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{matchResult.matchScore}% Match!</span>
                </div>
              </div>

              {/* Matched Program Headline */}
              <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                    Your Best Fit Program:
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {matchResult.track.title}
                  </h3>
                  <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                    {matchResult.track.tagline}
                  </p>
                </div>

                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
                  {matchResult.track.icon}
                </div>
              </div>

              {/* Why This Course Suits Them Breakdown */}
              <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 theme-text-primary" />
                  <span>Why This Track Fits Your Profile</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {matchResult.track.whyFit}
                </p>
              </div>

              {/* Key Technologies You Will Master */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 theme-text-primary" />
                    <span>Key Technologies You Will Master</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">Production-Ready Tooling</span>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  {matchResult.track.technologies.map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                    >
                      <span 
                        style={{ backgroundColor: 'var(--primary-color)' }}
                        className="w-1.5 h-1.5 rounded-full" 
                      />
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Career Roles & Expected Earnings */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Target Job Titles:
                  </div>
                  <div className="text-xs text-slate-200 font-medium leading-relaxed">
                    {matchResult.track.careerRoles.join(' • ')}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Starting Salary Potential:
                  </div>
                  <div className="text-xs font-semibold theme-text-primary">
                    {matchResult.track.startingSalary}
                  </div>
                </div>
              </div>

              {/* Next Intake & Campus Badge */}
              <div className="mt-6 p-4 rounded-xl theme-badge flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <Calendar className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>Next Cohort Starts: <strong className="theme-text-primary">{nextIntakeDate}</strong> (Online + Ngong Rd Lab)</span>
                </div>
                <span className="theme-text-primary font-medium">
                  {matchResult.track.duration}
                </span>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleRetake}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                  {onExplorePrograms && (
                    <button
                      onClick={onExplorePrograms}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-700/80 hover:bg-slate-800 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer text-center"
                    >
                      Compare All 3 Tracks
                    </button>
                  )}

                  {/* Primary CTA: Enroll in This Track */}
                  <button
                    onClick={() => handleEnrollClick(matchResult.track)}
                    style={{ backgroundColor: 'var(--primary-color)' }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-slate-950 font-bold text-sm shadow-xl hover:brightness-110 transition-all cursor-pointer group"
                  >
                    <span>Enroll in This Track</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

            {/* Secondary alternative fit suggestion */}
            {matchResult.secondaryTrack && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-400">Close Alternative Match: </span>
                    <strong className="text-white">{matchResult.secondaryTrack.title}</strong>
                    <span className="text-slate-400 ml-2">({matchResult.secondaryScore}% match)</span>
                  </div>
                </div>

                <button
                  onClick={() => handleEnrollClick(matchResult.secondaryTrack!)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline text-left sm:text-right cursor-pointer"
                >
                  View this track instead &rarr;
                </button>
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>
        </div>

      </div>
    </motion.section>
  );
};
