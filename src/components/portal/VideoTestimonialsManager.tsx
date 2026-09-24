import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Play, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Star, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  X, 
  Briefcase, 
  GraduationCap, 
  Building2,
  Film
} from 'lucide-react';
import { VideoTestimonial, Course } from '../../types';

// Bundled high-fidelity alumni assets
import danielPhoto from '../../assets/images/alumni_daniel_dev_1790212245688.jpg';
import cynthiaPhoto from '../../assets/images/alumni_cynthia_data_1790212257311.jpg';
import kevinPhoto from '../../assets/images/alumni_kevin_cloud_1790212267835.jpg';
import faithPhoto from '../../assets/images/alumni_faith_sec_1790212286930.jpg';

interface VideoTestimonialsManagerProps {
  showToast: (msg: string) => void;
  courses?: Course[];
}

const ALUMNI_PRESETS = [
  { name: "Daniel Michael", photo: danielPhoto, role: "Junior Frontend Developer", company: "Safaricom PLC", course: "Full-Stack Software Engineering", cohort: "Cohort 14" },
  { name: "Cynthia Njeri", photo: cynthiaPhoto, role: "BI & Data Analyst", company: "Equity Bank Kenya", course: "Data Science & Machine Learning", cohort: "Cohort 12" },
  { name: "Kevin Otieno", photo: kevinPhoto, role: "Cloud DevOps Associate", company: "Cellulant", course: "Applied AI & Cloud Engineering", cohort: "Cohort 15" },
  { name: "Faith Mwangi", photo: faithPhoto, role: "Security Operations Analyst", company: "KCB Group", course: "Cyber Security & Cloud Defense", cohort: "Cohort 13" },
];

function resolveStudentPhoto(testimonial: VideoTestimonial): string {
  const name = testimonial.student_name.toLowerCase();
  const url = (testimonial.photo_url || testimonial.thumbnail_url || '').toLowerCase();
  
  if (name.includes('daniel') || url.includes('daniel')) return danielPhoto;
  if (name.includes('cynthia') || url.includes('cynthia')) return cynthiaPhoto;
  if (name.includes('kevin') || url.includes('kevin')) return kevinPhoto;
  if (name.includes('faith') || url.includes('faith')) return faithPhoto;

  if (testimonial.photo_url && testimonial.photo_url.startsWith('http')) {
    return testimonial.photo_url;
  }
  return danielPhoto;
}

