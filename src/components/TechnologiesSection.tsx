import React from 'react';
import { 
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { SiteSettings, TechnologiesSectionData, TechCardItem } from '../types';
import { renderCmsIcon } from '../utils/cmsIcons';

interface TechnologiesSectionProps {
  siteSettings?: SiteSettings;
}

const DEFAULT_TECH_DATA: TechnologiesSectionData = {
  badge_text: 'Modern Industry Tooling',
  title: 'Technologies You Will Master',
  subtitle: 'Practical stack tailored for full-stack software roles',
  items: [
    {
      id: 'html-css',
      title: 'HTML5 & CSS3',
      category: 'Front-End Foundation',
      description: 'Semantic web structures and modern responsive design layouts.',
      icon_name: 'Layout',
      tags: ['Flexbox', 'Grid', 'Semantic HTML', 'CSS Variables'],
      display_order: 1,
      is_visible: true
    },
    {
      id: 'bootstrap',
      title: 'Bootstrap 5',
      category: 'UI Framework',
      description: 'Rapid front-end UI framework and responsive mobile components.',
      icon_name: 'Layers',
      tags: ['Responsive Grids', 'Components', 'Utilities', 'Mobile-First'],
      display_order: 2,
      is_visible: true
    },
    {
      id: 'javascript',
      title: 'JavaScript (ES6+)',
      category: 'Core Language',
      description: 'Client-side interactivity, DOM manipulation, and asynchronous JS.',
      icon_name: 'Braces',
      tags: ['Async/Await', 'Fetch API', 'DOM APIs', 'ES Modules'],
      display_order: 3,
      is_visible: true
    },
    {
      id: 'sql-postgres',
      title: 'SQL & PostgreSQL',
      category: 'Database Systems',
      description: 'Relational database design, queries, joins, and data management.',
      icon_name: 'Database',
      tags: ['Schema Design', 'Complex Joins', 'Indexing', 'ACID Transactions'],
      display_order: 4,
      is_visible: true
    },
    {
      id: 'python-flask',
      title: 'Python & Flask',
      category: 'Backend & APIs',
      description: 'Backend API routes, server rendering, authentication, and SQL integrations.',
      icon_name: 'Server',
      tags: ['REST APIs', 'SQLAlchemy', 'JWT Auth', 'Jinja Templates'],
      display_order: 5,
      is_visible: true
    },
    {
      id: 'git-vercel',
      title: 'Git & Vercel',
      category: 'DevOps & Deployment',
      description: 'Version control workflows, cloud deployment, and live hosting.',
      icon_name: 'GitBranch',
      tags: ['Git Branching', 'CI/CD Pipelines', 'Cloud Hosting', 'SSL/Domains'],
      display_order: 6,
      is_visible: true
    }
  ]
};

export const TechnologiesSection: React.FC<TechnologiesSectionProps> = ({ siteSettings }) => {
  let sectionData: TechnologiesSectionData = DEFAULT_TECH_DATA;

  if (siteSettings?.technologies_section_json) {
    try {
      const parsed = JSON.parse(siteSettings.technologies_section_json);
      if (parsed && Array.isArray(parsed.items)) {
        sectionData = {
          badge_text: parsed.badge_text || DEFAULT_TECH_DATA.badge_text,
          title: parsed.title || DEFAULT_TECH_DATA.title,
          subtitle: parsed.subtitle || DEFAULT_TECH_DATA.subtitle,
          items: parsed.items
        };
      }
    } catch (e) {
      console.warn('Failed to parse technologies_section_json:', e);
    }
  }

  const visibleItems = (sectionData.items || [])
    .filter(item => item.is_visible !== false)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return (
    <section id="technologies" className="py-20 bg-slate-900 text-slate-100 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>{sectionData.badge_text}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {sectionData.title}
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {sectionData.subtitle}
          </p>
        </div>

        {/* Technology Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {visibleItems.map((tech) => (
            <div
              key={tech.id}
              className="p-6 sm:p-7 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-200 group flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 transition-all">
                    {renderCmsIcon(tech.icon_name, 'w-6 h-6 text-emerald-400')}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                    {tech.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                  {tech.title}
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed mt-2.5">
                  {tech.description}
                </p>
              </div>

              {/* Skills / Concept Tags */}
              {tech.tags && tech.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-850">
                  <div className="flex flex-wrap gap-1.5">
                    {tech.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400/70" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
