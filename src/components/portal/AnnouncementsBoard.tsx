import React, { useState } from 'react';
import { Announcement, AnnouncementCategory } from '../../types';
import { 
  Megaphone, 
  Pin, 
  AlertCircle, 
  Bell, 
  CheckCircle2, 
  ExternalLink, 
  Calendar, 
  Clock, 
  User, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  BookmarkCheck,
  Radio
} from 'lucide-react';

interface AnnouncementsBoardProps {
  announcements: Announcement[];
  studentCohort?: string;
  studentProgram?: string;
  onRefresh?: () => void;
}

export const AnnouncementsBoard: React.FC<AnnouncementsBoardProps> = ({
  announcements,
  studentCohort = 'Cohort 14',
  studentProgram = 'Software Engineering Immersive',
  onRefresh
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter announcements
  const filtered = announcements.filter(item => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Pinned') return Boolean(item.is_pinned);
    if (selectedCategory === 'Unread') return !readIds.has(item.id);
    return item.category === selectedCategory;
  });

  const urgentCount = announcements.filter(a => a.priority === 'Urgent' && !readIds.has(a.id)).length;
  const unreadCount = announcements.filter(a => !readIds.has(a.id)).length;

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Urgent':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Lab Notice':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'Class Update':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'Guest Lecture':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Career':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'Urgent') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
          <AlertCircle className="w-3 h-3" />
          Urgent Notice
        </span>
      );
    }
    if (priority === 'High') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <Sparkles className="w-3 h-3" />
          High Priority
        </span>
      );
    }
    return null;
  };

  const formatAnnouncementDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHrs < 1) return 'Just now';
      if (diffHrs < 24) return `${diffHrs}h ago`;
      if (diffHrs < 48) return 'Yesterday';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="student-announcements-board" className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
      
      {/* Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white tracking-wide">
                Class Announcements Board
              </h4>
              {urgentCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {urgentCount} Urgent
                </span>
              )}
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Important updates broadcast directly by faculty leads and academic directors
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {['All', 'Pinned', 'Class Update', 'Lab Notice', 'Guest Lecture', 'Unread'].map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Announcements List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-850 text-slate-400 text-xs space-y-1">
          <p className="font-semibold text-slate-300">No announcements match this filter</p>
          <p className="text-[11px]">Select "All" to view all broadcast updates from your instructors.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map(item => {
            const isRead = readIds.has(item.id);
            const isExpanded = expandedIds.has(item.id);
            const isPinned = Boolean(item.is_pinned);
            const isUrgent = item.priority === 'Urgent';

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isUrgent 
                    ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20 border-rose-500/40' 
                    : isPinned 
                      ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/30' 
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-750'
                } ${isRead ? 'opacity-85' : ''}`}
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {isPinned && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Pin className="w-3 h-3 fill-emerald-400/40" />
                        PINNED
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>

                    {getPriorityBadge(item.priority)}

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
                      {item.cohort || 'All Cohorts'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatAnnouncementDate(item.created_at)}
                    </span>
                    <button
                      onClick={(e) => toggleRead(item.id, e)}
                      title={isRead ? "Mark as unread" : "Mark as acknowledged"}
                      className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                        isRead ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Announcement Title */}
                <div className="flex items-start justify-between gap-3">
                  <h5 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {item.title}
                  </h5>
                </div>

                {/* Content */}
                <div className="mt-2 text-xs text-slate-300 leading-relaxed font-sans">
                  <p className={isExpanded ? '' : 'line-clamp-2'}>
                    {item.content}
                  </p>
                  {item.content.length > 180 && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="text-emerald-400 text-[11px] font-medium mt-1 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Show less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Read full update <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>

                {/* Footer: Author & Action Button */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-emerald-300 font-mono font-bold">
                      {item.author_name ? item.author_name.charAt(0) : 'F'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200">{item.author_name}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5">• {item.author_role}</span>
                    </div>
                  </div>

                  {item.action_url && (
                    <a
                      href={item.action_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors"
                    >
                      <span>{item.action_label || 'View Details'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Syncs with Code Point Kenya Faculty Broadcast Stream</span>
        </span>
        <span>Showing {filtered.length} of {announcements.length} updates</span>
      </div>

    </div>
  );
};
