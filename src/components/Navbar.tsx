import React, { useState } from 'react';
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

  const activeSection = useActiveSection([
    'hero',
    'career-quiz',
    'programs',
    'technologies',
    'schedules',
    'campus',
    'why-codepoint',
    'reviews',
    'tuition',
    'alumni',
    'contact'
  ], 140);

  const desktopNavItems = [
    { id: 'career-quiz', label: 'Career Quiz', icon: Compass, isSpecial: true },
    { id: 'programs', label: 'Programs' },
    { id: 'tuition', label: 'Tuition (KES)' },
    { id: 'campus', label: 'Campus & Lab' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'alumni', label: 'Alumni Stories' },
    { id: 'contact', label: 'Contact' },
  ];

  const mobileNavLinks = [
    { id: 'programs', label: 'Programs & Pricing' },
    { id: 'technologies', label: 'Technologies You Will Master' },
    { id: 'schedules', label: 'Flexible Class Schedules' },
    { id: 'why-codepoint', label: 'Why Study at CodePoint' },
    { id: 'campus', label: 'Online-First + Ngong Rd Lab' },
    { id: 'reviews', label: 'Reviews & Rating Wall' },
    { id: 'tuition', label: 'Tuition & Payment Plans' },
    { id: 'alumni', label: 'Alumni Stories & Careers' },
    { id: 'contact', label: 'Location & Contact' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(id);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Main Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-2 lg:gap-4">
        {/* Brand Logo */}
        <a 
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('hero');
          }}
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
        <nav className="hidden lg:flex items-center gap-1.5 2xl:gap-3 text-xs 2xl:text-sm font-medium text-slate-300 flex-nowrap whitespace-nowrap shrink-0">
          {desktopNavItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                className={`relative px-2.5 2xl:px-3 py-1.5 rounded-lg transition-colors text-xs 2xl:text-sm font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                  item.isSpecial
                    ? 'theme-btn-secondary font-semibold flex items-center gap-1.5 ml-0.5'
                    : isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && !item.isSpecial && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-lg bg-slate-850/90 border border-slate-700/70 shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  {item.icon && <item.icon className="w-3.5 h-3.5 theme-text-primary shrink-0" />}
                  <span className="whitespace-nowrap">{item.label}</span>
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
        <div className="hidden lg:flex items-center gap-2.5 flex-nowrap whitespace-nowrap shrink-0">
          {/* Admin CMS Button */}
          <button
            onClick={onOpenAdminCMS}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-800 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 theme-text-primary shrink-0" />
              <span className="whitespace-nowrap">Portal Login</span>
            </button>
          )}

          {/* Apply Now Button */}
          <button
            onClick={() => onOpenApply()}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-950 hover:brightness-110 px-3.5 py-1.5 rounded-xl shadow-md transition-all hover:translate-y-[-1px] cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="whitespace-nowrap">Apply Now</span>
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
                  e.preventDefault();
                  handleNavClick('career-quiz');
                }}
                className="text-left px-3 py-2 rounded-lg theme-btn-secondary font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 theme-text-primary" />
                <span>Career Path Quiz (60 Seconds)</span>
              </a>

              {mobileNavLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.id);
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
                  setMobileMenuOpen(false);
                  onOpenTracker();
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 theme-text-primary flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Track My Application Status
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminCMS();
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-amber-950/40 text-amber-400 flex items-center gap-2 border border-amber-500/20 bg-amber-500/5 font-semibold"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                Admin CMS Panel (Protected)
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPortal();
                }}
                className="w-full py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 theme-text-primary" />
                {currentUser ? `Access Portal (${currentUser.role})` : 'Access Student/Instructor Portal'}
              </button>
              <button
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
