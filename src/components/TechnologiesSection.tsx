import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2
} from 'lucide-react';
import { SiteSettings, TechnologiesSectionData, TechCardItem } from '../types';

interface TechnologiesSectionProps {
  siteSettings?: SiteSettings;
}

export interface TechBrandStyle {
  iconClass: string;
  containerClass: string;
  iconColor: string;
  glowClass: string;
  badgeClass: string;
  tagCheckColor: string;
}

export function getTechCardBrandStyle(tech: TechCardItem): TechBrandStyle {
  const id = (tech.id || '').toLowerCase();
  const title = (tech.title || '').toLowerCase();
  const icon = (tech.icon_name || '').toLowerCase();

  // 1. HTML5 & CSS3
  // Brand color: Blue for HTML/CSS
  if (id === 'html-css' || title.includes('html') || title.includes('css') || icon.includes('html') || icon === 'layout') {
    const iconClass = icon.startsWith('bi-') ? icon : 'bi-filetype-html';
    return {
      iconClass,
      containerClass: 'bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40 group-hover:bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_24px_rgba(59,130,246,0.35)]',
      iconColor: 'text-blue-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.65)]',
      badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      tagCheckColor: 'text-blue-400'
    };
  }

  // 2. Bootstrap 5
  // Brand color: Purple for Bootstrap
  if (id === 'bootstrap' || title.includes('bootstrap') || icon.includes('bootstrap') || icon === 'layers') {
    const iconClass = icon.startsWith('bi-') ? icon : 'bi-bootstrap-fill';
    return {
      iconClass,
      containerClass: 'bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40 group-hover:bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] group-hover:shadow-[0_0_24px_rgba(168,85,247,0.35)]',
      iconColor: 'text-purple-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.65)]',
      badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      tagCheckColor: 'text-purple-400'
    };
  }

  // 3. JavaScript (ES6+)
  // Brand color: Yellow for JS
  if (id === 'javascript' || title.includes('javascript') || title.includes('js') || icon.includes('javascript') || icon === 'braces') {
    const iconClass = icon.startsWith('bi-') ? icon : 'bi-filetype-js';
    return {
      iconClass,
      containerClass: 'bg-amber-500/10 border-yellow-500/20 group-hover:border-yellow-500/40 group-hover:bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.15)] group-hover:shadow-[0_0_24px_rgba(234,179,8,0.35)]',
      iconColor: 'text-yellow-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(250,204,21,0.65)]',
      badgeClass: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
      tagCheckColor: 'text-yellow-400'
    };
  }

  // 4. SQL & PostgreSQL
  // Brand color: Blue/Cyan for SQL
  if (id === 'sql-postgres' || title.includes('sql') || title.includes('postgres') || icon.includes('postgres') || icon === 'database') {
    const iconClass = icon.startsWith('bi-') ? icon : 'bi-database-fill-gear';
    return {
      iconClass,
      containerClass: 'bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_24px_rgba(6,182,212,0.35)]',
      iconColor: 'text-cyan-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(6,182,212,0.65)]',
      badgeClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
      tagCheckColor: 'text-cyan-400'
    };
  }

  // 5. Python & Flask
  // Brand color: Emerald/Green for Python
  if (id === 'python-flask' || title.includes('python') || title.includes('flask') || icon.includes('python') || icon === 'server') {
    const iconClass = icon.startsWith('bi-') ? icon : 'bi-filetype-py';
    return {
      iconClass,
      containerClass: 'bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_24px_rgba(16,185,129,0.35)]',
      iconColor: 'text-emerald-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.65)]',
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      tagCheckColor: 'text-emerald-400'
    };
  }

  // 6. Git & Vercel
  // Brand color: Coral/Rose for Git
  if (id === 'git-vercel' || title.includes('git') || title.includes('vercel') || icon.includes('git') || icon === 'gitbranch') {
    const iconClass = icon.startsWith('bi-') ? icon : 'bi-git';
    return {
      iconClass,
      containerClass: 'bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40 group-hover:bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] group-hover:shadow-[0_0_24px_rgba(244,63,94,0.35)]',
      iconColor: 'text-rose-400',
      glowClass: 'drop-shadow-[0_0_10px_rgba(244,63,94,0.65)]',
      badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      tagCheckColor: 'text-rose-400'
    };
  }

  // Custom or fallback
  const iconClass = icon.startsWith('bi-') ? icon : 'bi-code-slash';
  return {
    iconClass,
    containerClass: 'bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40 group-hover:bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_24px_rgba(59,130,246,0.35)]',
    iconColor: 'text-blue-400',
    glowClass: 'drop-shadow-[0_0_10px_rgba(59,130,246,0.65)]',
    badgeClass: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    tagCheckColor: 'text-blue-400'
  };
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
      icon_name: 'bi-filetype-html',
      tags: ['Flexbox', 'Grid', 'Semantic HTML', 'CSS Variables'],
      display_order: 1,
      is_visible: true
    },
    {
      id: 'bootstrap',
      title: 'Bootstrap 5',
      category: 'UI Framework',
      description: 'Rapid front-end UI framework and responsive mobile components.',
      icon_name: 'bi-bootstrap-fill',
      tags: ['Responsive Grids', 'Components', 'Utilities', 'Mobile-First'],
      display_order: 2,
      is_visible: true
    },
    {
      id: 'javascript',
      title: 'JavaScript (ES6+)',
      category: 'Core Language',
      description: 'Client-side interactivity, DOM manipulation, and asynchronous JS.',
      icon_name: 'bi-filetype-js',
      tags: ['Async/Await', 'Fetch API', 'DOM APIs', 'ES Modules'],
      display_order: 3,
      is_visible: true
    },
    {
      id: 'sql-postgres',
      title: 'SQL & PostgreSQL',
      category: 'Database Systems',
      description: 'Relational database design, queries, joins, and data management.',
      icon_name: 'bi-database-fill-gear',
      tags: ['Schema Design', 'Complex Joins', 'Indexing', 'ACID Transactions'],
      display_order: 4,
      is_visible: true
    },
    {
      id: 'python-flask',
      title: 'Python & Flask',
      category: 'Backend & APIs',
      description: 'Backend API routes, server rendering, authentication, and SQL integrations.',
      icon_name: 'bi-filetype-py',
      tags: ['REST APIs', 'SQLAlchemy', 'JWT Auth', 'Jinja Templates'],
      display_order: 5,
      is_visible: true
    },
    {
      id: 'git-vercel',
      title: 'Git & Vercel',
      category: 'DevOps & Deployment',
      description: 'Version control workflows, cloud deployment, and live hosting.',
      icon_name: 'bi-git',
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
    <motion.section 
      id="technologies" 
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1, margin: '-40px 0px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-full overflow-x-hidden py-20 bg-slate-900 text-slate-100 border-t border-slate-800 relative scroll-mt-20"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {sectionData.title}
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {sectionData.subtitle}
          </p>
        </div>

        {/* Technology Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
          {visibleItems.map((tech, index) => {
            const brand = getTechCardBrandStyle(tech);

            return (
              <motion.div
                key={tech.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
                whileHover={{ y: -4 }}
                className="p-6 sm:p-7 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-200 group flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    {/* Authentic Tech Icon Container with Crisp Sizing & Glowing Accent */}
                    <div 
                      className={`p-3 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-all duration-300 ${brand.containerClass}`}
                      title={tech.title}
                    >
                      <i 
                        className={`bi ${brand.iconClass} text-2xl w-7 h-7 flex items-center justify-center ${brand.iconColor} ${brand.glowClass} leading-none`}
                        aria-hidden="true"
                      />
                    </div>
                    
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${brand.badgeClass}`}>
                      {tech.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-white transition-colors">
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
                          <CheckCircle2 className={`w-3 h-3 ${brand.tagCheckColor} opacity-90`} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
};
