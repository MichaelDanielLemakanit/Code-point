import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  MapPin, 
  Phone, 
  Mail, 
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
    'student-stories',
    'technologies',
    'schedules',
    'why-study',
    'model',
    'reviews',
    'curriculum',
    'contact'
  ], 140);

  const navItems = [
    { id: 'career-quiz', label: 'Career Quiz', icon: Compass, isSpecial: true },
    { id: 'programs', label: 'Programs' },
    { id: 'student-stories', label: 'Alumni Stories' },
    { id: 'technologies', label: 'Technologies' },
    { id: 'schedules', label: 'Schedules' },
    { id: 'why-study', label: 'Why CodePoint' },
    { id: 'model', label: 'Campus & Lab' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'curriculum', label: 'Tuition (KES)' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(id);
  };

  const cleanPhone = (siteSettings?.primary_phone || "0756295128").replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Notification / Contact Strip */}
      <div className="hidden lg:block bg-slate-900 border-b border-slate-800/80 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6 text-slate-300">
            <span className="flex items-center gap-1.5 theme-text-primary font-medium">
              <span className="relative flex h-2 w-2">
                <span 
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                />
                <span 
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                />
              </span>
              Next Intake Open: Online-First + Ngong Rd Lab Access
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <MapPin className="w-3.5 h-3.5 theme-text-primary" />
              {siteSettings?.address || "Ngong Road, Teamshark, 5th Floor, Nairobi"}
            </span>
            <a 
              href={`mailto:${siteSettings?.email || "info@codepointkenya.com"}`} 
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 theme-text-primary" />
              {siteSettings?.email || "info@codepointkenya.com"}
            </a>
          </div>

          <div className="flex items-center space-x-5 text-slate-300">
            <a 
              href={`https://wa.me/${cleanPhone || "254756295128"}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1.5 theme-text-primary hover:brightness-110 font-medium transition-colors font-mono"
            >
              <Phone className="w-3.5 h-3.5" />
              WhatsApp: {siteSettings?.primary_phone || "0756295128"}
            </a>
            <span className="text-slate-600">|</span>
            {/* Direct Admin CMS Trigger */}
            <button
              onClick={onOpenAdminCMS}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
              title="Restricted Administrator Access"
            >
              <Lock className="w-3 h-3" />
              <span>Admin CMS</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenTracker}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 theme-text-primary" />
              Track Application
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('hero')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          {siteSettings?.school_logo_url ? (
            <img 
              src={siteSettings.school_logo_url} 
              alt={siteSettings.brand_name || "Code Point Kenya"} 
              className="w-10 h-10 rounded-xl object-cover shadow-lg border border-slate-750" 
            />
          ) : (
            <div 
              style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform"
            >
              <Terminal className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                {siteSettings?.brand_name || "Code Point"}
              </span>
              {!siteSettings?.brand_name && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold theme-badge">
                  KENYA
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-mono">
              {siteSettings?.tagline || "Nairobi Tech Institute"}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-1 text-sm font-medium text-slate-300">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-2.5 py-1.5 rounded-lg transition-colors text-xs lg:text-sm font-medium cursor-pointer ${
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
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.icon && <item.icon className="w-3.5 h-3.5 theme-text-primary" />}
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pr-3">
              <button
                onClick={onOpenPortal}
                className="flex items-center gap-2 text-xs text-slate-200 hover:text-white font-medium px-2 py-1.5 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full theme-badge flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <span>{currentUser.name.split(' ')[0]} ({currentUser.role})</span>
              </button>
              <button
                onClick={onLogout}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors ml-1"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenPortal}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 theme-text-primary" />
              Portal Login
            </button>
          )}

          <button
            onClick={onOpenAdminCMS}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-2 rounded-xl transition-colors cursor-pointer"
            title="Dedicated Admin CMS Panel"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin CMS</span>
          </button>

          <button
            onClick={() => onOpenApply()}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-950 hover:brightness-110 px-4 py-2 rounded-xl shadow-md transition-all hover:translate-y-[-1px] cursor-pointer"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onOpenApply()}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="text-xs font-semibold text-slate-950 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            Apply
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3 overflow-hidden"
          >
            <div className="p-2.5 rounded-lg bg-slate-900 text-xs text-slate-300 space-y-1">
              <p className="theme-text-primary font-medium">📍 {siteSettings?.address || "Ngong Road, Teamshark, 5th Floor"}</p>
              <p>WhatsApp: {siteSettings?.primary_phone || "0756295128"} | {siteSettings?.email || "info@codepointkenya.com"}</p>
            </div>

            <div className="flex flex-col space-y-2 text-sm font-medium">
              <button
                onClick={() => handleNavClick('career-quiz')}
                className="text-left px-3 py-2 rounded-lg theme-btn-secondary font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 theme-text-primary" />
                <span>Career Path Quiz (60 Seconds)</span>
              </button>
              <button
                onClick={() => handleNavClick('programs')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Programs & Pricing (KES)
              </button>
              <button
                onClick={() => handleNavClick('technologies')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Technologies You Will Master
              </button>
              <button
                onClick={() => handleNavClick('schedules')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Flexible Class Schedules
              </button>
              <button
                onClick={() => handleNavClick('why-study')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Why Study at CodePoint
              </button>
              <button
                onClick={() => handleNavClick('model')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Online-First + Ngong Rd Lab
              </button>
              <button
                onClick={() => handleNavClick('reviews')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Reviews & Rating Wall
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-slate-200"
              >
                Location & Contact
              </button>
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
