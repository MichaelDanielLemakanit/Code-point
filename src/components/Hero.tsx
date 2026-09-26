import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play,
  Laptop,
  Code2,
  Zap,
  CreditCard,
  Building2
} from 'lucide-react';

import kenyanCodingLab from '../assets/images/kenyan_coding_lab_1789557291842.jpg';
import nairobiDevClass from '../assets/images/nairobi_dev_class_1789557305446.jpg';
import engineerMentoring from '../assets/images/engineer_mentoring_1789557321566.jpg';
import { SiteSettings } from '../types';

interface HeroProps {
  onExplorePrograms?: () => void;
  onApplyNow?: () => void;
  onOpenTracker?: () => void;
  onTakeQuiz?: () => void;
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
  onTakeQuiz,
  siteSettings
}) => {
  const heroTitle = siteSettings?.hero_title || "Launch Your Tech Career in Software, Data, & AI with Code Point Kenya";
  const heroEyebrow = siteSettings?.hero_eyebrow || "Online-First Training + Physical Campus Lab (Ngong Road, Nairobi)";
  const heroIntro = siteSettings?.hero_introduction || "Kenya’s premier career-accelerator coding school. Learn through intensive, project-driven cohorts taught by senior engineers from Nairobi’s top tech ecosystems. Flexible online evening sessions combined with 24/7 access to our physical innovation lab at Ngong Road, Teamshark, 5th Floor.";
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
    <motion.section 
      id="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
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
        <div className="max-w-4xl space-y-6 sm:space-y-7">
          <motion.div 
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.14] min-h-[100px] sm:min-h-[120px] flex flex-col justify-center">
                  <span>
                    {activeSlide.headlinePrefix}
                    <span className="theme-gradient-text">
                      {activeSlide.headlineHighlight}
                    </span>
                    {activeSlide.headlineSuffix}
                  </span>
                </h1>

                <p className="text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed mt-2.5">
                  {activeSlide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Streamlined Feature Bar - Icons Only */}
            <div className="flex items-center gap-2.5 pt-1">
              <div 
                title="4 Real-World Projects"
                aria-label="4 Real-World Projects"
                className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 flex items-center justify-center hover:border-emerald-500/40 transition-colors shadow-sm"
              >
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>

              <div 
                title="Flexible Installments"
                aria-label="Flexible Installments"
                className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 flex items-center justify-center hover:border-emerald-500/40 transition-colors shadow-sm"
              >
                <CreditCard className="w-5 h-5 text-emerald-400" />
              </div>

              <div 
                title="Ngong Rd Physical Lab"
                aria-label="Ngong Rd Physical Lab"
                className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800/80 flex items-center justify-center hover:border-emerald-500/40 transition-colors shadow-sm"
              >
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-3">
              <button
                onClick={onApplyNow}
                style={{ backgroundColor: 'var(--primary-color)' }}
                className="flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-xl text-slate-950 text-sm font-bold shadow-lg hover:brightness-110 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>{heroCtaText || "Apply Now"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onTakeQuiz && (
                <button
                  onClick={onTakeQuiz}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl theme-btn-secondary text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer backdrop-blur-md"
                >
                  <span>Take Quiz</span>
                  <Zap className="w-4 h-4 theme-text-primary fill-current" />
                </button>
              )}
              
              <button
                onClick={onExplorePrograms}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 text-sm font-medium transition-all hover:scale-[1.01] cursor-pointer backdrop-blur-md"
              >
                <span>Explore Programs</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={onOpenTracker}
                className="sm:hidden text-center text-xs text-slate-400 hover:text-white pt-1 underline"
              >
                Already applied? Track your application
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Alumni Working Across Africa & Global Remote Teams:
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2 text-slate-300 text-xs font-mono font-medium">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-750 transition-colors">
                  <Building2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Safaricom PLC</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-750 transition-colors">
                  <Building2 className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>Equity Bank Tech</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-750 transition-colors">
                  <Laptop className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span>Microsoft ADC</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-750 transition-colors">
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Flutterwave</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-750 transition-colors">
                  <Code2 className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Andela Network</span>
                </span>
              </div>
            </div>

          </motion.div>
        </div>

        {/* CAROUSEL CONTROLS */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex items-center justify-end gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              title={isPaused ? "Resume auto-play" : "Pause auto-play"}
              aria-label={isPaused ? "Resume auto-play" : "Pause auto-play"}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-slate-400" />}
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
    </motion.section>
  );
};
