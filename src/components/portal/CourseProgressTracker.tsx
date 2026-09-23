import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Send, 
  Sparkles, 
  FileCode, 
  BookOpen, 
  RotateCw, 
  Check, 
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CourseProgressSummary, StudentModuleProgress } from '../../types';

interface CourseProgressTrackerProps {
  studentEmail: string;
  studentName: string;
  onProgressUpdated?: (percentage: number) => void;
}

export const CourseProgressTracker: React.FC<CourseProgressTrackerProps> = ({
  studentEmail,
  studentName,
  onProgressUpdated
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    activeCourseId: string;
    overallPercentage: number;
    activeCourseSummary: CourseProgressSummary | null;
    allCoursesSummaries: CourseProgressSummary[];
  } | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [submittingModule, setSubmittingModule] = useState<{
    moduleId: string;
    moduleTitle: string;
    moduleNumber: number;
    courseId: string;
    courseTitle: string;
  } | null>(null);

  const [studentNotes, setStudentNotes] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [markingCompleteId, setMarkingCompleteId] = useState<string | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const fetchProgress = async (courseId?: string) => {
    try {
      const email = studentEmail || 'student@codepointkenya.com';
      const targetCourse = courseId || selectedCourseId;
      const url = targetCourse 
        ? `/api/progress/student?email=${encodeURIComponent(email)}&course_id=${encodeURIComponent(targetCourse)}`
        : `/api/progress/student?email=${encodeURIComponent(email)}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.activeCourseId && !selectedCourseId) {
          setSelectedCourseId(json.activeCourseId);
        }
        if (onProgressUpdated && typeof json.overallPercentage === 'number') {
          onProgressUpdated(json.overallPercentage);
        }
      }
    } catch (err) {
      console.error('Failed to load course progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [studentEmail]);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    fetchProgress(courseId);
  };

  const handleOpenSubmitModal = (mod: any, course: CourseProgressSummary) => {
    setSubmittingModule({
      moduleId: mod.moduleId,
      moduleTitle: mod.title,
      moduleNumber: mod.moduleNumber,
      courseId: course.courseId,
      courseTitle: course.courseTitle
    });
    setStudentNotes(mod.progressRecord?.student_notes || '');
    setSubmissionUrl(mod.progressRecord?.student_submission_url || '');
    setActionMessage(null);
  };

  const handleSubmitForApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingModule) return;
    setSubmitting(true);
    setActionMessage(null);

    try {
      const res = await fetch('/api/progress/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: studentEmail || 'student@codepointkenya.com',
          student_name: studentName || 'Brian Kipchumba',
          course_id: submittingModule.courseId,
          course_title: submittingModule.courseTitle,
          module_id: submittingModule.moduleId,
          module_title: submittingModule.moduleTitle,
          module_number: submittingModule.moduleNumber,
          student_notes: studentNotes.trim(),
          student_submission_url: submissionUrl.trim()
        })
      });

      const json = await res.json();
      if (!res.ok) {
        setActionMessage({ text: json.error || 'Failed to submit module for review', isError: true });
      } else {
        setActionMessage({ 
          text: `Module "${submittingModule.moduleTitle}" successfully submitted for teacher review! Once your instructor approves, you can mark it complete.`, 
          isError: false 
        });
        setSubmittingModule(null);
        await fetchProgress(submittingModule.courseId);
      }
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Network error occurred', isError: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async (moduleId: string, courseId: string) => {
    setMarkingCompleteId(moduleId);
    setActionMessage(null);

    try {
      const res = await fetch('/api/progress/mark-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: studentEmail || 'student@codepointkenya.com',
          course_id: courseId,
          module_id: moduleId
        })
      });

      const json = await res.json();
      if (!res.ok) {
        setActionMessage({ text: json.error || 'Failed to mark module complete', isError: true });
      } else {
        setActionMessage({ 
          text: '✓ Module marked complete! Your profile completion percentage has been updated.', 
          isError: false 
        });
        await fetchProgress(courseId);
      }
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Network error occurred', isError: true });
    } finally {
      setMarkingCompleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs">
        <RotateCw className="w-5 h-5 mx-auto mb-2 animate-spin text-emerald-400" />
        <span>Loading your course curriculum & progress tracking...</span>
      </div>
    );
  }

  const activeCourse = data?.activeCourseSummary || data?.allCoursesSummaries?.[0];
  if (!activeCourse) {
    return null;
  }

  const percentage = activeCourse.percentage || 0;
  const completedCount = activeCourse.completedModules || 0;
  const totalCount = activeCourse.totalModules || 0;
  const approvedCount = activeCourse.approvedModules || 0;
  const pendingCount = activeCourse.pendingModules || 0;

  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
      
      {/* Header & Course Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-bold text-white tracking-tight">
              Course Progress & Module Completion Tracking
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Submit each module for teacher review. Once approved by your instructor, you can mark the module as complete to update your overall graduation progress.
          </p>
        </div>

        {/* Multi-Course Selector if student is enrolled in or viewing multiple programs */}
        {data && data.allCoursesSummaries.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Program:</span>
            <select
              value={activeCourse.courseId}
              onChange={(e) => handleSelectCourse(e.target.value)}
              className="bg-slate-900 border border-slate-750 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              {data.allCoursesSummaries.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.courseTitle} ({c.percentage}% Complete)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Profile Overall Percentage & Completion Bar */}
      <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
              Academic Milestone Status
            </span>
            <h5 className="text-base font-bold text-white mt-0.5">
              {activeCourse.courseTitle}
            </h5>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {percentage}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Overall Completed
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-750">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(percentage, 2)}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>{completedCount} of {totalCount} Modules Completed</span>
            <span>{totalCount - completedCount} Remaining</span>
          </div>
        </div>

        {/* Milestone Breakdown Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Modules</span>
            <span className="text-lg font-bold font-mono text-white">{totalCount}</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-center">
            <span className="text-[10px] uppercase font-mono text-emerald-400 block">Completed</span>
            <span className="text-lg font-bold font-mono text-emerald-300">{completedCount}</span>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-center">
            <span className="text-[10px] uppercase font-mono text-cyan-400 block">Teacher Approved</span>
            <span className="text-lg font-bold font-mono text-cyan-300">{approvedCount}</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-center">
            <span className="text-[10px] uppercase font-mono text-amber-400 block">In Review</span>
            <span className="text-lg font-bold font-mono text-amber-300">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Action / Feedback Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          actionMessage.isError 
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button 
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Individual Modules List with Approval & Completion Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider">
            Curriculum Modules & Teacher Approval Workflow
          </h5>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Step: Submit ➔ Teacher Review ➔ Mark Complete</span>
          </span>
        </div>

        <div className="space-y-3">
          {activeCourse.modules.map((m) => {
            const isCompleted = m.status === 'completed';
            const isApproved = m.status === 'approved';
            const isPending = m.status === 'pending_approval';
            const isRevision = m.status === 'revision_requested';
            const isExpanded = expandedModuleId === m.moduleId;

            return (
              <div 
                key={m.moduleId}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'bg-slate-900/60 border-emerald-500/30' 
                    : isApproved
                    ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm'
                    : isPending
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : isRevision
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Module Title & Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        Module {m.moduleNumber}
                      </span>

                      {/* Status Badges */}
                      {isCompleted && (
                        <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Completed</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <Award className="w-3 h-3 text-cyan-400" />
                          <span>Teacher Approved • Ready to Complete</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending Teacher Approval</span>
                        </span>
                      )}
                      {isRevision && (
                        <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          <span>Revision Requested</span>
                        </span>
                      )}
                      {!isCompleted && !isApproved && !isPending && !isRevision && (
                        <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          Not Completed
                        </span>
                      )}
                    </div>

                    <h6 className="text-sm font-bold text-white">
                      {m.title}
                    </h6>

                    {/* Subtopics snippet */}
                    {m.topics && m.topics.length > 0 && (
                      <p className="text-xs text-slate-400">
                        <span className="text-slate-500">Topics covered:</span> {m.topics.slice(0, 3).join(' • ')}
                        {m.topics.length > 3 && ` +${m.topics.length - 3} more`}
                      </p>
                    )}

                    {/* Teacher Feedback / Review notes if available */}
                    {m.progressRecord?.teacher_feedback && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                        <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-semibold mb-1">
                          <span>Feedback from {m.progressRecord.teacher_name || 'Course Instructor'}:</span>
                        </div>
                        <p className="text-slate-300 italic">
                          "{m.progressRecord.teacher_feedback}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-wrap items-center gap-2 lg:self-center">
                    
                    {/* CASE 1: Teacher Approved -> Student can mark as Complete! */}
                    {isApproved && (
                      <button
                        onClick={() => handleMarkComplete(m.moduleId, activeCourse.courseId)}
                        disabled={markingCompleteId === m.moduleId}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {markingCompleteId === m.moduleId ? (
                          <>
                            <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Mark Module as Complete</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* CASE 2: Already Completed */}
                    {isCompleted && (
                      <div className="text-right">
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Module Completed</span>
                        </span>
                        {m.progressRecord?.completed_at && (
                          <span className="text-[10px] text-slate-500 block font-mono">
                            {new Date(m.progressRecord.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CASE 3: Pending Teacher Review */}
                    {isPending && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-300 font-medium flex items-center gap-1.5 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Under Review</span>
                        </span>
                        <button
                          onClick={() => handleOpenSubmitModal(m, activeCourse)}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                          title="Update submission notes"
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {/* CASE 4: Not Started / Revision / In Progress -> Submit for approval */}
                    {(!isCompleted && !isApproved && !isPending) && (
                      <button
                        onClick={() => handleOpenSubmitModal(m, activeCourse)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isRevision 
                            ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40' 
                            : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isRevision ? 'Re-submit for Review' : 'Request Teacher Approval'}</span>
                      </button>
                    )}

                    {/* Toggle Details dropdown */}
                    <button
                      onClick={() => setExpandedModuleId(isExpanded ? null : m.moduleId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="View module syllabus details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Syllabus Details */}
                {isExpanded && m.topics && m.topics.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <span className="text-[11px] font-mono text-slate-400 uppercase block">Curriculum Breakdown:</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-300">
                      {m.topics.map((t: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submission Modal for Teacher Approval */}
      {submittingModule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400">Teacher Approval Request</span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {submittingModule.moduleTitle}
                </h4>
              </div>
              <button 
                onClick={() => setSubmittingModule(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForApproval} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-1">
                <span className="font-semibold text-white block">Course Teacher Approval Requirement:</span>
                <p className="text-slate-400 text-[11px]">
                  Your course teacher will review your completed project, exercises, or code repository for this module. Once approved, the module becomes eligible for you to mark as complete.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Project or Repository URL (GitHub, GitLab, or Live Demo):
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/your-username/module-capstone"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Student Notes & Key Learnings for Instructor:
                </label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what you built, key lessons mastered, or test coverage..."
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmittingModule(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Teacher Review</span>
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
