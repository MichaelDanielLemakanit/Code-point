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
  Laptop,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { Course } from '../types';

interface ProgramsCatalogProps {
  courses: Course[];
  loading: boolean;
  onApplyCourse: (courseId: string) => void;
}

export const ProgramsCatalog: React.FC<ProgramsCatalogProps> = ({
  courses,
  loading,
  onApplyCourse
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<Course | null>(null);

  const categories = ['All', 'Software Development', 'Data & Analytics', 'Artificial Intelligence', 'Security & Infrastructure'];

  const filteredCourses = activeCategory === 'All'
    ? courses
    : courses.filter(c => c.category === activeCategory);

  const toggleProgram = (courseId: string) => {
    setExpandedProgramId(prev => (prev === courseId ? null : courseId));
  };

  const getCourseIcon = (slug: string) => {
    switch (slug) {
      case 'software-engineering':
      case 'full-stack-software-engineering':
        return <Terminal className="w-5 h-5 text-blue-400" />;
      case 'data-science':
      case 'data-science-applied-ai':
        return <Database className="w-5 h-5 text-blue-400" />;
      case 'applied-ai':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'cybersecurity':
      case 'cyber-security-microservices':
        return <ShieldCheck className="w-5 h-5 text-blue-400" />;
      default:
        return <Layers className="w-5 h-5 text-blue-400" />;
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
      className="w-full max-w-full overflow-x-hidden py-20 bg-slate-900 text-slate-100 relative scroll-mt-20 border-b border-slate-800"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Transformative Tech Programs in Nairobi
          </h2>
        </div>

        {/* Category Filters */}
        <div className="w-full max-w-full flex flex-wrap items-center justify-center gap-2 mt-8 px-1">
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'text-slate-950 font-bold'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="programsCategoryPill"
                    className="absolute inset-0 rounded-xl theme-bg-primary shadow-md -z-0"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl bg-slate-950 border border-slate-800 animate-pulse overflow-hidden">
                <div className="h-36 sm:h-40 bg-slate-800/60 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-3.5 w-1/3 bg-slate-800 rounded" />
                  <div className="h-5 w-3/4 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-slate-950/60 rounded-2xl border border-slate-800/80 p-8 mt-12 max-w-2xl mx-auto space-y-3">
            <BookOpen className="w-10 h-10 theme-text-primary mx-auto" />
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
                  className="group rounded-2xl border border-slate-800 hover:border-blue-500/40 bg-slate-950 hover:bg-slate-950/95 transition-all duration-300 shadow-xl overflow-hidden flex flex-col w-full"
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-950/85 backdrop-blur-md text-blue-400 border border-blue-500/30 shadow-md">
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
                      <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs border border-white/10 font-mono text-[10px] text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        {course.duration_weeks} WEEKS
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs border border-white/10 font-mono text-[10px] text-blue-300 font-semibold">
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
                      className="w-full p-4 sm:p-4.5 flex items-start justify-between gap-3 cursor-pointer select-none transition-colors hover:bg-slate-900/60 rounded-b-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <div className="space-y-1 flex-1 pr-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider uppercase text-blue-400">
                          <span className="truncate">{course.category}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug line-clamp-2">
                          {course.title}
                        </h3>
                      </div>

                      {/* Interactive Expand/Collapse Toggle Icon (+ / -) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProgram(course.id);
                        }}
                        aria-label={isExpanded ? `Collapse ${course.title} details` : `Expand ${course.title} details`}
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-lg font-bold transition-all duration-200 border shadow-xs cursor-pointer ${
                          isExpanded
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white hover:bg-slate-850'
                        }`}
                      >
                        {isExpanded ? (
                          <Minus className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Plus className="w-4 h-4 text-slate-300" />
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
                                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span className="text-[11px] text-slate-300 truncate">{course.schedule}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                                <div className="flex items-center gap-1.5 truncate">
                                  <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
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
                                  className="text-blue-400 hover:text-blue-300 normal-case text-xs flex items-center gap-0.5 font-semibold cursor-pointer"
                                >
                                  <span>Full Syllabus</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="space-y-1">
                                {modulesList.slice(0, 3).map((mod, idx) => (
                                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
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
                                  <div className="text-xs text-blue-400 font-mono font-semibold">
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
                                  style={{ backgroundColor: 'var(--primary-color)' }}
                                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-slate-950 text-xs font-bold shadow-md hover:brightness-110 transition-all hover:scale-[1.01] cursor-pointer"
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
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                {getCourseIcon(selectedCourseForSyllabus.slug)}
              </div>
              <div>
                <span className="text-xs font-mono text-blue-400 font-medium">{selectedCourseForSyllabus.category}</span>
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
              <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
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
                  <div className="text-sm font-semibold text-blue-400">
                    {mod.module || (mod as any).title}
                  </div>
                  <ul className="space-y-1">
                    {(Array.isArray(mod.topics) ? mod.topics : []).map((topic, tIdx) => (
                      <li key={tIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
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
                style={{ backgroundColor: 'var(--primary-color)' }}
                className="px-6 py-2.5 rounded-xl text-slate-950 text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
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
