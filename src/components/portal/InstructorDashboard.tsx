import React, { useState, useEffect } from 'react';
import { User, Assignment, AssignmentSubmission, Certificate, SubmissionStatus, Announcement, AnnouncementCategory, AnnouncementPriority, ClassLecture } from '../../types';
import { ClassCalendar } from './ClassCalendar';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  Award, 
  FileCode,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  Save,
  X,
  Sparkles,
  BookOpen,
  Megaphone,
  Pin,
  Radio,
  Bell
} from 'lucide-react';
import { CertificateModal } from './CertificateModal';

interface InstructorDashboardProps {
  currentUser?: User | null;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({ currentUser }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grading' | 'assignments' | 'announcements' | 'certificates' | 'cohorts' | 'calendar'>('grading');

  // Lectures & Calendar state
  const [lectures, setLectures] = useState<ClassLecture[]>([]);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'Class Update' as AnnouncementCategory,
    cohort: 'All Cohorts',
    course_title: 'All Programs',
    priority: 'Normal' as AnnouncementPriority,
    is_pinned: false,
    action_url: '',
    action_label: ''
  });

  // Assignments state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    course_title: 'Software Engineering Immersive',
    cohort: 'Cohort 14',
    description: '',
    resource_url: '',
    sheets_url: '',
    due_date: 'May 5, 2026',
    max_marks: 100
  });

  // Submissions & Grading state
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [submissionFilter, setSubmissionFilter] = useState<'All' | 'Pending' | 'Marked' | 'Incomplete'>('All');
  const [gradingSub, setGradingSub] = useState<AssignmentSubmission | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [gradeStatus, setGradeStatus] = useState<SubmissionStatus>('Marked');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Certificate eligibility & approvals
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [approvingEmail, setApprovingEmail] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchFacultyData = async () => {
    try {
      const url = currentUser?.email
        ? `/api/instructor/data?email=${encodeURIComponent(currentUser.email)}`
        : '/api/instructor/data';
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d.assignments) setAssignments(d.assignments);
        if (d.submissions) setSubmissions(d.submissions);
        if (d.announcements) setAnnouncements(d.announcements);
        if (d.lectures) setLectures(d.lectures);
      }
    } catch (err) {
      console.error('Failed to load instructor data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLectures = async () => {
    try {
      const res = await fetch('/api/instructor/lectures');
      if (res.ok) {
        const d = await res.json();
        setLectures(d);
      }
    } catch (err) {
      console.error('Failed to load lectures', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const d = await res.json();
        setAnnouncements(d);
      }
    } catch (err) {
      console.error('Failed to load announcements', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Failed to load assignments', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Failed to load submissions', err);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (err) {
      console.error('Failed to load certificates', err);
    }
  };

  useEffect(() => {
    fetchFacultyData();
    fetchLectures();
    fetchAnnouncements();
    fetchAssignments();
    fetchSubmissions();
    fetchCertificates();
  }, [currentUser?.email]);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;
    setSavingAnnouncement(true);
    setAnnouncementMsg(null);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAnnouncement,
          author_name: currentUser?.name || data?.instructor?.name || 'Brenda Wambui',
          author_role: data?.instructor?.title || 'Lead Faculty & Curriculum Director'
        })
      });

      if (res.ok) {
        setAnnouncementMsg({ text: 'Broadcast update published to Student Portal!', isError: false });
        setShowAnnouncementModal(false);
        setNewAnnouncement({
          title: '',
          content: '',
          category: 'Class Update',
          cohort: 'All Cohorts',
          course_title: 'All Programs',
          priority: 'Normal',
          is_pinned: false,
          action_url: '',
          action_label: ''
        });
        fetchAnnouncements();
      } else {
        const err = await res.json();
        setAnnouncementMsg({ text: err.error || 'Failed to publish announcement', isError: true });
      }
    } catch (err: any) {
      setAnnouncementMsg({ text: err.message || 'Network error', isError: true });
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Remove this announcement from student portals?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        setAnnouncementMsg({ text: 'Announcement removed successfully.', isError: false });
      }
    } catch (err) {
      console.error("Failed to delete announcement", err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) return;
    setSavingAssignment(true);

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAssignment,
          instructor_name: currentUser?.name || data?.instructor?.name || 'Curriculum Faculty'
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewAssignment({
          title: '',
          course_title: 'Software Engineering Immersive',
          cohort: 'Cohort 14',
          description: '',
          resource_url: '',
          sheets_url: '',
          due_date: 'May 5, 2026',
          max_marks: 100
        });
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to save assignment', err);
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAssignments();
      }
    } catch (err) {
      console.error('Failed to delete assignment', err);
    }
  };

  const handleOpenGradeModal = (sub: AssignmentSubmission) => {
    setGradingSub(sub);
    setGradeMarks(sub.marks !== null && sub.marks !== undefined ? sub.marks : 85);
    setGradeFeedback(sub.feedback || '');
    setGradeStatus(sub.status || 'Marked');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;
    setSubmittingGrade(true);

    try {
      const res = await fetch(`/api/submissions/${gradingSub.id}/grade`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marks: Number(gradeMarks),
          feedback: gradeFeedback.trim(),
          status: gradeStatus
        })
      });

      if (res.ok) {
        setGradingSub(null);
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Failed to submit grade', err);
    } finally {
      setSubmittingGrade(false);
    }
  };

  const handleApproveCertificate = async (studentEmail: string, studentName: string, courseTitle: string) => {
    setApprovingEmail(studentEmail);
    setApprovalMessage(null);

    try {
      const res = await fetch('/api/certificates/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: studentEmail,
          student_name: studentName,
          course_title: courseTitle,
          cohort: 'Cohort 14',
          approved_by: 'Code Point Kenya Academic Board & Faculty',
          final_grade: 'Distinction'
        })
      });

      const json = await res.json();
      if (!res.ok) {
        setApprovalMessage({ text: json.error || 'Failed to approve certificate', isError: true });
      } else {
        setApprovalMessage({ text: `Certificate successfully issued for ${studentName}!`, isError: false });
        fetchCertificates();
        if (json.certificate) {
          setSelectedCert(json.certificate);
        }
      }
    } catch (err: any) {
      setApprovalMessage({ text: err.message || 'Error executing certificate approval', isError: true });
    } finally {
      setApprovingEmail(null);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading faculty workspace...</div>;
  }

  const displayName = currentUser?.name || data.instructor?.name || 'Brenda Wambui';
  const displayTitle = data.instructor?.title || 'Software Engineering & Applied AI Curriculum Lead';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  // Group submissions by student for the certificate evaluation rule
  const studentMap: Record<string, { name: string; email: string; course: string; submissions: AssignmentSubmission[] }> = {};
  for (const s of submissions) {
    const key = s.student_email.toLowerCase();
    if (!studentMap[key]) {
      studentMap[key] = {
        name: s.student_name,
        email: s.student_email,
        course: s.course_title,
        submissions: []
      };
    }
    studentMap[key].submissions.push(s);
  }

  const filteredSubmissions = submissions.filter(s => {
    if (submissionFilter === 'All') return true;
    return s.status === submissionFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Faculty Profile Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xl uppercase font-mono shadow-inner">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{displayName}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Curriculum Lead
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{displayTitle}</p>
            <p className="text-[11px] text-indigo-300 mt-1 flex items-center gap-1 font-mono">
              <MapPin className="w-3 h-3" />
              <span>Saturday Labs & Clinics: Ngong Road, Teamshark 5th Floor</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast Announcement</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post Assignment</span>
          </button>
        </div>
      </div>

      {announcementMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          announcementMsg.isError 
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300' 
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {announcementMsg.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{announcementMsg.text}</span>
          </div>
          <button onClick={() => setAnnouncementMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'announcements'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcements Board ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('grading')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'grading'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Submissions & Grading ({submissions.filter(s => s.status === 'Pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'assignments'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Coursework & Material Manager ({assignments.length})</span>
        </button>

        <button
          id="tab-class-calendar"
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'calendar'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Class Calendar & Schedule ({lectures.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'certificates'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificate Eligibility & Approvals</span>
        </button>

        <button
          onClick={() => setActiveTab('cohorts')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'cohorts'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Assigned Cohorts & Office Hours</span>
        </button>
      </div>

      {/* TAB 0: ANNOUNCEMENTS MANAGEMENT */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          
          {/* Header & Stats Strip */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-emerald-400" />
                  <span>Class Announcements & Student Broadcast Center</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Updates posted here appear prominently on all student portals upon login and sync with live cohort feeds.
                </p>
              </div>

              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Announcement</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Broadcasts</span>
                <span className="text-lg font-mono font-bold text-white mt-0.5 block">{announcements.length}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Pinned to Top</span>
                <span className="text-lg font-mono font-bold text-emerald-400 mt-0.5 block">
                  {announcements.filter(a => a.is_pinned).length}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Urgent Alerts</span>
                <span className="text-lg font-mono font-bold text-rose-400 mt-0.5 block">
                  {announcements.filter(a => a.priority === 'Urgent').length}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Active Cohorts</span>
                <span className="text-lg font-mono font-bold text-sky-400 mt-0.5 block">Cohort 14, 15, 16</span>
              </div>
            </div>
          </div>

          {/* Announcements Card List */}
          {announcements.length === 0 ? (
            <div className="p-12 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
              <Megaphone className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No active announcements</p>
              <p className="text-xs max-w-sm mx-auto text-slate-500">
                Broadcast class cancellations, assignment updates, or campus lab hours directly to students.
              </p>
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Create First Announcement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {announcements.map(ann => {
                const isPinned = Boolean(ann.is_pinned);
                const isUrgent = ann.priority === 'Urgent';

                return (
                  <div
                    key={ann.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isUrgent 
                        ? 'bg-slate-950 border-rose-500/40 shadow-lg shadow-rose-950/10' 
                        : isPinned 
                          ? 'bg-slate-950 border-emerald-500/30' 
                          : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          {isPinned && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <Pin className="w-3 h-3 fill-emerald-400/40" />
                              PINNED
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${
                            ann.category === 'Urgent' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                            ann.category === 'Lab Notice' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                            ann.category === 'Class Update' ? 'bg-sky-500/15 text-sky-300 border-sky-500/30' :
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {ann.category}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                            ann.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            ann.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}>
                            {ann.priority} Priority
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-850">
                            Target: {ann.cohort || 'All Cohorts'}
                          </span>

                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-850">
                            {ann.course_title || 'All Programs'}
                          </span>
                        </div>

                        {/* Title & Body */}
                        <h5 className="text-base font-bold text-white pt-1">
                          {ann.title}
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                          {ann.content}
                        </p>

                        {/* Attached Action URL if any */}
                        {ann.action_url && (
                          <div className="pt-2">
                            <a
                              href={ann.action_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
                            >
                              <span>{ann.action_label || 'Attached Resource'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Author & Timestamp */}
                        <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400 font-mono">
                          <span>Posted by: <strong className="text-slate-200">{ann.author_name}</strong> ({ann.author_role})</span>
                          <span>•</span>
                          <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="flex items-center gap-2 sm:self-start pt-2 sm:pt-0">
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          title="Delete announcement"
                          className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 1: SUBMISSIONS & GRADING */}
      {activeTab === 'grading' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Filter Submissions by Evaluation Status:</span>
            </div>
            <div className="flex items-center gap-2">
              {(['All', 'Pending', 'Marked', 'Incomplete'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setSubmissionFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    submissionFilter === status
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs">
              No submissions found for the "{submissionFilter}" filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map(sub => {
                const isPending = sub.status === 'Pending';
                const isMarked = sub.status === 'Marked';
                const isIncomplete = sub.status === 'Incomplete';

                return (
                  <div 
                    key={sub.id} 
                    className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white">{sub.assignment_title}</span>
                        {isMarked && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Marked ({sub.marks}/100)
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Pending Review
                          </span>
                        )}
                        {isIncomplete && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Incomplete (Needs Resubmit)
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-white">{sub.student_name}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-mono text-[11px]">{sub.student_email}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-[11px]">{sub.course_title}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-mono text-[11px]">Submitted {new Date(sub.submitted_at).toLocaleDateString()}</span>
                      </div>

                      {/* Submitted link */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Deliverable Link:</span>
                        <a
                          href={sub.submission_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span className="truncate max-w-xs">{sub.submission_url}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>

                      {sub.feedback && (
                        <div className="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-900 border border-slate-850">
                          <span className="text-slate-400 font-mono text-[10px] uppercase block">Instructor Feedback:</span>
                          {sub.feedback}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        onClick={() => handleOpenGradeModal(sub)}
                        className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{isMarked ? 'Update Marks' : 'Review & Grade'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: COURSEWORK & ASSIGNMENT MANAGER */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Curriculum Task & Assignment Repository
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage project tasks, syllabus assignments, and attached Google Sheets instruction templates.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(asg => {
              const subCount = submissions.filter(s => s.assignment_id === asg.id).length;
              return (
                <div 
                  key={asg.id} 
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 text-emerald-400 border border-emerald-500/30">
                        {asg.cohort}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Max Marks: {asg.max_marks} pts
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-white">{asg.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{asg.description || 'No detailed instructions provided.'}</p>
                    
                    {/* Material links */}
                    <div className="pt-2 space-y-1.5">
                      {asg.sheets_url && (
                        <div className="flex items-center gap-2 text-xs">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <a
                            href={asg.sheets_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline font-mono text-[11px] truncate"
                          >
                            Google Sheets Template: {asg.sheets_url}
                          </a>
                        </div>
                      )}

                      {asg.resource_url && (
                        <div className="flex items-center gap-2 text-xs">
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <a
                            href={asg.resource_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:underline font-mono text-[11px] truncate"
                          >
                            External Resource: {asg.resource_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">Due: {asg.due_date} • {subCount} Submissions</span>
                    <button
                      onClick={() => handleDeleteAssignment(asg.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete assignment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 3: CONDITIONAL CERTIFICATE APPROVALS */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono tracking-wider">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Strict Conditional Certificate Approval Policy</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with academic standards at Code Point Kenya, a student's graduation certificate <strong className="text-white">CANNOT</strong> be approved or generated if the student has any <span className="text-amber-400">Pending</span> or <span className="text-rose-400">Incomplete</span> assignment submissions. Only once all coursework deliverables have been evaluated and given a status of <span className="text-emerald-400 font-semibold">'Marked'</span> is the approval action unlocked.
            </p>

            {approvalMessage && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 mt-2 ${
                approvalMessage.isError 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {approvalMessage.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                <span>{approvalMessage.text}</span>
              </div>
            )}
          </div>

          {/* Student Roster Certificate Eligibility Grid */}
          <div className="space-y-3">
            {Object.values(studentMap).map(student => {
              const totalSubs = student.submissions.length;
              const pendingSubs = student.submissions.filter(s => s.status === 'Pending').length;
              const incompleteSubs = student.submissions.filter(s => s.status === 'Incomplete').length;
              const markedSubs = student.submissions.filter(s => s.status === 'Marked').length;

              // Enforce rule: Must have submissions and 0 pending and 0 incomplete
              const isEligible = totalSubs > 0 && pendingSubs === 0 && incompleteSubs === 0;
              
              // Check if already has issued certificate
              const existingCertificate = certificates.find(c => c.student_email.toLowerCase() === student.email.toLowerCase());

              return (
                <div 
                  key={student.email} 
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="text-sm font-bold text-white">{student.name}</h5>
                      <span className="text-xs font-mono text-slate-400">({student.email})</span>
                      {existingCertificate ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Certificate Issued ({existingCertificate.verification_id})</span>
                        </span>
                      ) : isEligible ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Eligible for Certificate</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Blocked ({pendingSubs} Pending, {incompleteSubs} Incomplete)</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300">{student.course}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono pt-1 text-slate-400">
                      <span>Total Tasks: {totalSubs}</span>
                      <span>•</span>
                      <span className="text-emerald-400">Marked: {markedSubs}</span>
                      <span>•</span>
                      <span className="text-amber-400">Pending: {pendingSubs}</span>
                      <span>•</span>
                      <span className="text-rose-400">Incomplete: {incompleteSubs}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {existingCertificate ? (
                      <button
                        onClick={() => setSelectedCert(existingCertificate)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Certificate</span>
                      </button>
                    ) : (
                      <button
                        disabled={!isEligible || approvingEmail === student.email}
                        onClick={() => handleApproveCertificate(student.email, student.name, student.course)}
                        title={
                          isEligible 
                            ? 'Approve and generate official digital certificate'
                            : 'Cannot approve: All submissions must be evaluated and marked first'
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          isEligible
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg'
                            : 'bg-slate-900 text-slate-500 border border-slate-850 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{approvingEmail === student.email ? 'Approving...' : 'Approve Certificate'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 4: COHORTS & CLINICS */}
      {activeTab === 'cohorts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Assigned Cohorts Overview:
            </h4>

            <div className="space-y-3">
              {data.cohorts.map((cohort: any) => (
                <div key={cohort.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">{cohort.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {cohort.studentsCount} Students • Avg Attendance: {cohort.avgAttendance}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-[10px] font-mono text-emerald-400">
                    Active Cohort
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Faculty Office Hours & Weekend Clinics:
            </h4>

            <div className="space-y-3">
              {data.officeHourSlots.map((slot: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-white block">{slot.time}</span>
                    <span className="text-slate-400 text-[11px]">{slot.location}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-emerald-400 font-medium font-mono">
                    {slot.booked} Booked
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: CLASS CALENDAR & LECTURES */}
      {activeTab === 'calendar' && (
        <ClassCalendar
          lectures={lectures}
          assignments={assignments}
          currentUser={currentUser}
          onLectureCreated={(newLecture) => setLectures(prev => [newLecture, ...prev])}
          onLectureDeleted={(lectureId) => setLectures(prev => prev.filter(l => l.id !== lectureId))}
        />
      )}

      {/* POST ASSIGNMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white uppercase font-mono">Post New Coursework Task</h4>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g., RESTful Backend API & SQL Database Migration"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Cohort</label>
                  <input
                    type="text"
                    value={newAssignment.cohort}
                    onChange={e => setNewAssignment({ ...newAssignment, cohort: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Max Marks (pts)</label>
                  <input
                    type="number"
                    value={newAssignment.max_marks}
                    onChange={e => setNewAssignment({ ...newAssignment, max_marks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Task Instructions / Description</label>
                <textarea
                  rows={3}
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Outline requirements, rubric criteria, and repository delivery guidelines..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Dedicated Google Sheets Link Input */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Sheets Link (Instructions / Grading Rubric)</span>
                </label>
                <input
                  type="url"
                  value={newAssignment.sheets_url}
                  onChange={e => setNewAssignment({ ...newAssignment, sheets_url: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none font-mono"
                />
              </div>

              {/* External Resource Link */}
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>External Resource Link (GitHub / Figma / Docs)</span>
                </label>
                <input
                  type="url"
                  value={newAssignment.resource_url}
                  onChange={e => setNewAssignment({ ...newAssignment, resource_url: e.target.value })}
                  placeholder="https://github.com/codepoint-kenya/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Due Date</label>
                <input
                  type="text"
                  value={newAssignment.due_date}
                  onChange={e => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                  placeholder="e.g., May 10, 2026, 11:59 PM EAT"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAssignment}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 disabled:opacity-50"
                >
                  {savingAssignment ? 'Publishing...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {gradingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h4 className="text-sm font-bold text-white">Grade Student Submission</h4>
                <p className="text-[11px] text-slate-400">{gradingSub.student_name} • {gradingSub.assignment_title}</p>
              </div>
              <button
                onClick={() => setGradingSub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 text-xs">
                <span className="text-slate-400 block font-mono text-[10px] uppercase">Deliverable Link:</span>
                <a
                  href={gradingSub.submission_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline font-mono text-xs inline-flex items-center gap-1 mt-0.5"
                >
                  <span>{gradingSub.submission_url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Marks Score (out of 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={gradeMarks}
                    onChange={e => setGradeMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Status</label>
                  <select
                    value={gradeStatus}
                    onChange={e => setGradeStatus(e.target.value as SubmissionStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="Marked">Marked (Pass)</option>
                    <option value="Pending">Pending (Under Review)</option>
                    <option value="Incomplete">Incomplete (Needs Resubmit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Faculty Feedback & Rubric Notes</label>
                <textarea
                  rows={4}
                  value={gradeFeedback}
                  onChange={e => setGradeFeedback(e.target.value)}
                  placeholder="Provide technical feedback, code architecture praise, or areas for refactoring..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 disabled:opacity-50"
                >
                  {submittingGrade ? 'Saving...' : 'Save Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST ANNOUNCEMENT BROADCAST MODAL */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white uppercase font-mono">Broadcast Class Announcement</h4>
              </div>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Announcement Headline *</label>
                <input
                  type="text"
                  required
                  value={newAnnouncement.title}
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  placeholder="e.g. Schedule Change: Saturday Code Clinic Moved to 10:30 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newAnnouncement.category}
                    onChange={e => setNewAnnouncement({ ...newAnnouncement, category: e.target.value as AnnouncementCategory })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="Class Update">Class Update</option>
                    <option value="Lab Notice">Lab Notice</option>
                    <option value="Urgent">Urgent Alert</option>
                    <option value="Guest Lecture">Guest Lecture</option>
                    <option value="Career">Career & Placement</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={e => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as AnnouncementPriority })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent (Red Alert Badge)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Cohort</label>
                  <select
                    value={newAnnouncement.cohort}
                    onChange={e => setNewAnnouncement({ ...newAnnouncement, cohort: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="All Cohorts">All Cohorts (Universal)</option>
                    <option value="Cohort 14">Cohort 14 (Current Primary)</option>
                    <option value="Cohort 15">Cohort 15 (Applied AI)</option>
                    <option value="Cohort 16">Cohort 16 (Data Science)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Program</label>
                  <select
                    value={newAnnouncement.course_title}
                    onChange={e => setNewAnnouncement({ ...newAnnouncement, course_title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-400 focus:outline-none"
                  >
                    <option value="All Programs">All Programs</option>
                    <option value="Software Engineering Immersive">Software Engineering Immersive</option>
                    <option value="Applied AI & LLM Systems">Applied AI & LLM Systems</option>
                    <option value="Data Science & Machine Learning">Data Science & Machine Learning</option>
                    <option value="Cybersecurity & Defense">Cybersecurity & Defense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Announcement Details & Instructions *</label>
                <textarea
                  rows={4}
                  required
                  value={newAnnouncement.content}
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  placeholder="Provide complete details, instructions, room allocations, zoom access, or preparation requirements..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Action Button Label (Optional)</label>
                  <input
                    type="text"
                    value={newAnnouncement.action_label}
                    onChange={e => setNewAnnouncement({ ...newAnnouncement, action_label: e.target.value })}
                    placeholder="e.g. Join Zoom Stream / View Doc"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Action Link URL (Optional)</label>
                  <input
                    type="url"
                    value={newAnnouncement.action_url}
                    onChange={e => setNewAnnouncement({ ...newAnnouncement, action_url: e.target.value })}
                    placeholder="https://zoom.us/j/... or https://..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAnnouncement.is_pinned}
                    onChange={e => setNewAnnouncement({ ...newAnnouncement, is_pinned: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span className="font-semibold">Pin this announcement to top of Student Portal</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAnnouncement}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {savingAnnouncement ? 'Broadcasting...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL CERTIFICATE VIEW MODAL */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

    </div>
  );
};
