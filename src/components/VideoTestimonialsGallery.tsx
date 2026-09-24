import React, { useState, useEffect } from 'react';
import { 
  Play, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  ExternalLink,
  Award,
  Clock,
  Eye,
  CheckCircle2,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoTestimonial } from '../types';

// Bundled high-fidelity alumni assets
import danielPhoto from '../assets/images/alumni_daniel_dev_1790212245688.jpg';
import cynthiaPhoto from '../assets/images/alumni_cynthia_data_1790212257311.jpg';
import kevinPhoto from '../assets/images/alumni_kevin_cloud_1790212267835.jpg';
import faithPhoto from '../assets/images/alumni_faith_sec_1790212286930.jpg';

interface VideoTestimonialsGalleryProps {
  onApplyForCourse?: (courseTitle?: string) => void;
  onExplorePrograms?: () => void;
}

const FALLBACK_TESTIMONIALS: VideoTestimonial[] = [
  {
    id: "vid-001",
    student_name: "Daniel Michael",
    photo_url: danielPhoto,
    thumbnail_url: danielPhoto,
    course_program: "Full-Stack Software Engineering",
    cohort: "Cohort 14",
    career_role: "Junior Frontend Developer",
    company: "Safaricom PLC",
    video_url: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
    duration: "3:12",
    quote_highlight: "The hands-on projects at Ngong Road campus helped me land my tech job in 4 months. Going from zero TypeScript knowledge to deploying microservices was surreal.",
    is_featured: 1,
    status: "approved",
    views_count: 1420,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
  },
  {
    id: "vid-002",
    student_name: "Cynthia Njeri",
    photo_url: cynthiaPhoto,
    thumbnail_url: cynthiaPhoto,
    course_program: "Data Science & Machine Learning",
    cohort: "Cohort 12",
    career_role: "BI & Data Analyst",
    company: "Equity Bank Kenya",
    video_url: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
    duration: "2:45",
    quote_highlight: "From zero Python background to building predictive credit models. The instructors pushed us through real East African banking datasets.",
    is_featured: 1,
    status: "approved",
    views_count: 980,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString()
  },
  {
    id: "vid-003",
    student_name: "Kevin Otieno",
    photo_url: kevinPhoto,
    thumbnail_url: kevinPhoto,
    course_program: "Applied AI & Cloud Engineering",
    cohort: "Cohort 15",
    career_role: "Cloud DevOps Associate",
    company: "Cellulant",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "4:05",
    quote_highlight: "The Saturday coding clinics and pair-programming at Teamshark 5th Floor completely changed my learning curve with senior mentors.",
    is_featured: 1,
    status: "approved",
    views_count: 1250,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString()
  },
  {
    id: "vid-004",
    student_name: "Faith Mwangi",
    photo_url: faithPhoto,
    thumbnail_url: faithPhoto,
    course_program: "Cyber Security & Cloud Defense",
    cohort: "Cohort 13",
    career_role: "Security Operations Analyst",
    company: "KCB Group",
    video_url: "https://www.youtube.com/watch?v=EngW7tLk6R8",
    duration: "3:30",
    quote_highlight: "Real penetration testing labs instead of multiple-choice quizzes made all the difference during technical whiteboard interviews.",
    is_featured: 1,
    status: "approved",
    views_count: 870,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString()
  }
];

// Helper to resolve bundled alumni photos if referenced by path or name
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
  if (testimonial.thumbnail_url && testimonial.thumbnail_url.startsWith('http')) {
    return testimonial.thumbnail_url;
  }
  return danielPhoto;
}

// Convert video URLs to standard embed formats
function getEmbedUrl(rawUrl: string): { type: 'iframe' | 'video'; url: string } {
  if (!rawUrl) return { type: 'iframe', url: '' };

  // YouTube standard or short links
  const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'iframe',
      url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`
    };
  }

  // Vimeo
  const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'iframe',
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0`
    };
  }

  // Direct MP4 / WebM / Cloudinary video file
  if (rawUrl.match(/\.(mp4|webm|ogg)($|\?)/i) || rawUrl.includes('cloudinary.com') || rawUrl.includes('video/upload')) {
    return {
      type: 'video',
      url: rawUrl
    };
  }

  // Fallback as iframe
  return {
    type: 'iframe',
    url: rawUrl
  };
}

