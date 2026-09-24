import React, { useState, useEffect } from 'react';
import { User as UserType, Announcement } from '../../types';
import { AnnouncementsBoard } from './AnnouncementsBoard';
import { CourseProgressTracker } from './CourseProgressTracker';
import { 
  BookOpen, 
  Calendar, 
  MapPin, 
  Wifi, 
  Video, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Download, 
  ExternalLink, 
  User, 
  Code, 
  FileText,
  MessageCircle,
  Sparkles,
  Megaphone,
  Lock,
  Unlock,
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  RefreshCw,
  PlayCircle,
  HelpCircle,
  Check
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser?: UserType | null;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser }) => {
  const [selectedEmail, setSelectedEmail] = useState<string>(currentUser?.email || 'student@codepointkenya.com');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadedReceipt, setDownloadedReceipt] = useState(false);
  const [curriculumPercent, setCurriculumPercent] = useState<number>(0);
  const [showMpesaGuide, setShowMpesaGuide] = useState(false);
  const [copiedMpesa, setCopiedMpesa] = useState(false);

  // Sync selected email if currentUser prop changes
  useEffect(() => {
    if (currentUser?.email) {
      setSelectedEmail(currentUser.email);
    }
  }, [currentUser?.email]);

  const fetchStudentData = async (emailToFetch: string) => {
    try {
      setRefreshing(true);
      const url = emailToFetch
        ? `/api/student/data?email=${encodeURIComponent(emailToFetch)}`
        : '/api/student/data';

      const res = await fetch(url);
      const data = await res.json();
      setStudentData(data);
      if (data?.student?.progressPercent !== undefined) {
        setCurriculumPercent(data.student.progressPercent);
      }
    } catch (err) {
      console.error('Failed to load student dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentData(selectedEmail);
  }, [selectedEmail]);

  if (loading || !studentData) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
        <span>Loading student portal & live tuition account...</span>
      </div>
    );
  }

  const { student, upcomingLiveSessions = [], assignments = [], announcements = [] } = studentData;

  // Lockout determination (from backend fee account or status)
  const isLockedOut = Boolean(
    studentData?.lockoutStatus?.isLockedOut || 
    student?.tuition?.isLockedOut || 
    student?.tuition?.paymentStatus === 'overdue' || 
    student?.tuition?.portalAccessGranted === false
  );

  const totalKes = Number(student?.tuition?.totalKes ?? 85000);
  const paidKes = Number(student?.tuition?.paidKes ?? 0);
  const balanceKes = Number(student?.tuition?.balanceKes ?? Math.max(0, totalKes - paidKes));
  const paymentStatus = student?.tuition?.paymentStatus || (balanceKes === 0 ? 'cleared' : 'pending');
  const deadlineDate = student?.tuition?.nextDue || 'April 30, 2026';

  const handleDownloadReceipt = () => {
    setDownloadedReceipt(true);
    setTimeout(() => setDownloadedReceipt(false), 3500);
  };

  const handleCopyPaybill = () => {
    navigator.clipboard.writeText('522522');
    setCopiedMpesa(true);
    setTimeout(() => setCopiedMpesa(false), 2500);
  };

  const urgentCount = announcements.filter((a: any) => a.priority === 'Urgent').length;

  // Sample recorded lessons for lecture archive demonstration
  const classRecordings = [
    {
      id: 'rec-01',
      title: 'Full-Stack REST Architecture with Node.js & SQLite Express',
      date: 'April 16, 2026',
      duration: '2h 14m',
      instructor: 'Alex Maina',
      module: 'Module 3: Server Engineering'
    },
    {
      id: 'rec-02',
      title: 'React 19 Server Actions, Hooks & State Management Clinic',
      date: 'April 13, 2026',
      duration: '1h 55m',
      instructor: 'Alex Maina',
      module: 'Module 2: Frontend Mastery'
    },
    {
      id: 'rec-03',
      title: 'PostgreSQL Relational Schema Design, Joins & Indexing',
      date: 'April 09, 2026',
      duration: '2h 20m',
      instructor: 'Esther Mwangi',
      module: 'Module 3: Database Architectures'
    }
  ];

  return (
    <div className="space-y-6">

      {/* Demo Student Account Switcher Bar (Quickly test Overdue vs Cleared vs Pending) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
            Active Student Account:
          </span>
          <select
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="student@codepointkenya.com">Brian Kipchumba (student@codepointkenya.com) — Pending / KES 48,000</option>
            <option value="faith.mutua@outlook.com">Faith Mutua (faith.mutua@outlook.com) — OVERDUE / KES 75,000 [LOCKED]</option>
            <option value="kevin.kiprono@gmail.com">Kevin Kiprono (kevin.kiprono@gmail.com) — Cleared / KES 0 [UNLOCKED]</option>
            <option value="cynthia.njeri@example.com">Cynthia Njeri (cynthia.njeri@example.com) — Pending / KES 35,000</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchStudentData(selectedEmail)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Sync Live Status</span>
          </button>
        </div>
      </div>
      
      {/* Student Welcome & Identity Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isLockedOut 
          ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/30 border-rose-500/40' 
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border-slate-800'
      } flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-bold text-xl uppercase font-mono shadow-md ${
            isLockedOut 
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            {student.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-white">{student.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {student.studentId}
              </span>

              {/* Status Badge in Identity header */}
              {isLockedOut ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>Access Restricted</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Portal Active</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{student.program} • {student.cohort}</p>
            <p className={`text-[11px] mt-1 flex items-center gap-1 ${isLockedOut ? 'text-rose-400' : 'text-emerald-400'}`}>
              <MapPin className="w-3 h-3" />
              <span>Campus Access: {isLockedOut ? 'Access Suspended (Tuition Due)' : student.campusAccess.facility}</span>
            </p>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#student-announcements-board"
            className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
              urgentCount > 0 
                ? 'bg-rose-950/30 border-rose-500/40 hover:bg-rose-900/40' 
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center justify-center gap-1">
              <Megaphone className="w-3 h-3 text-emerald-400" />
              <span>Announcements</span>
            </div>
            <div className={`text-lg font-bold font-mono ${urgentCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {announcements.length}
            </div>
          </a>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Curriculum</div>
            <div className={`text-lg font-bold font-mono ${isLockedOut ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isLockedOut ? 'Locked' : `${curriculumPercent}%`}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Tuition Status</div>
            <div className={`text-sm font-bold font-mono mt-1 ${
              paymentStatus === 'cleared'
                ? 'text-emerald-400'
                : paymentStatus === 'overdue' || isLockedOut
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}>
              {paymentStatus === 'cleared' ? 'Cleared' : paymentStatus === 'overdue' || isLockedOut ? 'Overdue' : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROMINENT OVERLAY ALERT ON PORTAL HOME SCREEN (REQUIREMENT 3)             */}
      {/* ========================================================================= */}
      {isLockedOut && (
        <div 
          id="student-overdue-lockout-overlay"
          className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-950/95 via-slate-950 to-rose-950/90 border-2 border-rose-500 shadow-2xl space-y-6 animate-in fade-in zoom-in-95"
          role="alert"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/80">
                <ShieldAlert className="w-7 h-7 text-rose-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-extrabold uppercase bg-rose-500 text-slate-950 tracking-wider shadow-sm">
                    ● ACCESS RESTRICTED • IMMEDIATE PAYMENT REQUIRED
                  </span>
                  <span className="text-xs text-rose-300 font-mono font-semibold">
                    Deadline: {deadlineDate}
                  </span>
                </div>
                
                {/* EXACT SPECIFIED ALERT MESSAGE */}
                <h4 className="text-lg md:text-xl font-extrabold text-white leading-snug">
                  Access Restricted: You have an outstanding tuition balance of <span className="text-rose-300 font-mono underline decoration-rose-500 decoration-2">KES {balanceKes.toLocaleString()}</span>. Please clear your balance or contact finance to restore full access to live classes and learning materials.
                </h4>
                
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  Per the Code Point Kenya admissions policy, live session call links (Zoom / Google Meet), classroom recordings, physical campus lab workstations, and module code evaluations remain locked until your tuition balance is settled or an approved arrangement is signed with the finance office.
                </p>
              </div>
            </div>

            {/* Quick Actions at Top Right of Lockout Alert */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <button
                onClick={() => setShowMpesaGuide(!showMpesaGuide)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>{showMpesaGuide ? 'Hide M-Pesa Details' : 'Pay via M-Pesa Now'}</span>
              </button>

              <a
                href={`https://wa.me/254756295128?text=Hello%20Finance%20Team,%20my%20name%20is%20${encodeURIComponent(student.name)}%20(ID:%20${encodeURIComponent(student.studentId)}).%20I%20am%20clearing%20my%20tuition%20balance%20of%20KES%20${balanceKes}.`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Finance Desk</span>
              </a>

              <button
                onClick={() => fetchStudentData(selectedEmail)}
                className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-check Access Status</span>
              </button>
            </div>
          </div>

          {/* Service Lockout Status Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">Live Lectures</span>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-xs font-bold text-rose-300">Zoom / Meet Links Blocked</p>
              <p className="text-[10px] text-slate-400">Online meetings disabled</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">Class Recordings</span>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-xs font-bold text-rose-300">Lecture Replays Locked</p>
              <p className="text-[10px] text-slate-400">Video streaming blocked</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">Campus Access</span>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-xs font-bold text-rose-300">Lab Pass Suspended</p>
              <p className="text-[10px] text-slate-400">Ngong Rd physical lab barred</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400">Curriculum Materials</span>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-xs font-bold text-rose-300">Submissions Frozen</p>
              <p className="text-[10px] text-slate-400">Teacher evaluations paused</p>
            </div>
          </div>

          {/* Collapsible Interactive M-Pesa Payment Box */}
          {showMpesaGuide && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-slate-200 text-xs space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    M
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">Instant M-Pesa Tuition Payment Instruction</h5>
                    <p className="text-[11px] text-slate-400">Settlements are updated automatically upon verification by the finance desk.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Direct Paybill
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">1. Business No / Paybill</span>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold font-mono text-emerald-400">522522</span>
                    <button
                      onClick={handleCopyPaybill}
                      className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedMpesa ? <Check className="w-3 h-3 text-emerald-400" /> : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">2. Account Number</span>
                  <span className="text-base font-bold font-mono text-white">
                    {student.studentId || `CPK-${student.name.split(' ')[0].toUpperCase()}`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">3. Amount Due</span>
                  <span className="text-base font-bold font-mono text-amber-400">
                    KES {balanceKes.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                After completing your M-Pesa transaction, forward the confirmation SMS to <strong className="text-white">+254 756 295 128</strong> on WhatsApp. Your portal access will be re-enabled promptly.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prominent Course Progress & Module Completion Tracker */}
      <CourseProgressTracker
        studentEmail={student.email}
        studentName={student.name}
        onProgressUpdated={(newPercent) => setCurriculumPercent(newPercent)}
        isLockedOut={isLockedOut}
        balanceKes={balanceKes}
      />

      {/* Prominent Announcements Board: Students see immediately upon login */}
      <AnnouncementsBoard 
        announcements={announcements} 
        studentCohort={student.cohort} 
        studentProgram={student.program} 
      />

      {/* Grid: Campus Lab Pass & Tuition Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Physical Campus Lab Pass Card */}
        <div className={`p-6 rounded-2xl bg-slate-950 border transition-all space-y-4 ${
          isLockedOut ? 'border-rose-500/40 shadow-inner' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 text-xs font-mono font-semibold uppercase ${
              isLockedOut ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              <MapPin className="w-4 h-4" />
              <span>Nairobi Campus Access Pass</span>
            </div>
            
            {isLockedOut ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Pass Suspended</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Member Pass
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Physical Facility</span>
                <span className="font-semibold text-white">{student.campusAccess.facility}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">Teamshark 5th Fl</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Lab Reservation</span>
                {isLockedOut ? (
                  <span className="font-semibold text-rose-400 flex items-center gap-1 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Access Revoked</span>
                  </span>
                ) : (
                  <span className="font-semibold text-white mt-0.5 block">{student.campusAccess.deskReservation}</span>
                )}
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Campus Gigabit Wi-Fi</span>
                {isLockedOut ? (
                  <span className="font-semibold text-rose-400 flex items-center gap-1 mt-0.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Wi-Fi Suspended</span>
                  </span>
                ) : (
                  <span className="font-semibold text-teal-300 font-mono flex items-center gap-1 mt-0.5">
                    <Wifi className="w-3.5 h-3.5" />
                    {student.campusAccess.highSpeedWifi}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-[11px] flex items-center justify-between ${
            isLockedOut 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
              : 'bg-emerald-500/5 border border-emerald-500/20 text-slate-300'
          }`}>
            <span>
              {isLockedOut 
                ? 'Campus lab stations and study pods are suspended until tuition balance is cleared.' 
                : 'Need help locating the office or booking a quiet meeting pod?'}
            </span>
            <a
              href="https://wa.me/254756295128?text=Hello%20Campus%20Team,%20I'm%20at%20Teamshark%205th%20Floor."
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 font-semibold hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>WhatsApp Concierge</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TUITION STATEMENT & INSTALLMENT SCHEDULE (REQUIREMENT 2)                  */}
        {/* ========================================================================= */}
        <div className={`p-6 rounded-2xl bg-slate-950 border transition-all space-y-4 ${
          isLockedOut ? 'border-rose-500/50 shadow-md' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-400 uppercase">
              <CreditCard className="w-4 h-4" />
              <span>Tuition Account & Installments</span>
            </div>
            
            {/* Live Payment Status Pill */}
            {paymentStatus === 'cleared' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Cleared / Up to Date
              </span>
            ) : paymentStatus === 'overdue' || isLockedOut ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400" />
                <span>Overdue / Locked Out</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Payment Pending
              </span>
            )}
          </div>

          {/* Live Tuition Numbers (Total Program, Paid to Date, Balance Due) */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Total Program</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                KES {totalKes.toLocaleString()}
              </div>
            </div>
            
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Paid to Date</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                KES {paidKes.toLocaleString()}
              </div>
            </div>
            
            <div className={`p-3 rounded-xl border ${
              balanceKes > 0 ? 'bg-rose-950/20 border-rose-500/30' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Balance Due</div>
              <div className={`text-base font-bold font-mono mt-0.5 ${
                balanceKes > 0 ? 'text-rose-400 font-extrabold' : 'text-emerald-400'
              }`}>
                KES {balanceKes.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Payment Deadline:</span>
              <span className={`font-semibold ${isLockedOut ? 'text-rose-400' : 'text-white'}`}>
                {deadlineDate}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMpesaGuide(true)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                Pay via M-Pesa
              </button>
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadedReceipt ? 'Receipt Ready' : 'Statement'}</span>
              </button>
            </div>
          </div>

          {downloadedReceipt && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center animate-in fade-in">
              ✓ Official Code Point Kenya fee statement for {student.name} generated.
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* UPCOMING LIVE SESSIONS & LECTURES (LOCKABLE CALL LINKS)                   */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Live Lectures & Weekend Clinics
            </h4>
            {isLockedOut && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                CALL LINKS LOCKED
              </span>
            )}
          </div>
          <span className="text-xs text-emerald-400 font-medium">7:00 PM – 9:30 PM EAT</span>
        </div>

        {isLockedOut && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Live Zoom and Google Meet meeting links are locked due to an outstanding tuition balance of <strong className="font-mono text-white">KES {balanceKes.toLocaleString()}</strong>.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingLiveSessions.map((session: any) => (
            <div 
              key={session.id} 
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                isLockedOut 
                  ? 'bg-slate-900/50 border-rose-500/20 opacity-80' 
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isLockedOut ? 'text-slate-400' : 'text-emerald-400'}`}>
                    {session.date}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {session.mode}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-white mt-1">{session.title}</h5>
                <p className="text-xs text-slate-400 mt-1">Lead Instructor: {session.instructor}</p>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                
                {/* Conditionally block or show the live call join button */}
                {isLockedOut ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs font-semibold cursor-not-allowed select-none">
                    <Lock className="w-3.5 h-3.5 text-rose-400" />
                    <span>Live Call Locked (Clear Balance)</span>
                  </div>
                ) : (
                  <a
                    href={session.zoomLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Live Lecture</span>
                  </a>
                )}

                <a
                  href="https://wa.me/254756295128"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Ask TA</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CLASS RECORDINGS ARCHIVE (LOCKABLE VIDEO WORKSHOP REPLAYS)                */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Class Recordings & Lecture Archive
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {classRecordings.length} Replays Available
          </span>
        </div>

        {isLockedOut ? (
          <div className="p-5 rounded-xl bg-slate-900 border border-rose-500/40 text-center space-y-2">
            <Lock className="w-6 h-6 text-rose-400 mx-auto" />
            <h5 className="font-bold text-white text-sm">Lecture Recordings Archive Locked</h5>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Recorded session archives and workshop video streams are restricted due to an outstanding tuition balance of <strong className="text-rose-300 font-mono font-bold">KES {balanceKes.toLocaleString()}</strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {classRecordings.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{rec.date}</span>
                    <span className="text-cyan-400">{rec.duration}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white line-clamp-2">{rec.title}</h5>
                  <p className="text-[11px] text-slate-400">{rec.module}</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => alert(`Streaming lecture replay: ${rec.title}`)}
                  className="w-full py-1.5 px-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Watch Recording</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
