import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Send, 
  Phone, 
  Mail, 
  User, 
  UserPlus,
  BookOpen, 
  GraduationCap,
  Target,
  Pencil,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Course, Application } from '../types';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialCourseId?: string;
  onApplicationCreated: (app: Application) => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  courses,
  initialCourseId,
  onApplicationCreated
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || '');
  const [intake, setIntake] = useState('April 2026 Intake (Part-Time Evening)');
  const [experienceLevel, setExperienceLevel] = useState('Complete Beginner');
  const [motivation, setMotivation] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedApp, setSubmittedApp] = useState<Application | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    } else if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [initialCourseId, courses]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMsg('Please enter a valid Kenyan phone/WhatsApp number (e.g., 0712345678 or +254...).');
      return;
    }
    if (!selectedCourseId) {
      setErrorMsg('Please select a program.');
      return;
    }

    setIsSubmitting(true);

    try {
      const matchedCourse = courses.find(c => c.id === selectedCourseId);
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          course_id: selectedCourseId,
          course_title: matchedCourse ? matchedCourse.title : 'Tech Program',
          intake,
          experience_level: experienceLevel,
          motivation: motivation.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmittedApp(data.application);
      onApplicationCreated(data.application);
      // Real-time notification dispatch
      window.dispatchEvent(new CustomEvent('cpk_inbox_updated'));
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleReset = () => {
    setSubmittedApp(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setMotivation('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      {/* 1. HEADER & MODAL CONTAINER STYLING */}
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#0a0e1a] border border-blue-500/30 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100 space-y-6">
        
        {/* Header Layout */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-blue-900/40">
          <div className="flex items-center gap-3.5">
            {/* Left Side: Rounded square icon badge with a blue-purple gradient background containing a user/plus icon */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
              <UserPlus className="w-6 h-6 text-white" />
            </div>

            {/* Center/Right: Title with blue gradient text highlight on "Upcoming Cohort" */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Apply for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                  Upcoming Cohort
                </span>
              </h2>
            </div>
          </div>

          {/* Far Right: Close button in a subtle dark rounded container */}
          <button
            onClick={handleReset}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!submittedApp ? (
          <div>
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 2. FIELD LAYOUT & OUTSIDE ICON BADGES */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Row 1: Full Name & WhatsApp/Phone row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name Group */}
                <div className="flex items-start gap-2.5">
                  {/* Left side icon badge for Full Name (User icon) */}
                  <div 
                    title="Full Name"
                    className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0 mt-5.5 shadow-sm"
                  >
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      {/* Inside Input Field inner icon */}
                      <User className="w-4 h-4 text-blue-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Kelvin Mwangi"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-blue-900/50 bg-[#0d1326] text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp / Phone Group */}
                <div className="flex items-start gap-2.5">
                  {/* Left side icon badge for WhatsApp / Phone (Green/Cyan WhatsApp phone icon badge) */}
                  <div 
                    title="WhatsApp / Phone"
                    className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0 mt-5.5 shadow-sm"
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      WhatsApp / Phone <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      {/* Inside Input Field inner icon */}
                      <Phone className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0756295128"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-blue-900/50 bg-[#0d1326] text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Row 2: Email Address row (Full-width row with Mail/Envelope icon badge on far left) */}
              <div className="flex items-start gap-2.5">
                <div 
                  title="Email Address"
                  className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0 mt-5.5 shadow-sm"
                >
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    {/* Inside Input Field inner icon */}
                    <Mail className="w-4 h-4 text-indigo-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kelvin@gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-blue-900/50 bg-[#0d1326] text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Select Program */}
              <div className="flex items-start gap-2.5">
                {/* Left side icon badge for Program (Graduation cap / Book icon badge) */}
                <div 
                  title="Select Program"
                  className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0 mt-5.5 shadow-sm"
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select Program <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    {/* Inside Input Field inner icon */}
                    <BookOpen className="w-4 h-4 text-cyan-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-900/50 bg-[#0d1326] text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors cursor-pointer"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.title} ({c.duration_weeks} Wks - KES {c.price_kes.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 4: Why do you want to join? row */}
              <div className="flex items-start gap-2.5">
                {/* Left side icon badge (Target/Goal icon badge) */}
                <div 
                  title="Goals & Motivation"
                  className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 mt-5.5 shadow-sm"
                >
                  <Target className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Why do you want to join Code Point Kenya? <span className="text-slate-500 text-[11px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    {/* Inside Input Field inner icon */}
                    <Pencil className="w-4 h-4 text-amber-400/60 absolute left-3.5 top-3.5 pointer-events-none" />
                    <textarea
                      rows={2}
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Tell us about your career goals, e.g., transitioning to tech, building a startup, or upskilling for promotions..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-900/50 bg-[#0d1326] text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors leading-relaxed resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (Bottom Right) */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-blue-900/30">
                {/* Cancel button with left arrow icon */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                {/* Submit Application button with a blue-indigo gradient background & Send icon */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Submission Success Screen */
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 p-0.5 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
              <div className="w-full h-full bg-[#0a0e1a] rounded-[14px] flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300">
                Application Received Successfully!
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                Welcome, {submittedApp.full_name}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Your application for <strong className="text-cyan-300">{submittedApp.course_title}</strong> has been assigned an official Code Point Kenya tracking code.
              </p>
            </div>

            {/* Tracking Code Box */}
            <div className="p-4 rounded-xl bg-[#0d1326] border border-blue-500/30 max-w-sm mx-auto flex items-center justify-between shadow-inner">
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Your Tracking ID:</div>
                <div className="text-lg font-bold font-mono text-cyan-300">
                  {submittedApp.tracking_code}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(submittedApp.tracking_code)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Next steps list */}
            <div className="p-4 rounded-xl bg-[#0d1326]/60 border border-blue-900/40 text-left space-y-2 text-xs text-slate-300 max-w-md mx-auto">
              <div className="font-semibold text-white">Next Steps from Admissions:</div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                <span>We sent an acknowledgment email to <strong className="text-white">{submittedApp.email}</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                <span>Our admissions advisor will reach out via WhatsApp at <strong className="text-white">{submittedApp.phone}</strong> within 24 hours.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                <span>Physical office visiting hours: Mon-Sat at <strong className="text-white">Ngong Road, Teamshark 5th Floor</strong>.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/254756295128?text=Hello%20Code%20Point%20Kenya!%20I%20have%20submitted%20my%20application%20for%20${encodeURIComponent(submittedApp.course_title)}.%20My%20Tracking%20Code%20is%20${submittedApp.tracking_code}.`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold transition-colors"
              >
                <span>Notify Admissions on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