export const VideoTestimonialsGallery: React.FC<VideoTestimonialsGalleryProps> = ({
  onApplyForCourse,
  onExplorePrograms
}) => {
  const [testimonials, setTestimonials] = useState<VideoTestimonial[]>(FALLBACK_TESTIMONIALS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeModalVideo, setActiveModalVideo] = useState<VideoTestimonial | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch live video testimonials from backend
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/video-testimonials?status=approved');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      }
    } catch (err) {
      console.warn('Could not load video testimonials from API, using fallback data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();

    // Listen for live updates when an admin adds or edits video testimonials
    const handleUpdate = () => {
      fetchTestimonials();
    };
    window.addEventListener('video-testimonials-updated', handleUpdate);
    return () => {
      window.removeEventListener('video-testimonials-updated', handleUpdate);
    };
  }, []);

  // Filter logic
  const filteredList = testimonials.filter(item => {
    if (selectedFilter === 'all') return true;
    const prog = item.course_program.toLowerCase();
    if (selectedFilter === 'software' && (prog.includes('software') || prog.includes('full-stack') || prog.includes('frontend') || prog.includes('backend'))) return true;
    if (selectedFilter === 'data' && (prog.includes('data') || prog.includes('python') || prog.includes('machine learning') || prog.includes('analytics'))) return true;
    if (selectedFilter === 'cloud' && (prog.includes('cloud') || prog.includes('devops') || prog.includes('aws') || prog.includes('ai & cloud'))) return true;
    if (selectedFilter === 'security' && (prog.includes('security') || prog.includes('cyber') || prog.includes('defense'))) return true;
    return false;
  });

  // Open modal and register view
  const handleOpenModal = (item: VideoTestimonial) => {
    setActiveModalVideo(item);
    try {
      fetch(`/api/video-testimonials/${item.id}/view`, { method: 'POST' });
    } catch (e) {}
  };

  const handleCloseModal = () => {
    setActiveModalVideo(null);
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeModalVideo) return;
      if (e.key === 'Escape') {
        handleCloseModal();
      } else if (e.key === 'ArrowRight') {
        handleNextVideo();
      } else if (e.key === 'ArrowLeft') {
        handlePrevVideo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalVideo, filteredList]);

  const handleNextVideo = () => {
    if (!activeModalVideo) return;
    const currentIndex = filteredList.findIndex(v => v.id === activeModalVideo.id);
    const nextIndex = (currentIndex + 1) % filteredList.length;
    setActiveModalVideo(filteredList[nextIndex]);
  };

  const handlePrevVideo = () => {
    if (!activeModalVideo) return;
    const currentIndex = filteredList.findIndex(v => v.id === activeModalVideo.id);
    const prevIndex = (currentIndex - 1 + filteredList.length) % filteredList.length;
    setActiveModalVideo(filteredList[prevIndex]);
  };

  return (
    <section id="student-stories" className="py-20 bg-slate-900 text-slate-100 border-b border-slate-800 relative overflow-hidden">
      
      {/* Background ambient accents dynamically bound to theme */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full blur-3xl pointer-events-none transition-colors duration-700" 
        style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.05)' }}
      />
      <div 
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-700" 
        style={{ backgroundColor: 'rgba(var(--secondary-rgb), 0.05)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full theme-badge text-xs font-semibold mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alumni Career Transformations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Student Testimonials & Alumni Stories
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
            Hear directly from Kenyans who transformed from coding beginners into professional software engineers, 
            data analysts, and cloud architects working at Safaricom, Equity Bank, Cellulant, and regional tech firms.
          </p>

          {/* Metric Bar with dynamic theme highlights */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border transition-all font-medium text-slate-200"
              style={{
                backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                borderColor: 'rgba(var(--primary-rgb), 0.28)'
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--primary-color)' }} />
              <span>94% Job Placement Rate</span>
            </div>

            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border transition-all font-medium text-slate-200"
              style={{
                backgroundColor: 'rgba(var(--secondary-rgb), 0.1)',
                borderColor: 'rgba(var(--secondary-rgb), 0.28)'
              }}
            >
              <Building2 className="w-4 h-4 shrink-0" style={{ color: 'var(--secondary-color)' }} />
              <span>Nairobi & Remote Tech Roles</span>
            </div>

            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border transition-all font-medium text-slate-200"
              style={{
                backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                borderColor: 'rgba(var(--primary-rgb), 0.28)'
              }}
            >
              <GraduationCap className="w-4 h-4 shrink-0" style={{ color: 'var(--primary-color)' }} />
              <span>1,200+ Alumni Network</span>
            </div>
          </div>
        </div>

        {/* Interactive Track Filter Bar with Dynamic Active State */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
            {[
              { id: 'all', label: 'All Alumni Stories' },
              { id: 'software', label: 'Software Engineering' },
              { id: 'data', label: 'Data Science & AI' },
              { id: 'cloud', label: 'Cloud & DevOps' },
              { id: 'security', label: 'Cyber Security' }
            ].map(tab => {
              const isActive = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  style={isActive ? {
                    backgroundColor: 'var(--primary-color)',
                    color: '#020617',
                    boxShadow: '0 4px 14px 0 rgba(var(--primary-rgb), 0.35)'
                  } : undefined}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Cards Grid - Compact 3-column proportion matching Tuition/Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item, index) => {
            const photoSrc = resolveStudentPhoto(item);
            const isFeatured = Number(item.is_featured) === 1;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="group relative bg-slate-950/80 hover:bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden theme-card-hover transition-all duration-300 flex flex-col justify-between shadow-xl"
              >
                <div>
                  {/* Playable Video Thumbnail Container - Sleek, compact height restricted to 190px–200px */}
                  <div 
                    onClick={() => handleOpenModal(item)}
                    className="relative h-48 max-h-[200px] w-full overflow-hidden bg-slate-950 cursor-pointer"
                  >
                    <img
                      src={photoSrc}
                      alt={`${item.student_name} testimonial thumbnail`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Play Button Overlay with Dynamic Theme Fill and Glow */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:brightness-110 transition-all duration-300"
                        style={{
                          backgroundColor: 'var(--primary-color)',
                          color: '#020617',
                          boxShadow: '0 6px 20px rgba(var(--primary-rgb), 0.45)'
                        }}
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Featured Story Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                      {isFeatured && (
                        <span 
                          className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md border backdrop-blur-xs flex items-center gap-1 shadow-xs theme-badge"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Featured Story</span>
                        </span>
                      )}
                    </div>

                    {/* Duration badge dynamically bound to primary theme */}
                    <div 
                      className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-200 bg-slate-950/90 px-2 py-0.5 rounded-md border border-slate-800"
                    >
                      <Clock className="w-3 h-3 theme-text-primary" />
                      <span className="theme-text-primary font-bold">{item.duration || '3:00'}</span>
                      {item.views_count ? (
                        <>
                          <span className="text-slate-600" aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Eye className="w-3 h-3 text-slate-400" />
                            {item.views_count.toLocaleString()}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Card Content Area - Compact proportions */}
                  <div className="p-5">
                    {/* Track & Cohort (Unboxed metadata with theme color) */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
                      <span 
                        className="font-semibold tracking-wide theme-text-primary uppercase text-[10px]"
                      >
                        {item.course_program}
                      </span>
                      {item.cohort && (
                        <>
                          <span className="text-slate-600" aria-hidden="true">·</span>
                          <span className="text-slate-400 font-mono text-[10px]">{item.cohort}</span>
                        </>
                      )}
                    </div>

                    {/* Student Name */}
                    <h3 className="text-base sm:text-lg font-bold text-white theme-group-hover-title transition-colors">
                      {item.student_name}
                    </h3>

                    {/* Career Role & Company */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.career_role}</span>
                      {item.company && (
                        <>
                          <span className="text-slate-500">at</span>
                          <span className="font-semibold theme-text-secondary truncate">
                            {item.company}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Key Quote / Short Highlight */}
                    <blockquote 
                      className="mt-3 text-xs text-slate-300 leading-relaxed italic border-l-2 pl-2.5 transition-colors line-clamp-3"
                      style={{ borderColor: 'var(--primary-color)' }}
                    >
                      "{item.quote_highlight}"
                    </blockquote>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-85 theme-text-primary"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch Full Story</span>
                  </button>

                  {onApplyForCourse && (
                    <button
                      onClick={() => onApplyForCourse(item.course_program)}
                      className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {item.course_program.split(' ')[0]} Track &rarr;
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Strip underneath the gallery */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Ready to write your own Kenya tech success story?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Join the next cohort on Ngong Road or attend live online evening sessions. Applications are open for upcoming intakes.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            {onApplyForCourse && (
              <button
                onClick={() => onApplyForCourse()}
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: '#020617',
                  boxShadow: '0 8px 20px -4px rgba(var(--primary-rgb), 0.35)'
                }}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl hover:brightness-110 text-xs sm:text-sm font-bold transition-all cursor-pointer text-center"
              >
                Apply for Next Cohort
              </button>
            )}
            {onExplorePrograms && (
              <button
                onClick={onExplorePrograms}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer text-center bg-slate-900"
              >
                Browse Syllabus
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Responsive Video Modal Player */}
      <AnimatePresence>
        {activeModalVideo && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950/85 backdrop-blur-md"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[90vh]"
            >
              
              {/* Modal Header */}
              <div className="p-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700">
                    <img
                      src={resolveStudentPhoto(activeModalVideo)}
                      alt={activeModalVideo.student_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {activeModalVideo.student_name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeModalVideo.career_role} {activeModalVideo.company ? `at ${activeModalVideo.company}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevVideo}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Previous Story (Left Arrow)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextVideo}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Next Story (Right Arrow)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ml-2"
                    title="Close (Escape)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Video Player Embed / Video Element */}
              <div className="relative aspect-video w-full bg-black">
                {(() => {
                  const media = getEmbedUrl(activeModalVideo.video_url);

                  if (media.type === 'video') {
                    return (
                      <video
                        src={media.url}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    );
                  }

                  if (media.url) {
                    return (
                      <iframe
                        src={media.url}
                        title={`${activeModalVideo.student_name} Video Testimonial`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    );
                  }

                  // Simulated video playback container fallback
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border"
                        style={{
                          backgroundColor: 'rgba(var(--primary-rgb), 0.15)',
                          borderColor: 'rgba(var(--primary-rgb), 0.35)',
                          color: 'var(--primary-color)'
                        }}
                      >
                        <Volume2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2">Video Testimonial Recording</h4>
                      <p className="text-xs text-slate-400 max-w-md mb-4">
                        Direct video stream for {activeModalVideo.student_name} ({activeModalVideo.duration || '3:12'}).
                      </p>
                      <a
                        href={activeModalVideo.video_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          backgroundColor: 'var(--primary-color)',
                          color: '#020617'
                        }}
                        className="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Video Stream Directly</span>
                      </a>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer / Highlight & Application Action */}
              <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span 
                      className="font-semibold theme-text-primary"
                    >
                      {activeModalVideo.course_program}
                    </span>
                    {activeModalVideo.cohort && (
                      <>
                        <span className="text-slate-600" aria-hidden="true">·</span>
                        <span>{activeModalVideo.cohort}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 italic">
                    "{activeModalVideo.quote_highlight}"
                  </p>
                </div>

                {onApplyForCourse && (
                  <button
                    onClick={() => {
                      handleCloseModal();
                      onApplyForCourse(activeModalVideo.course_program);
                    }}
                    style={{
                      backgroundColor: 'var(--primary-color)',
                      color: '#020617',
                      boxShadow: '0 8px 16px -4px rgba(var(--primary-rgb), 0.3)'
                    }}
                    className="px-4 py-2 rounded-xl hover:brightness-110 text-xs font-bold transition-all whitespace-nowrap cursor-pointer self-start sm:self-auto"
                  >
                    Apply for {activeModalVideo.course_program.split(' ')[0]} Track
                  </button>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
