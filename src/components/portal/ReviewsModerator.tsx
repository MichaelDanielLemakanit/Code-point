import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  RefreshCw, 
  Filter, 
  Sparkles, 
  X, 
  AlertCircle,
  ThumbsUp,
  MessageSquareHeart,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Review } from '../../types';

interface ReviewsModeratorProps {
  showToast: (msg: string) => void;
  onRefreshApprovedReviews?: () => void;
}

export const ReviewsModerator: React.FC<ReviewsModeratorProps> = ({ 
  showToast,
  onRefreshApprovedReviews 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Edit / Add Review
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [modalRating, setModalRating] = useState<number>(5);
  const [modalFullName, setModalFullName] = useState('');
  const [modalRole, setModalRole] = useState('');
  const [modalOrg, setModalOrg] = useState('');
  const [modalTestimonial, setModalTestimonial] = useState('');
  const [modalAvatarUrl, setModalAvatarUrl] = useState('');
  const [modalStatus, setModalStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [modalIsFeatured, setModalIsFeatured] = useState<boolean>(false);
  const [isSavingModal, setIsSavingModal] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews?status=all');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.warn('Failed to fetch reviews:', e);
      showToast('Could not load reviews from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Quick Action: Change Status (Approve / Reject / Pending)
  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        
        if (newStatus === 'approved') {
          showToast('Review approved! Published live to the public marquee.');
        } else if (newStatus === 'rejected') {
          showToast('Review marked as rejected.');
        } else {
          showToast('Review moved back to pending moderation queue.');
        }

        if (typeof onRefreshApprovedReviews === 'function') {
          onRefreshApprovedReviews();
        }
      } else {
        alert('Failed to update review status');
      }
    } catch (e) {
      console.error('Error updating review status:', e);
      alert('Network error updating review');
    }
  };

  // Toggle is_featured
  const handleToggleFeatured = async (review: Review) => {
    const nextFeatured = !review.is_featured;
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: nextFeatured })
      });

      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_featured: nextFeatured ? 1 : 0 } : r));
        showToast(nextFeatured ? 'Review pinned to front of marquee!' : 'Review unpinned.');
        if (typeof onRefreshApprovedReviews === 'function') {
          onRefreshApprovedReviews();
        }
      }
    } catch (e) {
      console.error('Error toggling featured:', e);
    }
  };

  // Delete review
  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        showToast('Review permanently deleted.');
        if (typeof onRefreshApprovedReviews === 'function') {
          onRefreshApprovedReviews();
        }
      } else {
        alert('Failed to delete review');
      }
    } catch (e) {
      console.error('Error deleting review:', e);
      alert('Network error deleting review');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (review: Review) => {
    setActiveReview(review);
    setModalMode('edit');
    setModalRating(review.rating);
    setModalFullName(review.full_name);
    setModalRole(review.role_program);
    setModalOrg(review.organization);
    setModalTestimonial(review.testimonial);
    setModalAvatarUrl(review.avatar_url || '');
    setModalStatus(review.status);
    setModalIsFeatured(Boolean(review.is_featured));
    setIsModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setActiveReview(null);
    setModalMode('add');
    setModalRating(5);
    setModalFullName('');
    setModalRole('Software Engineering Cohort Alum');
    setModalOrg('Junior Developer, Safaricom PLC');
    setModalTestimonial('');
    setModalAvatarUrl('');
    setModalStatus('approved');
    setModalIsFeatured(false);
    setIsModalOpen(true);
  };

  // Save Modal Form (Add or Edit)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalFullName.trim() || !modalTestimonial.trim()) {
      alert('Please provide full name and testimonial quote.');
      return;
    }

    setIsSavingModal(true);
    try {
      if (modalMode === 'edit' && activeReview) {
        // PATCH existing review
        const res = await fetch(`/api/reviews/${activeReview.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: modalRating,
            full_name: modalFullName.trim(),
            role_program: modalRole.trim(),
            organization: modalOrg.trim(),
            testimonial: modalTestimonial.trim(),
            avatar_url: modalAvatarUrl.trim(),
            status: modalStatus,
            is_featured: modalIsFeatured
          })
        });

        if (res.ok) {
          const data = await res.json();
          setReviews(prev => prev.map(r => r.id === activeReview.id ? data.review : r));
          setIsModalOpen(false);
          showToast('Review updated successfully.');
          if (typeof onRefreshApprovedReviews === 'function') {
            onRefreshApprovedReviews();
          }
        } else {
          alert('Failed to update review.');
        }
      } else {
        // Add new review directly via POST /api/reviews
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: modalRating,
            full_name: modalFullName.trim(),
            role_program: modalRole.trim(),
            organization: modalOrg.trim(),
            testimonial: modalTestimonial.trim(),
            avatar_url: modalAvatarUrl.trim()
          })
        });

        if (res.ok) {
          const data = await res.json();
          // If admin chose 'approved', update status immediately
          if (modalStatus === 'approved' && data.review?.id) {
            await fetch(`/api/reviews/${data.review.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'approved', is_featured: modalIsFeatured })
            });
          }
          await fetchReviews();
          setIsModalOpen(false);
          showToast('New testimonial created and saved!');
          if (typeof onRefreshApprovedReviews === 'function') {
            onRefreshApprovedReviews();
          }
        } else {
          alert('Failed to create review.');
        }
      }
    } catch (e) {
      console.error('Error saving review in modal:', e);
      alert('Network error saving review');
    } finally {
      setIsSavingModal(false);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.full_name?.toLowerCase().includes(q);
      const matchRole = r.role_program?.toLowerCase().includes(q);
      const matchOrg = r.organization?.toLowerCase().includes(q);
      const matchText = r.testimonial?.toLowerCase().includes(q);
      return matchName || matchRole || matchOrg || matchText;
    }
    return true;
  });

  // Key Counts
  const totalCount = reviews.length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected').length;
  const avgRating = approvedCount > 0 
    ? (reviews.filter(r => r.status === 'approved').reduce((acc, r) => acc + r.rating, 0) / approvedCount).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <MessageSquareHeart className="w-7 h-7 text-emerald-600" />
            <span>Reviews & Ratings Moderation</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Review public feedback submissions, approve endorsements to the live website marquee, edit quotes, or add verified alumni stories.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchReviews}
            disabled={loading}
            className="p-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-4 h-4 text-stone-600 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-stone-900/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">Total Submissions</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">All-time reviews received</div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs transition-colors ${
          pendingCount > 0 
            ? 'bg-amber-50/70 border-amber-200 ring-1 ring-amber-300' 
            : 'bg-white border-stone-200'
        }`}>
          <div className="text-[11px] font-mono text-amber-700 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Awaiting admin approval</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] font-mono text-emerald-600 uppercase tracking-wider">Approved & Live</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</div>
          <div className="text-[11px] text-stone-500 mt-0.5">Visible on public marquee</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="text-[11px] font-mono text-amber-500 uppercase tracking-wider">Average Rating</div>
          <div className="text-2xl font-bold text-stone-900 mt-1 flex items-center gap-1.5">
            <span>{avgRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">Based on approved reviews</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'pending', label: `Pending Moderation (${pendingCount})`, highlight: pendingCount > 0 },
            { id: 'approved', label: `Approved & Live (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : tab.highlight
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, company, quote..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading && reviews.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-stone-500 bg-white rounded-2xl border border-stone-200">
            Loading submissions...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
            <MessageSquareHeart className="w-8 h-8 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No submissions found</h3>
            <p className="text-xs text-stone-500">
              {statusFilter === 'pending'
                ? 'Great news! There are no pending reviews in the queue.'
                : 'No reviews match your filter or search query.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const isApproved = review.status === 'approved';
            const isPending = review.status === 'pending';
            const isRejected = review.status === 'rejected';

            return (
              <div
                key={review.id}
                className={`p-5 sm:p-6 rounded-2xl bg-white border transition-all shadow-xs ${
                  isPending 
                    ? 'border-amber-300 bg-amber-50/20' 
                    : isApproved
                    ? 'border-stone-200 hover:border-emerald-500/40'
                    : 'border-stone-200 opacity-70'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Review Details */}
                  <div className="space-y-3 flex-1">
                    
                    {/* Status badge + Rating + Timestamp */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>Pending Moderation</span>
                        </span>
                      )}

                      {isApproved && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Approved & Live on Marquee</span>
                        </span>
                      )}

                      {isRejected && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5 text-rose-700" />
                          <span>Rejected / Hidden</span>
                        </span>
                      )}

                      {review.is_featured ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                          ★ Featured Pin
                        </span>
                      ) : null}

                      {/* Stars */}
                      <div className="flex items-center gap-1 ml-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= review.rating 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-[11px] font-mono text-stone-500">
                        {new Date(review.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Testimonial Quote */}
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 leading-relaxed font-sans italic">
                      "{review.testimonial}"
                    </div>

                    {/* Reviewer identity */}
                    <div className="flex items-center gap-3">
                      {review.avatar_url ? (
                        <img
                          src={review.avatar_url}
                          alt={review.full_name}
                          className="w-9 h-9 rounded-full object-cover border border-stone-300 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-stone-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {review.full_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <span>{review.full_name}</span>
                          <span className="text-[10px] text-stone-500 font-mono">({review.id})</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          {review.role_program}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {review.organization}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Moderation Actions Bar */}
                  <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                    
                    {/* Approve Button */}
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Publish</span>
                      </button>
                    )}

                    {/* Reject Button */}
                    {!isRejected && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(review.id, 'rejected')}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-stone-500" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Move to Pending if approved or rejected */}
                    {!isPending && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(review.id, 'pending')}
                        className="px-3 py-1.5 rounded-lg border border-amber-300 hover:bg-amber-50 text-amber-900 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Set to Pending</span>
                      </button>
                    )}

                    {/* Edit Details */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(review)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                      <span>Edit</span>
                    </button>

                    {/* Featured Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(review)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        review.is_featured
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                          : 'border-stone-200 hover:bg-stone-100 text-stone-600'
                      }`}
                      title="Toggle pinned feature status"
                    >
                      <Star className={`w-3.5 h-3.5 ${review.is_featured ? 'fill-indigo-600 text-indigo-600' : 'text-stone-400'}`} />
                      <span>{review.is_featured ? 'Pinned' : 'Pin to Top'}</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                      title="Delete review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit or Add Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquareHeart className="w-4 h-4 text-emerald-600" />
                  <span>{modalMode === 'edit' ? 'Edit Testimonial Details' : 'Add Verified Testimonial'}</span>
                </h4>
                <p className="text-xs text-stone-500">
                  {modalMode === 'edit' ? 'Update wording, rating, and public author info' : 'Manually create an alumni or partner endorsement'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              
              {/* Rating selection */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Star Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setModalRating(st)}
                      className="p-1 rounded cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          st <= modalRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2">
                    {modalRating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={modalFullName}
                  onChange={(e) => setModalFullName(e.target.value)}
                  placeholder="e.g. Kevin Otieno"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Role & Org */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Role / Program
                  </label>
                  <input
                    type="text"
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value)}
                    placeholder="e.g. Software Engineering Cohort 3 Alum"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    value={modalOrg}
                    onChange={(e) => setModalOrg(e.target.value)}
                    placeholder="e.g. Junior Developer, Safaricom PLC"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* Testimonial Quote */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Testimonial / Endorsement Quote *
                </label>
                <textarea
                  rows={4}
                  required
                  value={modalTestimonial}
                  onChange={(e) => setModalTestimonial(e.target.value)}
                  placeholder="The fellow's verified experience quote..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 leading-relaxed"
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Avatar Image URL <span className="text-stone-400 text-[10px]">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={modalAvatarUrl}
                  onChange={(e) => setModalAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Moderation Status & Featured Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Publication Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:border-stone-900 bg-white"
                  >
                    <option value="approved">Approved & Live</option>
                    <option value="pending">Pending Moderation</option>
                    <option value="rejected">Rejected / Hidden</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 pb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalIsFeatured}
                      onChange={(e) => setModalIsFeatured(e.target.checked)}
                      className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Pin to Front of Marquee</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingModal}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingModal ? 'Saving...' : modalMode === 'edit' ? 'Save Changes' : 'Publish Testimonial'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
