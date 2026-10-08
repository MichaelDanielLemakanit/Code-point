import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  BookOpen,
  X,
  Layers,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { Course, SiteSettings } from '../types';

interface ProgramsCatalogProps {
  courses: Course[];
  loading: boolean;
  onApplyCourse: (courseId: string) => void;
  siteSettings?: SiteSettings;
}

export const ProgramsCatalog: React.FC<ProgramsCatalogProps> = ({
  courses,
  loading,
  onApplyCourse,
  siteSettings
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<Course | null>(null);

  // Dynamic brand/theme color resolution
  const themeColor = siteSettings?.primary_cta_color || 'var(--primary-color, #10b981)';
  const secondaryThemeColor = siteSettings?.secondary_cta_color || 'var(--secondary-color, #06b6d4)';

  // Helper to safely generate rgba colors from hex or css variables
  const getRgba = (colorStr: string, alpha: number) => {
    if (colorStr.startsWith('#')) {
      let clean = colorStr.replace('#', '').trim();
      if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
      const num = parseInt(clean, 16);
      if (!isNaN(num) && clean.length === 6) {
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
    return `rgba(var(--primary-rgb, 16, 185, 129), ${alpha})`;
  };

  const categories = ['All', 'Software Development', 'Data & Analytics', 'Artificial Intelligence', 'Security & Infrastructure'];

  const filteredCourses = activeCategory === 'All'
    ? courses
    : courses.filter(c => c.category === activeCategory);

  const toggleProgram = (courseId: string) => {
    setExpandedProgramId(prev => (prev === courseId ? null : courseId));
  };

  const getCourseIcon = (slug: string) => {
    const iconProps = { className: "w-5 h-5", style: { color: themeColor } };
    switch (slug) {
      case 'software-engineering':
      case 'full-stack-software-engineering':
        return <Terminal {...iconProps} />;
      case 'data-science':
      case 'data-science-applied-ai':
        return <Database {...iconProps} />;
      case 'applied-ai':
        return <Cpu {...iconProps} />;
      case 'cybersecurity':
      case 'cyber-security-microservices':
        return <ShieldCheck {...iconProps} />;
      default:
        return <Layers {...iconProps} />;
    }
  };

  const getFallbackImage = (category: string, slug: string) => {
    const cat = (category || '').toLowerCase();
    const s = (slug || '').toLowerCase();
    if (cat.includes('ai') || cat.includes('artificial') || s.includes('ai')) {
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop';
    }
    if (cat.includes('security') || cat.includes('infrastructure') || s.includes('security') || s.includes('cyber')) {
      return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop';
    }
    if (cat.includes('data') || s.includes('data')) {
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop';
    }
    return 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=1200&auto=format&fit=crop';
  };

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <motion.section 
      id="programs" 
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: '-40px 0px' }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-full overflow-x-hidden py-20 text-slate-900 dark:text-slate-100 relative scroll-mt-20 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div 
            style={{ 
              backgroundColor: getRgba(themeColor, 0.12),
              color: themeColor,
              borderColor: getRgba(themeColor, 0.3)
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border shadow-xs"
          >
            <span>Industry-Standard Curricula</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Transformative Tech Programs in Nairobi
          </h2>
        </div>

        {/* Category Filter Pills with Dynamic Theme Color */}
        <div className="w-full max-w-full flex flex-wrap items-center justify-center gap-2 mt-8 px-1">
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={isActive ? { backgroundColor: themeColor, color: '#020617' } : undefined}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'shadow-md scale-102'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="programsCategoryPill"
                    style={{ backgroundColor: themeColor }}
                    className="absolute inset-0 rounded-xl shadow-md -z-0"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Courses 3-Column Compact Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 items-start">
            {[1, 2, 3].map(i => (
              <div key={i} className="max-w-[400px] w-full mx-auto rounded-2xl bg-slate-950 border border-slate-800 animate-pulse overflow-hidden">
                <div className="h-36 sm:h-40 bg-slate-850 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-3.5 w-1/3 bg-slate-800 rounded" />
                  <div className="h-5 w-3/4 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-slate-950 rounded-2xl border border-slate-800 p-8 mt-12 max-w-2xl mx-auto space-y-3 shadow-xl">
            <BookOpen className="w-10 h-10 mx-auto" style={{ color: themeColor }} />
            <h3 className="text-lg font-bold text-white">Curriculum Offerings Updating</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              New curriculum offerings and intake dates are being published by our academic team. Check back shortly or contact our admissions advisors to inquire about upcoming cohorts.
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p>No programs found in this category.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 items-start">
            <AnimatePresence>
            {filteredCourses.map(course => {
              const isExpanded = expandedProgramId === course.id;
              const isHovered = hoveredCardId === course.id;
              const displayImage = course.image_url || getFallbackImage(course.category, course.slug);
              const modulesList = course.curriculum_modules || course.curriculum || [];

              return (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  onMouseEnter={() => setHoveredCardId(course.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{
                    borderColor: isExpanded 
                      ? getRgba(themeColor, 0.55)
                      : isHovered
                      ? getRgba(themeColor, 0.38)
                      : undefined,
                    boxShadow: isExpanded 
                      ? `0 14px 32px -6px ${getRgba(themeColor, 0.22)}`
                      : isHovered
                      ? `0 10px 24px -8px ${getRgba(themeColor, 0.16)}`
                      : undefined
                  }}
                  className="group max-w-[400px] w-full mx-auto rounded-2xl border border-slate-800 bg-slate-950 transition-all duration-300 shadow-xl overflow-hidden flex flex-col"
                >
                  {/* 1. Top Image Header - Restricted height h-36 or h-40 */}
                  <div 
                    onClick={() => toggleProgram(course.id)}
                    className="relative w-full h-36 sm:h-40 overflow-hidden rounded-t-2xl bg-slate-950 cursor-pointer select-none"
                  >
                    <img
                      src={displayImage}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />

                    {/* Floating Badges on Image */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span 
                        style={{
                          backgroundColor: getRgba(themeColor, 0.2),
                          color: themeColor,
                          borderColor: getRgba(themeColor, 0.4)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-md border shadow-md"
                      >
                        {course.category}
                      </span>
                      {Boolean(course.is_featured) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 shadow-md">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Bottom Metadata Chip over Image */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none text-xs text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs border border-white/10 font-mono text-[10px] text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" style={{ color: themeColor }} />
                        {course.duration_weeks} WEEKS
                      </span>
                      <span 
                        style={{ color: themeColor }}
                        className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-xs border border-white/10 font-mono text-[10px] font-semibold"
                      >
                        {formatKES(course.price_kes)}
                      </span>
                    </div>
                  </div>

                  {/* 2. Card Content Body - Dark Slate Container matching Tuition Section */}
                  <div className="bg-slate-950 text-slate-100 flex flex-col flex-1">
                    
                    {/* Header Row: Category Badge & Title on left, +/- icon on right */}
                    <div
                      onClick={() => toggleProgram(course.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleProgram(course.id);
                        }
                      }}
                      className="w-full p-4 sm:p-4.5 flex items-start justify-between gap-3 cursor-pointer select-none transition-colors hover:bg-slate-900/60 rounded-b-2xl focus:outline-none focus-visible:ring-2"
                      style={{ 
                        '--tw-ring-color': getRgba(themeColor, 0.5) 
                      } as React.CSSProperties}
                    >
                      <div className="space-y-1 flex-1 pr-1 min-w-0">
                        <div 
                          style={{ color: themeColor }}
                          className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase"
                        >
                          <span className="truncate">{course.category}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-slate-100 transition-colors leading-snug line-clamp-2">
                          {course.title}
                        </h3>
                      </div>

                      {/* Interactive Expand/Collapse Toggle Button (+ / -) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProgram(course.id);
                        }}
                        aria-label={isExpanded ? `Collapse ${course.title} details` : `Expand ${course.title} details`}
                        style={isExpanded ? {
                          backgroundColor: getRgba(themeColor, 0.2),
                          color: themeColor,
                          borderColor: getRgba(themeColor, 0.5)
                        } : undefined}
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-lg font-bold transition-all duration-200 border shadow-xs cursor-pointer ${
                          isExpanded
                            ? 'hover:brightness-110'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-850'
                        }`}
                      >
                        {isExpanded ? (
                          <Minus className="w-4 h-4" style={{ color: themeColor }} />
                        ) : (
                          <Plus className="w-4 h-4 text-slate-300 group-hover:text-white" />
                        )}
                      </button>
                    </div>

                    {/* 3. Compact Collapsible Program Details */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="compact-program-details"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-4.5 pb-4 pt-1 border-t border-slate-800/80 space-y-3.5 text-xs">
                            
                            {/* Summary */}
                            <p className="text-slate-300 text-xs leading-relaxed">
                              {course.summary}
                            </p>

                            {/* Metadata Specs Grid */}
                            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                                <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: themeColor }} />
                                <span className="text-[11px] text-slate-300 truncate">{course.schedule}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                                <div className="flex items-center gap-1.5 truncate">
                                  <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: themeColor }} />
                                  <span className="text-[11px] text-slate-300 truncate">Intake: {course.next_intake}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 shrink-0">{course.level || 'Beginner+'}</span>
                              </div>
                            </div>

                            {/* Core Curriculum Highlights */}
                            <div className="space-y-1.5">
                              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                <span>Curriculum Highlights:</span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedCourseForSyllabus(course)}
                                  style={{ color: themeColor }}
                                  className="hover:underline normal-case text-xs flex items-center gap-0.5 font-semibold cursor-pointer"
                                >
                                  <span>Full Syllabus</span>
                                  <ChevronRight className="w-3 h-3" style={{ color: themeColor }} />
                                </button>
                              </div>

                              <div className="space-y-1">
                                {modulesList.slice(0, 3).map((mod, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: themeColor }} />
                                    <span className="truncate">{mod.module || (mod as any).title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tuition & CTAs */}
                            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                              <div className="flex items-baseline justify-between">
                                <div>
                                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Tuition (KES)</span>
                                  <span className="text-xl font-extrabold text-white font-mono">
                                    {formatKES(course.price_kes)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 font-mono">Installments</span>
                                  <div 
                                    style={{ color: themeColor }}
                                    className="text-xs font-mono font-semibold"
                                  >
                                    {formatKES(course.monthly_kes)} / mo
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCourseForSyllabus(course)}
                                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1"
                                  title="View Full Syllabus"
                                >
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Syllabus</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onApplyCourse(course.id)}
                                  style={{ backgroundColor: themeColor, color: '#020617' }}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all hover:scale-[1.01] cursor-pointer"
                                >
                                  <span>Apply Now</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>

                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>
        )}

      </div>

      {/* Syllabus Modal Dialog */}
      <AnimatePresence>
      {selectedCourseForSyllabus && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl"
          >
            
            <button
              onClick={() => setSelectedCourseForSyllabus(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div 
                style={{ 
                  backgroundColor: getRgba(themeColor, 0.15),
                  borderColor: getRgba(themeColor, 0.3)
                }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center"
              >
                {getCourseIcon(selectedCourseForSyllabus.slug)}
              </div>
              <div>
                <span 
                  style={{ color: themeColor }}
                  className="text-xs font-mono font-medium"
                >
                  {selectedCourseForSyllabus.category}
                </span>
                <h3 className="text-xl font-bold text-white">{selectedCourseForSyllabus.title}</h3>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                Duration: {selectedCourseForSyllabus.duration_weeks} Weeks
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                Level: {selectedCourseForSyllabus.level}
              </span>
              <span 
                style={{
                  backgroundColor: getRgba(themeColor, 0.15),
                  color: themeColor,
                  borderColor: getRgba(themeColor, 0.3)
                }}
                className="px-2.5 py-1 rounded border font-medium font-mono"
              >
                Tuition: {formatKES(selectedCourseForSyllabus.price_kes)}
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              {selectedCourseForSyllabus.summary}
            </p>

            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Full Module Breakdown:
              </h4>

              {(selectedCourseForSyllabus.curriculum_modules || selectedCourseForSyllabus.curriculum || []).map((mod, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div 
                    style={{ color: themeColor }}
                    className="text-sm font-semibold"
                  >
                    {mod.module || (mod as any).title}
                  </div>
                  <ul className="space-y-1">
                    {(Array.isArray(mod.topics) ? mod.topics : []).map((topic, tIdx) => (
                      <li key={tIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span 
                          style={{ backgroundColor: themeColor }}
                          className="w-1.5 h-1.5 rounded-full shrink-0" 
                        />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Online-First + Ngong Rd, Teamshark 5th Floor
              </span>
              <button
                onClick={() => {
                  const cId = selectedCourseForSyllabus.id;
                  setSelectedCourseForSyllabus(null);
                  onApplyCourse(cId);
                }}
                style={{ backgroundColor: themeColor, color: '#020617' }}
                className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                Apply for this Course
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.section>
  );
};
