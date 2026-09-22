import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  Plus, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  CalendarDays, 
  BookOpen, 
  Sparkles, 
  Users, 
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck
} from 'lucide-react';
import { ClassLecture, Assignment, User } from '../../types';

interface ClassCalendarProps {
  lectures: ClassLecture[];
  assignments: Assignment[];
  currentUser?: User | null;
  onLectureCreated: (newLecture: ClassLecture) => void;
  onLectureDeleted: (lectureId: string) => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const ClassCalendar: React.FC<ClassCalendarProps> = ({
  lectures,
  assignments,
  currentUser,
  onLectureCreated,
  onLectureDeleted
}) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [cohortFilter, setCohortFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Lectures' | 'Deadlines'>('All');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<{ type: 'lecture' | 'assignment'; data: any } | null>(null);

  // New Lecture Form state
  const [newLecture, setNewLecture] = useState({
    title: '',
    course_title: 'Software Engineering Immersive',
    cohort: 'Cohort 14',
    day_of_week: 'Monday',
    start_time: '18:00',
    end_time: '20:00',
    recurrence: 'Weekly',
    location_type: 'Online Google Meet',
    meeting_link: 'https://meet.google.com/cpk-live-tech',
    description: ''
  });

  // Filter lectures
  const filteredLectures = lectures.filter(lec => {
    if (typeFilter === 'Deadlines') return false;
    if (cohortFilter !== 'All' && lec.cohort !== cohortFilter && lec.cohort !== 'All Cohorts') return false;
    return true;
  });

  // Filter assignments
  const filteredAssignments = assignments.filter(asg => {
    if (typeFilter === 'Lectures') return false;
    if (cohortFilter !== 'All' && asg.cohort !== cohortFilter && asg.cohort !== 'All Cohorts') return false;
    return true;
  });

  // Helper to map assignments to days of the week based on due_date string
  const getAssignmentsForDay = (day: string) => {
    return filteredAssignments.filter(asg => {
      const lower = asg.due_date.toLowerCase();
      // Match explicit day names or map dates to days
      if (lower.includes(day.toLowerCase())) return true;
      if (day === 'Tuesday' && (lower.includes('may 5') || lower.includes('5th'))) return true;
      if (day === 'Friday' && (lower.includes('friday') || lower.includes('weekend') || lower.includes('end of week'))) return true;
      if (day === 'Saturday' && lower.includes('saturday')) return true;
      if (day === 'Sunday' && (lower.includes('sunday') || lower.includes('midnight'))) return true;
      return false;
    });
  };

  const getLecturesForDay = (day: string) => {
    return filteredLectures.filter(lec => lec.day_of_week.toLowerCase() === day.toLowerCase());
  };

  const handleCreateLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecture.title.trim()) {
      setActionError('Please enter a lecture title');
      return;
    }

