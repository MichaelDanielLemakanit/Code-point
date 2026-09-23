import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';
import { SiteSettings, WhyStudySectionData, WhyStudyFeatureItem } from '../types';
import { renderCmsIcon } from '../utils/cmsIcons';

interface WhyStudySectionProps {
  siteSettings?: SiteSettings;
}

const DEFAULT_WHY_STUDY_DATA: WhyStudySectionData = {
  badge_text: 'The CodePoint Kenya Advantage',
  title: 'Why Study at CodePoint Kenya',
  subtitle: 'Built specifically for working professionals, university students, and career changers.',
  items: [
    {
      id: 'mentorship',
      title: '1-on-1 Mentorship & Code Reviews',
      badge: 'Direct Guidance',
      description: 'Get direct support from experienced software engineers to debug your code and review portfolio assignments.',
      icon_name: 'Users',
      benefits: [
        'Line-by-line pull request audits from tech leads',
        'Personalized office hours for architectural debugging',
        'Career readiness coaching & technical interview prep'
      ],
      outcome_text: 'Guaranteed Outcome',
      display_order: 1,
      is_visible: true
    },
    {
      id: 'projects',
      title: 'Practical Portfolio Projects',
      badge: 'Production-Grade',
      description: 'Graduate with real-world applications (E-commerce storefronts, REST APIs, database systems) deployed live on the web.',
      icon_name: 'Rocket',
      benefits: [
        'Production deployments with cloud hosting & custom domains',
        'Robust SQL schema design with security best practices',
        'Public GitHub repositories showcasing clean code commits'
      ],
      outcome_text: 'Guaranteed Outcome',
      display_order: 2,
      is_visible: true
    },
    {
      id: 'certificate',
      title: 'Verified Completion Certificate',
      badge: 'Industry Credential',
      description: 'Receive an official, verifiable certificate of completion to showcase your software development skills to employers.',
      icon_name: 'Award',
      benefits: [
        'Cryptographically verifiable serial number & QR code',
        'One-click LinkedIn credential and resume attachment',
        'Endorsed by hiring managers across Kenyan tech startups'
      ],
      outcome_text: 'Guaranteed Outcome',
      display_order: 3,
      is_visible: true
    }
  ]
};

export const WhyStudySection: React.FC<WhyStudySectionProps> = ({ siteSettings }) => {
  let sectionData: WhyStudySectionData = DEFAULT_WHY_STUDY_DATA;

  if (siteSettings?.why_study_section_json) {
    try {
      const parsed = JSON.parse(siteSettings.why_study_section_json);
      if (parsed && Array.isArray(parsed.items)) {
        sectionData = {
          badge_text: parsed.badge_text || DEFAULT_WHY_STUDY_DATA.badge_text,
          title: parsed.title || DEFAULT_WHY_STUDY_DATA.title,
          subtitle: parsed.subtitle || DEFAULT_WHY_STUDY_DATA.subtitle,
          items: parsed.items
        };
      }
    } catch (e) {
      console.warn('Failed to parse why_study_section_json:', e);
    }
  }

  const visibleItems = (sectionData.items || [])
    .filter(item => item.is_visible !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return (
    <section id="why-study" className="py-20 bg-slate-900 text-slate-100 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full theme-badge text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{sectionData.badge_text}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {sectionData.title}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {sectionData.subtitle}
          </p>
        </div>

        {/* Reason Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-200 group flex flex-col justify-between space-y-6 shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl theme-icon-box flex items-center justify-center group-hover:scale-105 transition-all">
                    {renderCmsIcon(item.icon_name, 'w-6 h-6 theme-text-primary')}
                  </div>
                  {item.badge && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium theme-badge">
                      {item.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-white transition-colors">
                  {item.title}
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed">
                  {item.description}
                </p>

                {item.benefits && item.benefits.length > 0 && (
                  <div className="pt-3 space-y-2.5">
                    {item.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 theme-text-primary shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="theme-text-primary font-medium">{item.outcome_text || 'Guaranteed Outcome'}</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
