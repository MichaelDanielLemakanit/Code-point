import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Quote, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  MessageSquareHeart, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { Review } from '../types';

interface ReviewsSectionProps {
  onFeedbackSubmitted?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ onFeedbackSubmitted }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [fullName, setFullName] = useState('');
  const [roleProgram, setRoleProgram] = useState('');
  const [organization, setOrganization] = useState('');
  const [testimonial, setTestimonial] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch only approved reviews for public marquee
  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?approved=true&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const approved = data.filter((r: Review) => r.isApproved === true);
          setReviews(approved);
        } else {
          setReviews([]);
        }
      } else {
        setReviews([]);
      }
    } catch (e) {
      console.warn('Failed to load approved reviews:', e);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedReviews();

    const handleUpdate = () => {
      fetchApprovedReviews();
    };
    window.addEventListener('reviews-updated', handleUpdate);
    window.addEventListener('testimonials-updated', handleUpdate);
    window.addEventListener('video-testimonials-updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchApprovedReviews();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('reviews-updated', handleUpdate);
      window.removeEventListener('testimonials-updated', handleUpdate);
      window.removeEventListener('video-testimonials-updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!fullName.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (!testimonial.trim()) {
      setSubmitError('Please enter your testimonial or feedback review.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          full_name: fullName.trim(),
          role_program: roleProgram.trim() || 'Software Engineering Fellow',
          organization: organization.trim() || 'Independent / Tech Learner',
          testimonial: testimonial.trim(),
          avatar_url: avatarUrl.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(
          `Asante sana, ${fullName}! Your feedback and rating have been routed to the admissions moderation queue. Once approved by our team, your testimonial will appear live on our community marquee.`
        );
        // Reset form
        setRating(5);
        setFullName('');
        setRoleProgram('');
        setOrganization('');
        setTestimonial('');
        setAvatarUrl('');

        if (typeof onFeedbackSubmitted === 'function') {
          onFeedbackSubmitted();
        }
      } else {
        setSubmitError(data.error || 'Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      console.error('Error posting review:', err);
      setSubmitError('Network error while submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for rating label text
  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return '5.0 / 5.0 — Outstanding / Life-Changing Career Shift';
      case 4:
        return '4.0 / 5.0 — Very Good / Highly Recommended';
      case 3:
        return '3.0 / 5.0 — Solid Foundations & Practical Coding';
      case 2:
        return '2.0 / 5.0 — Fair / Needs Faster Mentor Response';
      case 1:
        return '1.0 / 5.0 — Unsatisfactory';
      default:
        return '5.0 / 5.0 — Outstanding';
    }
  };

  // Helper for generating avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Split reviews into two tracks for rich dual-row marquee if count > 3
  const firstRow = reviews.length > 0 ? reviews : [];
  const secondRow = reviews.length >= 4 ? [...reviews].reverse() : [];

  return (
    <section id="reviews" className="w-full max-w-full overflow-x-hidden py-24 bg-slate-950 text-slate-100 border-t border-slate-900 relative scroll-mt-20">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 blur-3xl pointer-events-none -z-0" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Loved by Kenyan Fellows, Career Switchers & Tech Teams
          </h2>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* INFINITE-SCROLL REVIEW MARQUEE (APPROVED REVIEWS ONLY)         */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-14 space-y-6">
          
          {loading && reviews.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-xs font-mono text-slate-500">
              Loading verified alumni reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 px-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 max-w-lg mx-auto space-y-2">
              <Quote className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Student & Alumni Feedback</h4>
              <p className="text-xs text-slate-400">
                Alumni and current fellows are invited to submit verified course feedback and project testimonials below.
              </p>
            </div>
          ) : (
            <>
              {/* Marquee Track 1 (Leftwards continuous animation) */}
              <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-5 py-2">
                  {/* Render track twice to ensure seamless continuous looping */}
                  {[...firstRow, ...firstRow].map((review, i) => {
                    const reviewerName = review.reviewerName || review.full_name || 'Fellow';
                    const reviewerRole = review.role || review.role_program || 'Software Engineering Fellow';
                    const reviewComment = review.comment || review.testimonial || '';
                    const reviewerAvatar = review.avatarUrl || review.avatar_url;

                    return (
                      <div
                        key={`row1-${review.id}-${i}`}
                        className="w-[84vw] sm:w-[350px] md:w-[380px] max-w-[380px] p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all duration-300 shrink-0 shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          {/* Rating Stars & Quote Icon */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(starNum => (
                                <Star
                                  key={starNum}
                                  className={`w-3.5 h-3.5 ${
                                    starNum <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <Quote className="w-4 h-4 text-emerald-500/40" />
                          </div>

                          {/* Testimonial Quote */}
                          <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-4">
                            "{reviewComment}"
                          </p>
                        </div>

                        {/* Reviewer Profile */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-3">
                          {reviewerAvatar ? (
                            <img
                              src={reviewerAvatar}
                              alt={reviewerName}
                              className="w-10 h-10 rounded-full object-cover border border-emerald-500/30 shrink-0 bg-slate-800"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/40">
                              {getInitials(reviewerName)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate">
                                {reviewerName}
                              </span>
                              <CheckCircle2 className="w-3.5 h-3.5 theme-text-primary shrink-0" title="Verified Alumni / Partner" />
                            </div>
                            <p className="text-[11px] theme-text-primary font-medium truncate">
                              {reviewerRole}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {review.organization}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Marquee Track 2 (Reverse rightwards continuous animation) */}
              {secondRow.length > 0 && (
                <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                  <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused] gap-5 py-2">
                    {[...secondRow, ...secondRow].map((review, i) => {
                      const reviewerName = review.reviewerName || review.full_name || 'Fellow';
                      const reviewerRole = review.role || review.role_program || 'Software Engineering Fellow';
                      const reviewComment = review.comment || review.testimonial || '';
                      const reviewerAvatar = review.avatarUrl || review.avatar_url;

                      return (
                        <div
                          key={`row2-${review.id}-${i}`}
                          className="w-[84vw] sm:w-[350px] md:w-[380px] max-w-[380px] p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900 transition-all duration-300 shrink-0 shadow-lg flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(starNum => (
                                  <Star
                                    key={starNum}
                                    className={`w-3.5 h-3.5 ${
                                      starNum <= review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                              <Quote className="w-4 h-4 text-teal-500/40" />
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-4">
                              "{reviewComment}"
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-3">
                            {reviewerAvatar ? (
                              <img
                                src={reviewerAvatar}
                                alt={reviewerName}
                                className="w-10 h-10 rounded-full object-cover border border-teal-500/30 shrink-0 bg-slate-800"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-indigo-800 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-teal-500/40">
                                {getInitials(reviewerName)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white truncate">
                                  {reviewerName}
                                </span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" title="Verified Fellow" />
                              </div>
                              <p className="text-[11px] text-teal-400 font-medium truncate">
                                {reviewerRole}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {review.organization}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* ------------------------------------------------------------- */}
        {/* PUBLIC FEEDBACK & RATING SUBMISSION FORM BLOCK (REQ 2)        */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-20 max-w-2xl mx-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shadow-2xl">
            {/* Corner ambient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 theme-text-primary" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider theme-text-primary">
                  Share Your Story
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Leave Feedback & Rating
              </h3>

              {/* Feedback Success Notification */}
              {submitSuccess && (
                <div className="mt-6 p-4 rounded-xl theme-badge text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 theme-text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold theme-text-primary">Feedback Received!</p>
                    <p className="leading-relaxed">{submitSuccess}</p>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {submitError && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmitReview} className="mt-6 space-y-5">
                
                {/* 1. Star Rating Selector */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300">
                    Your Overall Rating *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(starIndex => (
                      <button
                        key={starIndex}
                        type="button"
                        onClick={() => setRating(starIndex)}
                        onMouseEnter={() => setHoverRating(starIndex)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                        aria-label={`Rate ${starIndex} stars`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            starIndex <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] font-mono theme-text-primary font-semibold pt-1">
                    {getRatingLabel(hoverRating || rating)}
                  </p>
                </div>

                {/* 2. Full Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Kevin Otieno"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Role or Enrolled Program
                    </label>
                    <input
                      type="text"
                      value={roleProgram}
                      onChange={(e) => setRoleProgram(e.target.value)}
                      placeholder="e.g. Software Engineering Cohort 3 Alum"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 3. Organization & Optional Avatar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Current Organization / Company / University
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Junior Developer at Safaricom PLC"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Avatar URL <span className="text-slate-500 text-[10px]">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://... (or leave blank for initials)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* 4. Testimonial / Endorsement Quote */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Your Testimonial / Endorsement Quote *
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {testimonial.length}/500 chars
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    maxLength={500}
                    value={testimonial}
                    onChange={(e) => setTestimonial(e.target.value)}
                    placeholder="Share how Code Point Kenya impacted your learning, curriculum depth, Saturday Ngong Road labs, or tech career outcomes..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 theme-text-primary" />
                    Sent to Admissions Moderation Desk
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: 'var(--primary-color)' }}
                    className="px-6 py-2.5 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:brightness-110 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Feedback & Rating</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
