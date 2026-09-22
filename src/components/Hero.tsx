import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Terminal, 
  Database, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play,
  ExternalLink,
  Laptop,
  Code2,
  Calendar,
  Clock,
  Flame
} from 'lucide-react';

import kenyanCodingLab from '../assets/images/kenyan_coding_lab_1789557291842.jpg';
import nairobiDevClass from '../assets/images/nairobi_dev_class_1789557305446.jpg';
import engineerMentoring from '../assets/images/engineer_mentoring_1789557321566.jpg';
import { SiteSettings } from '../types';

interface HeroProps {
  onExplorePrograms?: () => void;
  onApplyNow?: () => void;
  onOpenTracker?: () => void;
  siteSettings?: SiteSettings;
  heroCtaText?: string;
  primaryCtaColor?: string;
}

interface SlideData {
  id: number;
  image: string;
  badge: string;
  badgeIcon: React.ReactNode;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  pillLabel: string;
  quickHighlight: string;
}

export const Hero: React.FC<HeroProps> = ({
  onExplorePrograms,
  onApplyNow,
  onOpenTracker,
  siteSettings
}) => {
  const heroTitle = siteSettings?.hero_title || "Launch Your Tech Career in Software, Data, & AI with Code Point Kenya";
  const heroEyebrow = siteSettings?.hero_eyebrow || "Online-First Training + Physical Campus Lab (Ngong Road, Nairobi)";
  const heroIntro = siteSettings?.hero_introduction || "Kenya’s premier career-accelerator coding school. Learn through intensive, project-driven cohorts taught by senior engineers from Nairobi’s top tech ecosystems. Flexible online evening sessions combined with 24/7 access to our physical innovation lab at Ngong Road, Teamshark, 5th Floor.";
  const phoneClean = (siteSettings?.primary_phone || "+254 756 295 128").replace(/[^0-9]/g, '');
  const primaryCtaColor = siteSettings?.primary_cta_color || '#10B981';
  const heroCtaText = siteSettings?.hero_cta_text || "Apply Now for Next Cohort";

  const resolveSlideImage = (imgStr: string | undefined, defaultImg: string): string => {
    if (!imgStr || typeof imgStr !== 'string' || imgStr.trim() === '') return defaultImg;
    if (imgStr === 'kenyanCodingLab') return kenyanCodingLab;
    if (imgStr === 'nairobiDevClass') return nairobiDevClass;
    if (imgStr === 'engineerMentoring') return engineerMentoring;
    return imgStr;
  };

  const defaultSlides: SlideData[] = [
    {
      id: 0,
      image: kenyanCodingLab,
      badge: heroEyebrow,
      badgeIcon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
      headlinePrefix: "",
      headlineHighlight: heroTitle,
      headlineSuffix: "",
      description: heroIntro,
      pillLabel: "Tech Accelerator",
      quickHighlight: "94% Grad Placement"
    },
    {
      id: 1,
      image: nairobiDevClass,
      badge: "Physical Collaborative Lab: Teamshark 5th Floor, Ngong Road",
      badgeIcon: <MapPin className="w-3.5 h-3.5 text-teal-400" />,
      headlinePrefix: "Hands-on Coding & ",
      headlineHighlight: "Mentorship at Ngong Road Lab",
      headlineSuffix: "",
      description: "Step into our high-speed collaborative coding space in Nairobi. Access gigabit internet, backup power, peer pair-programming stations, and interactive Saturday coding clinics with senior tech practitioners.",
      pillLabel: "Ngong Road Hub",
      quickHighlight: "Gigabit Campus Wi-Fi"
    },
    {
      id: 2,
      image: engineerMentoring,
      badge: "Production Portfolio & Global Engineering Standards",
      badgeIcon: <Code2 className="w-3.5 h-3.5 text-indigo-400" />,
      headlinePrefix: "Build ",
      headlineHighlight: "Production-Grade Projects",
      headlineSuffix: " with Expert Engineers",
      description: "No toy tutorials or synthetic exercises. Graduate with 4 verified production projects deployed on cloud infrastructure—from scalable microservices and database engines to enterprise LLM integrations.",
      pillLabel: "Live Projects",
      quickHighlight: "4 Verified Capstones"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80",
      badge: "Evening Live Cohorts (7:00 PM – 9:30 PM EAT)",
      badgeIcon: <Laptop className="w-3.5 h-3.5 text-emerald-300" />,
      headlinePrefix: "Flexible Online Learning ",
      headlineHighlight: "Designed for Working Minds",
      headlineSuffix: "",
      description: "Level up into high-paying engineering without sacrificing your day job or university schedule. Interactive live sessions, recorded workshops, and flexible 5-month KES installment plans from KES 16,500/month.",
      pillLabel: "Flexible Evenings",
      quickHighlight: "KES 16.5K/mo Plans"
    }
  ];

  let parsedSlides: SlideData[] = [];
  if (siteSettings?.carousel_slides_json) {
    try {
      const raw = JSON.parse(siteSettings.carousel_slides_json);
      if (Array.isArray(raw) && raw.length > 0) {
        parsedSlides = raw.map((s: any, idx: number) => {
          const defaultImg = idx === 1 ? nairobiDevClass : idx === 2 ? engineerMentoring : kenyanCodingLab;
          return {
            id: s.id ?? idx,
            image: resolveSlideImage(s.image, defaultImg),
            badge: s.badge || defaultSlides[idx]?.badge || heroEyebrow,
            badgeIcon: idx === 1 ? <MapPin className="w-3.5 h-3.5 text-teal-400" /> : idx === 2 ? <Code2 className="w-3.5 h-3.5 text-indigo-400" /> : idx === 3 ? <Laptop className="w-3.5 h-3.5 text-emerald-300" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
            headlinePrefix: s.headlinePrefix ?? defaultSlides[idx]?.headlinePrefix ?? "",
            headlineHighlight: s.headlineHighlight || defaultSlides[idx]?.headlineHighlight || heroTitle,
            headlineSuffix: s.headlineSuffix ?? defaultSlides[idx]?.headlineSuffix ?? "",
            description: s.description || defaultSlides[idx]?.description || heroIntro,
            pillLabel: s.pillLabel || defaultSlides[idx]?.pillLabel || `Cohort 0${idx + 1}`,
            quickHighlight: s.quickHighlight || defaultSlides[idx]?.quickHighlight || "Verified Placement"
          };
        });
      }
    } catch (e) {
      console.warn("Failed to parse carousel_slides_json", e);
    }
  }

  const slides: SlideData[] = parsedSlides.length > 0 ? parsedSlides : defaultSlides;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const slideDuration = 5000; // 5 seconds per slide

  // Preload all slide images into browser cache upon mounting
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, [slides]);

  // Robust Auto-play Timer Logic
  useEffect(() => {
    if (isPaused) return;

    const stepMs = 50;
    const increment = (stepMs / slideDuration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [isPaused, currentSlide, slides.length]);

  const handleSelectSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentSlide((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentSlide((curr) => (curr + 1) % slides.length);
    setProgress(0);
  };

  const activeSlide = slides[currentSlide] || slides[0];

  return (
    <section 
      id="hero"
      className="relative overflow-hidden bg-slate-950 text-slate-100 pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800/80 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* BACKGROUND CAROUSEL IMAGES WITH STACKING CONTROL */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id ?? idx}
              style={{ zIndex: isActive ? 10 : 1 }}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.badge}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = kenyanCodingLab;
                }}
              />
            </div>
          );
        })}

        {/* Dark Overlays */}
        <div className="absolute inset-0 bg-slate-950/30 sm:bg-slate-950/25 backdrop-blur-[0.5px] z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full z-10" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-teal-500/10 blur-[110px] rounded-full z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold tracking-wide backdrop-blur-md shadow-lg shadow-emerald-950/40 transition-all duration-300">
                {activeSlide.badgeIcon}
                <span className="truncate max-w-xs sm:max-w-md">{activeSlide.badge}</span>
              </div>

              {/* Dynamic Next Intake & Cohort Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold backdrop-blur-md shadow-lg shadow-emerald-950/40">
                <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Next Intake: <strong className="text-white font-bold">{siteSettings?.next_intake_date || "October 15, 2026"}</strong></span>
                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-extrabold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  {siteSettings?.intake_status || "Enrollment Open"}
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.14] min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
              <span>
                {activeSlide.headlinePrefix}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                  {activeSlide.headlineHighlight}
                </span>
                {activeSlide.headlineSuffix}
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed min-h-[70px] flex items-center">
              {activeSlide.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero fluff: 4 production-grade portfolio projects</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Flexible KES monthly installments (from KES 16.5K/mo)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1-on-1 mentorship & career placement support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Physical campus at Ngong Road, Teamshark 5th Fl</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
              <button
                onClick={onApplyNow}
                style={{ backgroundColor: primaryCtaColor }}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/25 hover:brightness-110 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>{heroCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onExplorePrograms}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-sm font-medium transition-colors cursor-pointer backdrop-blur-sm"
              >
                <span>Explore Programs & Fees (KES)</span>
              </button>

              <button
                onClick={onOpenTracker}
                className="sm:hidden text-center text-xs text-slate-400 hover:text-emerald-400 pt-1 underline"
              >
                Already applied? Track your application
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Alumni Working Across Africa & Global Remote Teams:
              </p>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-2.5 text-slate-300 text-xs font-mono font-medium">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">Safaricom PLC</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">Equity Bank Tech</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">Microsoft ADC</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">Flutterwave</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800">Andela Network</span>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800/90 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Nairobi Campus & Lab</h3>
                    <p className="text-[11px] text-slate-400">{siteSettings?.address || "Ngong Road, Teamshark, 5th Floor"}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {siteSettings?.short_hours_label || "Open Mon - Sat"}
                </span>
              </div>

              {/* Dynamic Next Cohort Urgency & Intake Card */}
              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-slate-900 border border-emerald-500/40 shadow-inner">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Next Cohort: <strong className="text-emerald-300">{siteSettings?.next_intake_date || "October 15, 2026"}</strong></span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wide">
                    {siteSettings?.intake_status || "Enrollment Open"}
                  </span>
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-300 gap-1 pt-1.5 border-t border-emerald-500/20">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Apply before: <strong>{siteSettings?.registration_deadline || "October 10, 2026"}</strong></span>
                  </span>
                  <span className="text-emerald-400 font-medium">Campus & Online Seats</span>
                </div>

                {siteSettings?.announcement_banner_text && (
                  <div className="mt-2 pt-1.5 border-t border-emerald-500/20 text-[11px] text-emerald-200/90 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{siteSettings.announcement_banner_text}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  <Terminal className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Software Engineering Immersive</div>
                    <div className="text-[11px] text-slate-400">16 Weeks • React, Node, Python, Cloud • KES 85,000</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  <Database className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Data Science & Predictive Analytics</div>
                    <div className="text-[11px] text-slate-400">16 Weeks • Python, SQL, Power BI, ML • KES 75,000</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Applied AI & LLM Systems</div>
                    <div className="text-[11px] text-slate-400">14 Weeks • Prompting, LangChain, RAG • KES 95,000</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-white">Cybersecurity & Ethical Hacking</div>
                    <div className="text-[11px] text-slate-400">16 Weeks • SOC Defense, Pentesting • KES 80,000</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-slate-950/60">
                  <div className="text-base font-extrabold text-emerald-400 font-mono">94%</div>
                  <div className="text-[10px] text-slate-400">Grad Placement</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60">
                  <div className="text-base font-extrabold text-white font-mono">1,200+</div>
                  <div className="text-[10px] text-slate-400">Tech Alumni</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60">
                  <div className="text-base font-extrabold text-teal-400 font-mono">1:1</div>
                  <div className="text-[10px] text-slate-400">Mentor Support</div>
                </div>
              </div>

              <a
                href={`https://wa.me/${phoneClean || '254756295128'}?text=Hello%20${encodeURIComponent(siteSettings?.brand_name || 'Code Point Kenya')}!%20I%20would%20like%20to%20learn%20more%20about%20your%20upcoming%20tech%20programs.`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <span>Chat with Admissions Advisor on WhatsApp ({siteSettings?.primary_phone || "0756295128"})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* CAROUSEL CONTROLS */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-2">
            {slides.map((slide, idx) => {
              const isCurrent = idx === currentSlide;
              return (
                <button
                  key={slide.id ?? idx}
                  onClick={() => handleSelectSlide(idx)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-900 border border-emerald-500/50 text-white shadow-md shadow-emerald-950'
                      : 'bg-slate-950/70 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  <span className="font-mono text-[11px] text-emerald-400">0{idx + 1}</span>
                  <span className="hidden sm:inline">{slide.pillLabel}</span>

                  {isCurrent && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title={isPaused ? "Resume auto-play" : "Pause auto-play"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[11px] font-mono">{isPaused ? "Paused" : "Auto-playing"}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                title="Previous slide"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                title="Next slide"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
