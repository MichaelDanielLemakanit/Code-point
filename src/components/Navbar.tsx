import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck,
  ChevronDown,
  Lock
} from 'lucide-react';
import { User, SiteSettings } from '../types';
import { useActiveSection } from '../hooks/useActiveSection';
import { AnnouncementBanner } from './AnnouncementBanner';
import { ThemeModeToggle } from './ThemeModeToggle';

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
    'programs',
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
    // 2. AUTO-CLOSE MOBILE MENU ON SELECTION
    setMobileMenuOpen(false);

    const cleanId = id.replace(/^#/, '');

    // 1. ENABLE CLICK & ROUTING HANDLERS ON MOBILE NAV ITEMS
    if (cleanId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        window.history.pushState(null, '', '#');
      } catch (_) {}
    } else {
      const selector = `#${cleanId}`;
      const element = document.querySelector(selector) || document.getElementById(cleanId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
          window.history.pushState(null, '', selector);
        } catch (_) {}
      }

      // Secondary smooth-scroll trigger ensures accurate target placement once menu collapse starts
      setTimeout(() => {
        const delayedEl = document.querySelector(selector) || document.getElementById(cleanId);
        if (delayedEl) {
          delayedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    if (typeof onNavigateSection === 'function') {
      onNavigateSection(cleanId);
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
    <header 
      style={{ backgroundColor: 'var(--nav-bg, rgba(2, 6, 23, 0.85))' }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-200 backdrop-blur-md border-b border-slate-800/60 ${
        isScrolled 
          ? 'shadow-xl shadow-black/30' 
          : 'shadow-sm'
      } text-slate-900 dark:text-slate-100`}
    >
      {/* Top-Bar Announcement Banner for Upcoming Intake & Next Cohort */}
      <AnnouncementBanner
        siteSettings={siteSettings}
        onApplyNow={() => onOpenApply()}
      />

      {/* Main Navigation Bar */}
      <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 lg:gap-4 xl:gap-6">
        
        {/* ========================================================================= */}
        {/* LEFT SECTION: Brand Logo & Title (Fixed / Content-Based Width)            */}
        {/* ========================================================================= */}
        <div className="flex items-center flex-shrink-0">
          <a 
            href="#hero"
            onClick={(e) => handleNavClick('hero', e)}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none flex-shrink-0"
          >
            {siteSettings?.school_logo_url && (
              <img 
                src={siteSettings.school_logo_url} 
                alt={siteSettings.brand_name || "Code Point Kenya"} 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover shadow-lg border border-slate-750 shrink-0" 
              />
            )}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans whitespace-nowrap">
                {siteSettings?.brand_name || "Code Point Kenya"}
              </span>
            </div>
          </a>
        </div>

        {/* ========================================================================= */}
        {/* CENTER SECTION: Perfectly Centered Navigation Links List                  */}
        {/* ========================================================================= */}
        <nav 
          aria-label="Primary navigation"
          className="hidden lg:flex flex-1 justify-center items-center gap-1.5 xl:gap-2.5 2xl:gap-4 mx-auto min-w-0 overflow-x-auto no-scrollbar py-1"
        >
          {navLinks.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                title={item.label}
                onClick={(e) => handleNavClick(item.id, e)}
                className={`relative px-1.5 py-1 xl:px-2 xl:py-1.5 2xl:px-2.5 rounded-lg transition-colors text-xs xl:text-sm font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-900/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-lg bg-slate-200/80 dark:bg-slate-850/90 border border-slate-300/80 dark:border-slate-700/70 shadow-xs"
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

        {/* ========================================================================= */}
        {/* RIGHT SECTION: Controls (Theme Toggle, Admin CMS, User/Portal, Apply)     */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
          {/* Mobile Right Controls (< lg) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminCMS();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 pointer-events-auto"
              title="Admin CMS"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Admin CMS</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0 pointer-events-auto"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900 dark:text-white" /> : <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />}
            </button>
          </div>

          {/* Desktop Right Controls (lg+) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 2xl:gap-3 flex-nowrap whitespace-nowrap flex-shrink-0">
            {/* Theme Mode Segmented Control (Auto / System, Dark, Light) */}
            <ThemeModeToggle size="sm" variant="auto" />

            {/* Admin CMS Button */}
            <button
              onClick={onOpenAdminCMS}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 xl:px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Dedicated Admin CMS Panel"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">Admin CMS</span>
            </button>

            {/* User Profile (when authenticated) */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 pr-3 shrink-0 whitespace-nowrap">
                <button
                  onClick={onOpenPortal}
                  className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-medium px-2 py-1.5 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full theme-badge flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="whitespace-nowrap">{currentUser.name.split(' ')[0]} ({currentUser.role})</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors ml-1 whitespace-nowrap shrink-0 cursor-pointer"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Backdrop Overlay (screens below lg: 1024px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden pointer-events-auto"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile & Tablet Slide-Over Menu (screens below lg: 1024px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ backgroundColor: 'var(--color-canvas-surface, #020617)' }}
            className="relative z-40 lg:hidden border-b border-slate-800 px-4 pt-3 pb-6 space-y-3.5 max-h-[calc(100vh-4.5rem)] overflow-y-auto shadow-2xl pointer-events-auto"
          >
            <div className="p-2.5 rounded-lg bg-slate-900 text-xs text-slate-300 space-y-1">
              <p className="theme-text-primary font-medium">📍 {siteSettings?.address || "Ngong Road, Teamshark, 5th Floor"}</p>
              <p>WhatsApp: {siteSettings?.primary_phone || "0756295128"} | {siteSettings?.email || "info@codepointkenya.com"}</p>
            </div>

            <div className="flex flex-col space-y-1.5 text-sm font-medium">
              {/* Section Anchor Navigation Links */}
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => handleNavClick(link.id, e)}
                    className={`text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer block relative z-20 pointer-events-auto ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold border-l-2 theme-text-primary'
                        : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}

              {/* Track My Application Status */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTracker();
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-900 theme-text-primary flex items-center gap-2 cursor-pointer relative z-20 pointer-events-auto transition-colors"
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>Track My Application Status</span>
              </button>

              {/* Admin CMS Panel */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminCMS();
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-amber-950/40 text-amber-400 flex items-center gap-2 border border-amber-500/20 bg-amber-500/5 font-semibold cursor-pointer relative z-20 pointer-events-auto transition-colors"
              >
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Admin CMS Panel (Protected)</span>
              </button>

              {/* Theme Mode Segmented Control (Mobile) */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Theme Appearance</span>
                <ThemeModeToggle size="xs" variant="auto" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2 relative z-20 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPortal();
                }}
                className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-slate-850"
              >
                <ShieldCheck className="w-4 h-4 theme-text-primary shrink-0" />
                <span>{currentUser ? `Access Portal (${currentUser.role})` : 'Access Student/Instructor Portal'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
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
