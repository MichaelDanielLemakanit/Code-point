import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { User, SiteSettings } from '../types';

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
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Next Intake Open: Online-First + Ngong Rd Lab Access
            </span>
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {siteSettings?.address || "Ngong Road, Teamshark, 5th Floor, Nairobi"}
            </span>
            <a 
              href={`mailto:${siteSettings?.email || "info@codepointkenya.com"}`} 
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              {siteSettings?.email || "info@codepointkenya.com"}
            </a>
          </div>

          <div className="flex items-center space-x-5 text-slate-300">
            <a 
              href={`https://wa.me/${cleanPhone || "254756295128"}`} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors font-mono"
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
              className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5 text-emerald-100" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                {siteSettings?.brand_name || "Code Point"}
              </span>
              {!siteSettings?.brand_name && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNavClick('programs')}
            className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900 transition-colors text-xs lg:text-sm"
          >
            Programs
          </button>
          <button
            onClick={() => handleNavClick('technologies')}
            className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900 transition-colors text-xs lg:text-sm"
          >
            Technologies
          </button>
          <button
            onClick={() => handleNavClick('schedules')}
            className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900 transition-colors text-xs lg:text-sm"
          >
            Schedules
          </button>
          <button
            onClick={() => handleNavClick('why-study')}
            className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900 transition-colors text-xs lg:text-sm"
          >
            Why CodePoint
          </button>
          <button
            onClick={() => handleNavClick('model')}
            className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900 transition-colors text-xs lg:text-sm"
          >
            Campus & Lab
          </button>
          <button
            onClick={() => handleNavClick('reviews')}
            className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900 transition-colors text-xs lg:text-sm"
          >
            Reviews
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="px-2.5 py-1.5 rounded-lg hover:text-white hover:bg-slate-900 transition-colors text-xs lg:text-sm"
          >
            Contact
          </button>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pr-3">
              <button
                onClick={onOpenPortal}
                className="flex items-center gap-2 text-xs text-slate-200 hover:text-emerald-400 font-medium px-2 py-1.5 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs uppercase">
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
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
            style={{ backgroundColor: siteSettings?.primary_cta_color || undefined }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:brightness-110 px-4 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:translate-y-[-1px]"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onOpenApply()}
            style={{ backgroundColor: siteSettings?.primary_cta_color || undefined }}
            className="text-xs font-semibold text-slate-950 bg-emerald-400 px-3 py-1.5 rounded-lg"
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
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <div className="p-2.5 rounded-lg bg-slate-900 text-xs text-slate-300 space-y-1">
            <p className="text-emerald-400 font-medium">📍 {siteSettings?.address || "Ngong Road, Teamshark, 5th Floor"}</p>
            <p>WhatsApp: {siteSettings?.primary_phone || "0756295128"} | {siteSettings?.email || "info@codepointkenya.com"}</p>
          </div>

          <div className="flex flex-col space-y-2 text-sm font-medium">
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
              className="text-left px-3 py-2 rounded-lg hover:bg-slate-900 text-emerald-400 flex items-center gap-2"
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
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {currentUser ? `Access Portal (${currentUser.role})` : 'Access Student/Instructor Portal'}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApply();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-md"
            >
              Apply for Upcoming Intake
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
