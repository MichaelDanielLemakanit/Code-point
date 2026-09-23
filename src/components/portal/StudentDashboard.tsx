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
  Megaphone
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser?: UserType | null;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser }) => {
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadedReceipt, setDownloadedReceipt] = useState(false);
  const [curriculumPercent, setCurriculumPercent] = useState<number>(0);

  useEffect(() => {
    const url = currentUser?.email
      ? `/api/student/data?email=${encodeURIComponent(currentUser.email)}`
      : '/api/student/data';

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setStudentData(data);
        if (data?.student?.progressPercent !== undefined) {
          setCurriculumPercent(data.student.progressPercent);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load student dashboard data', err);
        setLoading(false);
      });
  }, [currentUser?.email]);

  if (loading || !studentData) {
    return <div className="p-8 text-center text-slate-400 text-xs">Loading your student portal...</div>;
  }

  const { student, upcomingLiveSessions, assignments, announcements = [] } = studentData;

  const handleDownloadReceipt = () => {
    setDownloadedReceipt(true);
    setTimeout(() => setDownloadedReceipt(false), 3000);
  };

  const urgentCount = announcements.filter((a: any) => a.priority === 'Urgent').length;

  return (
    <div className="space-y-6">
      
      {/* Student Welcome & Identity Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-xl uppercase font-mono">
            {student.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{student.name}</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {student.studentId}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{student.program} • {student.cohort}</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Campus Access: {student.campusAccess.facility}</span>
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
            <div className="text-lg font-bold font-mono text-emerald-400">{curriculumPercent}%</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] uppercase font-mono text-slate-400">Attendance</div>
            <div className="text-lg font-bold font-mono text-teal-400">{student.attendancePercent}%</div>
          </div>
        </div>
      </div>

      {/* Prominent Course Progress & Module Completion Tracker */}
      <CourseProgressTracker
        studentEmail={student.email}
        studentName={student.name}
        onProgressUpdated={(newPercent) => setCurriculumPercent(newPercent)}
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
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 uppercase">
              <MapPin className="w-4 h-4" />
              <span>Nairobi Campus Access Pass</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Member Pass
            </span>
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
                <span className="font-semibold text-white">{student.campusAccess.deskReservation}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Campus Gigabit Wi-Fi</span>
                <span className="font-semibold text-teal-300 font-mono flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5" />
                  {student.campusAccess.highSpeedWifi}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Need help locating the office or booking a quiet meeting pod?</span>
            <a
              href="https://wa.me/254756295128?text=Hello%20Campus%20Team,%20I'm%20at%20Teamshark%205th%20Floor."
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>WhatsApp Concierge</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tuition Statement & Installment Schedule */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-400 uppercase">
              <CreditCard className="w-4 h-4" />
              <span>Tuition Account & Installments</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              KES Account
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Total Program</div>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                KES {student.tuition.totalKes.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Paid to Date</div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                KES {student.tuition.paidKes.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Balance Due</div>
              <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
                KES {student.tuition.balanceKes.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Next Installment:</span>
              <span className="text-white font-medium">KES 16,000 due by {student.tuition.nextDue}</span>
            </div>
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadedReceipt ? 'Receipt Ready' : 'Get Statement'}</span>
            </button>
          </div>

          {downloadedReceipt && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center">
              ✓ Official Code Point Kenya fee statement for Brian Kipchumba generated.
            </div>
          )}
        </div>

      </div>

      {/* Upcoming Live Sessions & Lectures */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Live Lectures & Weekend Clinics:
          </h4>
          <span className="text-xs text-emerald-400 font-medium">7:00 PM – 9:30 PM EAT</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingLiveSessions.map((session: any) => (
            <div key={session.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400">{session.date}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {session.mode}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-white mt-1">{session.title}</h5>
                <p className="text-xs text-slate-400 mt-1">Lead Instructor: {session.instructor}</p>
              </div>

              <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                <a
                  href={session.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Live Lecture</span>
                </a>

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

    </div>
  );
};
