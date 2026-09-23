import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Banknote, 
  CheckCircle2, 
  ChevronRight, 
  ArrowRight,
  BookOpen,
  X,
  Layers
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
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<Course | null>(null);

  const categories = ['All', 'Software Development', 'Data & Analytics', 'Artificial Intelligence', 'Security & Infrastructure'];

  const filteredCourses = activeCategory === 'All'
    ? courses
    : courses.filter(c => c.category === activeCategory);

  const getCourseIcon = (slug: string) => {
    switch (slug) {
      case 'software-engineering':
        return <Terminal className="w-5 h-5 text-emerald-400" />;
      case 'data-science':
        return <Database className="w-5 h-5 text-teal-400" />;
      case 'applied-ai':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'cybersecurity':
        return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-emerald-400" />;
    }
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
      className="py-20 bg-slate-950 text-slate-100 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full theme-badge text-xs font-semibold">
            <span>Career-Ready Curricula</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Transformative Tech Programs in Nairobi
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            All programs follow our modern <span className="text-white font-medium">Online-First model</span> with interactive live evening lectures and full physical access to our high-speed collaboration hub at <span className="theme-text-primary font-medium">Ngong Road, Teamshark, 5th Floor</span>.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {categories.map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'text-slate-950 font-bold'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
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

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse space-y-4">
                <div className="h-6 w-1/3 bg-slate-800 rounded"></div>
                <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
                <div className="h-24 bg-slate-800/40 rounded"></div>
                <div className="h-10 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8 mt-12 max-w-2xl mx-auto space-y-3">
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
          <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <AnimatePresence>
            {filteredCourses.map(course => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-300 shadow-xl"
              >
                <div>
                  {/* Top Bar: Icon + Category + Duration */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                        {getCourseIcon(course.slug)}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-medium theme-text-primary uppercase tracking-wider">
                          {course.category}
                        </span>
                        <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {course.duration_weeks} Weeks
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                    {course.summary}
                  </p>

                  {/* Meta Specs (Schedule, Level, Delivery) */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <Calendar className="w-3.5 h-3.5 theme-text-primary shrink-0" />
                      <span className="truncate">{course.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <Clock className="w-3.5 h-3.5 theme-text-secondary shrink-0" />
                      <span className="truncate">{course.next_intake}</span>
                    </div>
                  </div>

                  {/* Curriculum Preview list */}
                  <div className="mt-5 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Core Curriculum Highlights:</span>
                      <button
                        onClick={() => setSelectedCourseForSyllabus(course)}
                        className="theme-text-primary hover:brightness-125 normal-case text-xs flex items-center gap-0.5 cursor-pointer font-medium"
                      >
                        <span>Full Syllabus</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.curriculum.slice(0, 4).map((mod, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 theme-text-primary shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{mod.module}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Actions */}
                <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-medium">Program Tuition</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-white font-mono">
                        {formatKES(course.price_kes)}
                      </span>
                      <span className="text-xs text-slate-400">
                        or {formatKES(course.monthly_kes)}/mo
                      </span>
                    </div>
                    <div className="text-[10px] theme-text-primary font-medium mt-0.5">
                      Includes campus lab access at Ngong Rd & certification
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCourseForSyllabus(course)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      title="View Syllabus"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onApplyCourse(course.id)}
                      style={{ backgroundColor: 'var(--primary-color)' }}
                      className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-slate-950 text-xs font-bold shadow-md hover:brightness-110 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
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
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl theme-icon-box flex items-center justify-center">
                {getCourseIcon(selectedCourseForSyllabus.slug)}
              </div>
              <div>
                <span className="text-xs font-mono theme-text-primary font-medium">{selectedCourseForSyllabus.category}</span>
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
              <span className="px-2.5 py-1 rounded theme-badge font-medium">
                Tuition: {formatKES(selectedCourseForSyllabus.price_kes)}
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-300">
              {selectedCourseForSyllabus.summary}
            </p>

            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Full Module Breakdown:
              </h4>

              {selectedCourseForSyllabus.curriculum.map((mod, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="text-sm font-semibold theme-text-primary">
                    {mod.module}
                  </div>
                  <ul className="space-y-1">
                    {mod.topics.map((topic, tIdx) => (
                      <li key={tIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <span 
                          style={{ backgroundColor: 'var(--primary-color)' }}
                          className="w-1.5 h-1.5 rounded-full" 
                        />
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
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
