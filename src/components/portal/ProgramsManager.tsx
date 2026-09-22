import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  Layers, 
  X, 
  Save, 
  RefreshCw,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { Course, CourseModule } from '../../types';

interface ProgramsManagerProps {
  courses: Course[];
  onRefreshCourses: () => void;
  showToast: (msg: string) => void;
}

const CATEGORIES = [
  'All',
  'Software Development',
  'Data & Analytics',
  'Artificial Intelligence',
  'Security & Infrastructure',
  'Cloud Computing'
];

export const ProgramsManager: React.FC<ProgramsManagerProps> = ({
  courses,
  onRefreshCourses,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    slug: '',
    category: 'Software Development',
    duration_weeks: 12,
    price_kes: 75000,
    monthly_kes: 16500,
    summary: '',
    schedule: 'Mon–Thu 7:00 PM – 9:30 PM EAT',
    delivery_mode: 'Online-First + Ngong Rd Campus Lab',
    next_intake: 'May 2025 Cohort',
    level: 'Beginner to Intermediate',
    is_featured: false,
    curriculum_modules: []
  });

  const [moduleList, setModuleList] = useState<{ title: string; topics: string }[]>([]);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Software Development',
      duration_weeks: 12,
      price_kes: 75000,
      monthly_kes: 16500,
      summary: '',
      schedule: 'Mon–Thu 7:00 PM – 9:30 PM EAT',
      delivery_mode: 'Online-First + Ngong Rd Campus Lab',
      next_intake: 'May 2025 Cohort',
      level: 'Beginner to Intermediate',
      is_featured: false,
      curriculum_modules: []
    });
    setModuleList([
      { title: 'Module 1: Foundations & Architecture', topics: 'Syntax, Git, Problem Solving, Data Structures' },
      { title: 'Module 2: Core Engineering & Systems', topics: 'APIs, Relational DBs, Async Patterns, Testing' },
      { title: 'Module 3: Production Capstone Project', topics: 'Cloud Deployment, CI/CD, Code Review, Security' }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      ...course
    });

    const modules = course.curriculum_modules || course.curriculum || [];
    if (Array.isArray(modules) && modules.length > 0) {
      setModuleList(
        modules.map((m: any) => ({
          title: m.title || m.module || 'Module',
          topics: Array.isArray(m.topics) ? m.topics.join(', ') : ''
        }))
      );
    } else {
      setModuleList([
        { title: 'Module 1: Core Fundamentals', topics: 'Foundations, Industry Tools, System Setup' },
        { title: 'Module 2: Advanced Applications', topics: 'Full Stack Engineering, Production Deployments' }
      ]);
    }
    setIsModalOpen(true);
  };

  const handleAddModule = () => {
    setModuleList(prev => [
      ...prev,
      { title: `Module ${prev.length + 1}: Technical Specialization`, topics: 'Key tools, capstone deliverables' }
    ]);
  };

  const handleRemoveModule = (index: number) => {
    setModuleList(prev => prev.filter((_, i) => i !== index));
  };

  const handleModuleChange = (index: number, field: 'title' | 'topics', val: string) => {
    setModuleList(prev => prev.map((m, i) => i === index ? { ...m, [field]: val } : m));
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = formData.title?.trim() || '';
    if (!cleanTitle) {
      alert('Please enter a course/program title');
      return;
    }

    const priceNum = Number(formData.price_kes);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Please enter a valid upfront tuition fee in KES (greater than 0)');
      return;
    }

    setIsSaving(true);
    try {
      const generatedSlug = formData.slug?.trim() 
        ? formData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const formattedModules: CourseModule[] = moduleList.map((m, idx) => ({
        module: m.title?.trim() || `Module ${idx + 1}`,
        topics: m.topics.split(',').map(t => t.trim()).filter(Boolean)
      }));

      const monthlyNum = Number(formData.monthly_kes) > 0 
        ? Number(formData.monthly_kes) 
        : Math.round(priceNum / 5);

      const durationNum = Number(formData.duration_weeks) > 0 
        ? Number(formData.duration_weeks) 
        : 12;

      const payload = {
        title: cleanTitle,
        slug: generatedSlug,
        category: formData.category?.trim() || 'Software Development',
        duration_weeks: durationNum,
        price_kes: priceNum,
        monthly_kes: monthlyNum,
        summary: formData.summary?.trim() || 'Comprehensive tech curriculum with hands-on labs and career mentoring.',
        schedule: formData.schedule?.trim() || 'Mon–Thu 7:00 PM – 9:30 PM EAT',
        delivery_mode: formData.delivery_mode?.trim() || 'Online-First + Ngong Rd Campus Lab Access',
        next_intake: formData.next_intake?.trim() || 'May 2026 Cohort',
        level: formData.level?.trim() || 'Beginner to Intermediate',
        is_featured: formData.is_featured ? 1 : 0,
        curriculum: formattedModules,
        curriculum_modules: formattedModules
      };

      let res: Response;
      if (editingCourse) {
        res = await fetch(`/api/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showToast(editingCourse ? 'Course updated successfully!' : 'New program created and published!');
        setIsModalOpen(false);
        onRefreshCourses();
      } else {
        const errorData = await res.json().catch(() => null);
        const errorMsg = errorData?.error || errorData?.message || `Server returned HTTP ${res.status}`;
        console.error('Failed to save course payload:', { status: res.status, errorData, payload });
        alert(`Failed to save course: ${errorMsg}`);
      }
    } catch (e) {
      console.error('Save course error:', e);
      alert('Network error communicating with the server. Please check connection and retry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}" from the public catalog?`)) {
      return;
    }

    setIsDeletingId(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`"${courseTitle}" removed from catalog.`);
        onRefreshCourses();
      } else {
        alert('Failed to delete course');
      }
    } catch (e) {
      console.error('Delete course error:', e);
      alert('Network error deleting course');
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-600" />
            <span>Programs & Tuition Manager</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage active courses, curriculum structures, and KES pricing schedules displayed on the public school website
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer self-start sm:self-auto hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Program</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 font-medium">Active Programs</span>
          <div className="text-2xl font-bold font-mono text-stone-900 mt-1">{courses.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 font-medium">Average Full Tuition</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {courses.length > 0 
              ? formatKES(Math.round(courses.reduce((acc, c) => acc + c.price_kes, 0) / courses.length))
              : 'KES 0'}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 font-medium">Monthly Options</span>
          <div className="text-sm font-bold font-mono text-stone-800 mt-1">From KES 16.5K/mo</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] text-stone-500 font-medium">Live Frontend Sync</span>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Active</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search programs by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {courses.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border-2 border-dashed border-stone-200 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-stone-900">Catalog is Fresh & Clean</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              All placeholder courses have been removed. Add your first official curriculum offering with custom tuition fees, schedules, and curriculum modules.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Program</span>
          </button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No programs match your search</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search query or category filter, or add a new program to the catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {c.category}
                      </span>
                      {c.is_featured && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-stone-900 tracking-tight">{c.title}</h3>
                  </div>

                  {/* KES Pricing */}
                  <div className="text-right shrink-0">
                    <div className="text-base font-extrabold text-stone-900 font-mono">
                      {formatKES(c.price_kes)}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono font-semibold">
                      {formatKES(c.monthly_kes)} / mo
                    </div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mt-2.5">
                  {c.summary}
                </p>

                {/* Course Metadata Strip */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 mt-3.5 pt-3 border-t border-stone-100 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{c.duration_weeks} Weeks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{c.next_intake}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-stone-600">
                    <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{c.delivery_mode}</span>
                  </div>
                </div>

                {/* Modules Summary */}
                {Array.isArray(c.curriculum_modules) && c.curriculum_modules.length > 0 && (
                  <div className="mt-3 bg-stone-50 p-2.5 rounded-xl border border-stone-150 text-[11px]">
                    <span className="font-semibold text-stone-700">
                      Curriculum: {c.curriculum_modules.length} Modules configured
                    </span>
                    <div className="text-stone-500 text-[10px] mt-0.5 truncate">
                      {c.curriculum_modules.map(m => m.title).join(' • ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-stone-400">Slug: /{c.slug}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit Program</span>
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(c.id, c.title)}
                    disabled={isDeletingId === c.id}
                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Program"
                  >
                    {isDeletingId === c.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {editingCourse ? 'Edit Program Offering' : 'Add New Technical Program'}
                </h3>
                <p className="text-xs text-stone-500">
                  Configure program curriculum details and KES tuition fee schedules
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Program Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Applied AI & Machine Learning Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="applied-ai-engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Category Tag
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 bg-white"
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Security & Infrastructure">Security & Infrastructure</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                  </select>
                </div>

                {/* Price KES */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Full Upfront Tuition (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.price_kes}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_kes: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Monthly KES */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Monthly Installment (KES/mo) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.monthly_kes}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_kes: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Duration (Weeks)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_weeks: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Next Intake */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Next Intake Cohort
                  </label>
                  <input
                    type="text"
                    value={formData.next_intake}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_intake: e.target.value }))}
                    placeholder="e.g. May 2025 Evening Cohort"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Delivery Mode */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Delivery Mode
                  </label>
                  <input
                    type="text"
                    value={formData.delivery_mode}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_mode: e.target.value }))}
                    placeholder="Online-First + Ngong Rd Campus Lab"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Schedule */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Cohort Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                    placeholder="Mon–Thu 7:00 PM – 9:30 PM EAT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Level */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Target Skill Level
                  </label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                    placeholder="Beginner to Advanced"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                {/* Featured Checkbox */}
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="is_featured" className="text-xs font-semibold text-stone-800 cursor-pointer">
                    Highlight as Featured Program on Catalog
                  </label>
                </div>

                {/* Summary */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Program Summary / Curriculum Overview *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Describe program goals, key technologies, and career opportunities..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 leading-relaxed"
                  />
                </div>

              </div>

              {/* Curriculum Modules Builder */}
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Curriculum Modules ({moduleList.length})
                    </h4>
                    <p className="text-[11px] text-stone-400">Configure key learning phases and topic tags</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Module</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {moduleList.map((mod, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 relative">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => handleModuleChange(idx, 'title', e.target.value)}
                          placeholder={`Module ${idx + 1} Title`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-800 focus:outline-none focus:border-stone-900 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveModule(idx)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded"
                          title="Remove module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={mod.topics}
                        onChange={(e) => handleModuleChange(idx, 'topics', e.target.value)}
                        placeholder="Topics (comma-separated): e.g. React, Redux, Tailwind, Node.js"
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-[11px] text-stone-600 focus:outline-none focus:border-stone-900 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Controls */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{editingCourse ? 'Save Program Changes' : 'Publish Program to Catalog'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
