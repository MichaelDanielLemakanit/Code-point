import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Phone, 
  Mail, 
  User, 
  BookOpen, 
  Calendar, 
  FileText,
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
      // Dispatch real-time inbox refresh event
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl">
        
        {/* Close button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedApp ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Code Point Kenya Admissions</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Apply for Upcoming Tech Cohort
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Join Kenya's fastest growing tech community. Online-first with physical campus lab access at <span className="text-emerald-400 font-medium">Ngong Road, Teamshark 5th Floor</span>.
            </p>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kelvin Mwangi"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kelvin@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp / Phone <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0756295128"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select Program <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.duration_weeks} Weeks - KES {c.price_kes.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Intake & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Preferred Cohort Intake
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <select
                      value={intake}
                      onChange={(e) => setIntake(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="April 2026 Intake (Part-Time Evening)">April 2026 (Evening Online + Lab)</option>
                      <option value="May 2026 Intake (Part-Time Evening)">May 2026 (Evening Online + Lab)</option>
                      <option value="Full-Time Immersion Cohort">Full-Time Immersion (Day)</option>
                      <option value="Weekend Masterclass Cohort">Weekend-Only Immersion</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Coding Experience
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    <option value="Complete Beginner">Complete Beginner (No prior code)</option>
                    <option value="Basic Self-Taught">Self-Taught / Basic Python/HTML</option>
                    <option value="Intermediate Developer">Intermediate / Upskilling</option>
                    <option value="CS Student/Graduate">Computer Science Student/Grad</option>
                  </select>
                </div>
              </div>

              {/* Motivation */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Why do you want to join Code Point Kenya? (Optional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <textarea
                    rows={3}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="Tell us about your career goals, e.g., transitioning to tech, building a startup, or upskilling for promotions..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Payment note */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400">
                💡 <span className="text-slate-300 font-medium">Application is free.</span> Tuition payments only begin after admission acceptance. Flexible monthly installment plans in KES are available.
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: 'var(--primary-color)' }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-slate-950 text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        ) : (
          /* Submission Success Screen */
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 rounded-2xl theme-icon-box flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9 theme-text-primary" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold theme-badge">
                Application Received Successfully!
              </span>
              <h2 className="text-2xl font-bold text-white">
                Welcome, {submittedApp.full_name}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Your application for <strong className="theme-text-primary">{submittedApp.course_title}</strong> has been assigned an official Code Point Kenya tracking code.
              </p>
            </div>

            {/* Tracking Code Box */}
            <div 
              style={{ borderColor: 'var(--card-highlight-border)' }}
              className="p-4 rounded-xl bg-slate-950 border max-w-sm mx-auto flex items-center justify-between"
            >
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Your Tracking ID:</div>
                <div className="text-lg font-bold font-mono theme-text-primary">
                  {submittedApp.tracking_code}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(submittedApp.tracking_code)}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 theme-text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Next steps list */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-left space-y-2 text-xs text-slate-300 max-w-md mx-auto">
              <div className="font-semibold text-white">Next Steps from Admissions:</div>
              <div className="flex items-start gap-2">
                <span 
                  style={{ backgroundColor: 'var(--primary-color)' }}
                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" 
                />
                <span>We sent an acknowledgment email to <strong className="text-white">{submittedApp.email}</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span 
                  style={{ backgroundColor: 'var(--primary-color)' }}
                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" 
                />
                <span>Our admissions advisor will reach out via WhatsApp at <strong className="text-white">{submittedApp.phone}</strong> within 24 hours.</span>
              </div>
              <div className="flex items-start gap-2">
                <span 
                  style={{ backgroundColor: 'var(--primary-color)' }}
                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" 
                />
                <span>Physical office visiting hours: Mon-Sat at <strong className="text-white">Ngong Road, Teamshark 5th Floor</strong>.</span>
              </div>
            </div>

            {/* Direct WhatsApp follow-up button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/254756295128?text=Hello%20Code%20Point%20Kenya!%20I%20have%20submitted%20my%20application%20for%20${encodeURIComponent(submittedApp.course_title)}.%20My%20Tracking%20Code%20is%20${submittedApp.tracking_code}.`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl theme-badge text-xs font-semibold hover:brightness-110 transition-colors"
              >
                <span>Notify Admissions on WhatsApp (0756295128)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
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
