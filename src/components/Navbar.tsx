import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  User as UserIcon, 
  Menu, 
  X, 
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Lock,
  Compass
} from 'lucide-react';
import { User, SiteSettings } from '../types';
import { useActiveSection } from '../hooks/useActiveSection';
import { AnnouncementBanner } from './AnnouncementBanner';

interface NavbarProps {
  currentUser: User | null;
  onOpenApply: (courseId?: string) => void;
  onOpenTracker: () => void;
  onOpenPortal: () => void;
  onOpenAdminCMS: () => void;
  onNavigateSection: (sectionId: string) => void;
  onLogout: () => void;
  siteSettings?: SiteSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenApply,
  onOpenTracker,
  onOpenPortal,
  onOpenAdminCMS,
  onNavigateSection,
  onLogout,
  siteSettings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const activeSection = useActiveSection([
    'hero',
    'career-quiz',
    'programs',
    'technologies',
    'schedules',
    'why-codepoint',
    'campus',
    'reviews',
    'tuition',
    'alumni',
    'contact'
  ], 140);

  const navLinks = [
    { id: 'programs', label: 'Programs & Pricing', desktopLabel: 'Programs' },
    { id: 'technologies', label: 'Technologies You Will Master', desktopLabel: 'Technologies' },
    { id: 'schedules', label: 'Flexible Class Schedules', desktopLabel: 'Schedules' },
    { id: 'why-codepoint', label: 'Why Study at CodePoint', desktopLabel: 'Why Us' },
    { id: 'campus', label: 'Online-First + Ngong Rd Lab', desktopLabel: 'Campus & Lab' },
    { id: 'reviews', label: 'Reviews & Rating Wall', desktopLabel: 'Reviews' },
    { id: 'tuition', label: 'Tuition & Payment Plans', desktopLabel: 'Tuition' },
    { id: 'alumni', label: 'Alumni Stories & Careers', desktopLabel: 'Alumni' },
    { id: 'contact', label: 'Location & Contact', desktopLabel: 'Contact' },
  ];