function getEmbedUrl(rawUrl: string): { type: 'iframe' | 'video'; url: string } {
  if (!rawUrl) return { type: 'iframe', url: '' };

  const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'iframe',
      url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`
    };
  }

  const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
    };
  }

  if (rawUrl.match(/\.(mp4|webm|ogg)($|\?)/i) || rawUrl.includes('cloudinary.com') || rawUrl.includes('video/upload')) {
    return {
      type: 'video',
      url: rawUrl
    };
  }

  return {
    type: 'iframe',
    url: rawUrl
  };
}

export const VideoTestimonialsManager: React.FC<VideoTestimonialsManagerProps> = ({
  showToast,
  courses = []
}) => {
  const [testimonials, setTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'hidden'>('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [activeTestimonial, setActiveTestimonial] = useState<VideoTestimonial | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formCourse, setFormCourse] = useState('Full-Stack Software Engineering');
  const [formCohort, setFormCohort] = useState('Cohort 14');
  const [formRole, setFormRole] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formDuration, setFormDuration] = useState('3:15');
  const [formQuote, setFormQuote] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formStatus, setFormStatus] = useState<'approved' | 'hidden'>('approved');
  const [isSaving, setIsSaving] = useState(false);

  // Quick Preview Player Modal
  const [previewTestimonial, setPreviewTestimonial] = useState<VideoTestimonial | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/video-testimonials?status=all');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (e) {
      console.warn('Failed to load video testimonials in Admin CMS:', e);
      showToast('Could not fetch video testimonials from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Quick action: Toggle Featured
  const handleToggleFeatured = async (v: VideoTestimonial) => {
    const nextFeatured = !(Number(v.is_featured) === 1);
    try {
      const res = await fetch(`/api/video-testimonials/${v.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: nextFeatured ? 1 : 0 })
      });
      if (res.ok) {
        setTestimonials(prev => prev.map(item => item.id === v.id ? { ...item, is_featured: nextFeatured ? 1 : 0 } : item));
        showToast(nextFeatured ? `"${v.student_name}" is now featured on homepage!` : `Unfeatured "${v.student_name}".`);
        window.dispatchEvent(new CustomEvent('video-testimonials-updated'));
      } else {
        alert('Failed to update featured status');
      }
    } catch (e) {
      console.error('Error toggling featured status:', e);
    }
  };

  // Quick action: Toggle Status (Approved vs Hidden)
  const handleToggleStatus = async (v: VideoTestimonial) => {
    const nextStatus = v.status === 'approved' ? 'hidden' : 'approved';
    try {
      const res = await fetch(`/api/video-testimonials/${v.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setTestimonials(prev => prev.map(item => item.id === v.id ? { ...item, status: nextStatus } : item));
        showToast(nextStatus === 'approved' ? `Video published to live gallery!` : `Video set to hidden.`);
        window.dispatchEvent(new CustomEvent('video-testimonials-updated'));
      }
    } catch (e) {
      console.error('Error toggling status:', e);
    }
  };

  // Delete Video Testimonial
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the video testimonial for "${name}"?`)) return;

    try {
      const res = await fetch(`/api/video-testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTestimonials(prev => prev.filter(item => item.id !== id));
        showToast(`Video testimonial deleted.`);
        window.dispatchEvent(new CustomEvent('video-testimonials-updated'));
      } else {
        alert('Failed to delete testimonial');
      }
    } catch (e) {
      console.error('Error deleting testimonial:', e);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setActiveTestimonial(null);
    setModalMode('add');
    setFormName('');
    setFormPhoto('');
    setFormCourse(courses[0]?.title || 'Full-Stack Software Engineering');
    setFormCohort('Cohort 14');
    setFormRole('');
    setFormCompany('Safaricom PLC');
    setFormVideoUrl('https://www.youtube.com/watch?v=kqtD5dpn9C8');
    setFormDuration('3:00');
    setFormQuote('');
    setFormIsFeatured(true);
    setFormStatus('approved');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (v: VideoTestimonial) => {
    setActiveTestimonial(v);
    setModalMode('edit');
    setFormName(v.student_name);
    setFormPhoto(v.photo_url || '');
    setFormCourse(v.course_program);
    setFormCohort(v.cohort || 'Cohort 14');
    setFormRole(v.career_role || '');
    setFormCompany(v.company || '');
    setFormVideoUrl(v.video_url);
    setFormDuration(v.duration || '3:00');
    setFormQuote(v.quote_highlight);
    setFormIsFeatured(Number(v.is_featured) === 1);
    setFormStatus(v.status === 'hidden' ? 'hidden' : 'approved');
    setIsModalOpen(true);
  };

  // Quick Preset Selection Helper
  const handleSelectPreset = (preset: typeof ALUMNI_PRESETS[0]) => {
    setFormName(preset.name);
    setFormPhoto(preset.photo);
    setFormRole(preset.role);
    setFormCompany(preset.company);
    setFormCourse(preset.course);
    setFormCohort(preset.cohort);
  };

  // Save Modal
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formVideoUrl.trim() || !formQuote.trim()) {
      alert('Please fill in student name, video URL, and quote highlight.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        student_name: formName.trim(),
        photo_url: formPhoto.trim(),
        thumbnail_url: formPhoto.trim(),
        course_program: formCourse.trim(),
        cohort: formCohort.trim(),
        career_role: formRole.trim(),
        company: formCompany.trim(),
        video_url: formVideoUrl.trim(),
        duration: formDuration.trim(),
        quote_highlight: formQuote.trim(),
        is_featured: formIsFeatured ? 1 : 0,
        status: formStatus
      };

      if (modalMode === 'edit' && activeTestimonial) {
        const res = await fetch(`/api/video-testimonials/${activeTestimonial.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Video testimonial updated successfully!');
          await fetchVideos();
          setIsModalOpen(false);
          window.dispatchEvent(new CustomEvent('video-testimonials-updated'));
        } else {
          alert('Failed to update testimonial');
        }
      } else {
        const res = await fetch('/api/video-testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('New video testimonial created and published!');
          await fetchVideos();
          setIsModalOpen(false);
          window.dispatchEvent(new CustomEvent('video-testimonials-updated'));
        } else {
          alert('Failed to create video testimonial');
        }
      }
    } catch (e) {
      console.error('Error saving video testimonial:', e);
      alert('Network error saving video testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered List
  const filteredVideos = testimonials.filter(v => {
    if (filterFeaturedOnly && !(Number(v.is_featured) === 1)) return false;
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.student_name?.toLowerCase().includes(q);
      const matchCourse = v.course_program?.toLowerCase().includes(q);
      const matchCompany = v.company?.toLowerCase().includes(q);
      const matchRole = v.career_role?.toLowerCase().includes(q);
      const matchQuote = v.quote_highlight?.toLowerCase().includes(q);
      return matchName || matchCourse || matchCompany || matchRole || matchQuote;
    }
    return true;
  });

  const featuredCount = testimonials.filter(v => Number(v.is_featured) === 1).length;
  const approvedCount = testimonials.filter(v => v.status === 'approved').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Film className="w-6 h-6 text-emerald-600" />
            <span>Student Video Testimonials CMS</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Manage real alumni video stories, featured toggles on the homepage gallery, video URLs (YouTube, Vimeo, MP4), and review quotes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchVideos}
            disabled={loading}
            className="p-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh videos"
          >
            <RefreshCw className={`w-4 h-4 text-stone-600 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video Testimonial</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Strict unboxed metadata discipline) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Total Videos</span>
          <span className="text-2xl font-serif font-bold text-stone-900 mt-1 block">{testimonials.length}</span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Alumni success records</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Featured on Home</span>
          <span className="text-2xl font-serif font-bold text-stone-900 mt-1 block">{featuredCount}</span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Hero & Gallery priority</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">Approved & Live</span>
          <span className="text-2xl font-serif font-bold text-stone-900 mt-1 block">{approvedCount}</span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Publicly playable</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200">
          <span className="text-[11px] font-semibold text-cyan-600 uppercase tracking-wider block">Total Video Views</span>
          <span className="text-2xl font-serif font-bold text-stone-900 mt-1 block">
            {testimonials.reduce((acc, v) => acc + (v.views_count || 0), 0).toLocaleString()}
          </span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Audience engagements</span>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-stone-100 rounded-xl border border-stone-200">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, company, course, or quote..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            Approved Only
          </button>
          <button
            onClick={() => setStatusFilter('hidden')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === 'hidden'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            Hidden
          </button>
          <button
            onClick={() => setFilterFeaturedOnly(!filterFeaturedOnly)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filterFeaturedOnly
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Featured Only</span>
          </button>
        </div>
      </div>

      {/* Video Testimonials List Cards */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl">
          <Film className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No video testimonials found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search query or filters.' : 'Add your first video testimonial to feature alumni success stories on your website.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video Testimonial</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVideos.map((v) => {
            const photoSrc = resolveStudentPhoto(v);
            const isFeatured = Number(v.is_featured) === 1;

            return (
              <div 
                key={v.id} 
                className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Photo + Names + Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                        <img
                          src={photoSrc}
                          alt={v.student_name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setPreviewTestimonial(v)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors text-white"
                          title="Preview Video"
                        >
                          <Play className="w-4 h-4 fill-white" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{v.student_name}</h4>
                          {isFeatured && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Featured
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            v.status === 'approved' 
                              ? 'text-emerald-700 bg-emerald-50' 
                              : 'text-stone-600 bg-stone-100'
                          }`}>
                            {v.status === 'approved' ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 font-medium">
                          {v.career_role || 'Alum'} {v.company ? `at ${v.company}` : ''}
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {v.course_program} {v.cohort ? `· ${v.cohort}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Quick Edit & Delete Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        title="Edit details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id, v.student_name)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete video testimonial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Video URL Link */}
                  <div className="mt-3 flex items-center justify-between text-xs bg-stone-50 p-2 rounded-lg border border-stone-200/80">
                    <span className="text-stone-500 truncate max-w-[240px] text-[11px] font-mono">
                      {v.video_url}
                    </span>
                    <button
                      onClick={() => setPreviewTestimonial(v)}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold text-[11px] flex items-center gap-1 shrink-0 ml-2"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play ({v.duration || '3:00'})</span>
                    </button>
                  </div>

                  {/* Quote Highlight */}
                  <blockquote className="mt-3 text-xs text-stone-600 italic border-l-2 border-emerald-500 pl-2.5">
                    "{v.quote_highlight}"
                  </blockquote>
                </div>

                {/* Bottom Toggle Bar */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleFeatured(v)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs font-semibold ${
                      isFeatured 
                        ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-600 text-amber-600' : 'text-stone-400'}`} />
                    <span>{isFeatured ? 'Featured on Hero/Gallery' : 'Pin to Featured'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(v)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs font-semibold ${
                      v.status === 'approved' 
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {v.status === 'approved' ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Video Testimonial Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
          >
            
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  {modalMode === 'edit' ? 'Edit Video Testimonial' : '+ Add Video Testimonial'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Publish a Kenyan tech graduate success story to the public homepage gallery.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto">
              
              {/* Quick Preset Selector for Easy Testing */}
              {modalMode === 'add' && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="text-[11px] font-bold text-emerald-900 block mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Quick Populate from Verified Alumni Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ALUMNI_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-stone-800 text-[11px] font-semibold rounded-md border border-emerald-200 transition-colors cursor-pointer"
                      >
                        {p.name} ({p.company})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Name & Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Daniel Michael"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Photo / Avatar URL
                  </label>
                  <input
                    type="text"
                    value={formPhoto}
                    onChange={(e) => setFormPhoto(e.target.value)}
                    placeholder="Image URL or bundled path"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Course & Cohort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Course / Program Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Full-Stack Software Engineering">Full-Stack Software Engineering</option>
                    <option value="Data Science & Machine Learning">Data Science & Machine Learning</option>
                    <option value="Applied AI & Cloud Engineering">Applied AI & Cloud Engineering</option>
                    <option value="Cyber Security & Cloud Defense">Cyber Security & Cloud Defense</option>
                    <option value="Mobile App Development (React Native)">Mobile App Development (React Native)</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Cohort Label
                  </label>
                  <input
                    type="text"
                    value={formCohort}
                    onChange={(e) => setFormCohort(e.target.value)}
                    placeholder="e.g. Cohort 14"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Career Role & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Career Role / Job Title
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Junior Frontend Developer"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Hired Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Safaricom PLC"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Video URL & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Video URL (YouTube, Vimeo, Cloudinary, or direct MP4) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 3:15"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Written Highlight / Review Quote */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Written Highlight / Review Quote <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  placeholder="e.g. The hands-on projects at Ngong Road campus helped me land my tech job in 4 months..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Toggles: Featured & Status */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Featured Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Featured on Homepage Hero & Gallery</span>
                    <span className="text-[11px] text-stone-500 block">Give priority placement on the public landing page</span>
                  </div>
                </label>

                {/* Status Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-700">Visibility:</span>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'approved' | 'hidden')}
                    className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-xs text-stone-900"
                  >
                    <option value="approved">Approved (Live)</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : modalMode === 'edit' ? 'Update Testimonial' : 'Publish Testimonial'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Admin Quick Preview Player Modal */}
      {previewTestimonial && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md"
          onClick={() => setPreviewTestimonial(null)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{previewTestimonial.student_name}</h4>
                <p className="text-[11px] text-stone-400">
                  {previewTestimonial.career_role} at {previewTestimonial.company} · {previewTestimonial.course_program}
                </p>
              </div>
              <button
                onClick={() => setPreviewTestimonial(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {(() => {
                const media = getEmbedUrl(previewTestimonial.video_url);
                if (media.type === 'video') {
                  return <video src={media.url} controls autoPlay className="w-full h-full object-cover" />;
                }
                return (
                  <iframe
                    src={media.url}
                    title={previewTestimonial.student_name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
              })()}
            </div>

            <div className="p-4 bg-stone-950 text-xs text-stone-300 italic border-t border-stone-800">
              "{previewTestimonial.quote_highlight}"
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
