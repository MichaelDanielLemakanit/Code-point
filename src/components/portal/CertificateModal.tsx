import React, { useRef, useState, useEffect } from 'react';
import { Certificate } from '../../types';
import { 
  Award, 
  CheckCircle, 
  Printer, 
  ShieldCheck, 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  Sliders, 
  AlertCircle 
} from 'lucide-react';
import { exportCertificatePdf } from '../../utils/certificatePdf';

interface CertificateModalProps {
  certificate?: Certificate | null;
  initialMode?: 'view' | 'edit';
  onClose: () => void;
  onSaved?: (cert: Certificate) => void;
}

const COURSE_PRESETS = [
  "Full-Stack Software Engineering",
  "Applied AI & LLM Systems Engineering",
  "Data Science & Machine Learning",
  "Cybersecurity & Cloud Defense",
  "Mobile App Engineering (React Native & Flutter)",
  "Cloud DevOps & Infrastructure"
];

const GRADE_PRESETS = [
  "Distinction with Honors",
  "First Class Honors",
  "Distinction",
  "Merit with Excellence",
  "Satisfactory Completion"
];

const TECH_PRESETS: { label: string; techs: string }[] = [
  {
    label: "Full-Stack Web",
    techs: "Python, JavaScript, React, Node.js, PostgreSQL, Tailwind CSS, Docker, Git"
  },
  {
    label: "Python & AI",
    techs: "Python, PyTorch, LangChain, FastAPI, Vector DBs, Gemini API, RAG, Docker"
  },
  {
    label: "Data Science",
    techs: "Python, Pandas, NumPy, Scikit-Learn, SQL, BigQuery, Automated ETL"
  },
  {
    label: "Cybersecurity",
    techs: "Network Defense, Penetration Testing, Linux Hardening, Cloud Security, SIEM"
  }
];