  const handleNavClick = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    closeMobileMenu();

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      try {
        window.history.pushState(null, '', `#${id}`);
      } catch (_) {}
    } else if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        window.history.pushState(null, '', '#');
      } catch (_) {}
    }

    if (typeof onNavigateSection === 'function') {
      onNavigateSection(id);
    }
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-200 ${
      isScrolled 
        ? 'bg-slate-950/85 backdrop-blur-md border-b border-slate-800/60 shadow-xl shadow-black/30' 
        : 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 shadow-sm'
    } text-slate-100`}>
      {/* Top-Bar Announcement Banner for Upcoming Intake & Next Cohort */}
      <AnnouncementBanner
        siteSettings={siteSettings}
        onApplyNow={() => onOpenApply()}
      />

      {/* Main Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 lg:gap-3">
        {/* Brand Logo */}
        <a 
          href="#hero"
          onClick={(e) => handleNavClick('hero', e)}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none min-w-0 shrink-0"
        >
          {siteSettings?.school_logo_url && (
            <img 
              src={siteSettings.school_logo_url} 
              alt={siteSettings.brand_name || "Code Point Kenya"} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover shadow-lg border border-slate-750 shrink-0" 
            />
          )}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white font-sans whitespace-nowrap">
              {siteSettings?.brand_name || "Code Point Kenya"}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links (Visible on lg: 1024px and above) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-2 text-[11px] xl:text-xs 2xl:text-sm font-medium text-slate-300 flex-nowrap whitespace-nowrap shrink-0">
          {/* Career Path Quiz Link */}
          <a
            href="#career-quiz"
            onClick={(e) => handleNavClick('career-quiz', e)}
            className={`relative px-2 py-1 xl:px-2.5 xl:py-1.5 rounded-lg transition-colors font-semibold cursor-pointer whitespace-nowrap shrink-0 theme-btn-secondary flex items-center gap-1.5 ${
              activeSection === 'career-quiz' ? 'brightness-110 shadow-sm' : ''
            }`}
            title="Interactive Career Path Quiz (60 Seconds)"
          >
            <Compass className="w-3.5 h-3.5 theme-text-primary shrink-0" />
            <span className="whitespace-nowrap">Quiz</span>
          </a>

          {navLinks.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                title={item.label}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`relative px-1.5 py-1 xl:px-2 xl:py-1.5 2xl:px-2.5 rounded-lg transition-colors font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-lg bg-slate-850/90 border border-slate-700/70 shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 whitespace-nowrap shrink-0">
                  {item.desktopLabel || item.label}
                </span>
              </a>
            );
          })}
        </nav>

        {/* Mobile & Tablet Header Right (strictly Quick Action "Admin CMS" or "Portal" + Hamburger Icon only) */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <button
            onClick={onOpenAdminCMS}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Admin CMS"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Admin CMS</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-slate-200" />}
          </button>
        </div>

        {/* Desktop Header Right (Visible on lg: 1024px and above) */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 flex-nowrap whitespace-nowrap shrink-0">
          {/* Admin CMS Button */}
          <button
            onClick={onOpenAdminCMS}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 xl:px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="Dedicated Admin CMS Panel"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">Admin CMS</span>
          </button>

          {/* Portal Login / User Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pr-3 shrink-0 whitespace-nowrap">
              <button
                onClick={onOpenPortal}
                className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white font-medium px-2 py-1.5 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full theme-badge flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="whitespace-nowrap">{currentUser.name.split(' ')[0]} ({currentUser.role})</span>
              </button>
              <button
                onClick={onLogout}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors ml-1 whitespace-nowrap shrink-0 cursor-pointer"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenPortal}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 theme-text-primary shrink-0" />
              <span className="whitespace-nowrap">Portal</span>
            </button>
          )}

          {/* Apply Now Button */}
          <button
            onClick={() => onOpenApply()}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-950 hover:brightness-110 px-3 py-1.5 rounded-xl shadow-md transition-all hover:translate-y-[-1px] cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="whitespace-nowrap">Apply</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Slide-Over Menu (screens below lg: 1024px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3.5 max-h-[calc(100vh-4.5rem)] overflow-y-auto shadow-2xl"
          >
            <div className="p-2.5 rounded-lg bg-slate-900 text-xs text-slate-300 space-y-1">
              <p className="theme-text-primary font-medium">📍 {siteSettings?.address || "Ngong Road, Teamshark, 5th Floor"}</p>
              <p>WhatsApp: {siteSettings?.primary_phone || "0756295128"} | {siteSettings?.email || "info@codepointkenya.com"}</p>
            </div>

            <div className="flex flex-col space-y-1.5 text-sm font-medium">
              <a
                href="#career-quiz"
                onClick={(e) => {
                  closeMobileMenu();
                  handleNavClick('career-quiz', e);
                }}
                className="text-left px-3 py-2 rounded-lg theme-btn-secondary font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 theme-text-primary" />
                <span>Career Path Quiz (60 Seconds)</span>
              </a>

              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => {
                      closeMobileMenu();
                      handleNavClick(link.id, e);
                    }}
                    className={`text-left px-3 py-2 rounded-lg transition-colors cursor-pointer block ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold border-l-2 theme-text-primary'
                        : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenTracker();
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 theme-text-primary flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Track My Application Status
              </button>
              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenAdminCMS();
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-amber-950/40 text-amber-400 flex items-center gap-2 border border-amber-500/20 bg-amber-500/5 font-semibold cursor-pointer"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                Admin CMS Panel (Protected)
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenPortal();
                }}
                className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 theme-text-primary" />
                {currentUser ? `Access Portal (${currentUser.role})` : 'Access Student/Instructor Portal'}
              </button>
              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenApply();
                }}
                style={{ backgroundColor: 'var(--primary-color)' }}
                className="w-full py-2.5 rounded-xl text-slate-950 text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                Apply for Upcoming Intake
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