    try {
      setSubmitting(true);
      setActionError(null);

      const res = await fetch('/api/instructor/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLecture,
          instructor_email: currentUser?.email || 'instructor@codepointkenya.com',
          instructor_name: currentUser?.name || 'Brenda Wambui',
          course_id: newLecture.course_title.toLowerCase().includes('ai') 
            ? 'applied-ai' 
            : newLecture.course_title.toLowerCase().includes('data') 
            ? 'data-science' 
            : 'software-engineering'
        })
      });

      if (res.ok) {
        const data = await res.json();
        onLectureCreated(data.lecture);
        setActionSuccess(`Scheduled recurring lecture: "${newLecture.title}"`);
        setShowScheduleModal(false);
        setNewLecture({
          title: '',
          course_title: 'Software Engineering Immersive',
          cohort: 'Cohort 14',
          day_of_week: 'Monday',
          start_time: '18:00',
          end_time: '20:00',
          recurrence: 'Weekly',
          location_type: 'Online Google Meet',
          meeting_link: 'https://meet.google.com/cpk-live-tech',
          description: ''
        });
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        const err = await res.json();
        setActionError(err.error || 'Failed to schedule lecture');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error communicating with server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLecture = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the schedule?`)) return;

    try {
      const res = await fetch(`/api/instructor/lectures/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        onLectureDeleted(id);
        setActionSuccess(`Removed lecture "${title}"`);
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        const err = await res.json();
        setActionError(err.error || 'Failed to delete lecture');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error deleting lecture');
    }
  };

  return (
    <div id="class-calendar-root" className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Class Calendar & Curriculum Schedule
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage recurring synchronous lectures, physical lab sessions, and upcoming student assignment deadlines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="view-mode-week"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Grid
            </button>
            <button
              id="view-mode-month"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'month'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Overview
            </button>
          </div>

          {/* Schedule Lecture Action Button */}
          <button
            id="btn-schedule-lecture"
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Lecture</span>
          </button>
        </div>
      </div>

      {/* Alert Notices */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Scheduled Lectures
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-white">{filteredLectures.length}</span>
            <span className="text-xs text-emerald-400 font-medium">Recurring</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Assignment Deadlines
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-amber-400">{filteredAssignments.length}</span>
            <span className="text-xs text-slate-400 font-medium">Under Evaluation</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Cohort Filter
          </span>
          <select
            id="calendar-cohort-filter"
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-emerald-500"
          >
            <option value="All">All Cohorts</option>
            <option value="Cohort 14">Cohort 14 (Software Eng)</option>
            <option value="Cohort 15">Cohort 15 (Applied AI)</option>
            <option value="Cohort 16">Cohort 16 (Data Science)</option>
          </select>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Event Category
          </span>
          <select
            id="calendar-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-hidden focus:border-emerald-500"
          >
            <option value="All">All Events & Deadlines</option>
            <option value="Lectures">Lectures Only</option>
            <option value="Deadlines">Deadlines Only</option>
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      {viewMode === 'week' ? (
        /* Weekly Grid View */
        <div id="weekly-calendar-grid" className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const dayLectures = getLecturesForDay(day);
            const dayAssignments = getAssignmentsForDay(day);
            const isWeekend = day === 'Saturday' || day === 'Sunday';

            return (
              <div 
                key={day}
                id={`calendar-col-${day.toLowerCase()}`}
                className={`bg-slate-900/70 rounded-2xl border transition-all flex flex-col min-h-[380px] ${
                  isWeekend 
                    ? 'border-slate-800/80 bg-slate-900/40' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Day Header */}
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{day}</h3>
                    <span className="text-[10px] text-slate-400">
                      {dayLectures.length + dayAssignments.length} item{dayLectures.length + dayAssignments.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  {dayLectures.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20"></span>
                  )}
                </div>

                {/* Day Content */}
                <div className="p-2.5 space-y-2.5 flex-1 flex flex-col justify-start">
                  {/* Scheduled Lectures on this day */}
                  {dayLectures.map((lec) => (
                    <div
                      key={lec.id}
                      id={`lecture-card-${lec.id}`}
                      className="group bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/30 rounded-xl p-3 text-left transition-all hover:border-emerald-500/60 shadow-xs relative"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {lec.start_time} - {lec.end_time}
                        </span>
                        <button
                          onClick={() => handleDeleteLecture(lec.id, lec.title)}
                          title="Remove Lecture"
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-2 leading-snug">
                        {lec.title}
                      </h4>

                      <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                        <p className="text-emerald-300 font-medium">{lec.cohort}</p>
                        <p className="flex items-center gap-1 truncate">
                          {lec.location_type.includes('Online') ? (
                            <Video className="w-3 h-3 text-sky-400 shrink-0" />
                          ) : (
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          )}
                          <span className="truncate">{lec.location_type}</span>
                        </p>
                      </div>

                      {lec.meeting_link && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                          <a
                            href={lec.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 hover:underline"
                          >
                            <span>Open Room</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          <span className="text-[9px] bg-slate-700/60 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                            {lec.recurrence}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Assignment Deadlines on this day */}
                  {dayAssignments.map((asg) => (
                    <div
                      key={asg.id}
                      id={`assignment-card-${asg.id}`}
                      className="bg-amber-950/20 hover:bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-left transition-all hover:border-amber-500/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <BookmarkCheck className="w-2.5 h-2.5" />
                          Due Date
                        </span>
                        <span className="text-[10px] font-bold text-amber-400">{asg.max_marks} Pts</span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 mt-1.5 line-clamp-2">
                        {asg.title}
                      </h4>

                      <p className="text-[10px] text-slate-400 mt-1">
                        {asg.cohort} • {asg.course_title.split(' ')[0]}
                      </p>

                      <div className="mt-2 pt-1.5 border-t border-amber-500/20 text-[10px] text-amber-300 font-mono">
                        {asg.due_date}
                      </div>
                    </div>
                  ))}

                  {dayLectures.length === 0 && dayAssignments.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-600">
                      <CalendarDays className="w-6 h-6 stroke-1 mb-1 opacity-50" />
                      <span className="text-[10px]">No sessions</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Monthly Overview View */
        <div id="monthly-calendar-grid" className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">May 2026 Academic Term</h3>
              <p className="text-xs text-slate-400">Software Engineering Cohort 14 & Applied AI Curriculum Block</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Live Lectures
              </span>
              <span className="flex items-center gap-1.5 text-slate-300 ml-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Assignment Deadlines
              </span>
            </div>
          </div>

          {/* Month Table Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 pb-2">
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
            <div>SUN</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Days 1-31 representation for May 2026 */}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((dateNum) => {
              // May 1, 2026 was a Friday
              const dayIndex = (dateNum + 3) % 7; // rough day map
              const dayName = DAYS_OF_WEEK[dayIndex];
              const dayLectures = getLecturesForDay(dayName);
              const dayAssignments = dateNum === 5 ? filteredAssignments : [];

              return (
                <div
                  key={dateNum}
                  className={`min-h-[90px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    dateNum === 4 || dateNum === 5 || dateNum === 6
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${dateNum === 4 ? 'text-emerald-400 font-black' : 'text-slate-400'}`}>
                      {dateNum}
                    </span>
                    {dayLectures.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayLectures.slice(0, 2).map((l) => (
                      <div
                        key={l.id}
                        className="text-[9px] bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded truncate border border-emerald-500/20"
                        title={`${l.title} (${l.start_time} - ${l.end_time})`}
                      >
                        {l.start_time} {l.title}
                      </div>
                    ))}

                    {dayAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="text-[9px] bg-amber-950/40 text-amber-300 px-1.5 py-0.5 rounded truncate border border-amber-500/30"
                        title={`Due: ${a.title}`}
                      >
                        Due: {a.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Lecture Modal */}
      {showScheduleModal && (
        <div 
          id="schedule-lecture-modal" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Schedule Recurring Lecture</h3>
                  <p className="text-xs text-slate-400">Add synchronous class session to student & instructor calendars</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Lecture / Session Title *
                </label>
                <input
                  id="lecture-title-input"
                  type="text"
                  required
                  placeholder="e.g. Advanced Python & Flask API Integration"
                  value={newLecture.title}
                  onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Academic Program
                  </label>
                  <select
                    value={newLecture.course_title}
                    onChange={(e) => setNewLecture({ ...newLecture, course_title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Software Engineering Immersive">Software Engineering Immersive</option>
                    <option value="Applied AI & LLM Systems">Applied AI & LLM Systems</option>
                    <option value="Data Science & Machine Learning">Data Science & Machine Learning</option>
                    <option value="Cybersecurity Operations">Cybersecurity Operations</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target Cohort
                  </label>
                  <select
                    value={newLecture.cohort}
                    onChange={(e) => setNewLecture({ ...newLecture, cohort: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Cohort 14">Cohort 14 (Current Active)</option>
                    <option value="Cohort 15">Cohort 15</option>
                    <option value="Cohort 16">Cohort 16</option>
                    <option value="All Cohorts">All Cohorts (General Masterclass)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newLecture.day_of_week}
                    onChange={(e) => setNewLecture({ ...newLecture, day_of_week: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newLecture.start_time}
                    onChange={(e) => setNewLecture({ ...newLecture, start_time: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newLecture.end_time}
                    onChange={(e) => setNewLecture({ ...newLecture, end_time: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Location / Modality
                  </label>
                  <select
                    value={newLecture.location_type}
                    onChange={(e) => setNewLecture({ ...newLecture, location_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Online Google Meet">Online Google Meet</option>
                    <option value="Ngong Rd Campus Lab">Ngong Rd Campus Lab</option>
                    <option value="Physical Lab A (Ngong Rd)">Physical Lab A (Ngong Rd)</option>
                    <option value="Physical Lab B (Ngong Rd)">Physical Lab B (Ngong Rd)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Recurrence
                  </label>
                  <select
                    value={newLecture.recurrence}
                    onChange={(e) => setNewLecture({ ...newLecture, recurrence: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Weekly">Weekly (Every {newLecture.day_of_week})</option>
                    <option value="Bi-weekly">Bi-weekly (Alternate weeks)</option>
                    <option value="Once-off">Once-off Guest Masterclass</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Meeting Link or Physical Room
                </label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or Teamshark Hub 5th Fl"
                  value={newLecture.meeting_link}
                  onChange={(e) => setNewLecture({ ...newLecture, meeting_link: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Session Notes & Prerequisites (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ensure Docker is installed. Clone starter repository before the call."
                  value={newLecture.description}
                  onChange={(e) => setNewLecture({ ...newLecture, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-schedule"
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? (
                    <span>Scheduling...</span>
                  ) : (
                    <>
                      <CalendarIcon className="w-4 h-4" />
                      <span>Confirm & Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