export const CertificateModal: React.FC<CertificateModalProps> = ({ 
  certificate, 
  initialMode = 'view', 
  onClose,
  onSaved 
}) => {
  const isNewCertificate = !certificate || !certificate.id;
  const [mode, setMode] = useState<'view' | 'edit'>(isNewCertificate ? 'edit' : initialMode);
  const certRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Form State initialized with blank student name for new certificates
  const [formData, setFormData] = useState({
    id: certificate?.id || '',
    student_name: certificate?.student_name || '',
    student_email: certificate?.student_email || '',
    course_title: certificate?.course_title || 'Full-Stack Software Engineering',
    technologies_covered: certificate?.technologies_covered || 'Python, JavaScript, React, PostgreSQL, Tailwind CSS',
    cohort: certificate?.cohort || 'Cohort 14 (Evening Track)',
    final_grade: certificate?.final_grade || 'Distinction with Honors',
    completion_date: certificate?.completion_date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    verification_id: certificate?.verification_id || `CPK-CERT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    issuer_name: certificate?.issuer_name || 'Ian Kiprop',
    issuer_title: certificate?.issuer_title || 'Lead Instructor & Head of Curriculum',
    second_issuer_name: certificate?.second_issuer_name || 'Dr. Angela Wanjiku',
    second_issuer_title: certificate?.second_issuer_title || 'Academic Director & Founder',
    approved_by: certificate?.approved_by || 'Code Point Kenya Academic Council'
  });

  const [activeCert, setActiveCert] = useState<Certificate | null>(certificate || null);

  useEffect(() => {
    if (certificate) {
      setActiveCert(certificate);
      setFormData({
        id: certificate.id || '',
        student_name: certificate.student_name || '',
        student_email: certificate.student_email || '',
        course_title: certificate.course_title || 'Full-Stack Software Engineering',
        technologies_covered: certificate.technologies_covered || 'Python, JavaScript, React, PostgreSQL, Tailwind CSS',
        cohort: certificate.cohort || 'Cohort 14 (Evening Track)',
        final_grade: certificate.final_grade || 'Distinction with Honors',
        completion_date: certificate.completion_date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        verification_id: certificate.verification_id || '',
        issuer_name: certificate.issuer_name || 'Ian Kiprop',
        issuer_title: certificate.issuer_title || 'Lead Instructor & Head of Curriculum',
        second_issuer_name: certificate.second_issuer_name || 'Dr. Angela Wanjiku',
        second_issuer_title: certificate.second_issuer_title || 'Academic Director & Founder',
        approved_by: certificate.approved_by || 'Code Point Kenya Academic Council'
      });
    }
  }, [certificate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    setFeedback(null);
    try {
      const vId = activeCert?.verification_id || formData.verification_id;
      const sName = activeCert?.student_name || formData.student_name;
      await exportCertificatePdf(certRef.current, {
        verification_id: vId,
        student_name: sName,
        course_title: activeCert?.course_title || formData.course_title,
        cohort: activeCert?.cohort || formData.cohort,
        grade: activeCert?.final_grade || formData.final_grade,
        completion_date: activeCert?.completion_date || formData.completion_date
      });
      setFeedback({ text: `Certificate PDF downloaded for ${sName || 'Student'}!`, isError: false });
    } catch (err: any) {
      console.warn('PDF generation notice:', err?.message || err);
      // Fallback
      window.print();
      setFeedback({ text: 'PDF export forwarded to print dialog.', isError: false });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveCertificate = async () => {
    if (!formData.student_name.trim()) {
      setFeedback({ text: "Please enter the Student's Full Name before saving.", isError: true });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const payload = {
        ...formData,
        student_email: formData.student_email.trim() || `${formData.student_name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@codepointkenya.com`
      };

      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to save certificate');
      }

      const saved: Certificate = json.certificate;
      setActiveCert(saved);
      setFormData(prev => ({
        ...prev,
        id: saved.id,
        verification_id: saved.verification_id
      }));

      setFeedback({ 
        text: `Certificate successfully saved & generated for ${saved.student_name}! (ID: ${saved.verification_id})`, 
        isError: false 
      });

      if (onSaved) {
        onSaved(saved);
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'Error saving certificate', isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const currentVerificationId = activeCert?.verification_id || formData.verification_id;
  const verificationUrl = `https://codepointkenya.com/verify?id=${currentVerificationId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`relative w-full ${mode === 'edit' ? 'max-w-6xl' : 'max-w-4xl'} bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 transition-all duration-200`}>
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider block">
                {isNewCertificate && mode === 'edit' ? 'Create Custom Certificate' : 'Official Graduation Certificate'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {formData.student_name ? `${formData.student_name} • ` : ''}ID: {currentVerificationId}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Mode Button */}
            <button
              onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                mode === 'edit'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
              title={mode === 'view' ? 'Edit certificate fields' : 'Switch to full certificate view'}
            >
              {mode === 'view' ? (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Details</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-teal-400" />
                  <span>View Fullscreen</span>
                </>
              )}
            </button>

            {/* Share Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Copy public verification link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            {/* Download PDF */}
            <button
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Download high-resolution A4 landscape PDF"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce text-emerald-300' : 'text-emerald-400'}`} />
              <span>{isDownloading ? 'Exporting...' : 'Download PDF'}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback / Alert Banner */}
        {feedback && (
          <div className={`px-5 py-2.5 text-xs flex items-center justify-between border-b ${
            feedback.isError 
              ? 'bg-rose-950/60 border-rose-800/50 text-rose-300' 
              : 'bg-emerald-950/60 border-emerald-800/50 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.isError ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
              <span>{feedback.text}</span>
            </div>
            <button 
              onClick={() => setFeedback(null)} 
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN BODY: VIEW OR EDIT MODE */}
        {mode === 'edit' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[82vh] overflow-y-auto">
            
            {/* LEFT COLUMN: INTERACTIVE FORM WITH EDITABLE FIELDS */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-900/60 border-r border-slate-800 space-y-4 overflow-y-auto">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Certificate Details & Parameters
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Live Preview Active
                </span>
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5 text-xs">
                
                {/* 1. Student Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase font-mono mb-1">
                    Student Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.student_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, student_name: e.target.value }))}
                    placeholder="Enter student full name (e.g., Brian Kipchumba)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Displayed prominently in the center calligraphy award line.
                  </p>
                </div>

                {/* Student Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase font-mono mb-1">
                    Student Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.student_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, student_email: e.target.value }))}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                {/* 2. Program / Course Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase font-mono mb-1">
                    Program / Course Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.course_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, course_title: e.target.value }))}
                    placeholder="e.g. Full-Stack Software Engineering"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {COURSE_PRESETS.slice(0, 3).map((course) => (
                      <button
                        key={course}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, course_title: course }))}
                        className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        {course.split(' ')[0]}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Technologies & Languages Learned */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase font-mono mb-1">
                    Technologies & Languages Learned
                  </label>
                  <textarea
                    rows={2}
                    value={formData.technologies_covered}
                    onChange={(e) => setFormData(prev => ({ ...prev, technologies_covered: e.target.value }))}
                    placeholder="e.g., Python, JavaScript, React, PostgreSQL, Tailwind CSS"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg text-white placeholder-slate-500 outline-none transition-colors text-xs resize-none"
                  />
                  {/* Tech Presets */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {TECH_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, technologies_covered: p.techs }))}
                        className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-800/30 transition-colors cursor-pointer"
                      >
                        + {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Cohort / Track Details & 5. Honors / Grade Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-200 uppercase font-mono mb-1">
                      Cohort / Track Details
                    </label>
                    <input
                      type="text"
                      value={formData.cohort}
                      onChange={(e) => setFormData(prev => ({ ...prev, cohort: e.target.value }))}
                      placeholder="e.g. Cohort 14 (Evening Track)"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-200 uppercase font-mono mb-1">
                      Honors / Grade Badge
                    </label>
                    <select
                      value={formData.final_grade}
                      onChange={(e) => setFormData(prev => ({ ...prev, final_grade: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg text-white outline-none transition-colors cursor-pointer"
                    >
                      {GRADE_PRESETS.map((g) => (
                        <option key={g} value={g} className="bg-slate-950 text-white">{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6. Issue Date & Verification ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-200 uppercase font-mono mb-1">
                      Issue Date
                    </label>
                    <input
                      type="text"
                      value={formData.completion_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                      placeholder="e.g. September 22, 2026"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg text-white placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-200 uppercase font-mono mb-1">
                      Verification ID
                    </label>
                    <input
                      type="text"
                      value={formData.verification_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, verification_id: e.target.value.toUpperCase() }))}
                      placeholder="CPK-CERT-..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-emerald-500 rounded-lg text-emerald-400 font-mono placeholder-slate-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 7. Signatory Names & Titles */}
                <div className="pt-2 border-t border-slate-800 space-y-2.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase font-mono tracking-wider block">
                    Institutional Signatories & Approval
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">
                        Signatory 1 (Instructor)
                      </label>
                      <input
                        type="text"
                        value={formData.issuer_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, issuer_name: e.target.value }))}
                        placeholder="Instructor Name"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-750 rounded text-white text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={formData.issuer_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, issuer_title: e.target.value }))}
                        placeholder="Title (e.g. Lead Instructor)"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-750 rounded text-slate-400 text-[11px] outline-none mt-1"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono mb-1">
                        Signatory 2 (Academic Director)
                      </label>
                      <input
                        type="text"
                        value={formData.second_issuer_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, second_issuer_name: e.target.value }))}
                        placeholder="Director Name"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-750 rounded text-white text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={formData.second_issuer_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, second_issuer_title: e.target.value }))}
                        placeholder="Title (e.g. Academic Director)"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-750 rounded text-slate-400 text-[11px] outline-none mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">
                      Approving Authority / Body
                    </label>
                    <input
                      type="text"
                      value={formData.approved_by}
                      onChange={(e) => setFormData(prev => ({ ...prev, approved_by: e.target.value }))}
                      placeholder="e.g. Code Point Kenya Academic Council"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-750 rounded text-white text-xs outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* Form Action Controls: Save & Generate / Download / Print */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveCertificate}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving & Generating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save & Generate Certificate</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={handleDownloadPdf}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                    <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: REAL-TIME DYNAMIC LIVE CERTIFICATE PREVIEW */}
            <div className="lg:col-span-7 p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center overflow-x-auto">
              <div className="w-full flex items-center justify-between pb-3 text-xs text-slate-400">
                <span className="font-mono text-[11px] text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Dynamic Preview
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Updates with every keystroke • Landscape A4 Ready
                </span>
              </div>

              {/* RENDER NODE FOR CAPTURE & PRINT */}
              <div
                id="certificate-print-root"
                ref={certRef}
                className="certificate-printable relative w-full min-w-[560px] max-w-[760px] text-slate-100 select-none overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  backgroundColor: '#07101e',
                  backgroundImage: 'radial-gradient(ellipse at 50% 30%, #0d1e38 0%, #07101e 80%)',
                  aspectRatio: '1.414 / 1',
                  padding: '16px'
                }}
              >
                {/* Outer Emerald Framing */}
                <div 
                  className="relative w-full h-full rounded-xl border-4 border-emerald-600/70 p-2 shadow-2xl flex flex-col justify-between"
                  style={{
                    boxShadow: 'inset 0 0 35px rgba(5, 150, 105, 0.15), 0 0 30px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  {/* Inner Gold Pinstripe */}
                  <div className="relative w-full h-full rounded-lg border border-amber-400/50 p-5 flex flex-col justify-between bg-[#0a1526]">
                    
                    {/* 4 Golden Corner Accents */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

                    {/* Header */}
                    <div className="text-center space-y-0.5">
                      <div className="inline-flex items-center justify-center gap-1.5 mb-0.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      </div>
                      <h2 className="text-sm font-bold tracking-[0.25em] text-white uppercase font-mono">
                        Code Point Kenya
                      </h2>
                      <p className="text-[8px] tracking-[0.2em] uppercase font-mono font-medium text-emerald-400">
                        Institute of Software Engineering & Applied AI
                      </p>
                      <div className="text-[7px] text-slate-400 font-mono">
                        Nairobi Campus • Ngong Road, Teamshark 5th Floor • Accredited Tech Accelerator
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-0.5">
                        <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                        <span className="text-amber-400 text-[10px]">✦</span>
                        <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                      </div>

                      <h1 className="text-base font-serif tracking-widest text-amber-200 font-bold uppercase drop-shadow pt-0.5">
                        Certificate of Graduation
                      </h1>
                    </div>

                    {/* Award Body Statement */}
                    <div className="text-center my-auto py-1 space-y-1">
                      <p className="text-[9px] font-mono tracking-widest uppercase text-slate-400">
                        This certificate of professional excellence is awarded to
                      </p>
                      
                      <h3 
                        className="cert-student-name text-xl sm:text-2xl font-serif italic font-extrabold text-[#fef08a] tracking-wide px-4 inline-block border-b-2 border-amber-400/40 pb-0.5"
                        style={{ textShadow: '0 0 15px rgba(251, 191, 36, 0.4)' }}
                      >
                        {formData.student_name.trim() || "Student Full Name"}
                      </h3>

                      <p className="text-[11px] text-slate-300 max-w-md mx-auto pt-0.5 leading-relaxed">
                        for the successful completion of the intensive professional engineering program in
                      </p>
                      
                      <div className="text-xs sm:text-sm font-bold font-mono tracking-wide text-white uppercase">
                        {formData.course_title || "Full-Stack Software Engineering"}
                      </div>

                      {formData.technologies_covered && (
                        <div className="max-w-md mx-auto pt-0.5">
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {formData.technologies_covered.split(',').map((tech, i) => (
                              <span 
                                key={i} 
                                className="px-1.5 py-0.5 rounded text-[7px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                              >
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold mt-0.5">
                        <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{formData.final_grade} • {formData.cohort}</span>
                      </div>
                    </div>

                    {/* Signatures & Accreditation Seal */}
                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 items-end">
                      {/* Left Signatory */}
                      <div className="text-center space-y-0.5">
                        <div className="font-serif italic text-xs text-amber-200/90 border-b border-slate-700/80 pb-0.5">
                          {formData.issuer_name || "Ian Kiprop"}
                        </div>
                        <div className="text-[8px] font-bold text-white font-mono uppercase">
                          {formData.issuer_name || "Lead Instructor"}
                        </div>
                        <div className="text-[7px] text-slate-400 font-mono">
                          {formData.issuer_title || "Curriculum & Faculty Lead"}
                        </div>
                      </div>

                      {/* Center Seal */}
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="relative w-11 h-11 rounded-full bg-gradient-to-b from-amber-400/20 to-emerald-500/20 border-2 border-amber-400/80 flex flex-col items-center justify-center shadow-lg p-0.5">
                          <QrCode className="w-5 h-5 text-amber-300 mb-0.5" />
                          <span className="text-[5px] font-mono font-bold text-amber-300 uppercase tracking-tighter">
                            VERIFIED
                          </span>
                        </div>
                        <span className="text-[6px] font-mono font-bold text-emerald-400 mt-0.5 uppercase tracking-wider">
                          OFFICIAL SEAL
                        </span>
                      </div>

                      {/* Right Signatory */}
                      <div className="text-center space-y-0.5">
                        <div className="font-serif italic text-xs text-amber-200/90 border-b border-slate-700/80 pb-0.5">
                          {formData.second_issuer_name || formData.approved_by || "Dr. Angela Wanjiku"}
                        </div>
                        <div className="text-[8px] font-bold text-white font-mono uppercase">
                          {formData.second_issuer_name || "Academic Director"}
                        </div>
                        <div className="text-[7px] text-slate-400 font-mono">
                          {formData.second_issuer_title || "Academic Council"}
                        </div>
                      </div>
                    </div>

                    {/* Micro Security Bar */}
                    <div className="mt-1.5 pt-1 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-1 text-[7px] font-mono text-slate-400">
                      <span>Issued: {formData.completion_date}</span>
                      <span className="text-amber-400 font-bold">ID: {currentVerificationId}</span>
                      <span className="text-emerald-400">codepointkenya.com/verify?id={currentVerificationId}</span>
                    </div>

                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 mt-3 text-center">
                Click <strong className="text-slate-300">"Save & Generate Certificate"</strong> to persist records to database.
              </p>
            </div>

          </div>
        ) : (
          /* VIEW MODE (CLEAN FULLSCREEN CERTIFICATE) */
          <div className="p-6 sm:p-8 bg-slate-950 flex flex-col items-center justify-center overflow-x-auto">
            
            {/* RENDER NODE FOR CAPTURE & PRINT */}
            <div
              id="certificate-print-root"
              ref={certRef}
              className="certificate-printable relative w-full min-w-[680px] max-w-[880px] text-slate-100 select-none overflow-hidden rounded-2xl shadow-2xl"
              style={{
                backgroundColor: '#07101e',
                backgroundImage: 'radial-gradient(ellipse at 50% 30%, #0d1e38 0%, #07101e 80%)',
                aspectRatio: '1.414 / 1',
                padding: '20px'
              }}
            >
              {/* Outer Emerald Framing */}
              <div 
                className="relative w-full h-full rounded-xl border-4 border-emerald-600/70 p-2.5 shadow-2xl flex flex-col justify-between"
                style={{
                  boxShadow: 'inset 0 0 35px rgba(5, 150, 105, 0.15), 0 0 30px rgba(0, 0, 0, 0.8)'
                }}
              >
                {/* Inner Gold Pinstripe */}
                <div className="relative w-full h-full rounded-lg border border-amber-400/50 p-6 flex flex-col justify-between bg-[#0a1526]">
                  
                  {/* 4 Golden Corner Accents */}
                  <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-400" />
                  <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-400" />
                  <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-400" />
                  <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-400" />

                  {/* Header */}
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center justify-center gap-2 mb-0.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold tracking-[0.25em] text-white uppercase font-mono">
                      Code Point Kenya
                    </h2>
                    <p className="text-[9px] tracking-[0.2em] uppercase font-mono font-medium text-emerald-400">
                      Institute of Software Engineering & Applied AI
                    </p>
                    <div className="text-[8px] text-slate-400 font-mono">
                      Nairobi Campus • Ngong Road, Teamshark 5th Floor • Accredited Tech Accelerator
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-1">
                      <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                      <span className="text-amber-400 text-xs">✦</span>
                      <div className="h-[1px] w-20 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                    </div>

                    <h1 className="text-lg sm:text-xl font-serif tracking-widest text-amber-200 font-bold uppercase drop-shadow pt-0.5">
                      Certificate of Graduation
                    </h1>
                  </div>

                  {/* Body Statement */}
                  <div className="text-center my-auto py-2 space-y-1.5">
                    <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                      This certificate of professional excellence is awarded to
                    </p>
                    <h3 
                      className="cert-student-name text-2xl sm:text-3xl font-serif italic font-extrabold text-[#fef08a] tracking-wide px-4 inline-block border-b-2 border-amber-400/40 pb-0.5"
                      style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.4)' }}
                    >
                      {activeCert?.student_name || formData.student_name || "Student Full Name"}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-lg mx-auto pt-1 leading-relaxed">
                      for the successful completion of the intensive professional engineering program in
                    </p>
                    <div className="text-sm sm:text-base font-bold font-mono tracking-wide text-white uppercase">
                      {activeCert?.course_title || formData.course_title}
                    </div>

                    {(activeCert?.technologies_covered || formData.technologies_covered) && (
                      <div className="max-w-lg mx-auto pt-1">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {(activeCert?.technologies_covered || formData.technologies_covered).split(',').map((tech, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 rounded text-[8px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                            >
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold mt-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>{(activeCert?.final_grade || formData.final_grade)} • {(activeCert?.cohort || formData.cohort)}</span>
                    </div>
                  </div>

                  {/* Signatures & Accreditation Seal */}
                  <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-3 items-end">
                    
                    {/* Left Signatory */}
                    <div className="text-center space-y-0.5">
                      <div className="font-serif italic text-sm text-amber-200/90 border-b border-slate-700/80 pb-0.5">
                        {activeCert?.issuer_name || formData.issuer_name || "Ian Kiprop"}
                      </div>
                      <div className="text-[9px] font-bold text-white font-mono uppercase">
                        {activeCert?.issuer_name || formData.issuer_name || "Lead Instructor"}
                      </div>
                      <div className="text-[8px] text-slate-400 font-mono">
                        {activeCert?.issuer_title || formData.issuer_title || "Curriculum & Faculty Lead"}
                      </div>
                    </div>

                    {/* Center Medal */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="relative w-14 h-14 rounded-full bg-gradient-to-b from-amber-400/20 to-emerald-500/20 border-2 border-amber-400/80 flex flex-col items-center justify-center shadow-lg p-1">
                        <QrCode className="w-6 h-6 text-amber-300 mb-0.5" />
                        <span className="text-[6px] font-mono font-bold text-amber-300 uppercase tracking-tighter">
                          VERIFIED
                        </span>
                      </div>
                      <span className="text-[7px] font-mono font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                        OFFICIAL SEAL
                      </span>
                    </div>

                    {/* Right Signatory */}
                    <div className="text-center space-y-0.5">
                      <div className="font-serif italic text-sm text-amber-200/90 border-b border-slate-700/80 pb-0.5">
                        {activeCert?.second_issuer_name || activeCert?.approved_by || formData.second_issuer_name || "Dr. Angela Wanjiku"}
                      </div>
                      <div className="text-[9px] font-bold text-white font-mono uppercase">
                        {activeCert?.second_issuer_name || formData.second_issuer_name || "Academic Director"}
                      </div>
                      <div className="text-[8px] text-slate-400 font-mono">
                        {activeCert?.second_issuer_title || formData.second_issuer_title || "Academic Council"}
                      </div>
                    </div>

                  </div>

                  {/* Micro Security Bar */}
                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-1 text-[8px] font-mono text-slate-400">
                    <span>Issued: {activeCert?.completion_date || formData.completion_date}</span>
                    <span className="text-amber-400 font-bold">ID: {currentVerificationId}</span>
                    <span className="text-emerald-400">codepointkenya.com/verify?id={currentVerificationId}</span>
                  </div>

                </div>
              </div>

            </div>

            {/* Public Verification URL */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span>Direct Public Verification URL:</span>
              <span className="font-mono text-emerald-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 select-all text-[11px]">
                {verificationUrl}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
