import React from 'react';
import { 
  Terminal, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  ExternalLink, 
  ShieldCheck, 
  Heart,
  ArrowUp,
  Lock
} from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  onOpenApply: () => void;
  onOpenTracker: () => void;
  onOpenPortal: () => void;
  onOpenAdminCMS: () => void;
  onNavigateSection: (sectionId: string) => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenApply,
  onOpenTracker,
  onOpenPortal,
  onOpenAdminCMS,
  onNavigateSection,
  siteSettings
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Col 1: Brand & Operating Model (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white">
                <Terminal className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight">{siteSettings?.brand_name || "Code Point Kenya"}</span>
                <span className="block text-[11px] text-emerald-400 font-mono">Nairobi Tech Institute</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs">
              {siteSettings?.tagline ? `${siteSettings.tagline}. ` : ''}Code Point Kenya is an online-first coding and tech institution with a physical collaborative lab based in Nairobi. We equip ambitious Africans with high-demand engineering, data, and AI skills.
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Physical Campus & Offices:</span>
              </div>
              <p className="text-xs text-white">
                {siteSettings?.address || "Ngong Road, Teamshark, 5th Floor, Nairobi, Kenya"}
              </p>
            </div>
          </div>

          {/* Col 2: Programs (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Core Tech Programs
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigateSection('programs')} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Software Engineering (16 Wks • KES 85K)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('programs')} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Data Science & Analytics (16 Wks • KES 75K)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('programs')} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Applied AI & Large Language Models (14 Wks • KES 95K)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('programs')} 
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Cybersecurity & Ethical Hacking (16 Wks • KES 80K)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Admissions & Portals (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Admissions & Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={onOpenApply} 
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-left"
                >
                  Apply for Next Intake
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenTracker} 
                  className="hover:text-white transition-colors text-left"
                >
                  Track Application Status
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenPortal} 
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student & Staff Portal</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenAdminCMS} 
                  className="text-amber-400 hover:text-amber-300 transition-colors text-left flex items-center gap-1.5 font-medium"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin CMS Panel</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('technologies')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Technologies You Master
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('schedules')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Flexible Class Schedules
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('why-study')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Why CodePoint Kenya
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigateSection('model')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Ngong Rd Lab Booking
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Contact & Socials (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Official Contact Info
            </h4>
            <div className="space-y-2.5">
              <a
                href={`https://wa.me/${(siteSettings?.primary_phone || "0756295128").replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: {siteSettings?.primary_phone || "0756295128"}</span>
              </a>

              <a
                href={`mailto:${siteSettings?.email || "info@codepointkenya.com"}`}
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{siteSettings?.email || "info@codepointkenya.com"}</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Instagram: {siteSettings?.social_instagram || "Code Point Kenya"}</span>
              </a>

              <div className="pt-2 text-[11px] text-slate-500">
                Operating Model: Online-First Live Instruction + Physical Hub at {siteSettings?.address || "Ngong Road, Teamshark 5th Floor, Nairobi"}.
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Sub-Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} {siteSettings?.brand_name || "Code Point Kenya"}. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdminCMS}
              className="text-amber-400/80 hover:text-amber-300 flex items-center gap-1 cursor-pointer text-xs"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Access</span>
            </button>
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
