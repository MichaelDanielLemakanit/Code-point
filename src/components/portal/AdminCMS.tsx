import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  ExternalLink,
  Save,
  AlertCircle,
  Calendar,
  ChevronDown,
  RefreshCw,
  Award,
  TrendingUp,
  CheckCircle,
  QrCode,
  DollarSign,
  GraduationCap,
  Terminal,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Application, Course, AdminStats, ApplicationStatus, Certificate, AssignmentSubmission, SiteSettings } from '../../types';
import { CertificateModal } from './CertificateModal';
import { TechStackManager } from './TechStackManager';
import { ClassSchedulesManager } from './ClassSchedulesManager';
import { WhyStudyManager } from './WhyStudyManager';

interface AdminCMSProps {
  courses: Course[];
  onRefreshCourses: () => void;
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (settings: SiteSettings) => Promise<boolean>;
  onSettingsUpdated?: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  courses,
  onRefreshCourses,
  siteSettings,
  onUpdateSiteSettings,
  onSettingsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'courses' | 'certificates' | 'school-analytics' | 'tech-stack' | 'schedules' | 'why-study'>('applications');
  const [localSiteSettings, setLocalSiteSettings] = useState<SiteSettings | undefined>(siteSettings);

  useEffect(() => {
    if (siteSettings) {
      setLocalSiteSettings(siteSettings);
    } else {
      fetch('/api/site-settings')
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) setLocalSiteSettings(data); })
        .catch(err => console.warn('Could not load site settings in AdminCMS', err));
    }
  }, [siteSettings]);
  
  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Stats & School Analytics state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [schoolAnalytics, setSchoolAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Certificates & Submissions state
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [approvingEmail, setApprovingEmail] = useState<string | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Course management state
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Software Development');
  const [newCourseWeeks, setNewCourseWeeks] = useState(12);
  const [newCoursePrice, setNewCoursePrice] = useState(70000);
  const [newCourseMonthly, setNewCourseMonthly] = useState(15000);
  const [newCourseSummary, setNewCourseSummary] = useState('');
  const [addingCourseLoading, setAddingCourseLoading] = useState(false);

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      let url = `/api/applications?_t=${Date.now()}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}&`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch applications', e);
    } finally {
      setAppsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stats?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch stats', e);
    }
  };

  const fetchSchoolAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/admin/school-analytics?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setSchoolAnalytics(data);
      }
    } catch (e) {
      console.error('Failed to fetch school analytics', e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchCertificatesAndSubmissions = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        fetch('/api/certificates'),
        fetch('/api/submissions')
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setCertificates(cData);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setSubmissions(sData);
      }
    } catch (e) {
      console.error('Failed to fetch certificates or submissions', e);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchStats();
    fetchSchoolAnalytics();
    fetchCertificatesAndSubmissions();
  }, [statusFilter]);

  // Real-time synchronization when user submits an application or message
  useEffect(() => {
    const handleUpdate = () => {
      fetchApplications();
      fetchStats();
    };

    window.addEventListener('cpk_inbox_updated', handleUpdate);
    return () => window.removeEventListener('cpk_inbox_updated', handleUpdate);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchApplications();
        fetchStats();
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editingNotes })
      });
      if (res.ok) {
        setSelectedApp(prev => prev ? { ...prev, notes: editingNotes } : null);
        fetchApplications();
      }
    } catch (e) {
      console.error('Failed to save notes', e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim() || !newCoursePrice) return;
    setAddingCourseLoading(true);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourseTitle.trim(),
          category: newCourseCategory,
          duration_weeks: Number(newCourseWeeks),
          price_kes: Number(newCoursePrice),
          monthly_kes: Number(newCourseMonthly),
          summary: newCourseSummary.trim() || 'Comprehensive tech curriculum with hands-on projects and career coaching.',
          curriculum: [
            { module: 'Phase 1: Foundations', topics: ['Core Syntax & Principles', 'Data Structures', 'Git Workflows'] },
            { module: 'Phase 2: Core Engineering', topics: ['Modern Architecture', 'Databases & APIs', 'Testing'] },
            { module: 'Phase 3: Production Capstone', topics: ['Deployment', 'Portfolio Defense', 'Job Mock Interviews'] }
          ],
          level: 'Beginner to Intermediate',
          delivery_mode: 'Online-First + Ngong Rd Campus Lab Access',
          schedule: 'Flexible Evenings & Saturday Clinics',
          next_intake: 'Upcoming Cohort',
          is_featured: 1
        })
      });

      if (res.ok) {
        onRefreshCourses();
        setShowAddCourse(false);
        setNewCourseTitle('');
        setNewCourseSummary('');
      }
    } catch (e) {
      console.error('Failed to create course', e);
    } finally {
      setAddingCourseLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course from Code Point Kenya catalog?')) return;
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      onRefreshCourses();
    } catch (e) {
      console.error('Failed to delete course', e);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Accepted</span>;
      case 'enrolled':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">Enrolled (Student ID)</span>;
      case 'interview_scheduled':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Interview Booked</span>;
      case 'reviewing':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Under Review</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">Declined</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Total Applications</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{stats.totalApplications}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Stored in SQLite</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Pending Review</div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{stats.pendingCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting decision</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Accepted / Enrolled</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats.acceptedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Campus passes ready</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Conversion Rate</div>
            <div className="text-2xl font-bold font-mono text-teal-400 mt-1">{stats.conversionRate}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Admissions yield</div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-4 text-xs font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'applications'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'courses'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Catalog CMS ({courses.length})</span>
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
          <span>Graduation & Certificates ({certificates.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('school-analytics');
            fetchSchoolAnalytics();
          }}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'school-analytics'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>School Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('tech-stack')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'tech-stack'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Technologies Stack</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'schedules'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Class Schedules</span>
        </button>

        <button
          onClick={() => setActiveTab('why-study')}
          className={`pb-3 border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap transition-colors ${
            activeTab === 'why-study'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Why Study Features</span>
        </button>
      </div>

      {/* TAB 1: APPLICATIONS CMS */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or tracking ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </form>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="accepted">Accepted</option>
                <option value="enrolled">Enrolled</option>
                <option value="rejected">Declined</option>
              </select>

              <button
                onClick={() => {
                  fetchApplications();
                  fetchStats();
                }}
                disabled={appsLoading}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh from admissions database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${appsLoading ? 'animate-spin text-emerald-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Table / List */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            {appsLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No applications match the current filter.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Tracking Code</th>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Selected Program</th>
                      <th className="py-3 px-4">Phone / WhatsApp</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                          {app.tracking_code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{app.full_name}</div>
                          <div className="text-[11px] text-slate-400">{app.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-200">{app.course_title}</div>
                          <div className="text-[10px] text-slate-400">{app.intake}</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <a
                            href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                          >
                            <span>{app.phone}</span>
                            <ExternalLink className="w-3 h-3 text-emerald-400" />
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setEditingNotes(app.notes || '');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Selected Application Detail Drawer / Modal */}
          {selectedApp && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Managing Application</span>
                  <h4 className="text-lg font-bold text-white">
                    {selectedApp.full_name} ({selectedApp.tracking_code})
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Program & Intake</span>
                  <span className="text-white font-medium">{selectedApp.course_title}</span>
                  <span className="block text-slate-400 text-[11px]">{selectedApp.intake}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Experience Level</span>
                  <span className="text-white font-medium">{selectedApp.experience_level}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Current Status</span>
                  <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                </div>
              </div>

              {selectedApp.motivation && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <span className="text-slate-400 font-semibold block mb-1">Applicant Statement of Purpose:</span>
                  <p className="italic">"{selectedApp.motivation}"</p>
                </div>
              )}

              {/* Status Change Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Update Admissions Status:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'reviewing')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                  >
                    Mark Reviewing
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'interview_scheduled')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                  >
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'accepted')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                  >
                    Accept Applicant
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'enrolled')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30"
                  >
                    Enroll (Issue Campus Pass)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                  >
                    Decline
                  </button>
                </div>
              </div>

              {/* Internal Notes Editor */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Admissions Notes (Visible to applicant in tracking):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="e.g. Passed coding quiz. Interview scheduled for Friday at Ngong Road."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNote}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingNote ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: COURSE CATALOG CMS */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Course Offerings & Tuition</h3>
              <p className="text-xs text-slate-400">All changes persist directly to the Code Point Kenya SQLite database.</p>
            </div>
            <button
              onClick={() => setShowAddCourse(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Program</span>
            </button>
          </div>

          {showAddCourse && (
            <form onSubmit={handleCreateCourse} className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Add New Tech Program</h4>
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Program Title *</label>
                  <input
                    type="text"
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Cloud DevOps & Infrastructure"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Security & Infrastructure">Security & Infrastructure</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Total Tuition (KES) *</label>
                  <input
                    type="number"
                    required
                    value={newCoursePrice}
                    onChange={(e) => setNewCoursePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Monthly Installment (KES)</label>
                  <input
                    type="number"
                    value={newCourseMonthly}
                    onChange={(e) => setNewCourseMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Program Summary</label>
                <textarea
                  rows={2}
                  value={newCourseSummary}
                  onChange={(e) => setNewCourseSummary(e.target.value)}
                  placeholder="Outline key learning outcomes and tools taught..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingCourseLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold"
                >
                  {addingCourseLoading ? 'Saving...' : 'Publish Program to Catalog'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">{course.category}</span>
                    <span className="text-xs font-mono font-bold text-white">KES {course.price_kes.toLocaleString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{course.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                  <span>{course.duration_weeks} Weeks • {course.schedule}</span>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 3: GRADUATION & CERTIFICATE CMS */}
      {activeTab === 'certificates' && (
        <div className="space-y-6">
          
          {/* Header Policy Rule */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono tracking-wider">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Academic Standards: Conditional Certificate Issuance Policy</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In the Super-Admin CMS, certificates are subject to strict academic criteria: a student's certificate is <strong className="text-white">prevented from being approved or generated</strong> if they have any pending, unmarked, or incomplete assignments. Only once all coursework deliverables have been evaluated and marked is the <span className="text-emerald-400 font-semibold">'Approve Certificate'</span> action enabled.
            </p>

            {approvalFeedback && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 mt-2 ${
                approvalFeedback.isError
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {approvalFeedback.isError ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
                <span>{approvalFeedback.text}</span>
              </div>
            )}
          </div>

          {/* Student Graduation Candidates Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Student Coursework Evaluations & Graduation Roster:
            </h4>

            {/* Build student candidates list from submissions & enrolled applications */}
            {(() => {
              const studentCandidatesMap: Record<string, {
                name: string;
                email: string;
                course: string;
                submissions: AssignmentSubmission[];
              }> = {};

              // Populate from applications
              applications.forEach(app => {
                const email = app.email.toLowerCase();
                if (!studentCandidatesMap[email]) {
                  studentCandidatesMap[email] = {
                    name: app.full_name,
                    email: app.email,
                    course: app.course_title,
                    submissions: []
                  };
                }
              });

              // Populate submissions
              submissions.forEach(sub => {
                const email = sub.student_email.toLowerCase();
                if (!studentCandidatesMap[email]) {
                  studentCandidatesMap[email] = {
                    name: sub.student_name,
                    email: sub.student_email,
                    course: sub.course_title,
                    submissions: []
                  };
                }
                studentCandidatesMap[email].submissions.push(sub);
              });

              const candidates = Object.values(studentCandidatesMap);

              if (candidates.length === 0) {
                return (
                  <div className="p-8 text-center rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                    No active student candidates found.
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {candidates.map(candidate => {
                    const totalSubs = candidate.submissions.length;
                    const pendingSubs = candidate.submissions.filter(s => s.status === 'Pending').length;
                    const incompleteSubs = candidate.submissions.filter(s => s.status === 'Incomplete').length;
                    const markedSubs = candidate.submissions.filter(s => s.status === 'Marked').length;

                    // Conditional Rule
                    const isEligible = totalSubs > 0 && pendingSubs === 0 && incompleteSubs === 0;
                    const existingCert = certificates.find(c => c.student_email.toLowerCase() === candidate.email.toLowerCase());

                    const handleAdminApprove = async () => {
                      setApprovingEmail(candidate.email);
                      setApprovalFeedback(null);
                      try {
                        const res = await fetch('/api/certificates/approve', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            student_email: candidate.email,
                            student_name: candidate.name,
                            course_title: candidate.course,
                            cohort: 'Cohort 14',
                            approved_by: 'Code Point Kenya Super-Admin & Academic Council',
                            final_grade: 'Distinction'
                          })
                        });
                        const json = await res.json();
                        if (!res.ok) {
                          setApprovalFeedback({ text: json.error || 'Failed to approve certificate', isError: true });
                        } else {
                          setApprovalFeedback({ text: `Certificate generated for ${candidate.name}!`, isError: false });
                          fetchCertificatesAndSubmissions();
                          if (json.certificate) {
                            setSelectedCert(json.certificate);
                          }
                        }
                      } catch (err: any) {
                        setApprovalFeedback({ text: err.message || 'Error approving certificate', isError: true });
                      } finally {
                        setApprovingEmail(null);
                      }
                    };

                    return (
                      <div 
                        key={candidate.email}
                        className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="text-sm font-bold text-white">{candidate.name}</h5>
                            <span className="text-xs font-mono text-slate-400">({candidate.email})</span>
                            {existingCert ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Issued ({existingCert.verification_id})</span>
                              </span>
                            ) : isEligible ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>Eligible for Graduation</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                <span>Blocked ({pendingSubs} Pending, {incompleteSubs} Incomplete)</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-300">{candidate.course}</p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono pt-1 text-slate-400">
                            <span>Deliverables: {totalSubs}</span>
                            <span>•</span>
                            <span className="text-emerald-400">Marked: {markedSubs}</span>
                            <span>•</span>
                            <span className="text-amber-400">Pending: {pendingSubs}</span>
                            <span>•</span>
                            <span className="text-rose-400">Incomplete: {incompleteSubs}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {existingCert ? (
                            <button
                              onClick={() => setSelectedCert(existingCert)}
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                              <span>View Certificate</span>
                            </button>
                          ) : (
                            <button
                              disabled={!isEligible || approvingEmail === candidate.email}
                              onClick={handleAdminApprove}
                              title={
                                isEligible
                                  ? 'Approve and generate verifiable digital certificate'
                                  : 'Cannot approve: All student assignments must be marked and completed first.'
                              }
                              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                isEligible
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg'
                                  : 'bg-slate-900 text-slate-500 border border-slate-850 cursor-not-allowed opacity-60'
                              }`}
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>{approvingEmail === candidate.email ? 'Issuing...' : 'Approve Certificate'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Issued Certificates Table */}
          {certificates.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Verifiable Issued Digital Certificates ({certificates.length}):
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map(cert => (
                  <div key={cert.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <h5 className="text-xs font-bold text-white">{cert.student_name}</h5>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cert.course_title} • {cert.cohort}</p>
                      <p className="text-[10px] font-mono text-emerald-400 mt-1">ID: {cert.verification_id}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
                    >
                      Inspect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: SCHOOL ANALYTICS (RECHARTS VISUALIZATIONS) */}
      {activeTab === 'school-analytics' && (
        <div className="space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  School Analytics & Executive Telemetry
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Visualizing enrollment trends, student pass rates, and tuition revenue across technical tracks.
              </p>
            </div>
            <button
              onClick={fetchSchoolAnalytics}
              disabled={analyticsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Total Admissions</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {schoolAnalytics?.enrollmentTrends?.[5]?.applications || applications.length || 38}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">+24% MoM Application Velocity</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Overall Pass Rate</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {schoolAnalytics?.passRates?.overallPassRate || 92}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Based on marked deliverables</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Total Projected Revenue</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                KES {(schoolAnalytics?.revenue?.totalProjectedKes || 1850000).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                KES {(schoolAnalytics?.revenue?.collectedKes || 1147000).toLocaleString()} Collected (62%)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Certificates Issued</div>
              <div className="text-2xl font-bold font-mono text-teal-400 mt-1">
                {certificates.length || schoolAnalytics?.certificatesIssuedCount || 0}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Authenticated via QR code</div>
            </div>
          </div>

          {/* CHART 1: ENROLLMENT TRENDS */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Cohort Enrollment & Admissions Growth Trend:
                </h5>
                <p className="text-[11px] text-slate-400">
                  Applications received, interview sessions conducted, and enrolled students per intake cycle.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Applications
                </span>
                <span className="flex items-center gap-1.5 text-teal-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  Enrolled Fellows
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={schoolAnalytics?.enrollmentTrends || [
                    { month: "Nov 2025", applications: 18, enrolled: 8, interviews: 14 },
                    { month: "Dec 2025", applications: 25, enrolled: 12, interviews: 20 },
                    { month: "Jan 2026", applications: 38, enrolled: 19, interviews: 31 },
                    { month: "Feb 2026", applications: 44, enrolled: 22, interviews: 35 },
                    { month: "Mar 2026", applications: 52, enrolled: 28, interviews: 41 },
                    { month: "Apr 2026", applications: 60, enrolled: 34, interviews: 48 }
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" name="Applications" />
                  <Area type="monotone" dataKey="enrolled" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorEnrolled)" name="Enrolled" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DUAL CHARTS: PASS RATES & COURSEWORK STATUS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Student Pass Rates by Program */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Academic Performance & Pass Rate by Program:
                </h5>
                <p className="text-[11px] text-slate-400">
                  Average grade scores and completion rates across primary curricula.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={schoolAnalytics?.passRates?.coursePerformance || [
                      { program: "Software Eng", avgMark: 88, passRate: 92 },
                      { program: "Applied AI", avgMark: 91, passRate: 95 },
                      { program: "Data Science", avgMark: 84, passRate: 86 },
                      { program: "Cybersecurity", avgMark: 82, passRate: 85 }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="program" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="passRate" fill="#10b981" name="Pass Rate (%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgMark" fill="#6366f1" name="Average Mark (pts)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Coursework Evaluation Status Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Deliverable Grading Distribution:
                </h5>
                <p className="text-[11px] text-slate-400">
                  Evaluated and marked vs pending vs incomplete coursework tasks.
                </p>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={schoolAnalytics?.passRates?.gradingDistribution || [
                        { name: "Marked & Passed", value: 12, color: "#10b981" },
                        { name: "Under Review (Pending)", value: 3, color: "#f59e0b" },
                        { name: "Incomplete / Re-submit", value: 1, color: "#ef4444" }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {(schoolAnalytics?.passRates?.gradingDistribution || [
                        { color: "#10b981" },
                        { color: "#f59e0b" },
                        { color: "#ef4444" }
                      ]).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* REVENUE METRICS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Revenue By Technical Program */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Tuition Revenue by Technical Track (KES):
                </h5>
                <p className="text-[11px] text-slate-400">
                  Projected revenue generated based on enrolled fellow counts and program pricing.
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={schoolAnalytics?.revenue?.revenueByProgram || [
                      { name: "Software Eng", revenueKes: 850000 },
                      { name: "Applied AI", revenueKes: 520000 },
                      { name: "Data Science", revenueKes: 480000 },
                      { name: "Cybersecurity", revenueKes: 350000 }
                    ]}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(val: any) => [`KES ${Number(val).toLocaleString()}`, 'Revenue']}
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                    />
                    <Bar dataKey="revenueKes" fill="#10b981" name="Revenue (KES)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tuition Collection & Payment Plan Split */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <h5 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Tuition Cashflow & Installment Structure:
                </h5>
                <p className="text-[11px] text-slate-400">
                  Collected vs outstanding balances and chosen payment structures.
                </p>
              </div>

              {/* Progress bar */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400">
                    Collected: KES {(schoolAnalytics?.revenue?.collectedKes || 1147000).toLocaleString()}
                  </span>
                  <span className="text-amber-400">
                    Balance: KES {(schoolAnalytics?.revenue?.outstandingKes || 703000).toLocaleString()}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-400 rounded-l-full" style={{ width: '62%' }} />
                  <div className="h-full bg-amber-400/70 rounded-r-full" style={{ width: '38%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>62% Realized</span>
                  <span>38% In Flight</span>
                </div>
              </div>

              {/* Payment Plan breakdown */}
              <div className="space-y-2 text-xs">
                {(schoolAnalytics?.revenue?.paymentPlans || [
                  { name: "5-Month Installments", percentage: 65, count: 18 },
                  { name: "Upfront Full Payment", percentage: 25, count: 7 },
                  { name: "Corporate / Sponsor", percentage: 10, count: 3 }
                ]).map((plan: any) => (
                  <div key={plan.name} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-850">
                    <span className="text-slate-300 font-medium">{plan.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{plan.percentage}% ({plan.count} Fellows)</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 5: TECHNOLOGIES STACK CMS */}
      {activeTab === 'tech-stack' && (
        <TechStackManager
          siteSettings={localSiteSettings}
          onUpdateSiteSettings={async (newSet) => {
            if (onUpdateSiteSettings) {
              const ok = await onUpdateSiteSettings(newSet);
              if (ok) setLocalSiteSettings(prev => ({ ...(prev || {}), ...newSet } as SiteSettings));
              return ok;
            } else {
              const res = await fetch('/api/site-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSet)
              });
              if (res.ok) {
                setLocalSiteSettings(prev => ({ ...(prev || {}), ...newSet } as SiteSettings));
                return true;
              }
              return false;
            }
          }}
          onSettingsUpdated={() => {
            if (onSettingsUpdated) onSettingsUpdated();
            fetch('/api/site-settings')
              .then(res => res.json())
              .then(data => setLocalSiteSettings(data))
              .catch(console.error);
          }}
        />
      )}

      {/* TAB 6: CLASS SCHEDULES CMS */}
      {activeTab === 'schedules' && (
        <ClassSchedulesManager
          siteSettings={localSiteSettings}
          onUpdateSiteSettings={async (newSet) => {
            if (onUpdateSiteSettings) {
              const ok = await onUpdateSiteSettings(newSet);
              if (ok) setLocalSiteSettings(prev => ({ ...(prev || {}), ...newSet } as SiteSettings));
              return ok;
            } else {
              const res = await fetch('/api/site-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSet)
              });
              if (res.ok) {
                setLocalSiteSettings(prev => ({ ...(prev || {}), ...newSet } as SiteSettings));
                return true;
              }
              return false;
            }
          }}
          onSettingsUpdated={() => {
            if (onSettingsUpdated) onSettingsUpdated();
            fetch('/api/site-settings')
              .then(res => res.json())
              .then(data => setLocalSiteSettings(data))
              .catch(console.error);
          }}
        />
      )}

      {/* TAB 7: WHY STUDY CMS */}
      {activeTab === 'why-study' && (
        <WhyStudyManager
          siteSettings={localSiteSettings}
          onUpdateSiteSettings={async (newSet) => {
            if (onUpdateSiteSettings) {
              const ok = await onUpdateSiteSettings(newSet);
              if (ok) setLocalSiteSettings(prev => ({ ...(prev || {}), ...newSet } as SiteSettings));
              return ok;
            } else {
              const res = await fetch('/api/site-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSet)
              });
              if (res.ok) {
                setLocalSiteSettings(prev => ({ ...(prev || {}), ...newSet } as SiteSettings));
                return true;
              }
              return false;
            }
          }}
          onSettingsUpdated={() => {
            if (onSettingsUpdated) onSettingsUpdated();
            fetch('/api/site-settings')
              .then(res => res.json())
              .then(data => setLocalSiteSettings(data))
              .catch(console.error);
          }}
        />
      )}

      {/* OFFICIAL DIGITAL CERTIFICATE MODAL */}
      {selectedCert && (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

    </div>
  );
};
