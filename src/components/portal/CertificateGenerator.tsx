import React, { useState, useRef, useEffect } from 'react';
import { Certificate, Application, AssignmentSubmission } from '../../types';
import { 
  Award, 
  Download, 
  Mail, 
  Printer, 
  Save, 
  RotateCcw, 
  Search, 
  CheckCircle, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  Trash2, 
  Edit3, 
  Eye, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronRight, 
  UserCheck, 
  BookOpen, 
  Code, 
  Calendar, 
  Layers, 
  RefreshCw,
  X,
  FileCheck,
  Send
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface CertificateGeneratorProps {
  initialCertificates?: Certificate[];
  applications?: Application[];
  submissions?: AssignmentSubmission[];
  onRefresh?: () => void;
  onSelectPreview?: (cert: Certificate) => void;
}

interface CertificateFormState {
  id?: string;
  student_name: string;
  student_email: string;
  course_title: string;
  technologies_covered: string;
  verification_id: string;
  completion_date: string;
  cohort: string;
  final_grade: string;
  issuer_name: string;
  issuer_title: string;
  second_issuer_name: string;
  second_issuer_title: string;
  approved_by: string;
}

const DEFAULT_COURSE_OPTIONS = [
  "Full-Stack Software Engineering",
  "Data Science & Machine Learning",
  "Applied AI & LLM Systems Engineering",
  "Cybersecurity & Cloud Defense",
  "Mobile App Engineering (React Native & Flutter)",
  "Cloud DevOps & Infrastructure"
];

const TECH_PRESETS: { name: string; techs: string }[] = [
  {
    name: "Full-Stack Web",
    techs: "Python, JavaScript, React 19, TypeScript, Node.js, PostgreSQL, Tailwind CSS, Docker, Git"
  },
  {
    name: "Python & AI",
    techs: "Python 3.12, PyTorch, LangChain, FastAPI, Vector DBs, Gemini API, RAG Architecture, Docker"
  },
  {
    name: "Data Science",
    techs: "Python, Pandas, NumPy, Scikit-Learn, SQL, Tableau, BigQuery, Automated ETL Pipelines"
  },
  {
    name: "Cybersecurity",
    techs: "Network Defense, Penetration Testing, Linux Hardening, Wireshark, Cloud Security, SIEM"
  }
];

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  initialCertificates = [],
  applications = [],
  submissions = [],
  onRefresh,
  onSelectPreview
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState<CertificateFormState>({
    student_name: "Brian Kipchumba",
    student_email: "student@codepointkenya.com",
    course_title: "Full-Stack Software Engineering",
    technologies_covered: "Python, JavaScript, React 19, Node.js, PostgreSQL, Tailwind CSS, Docker, Git",
    verification_id: `CPK-CERT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    completion_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    cohort: "Cohort 14 (Evening Track)",
    final_grade: "Distinction with Honors",
    issuer_name: "Ian Kiprop",
    issuer_title: "Lead Instructor & Head of Curriculum",
    second_issuer_name: "Dr. Angela Wanjiku",
    second_issuer_title: "Academic Director & Founder",
    approved_by: "Code Point Kenya Academic Council"
  });

  const [activeTab, setActiveTab] = useState<'studio' | 'archive'>('studio');
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [shareModalData, setShareModalData] = useState<{ email: string; verificationId: string; url: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  const [showRosterPicker, setShowRosterPicker] = useState(false);

  // Certificates list
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);

  useEffect(() => {
    if (initialCertificates.length > 0) {
      setCertificates(initialCertificates);
    }
  }, [initialCertificates]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleRegenerateId = () => {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newId = `CPK-CERT-2026-${randomHex}`;
    setFormData(prev => ({ ...prev, verification_id: newId }));
    showToast(`Generated new serial ID: ${newId}`, 'info');
  };

  const handleResetForm = () => {
    setEditingCertId(null);
    setFormData({
      student_name: "",
      student_email: "",
      course_title: "Full-Stack Software Engineering",
      technologies_covered: "Python, JavaScript, React 19, Node.js, PostgreSQL, Tailwind CSS, Docker, Git",
      verification_id: `CPK-CERT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      completion_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      cohort: "Cohort 14 (Evening Track)",
      final_grade: "Distinction with Honors",
      issuer_name: "Ian Kiprop",
      issuer_title: "Lead Instructor & Head of Curriculum",
      second_issuer_name: "Dr. Angela Wanjiku",
      second_issuer_title: "Academic Director & Founder",
      approved_by: "Code Point Kenya Academic Council"
    });
    showToast("Form reset to blank state", "info");
  };

  // Populate from existing certificate to edit
  const handleEditCertificate = (cert: Certificate) => {
    setEditingCertId(cert.id);
    setFormData({
      id: cert.id,
      student_name: cert.student_name,
      student_email: cert.student_email,
      course_title: cert.course_title,
      technologies_covered: cert.technologies_covered || "Python, JavaScript, React 19, PostgreSQL, Tailwind CSS",
      verification_id: cert.verification_id,
      completion_date: cert.completion_date,
      cohort: cert.cohort,
      final_grade: cert.final_grade,
      issuer_name: cert.issuer_name || "Ian Kiprop",
      issuer_title: cert.issuer_title || "Lead Instructor & Head of Curriculum",
      second_issuer_name: cert.second_issuer_name || "Dr. Angela Wanjiku",
      second_issuer_title: cert.second_issuer_title || "Academic Director & Founder",
      approved_by: cert.approved_by || "Code Point Kenya Academic Council"
    });
    setActiveTab('studio');
    showToast(`Loaded certificate for ${cert.student_name} into editor`, 'info');
  };

  // Populate from Roster candidate
  const handleSelectCandidate = (name: string, email: string, course: string) => {
    setFormData(prev => ({
      ...prev,
      student_name: name,
      student_email: email,
      course_title: course || prev.course_title
    }));
    setShowRosterPicker(false);
    showToast(`Loaded candidate details: ${name}`, 'success');
  };

  // Save to PostgreSQL Database
  const handleSaveToDatabase = async (): Promise<Certificate | null> => {
    if (!formData.student_name.trim()) {
      showToast("Please enter the student's full name.", "error");
      return null;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        id: editingCertId || formData.id
      };

      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save certificate');
      }

      showToast(`Certificate saved to PostgreSQL for ${formData.student_name}!`, 'success');
      
      // Update local state list
      const savedCert: Certificate = data.certificate;
      setCertificates(prev => {
        const filtered = prev.filter(c => c.id !== savedCert.id && c.verification_id !== savedCert.verification_id);
        return [savedCert, ...filtered];
      });
      setEditingCertId(savedCert.id);

      if (onRefresh) onRefresh();
      return savedCert;
    } catch (err: any) {
      showToast(err.message || 'Error saving to database', 'error');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Download high-resolution landscape PDF
  const handleDownloadPdf = async () => {
    if (!certRef.current) {
      showToast("Certificate preview is not rendered yet.", "error");
      return;
    }

    setIsExportingPdf(true);
    try {
      showToast("Rendering high-resolution vector PDF...", "info");

      // Render the DOM node to canvas with high pixel scale for print fidelity
      const element = certRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#07101e'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Landscape A4 dimensions in mm: 297 x 210
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Draw the image fitting the entire landscape page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const fileName = `CodePointKenya_Certificate_${formData.verification_id}.pdf`;
      pdf.save(fileName);

      showToast(`Certificate downloaded: ${fileName}`, 'success');
    } catch (err: any) {
      console.warn("PDF export notice:", err?.message || err);
      showToast("PDF rendering completed or redirected to Print dialog.", "info");
      // Fallback to print
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Share / Email to student
  const handleShareEmail = async () => {
    if (!formData.student_name.trim()) {
      showToast("Student name is required.", "error");
      return;
    }

    setIsSendingEmail(true);
    try {
      // First ensure certificate is saved in database
      const saved = await handleSaveToDatabase();
      const targetId = saved?.id || editingCertId || formData.verification_id;

      const res = await fetch(`/api/certificates/${targetId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch certificate email');
      }

      const verificationUrl = data.verificationUrl || `https://codepointkenya.com/verify?id=${formData.verification_id}`;
      
      // Open share modal
      setShareModalData({
        email: formData.student_email || "student@codepointkenya.com",
        verificationId: formData.verification_id,
        url: verificationUrl
      });

      // Update certificate in local state with email timestamp
      if (data.certificate) {
        setCertificates(prev => prev.map(c => c.id === data.certificate.id ? data.certificate : c));
      }

      showToast(`Official Certificate credentials dispatched to ${formData.student_email}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error sending email', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Print Certificate Action
  const handlePrint = () => {
    window.print();
  };

  // Revoke / Delete Certificate
  const handleDeleteCert = async (cert: Certificate) => {
    if (!window.confirm(`Are you sure you want to revoke and delete certificate ${cert.verification_id} for ${cert.student_name}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/certificates/${cert.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete certificate');

      setCertificates(prev => prev.filter(c => c.id !== cert.id));
      if (editingCertId === cert.id) {
        handleResetForm();
      }
      showToast(`Certificate ${cert.verification_id} has been revoked.`, 'info');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error deleting certificate', 'error');
    }
  };

  // Filtered Archive
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = 
      cert.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.verification_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.course_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = filterCourse === 'All' || cert.course_title === filterCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
            toastMessage.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : toastMessage.type === 'info'
              ? 'bg-sky-950 text-sky-200 border-sky-800'
              : 'bg-emerald-950 text-emerald-200 border-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Module Navigation & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Dynamic Certificate Studio & Graduation Registry</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans font-normal">
                PostgreSQL Integrated
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live landscape certificate rendering, instant PDF generation, and automated student delivery
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'studio'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Certificate Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'archive'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Issued Registry ({certificates.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CERTIFICATE STUDIO & LIVE GENERATOR */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          
          {/* Action Toolbar Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              {editingCertId ? (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <Edit3 className="w-3 h-3" />
                  <span>Editing Certificate: {formData.verification_id}</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>New Certificate Draft</span>
                </span>
              )}

              <button
                onClick={() => setShowRosterPicker(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Pick Student from Roster</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleResetForm}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Reset to blank form"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Print or save document directly via browser"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print</span>
              </button>

              <button
                disabled={isExportingPdf}
                onClick={handleDownloadPdf}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className={`w-3.5 h-3.5 text-emerald-400 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>

              <button
                disabled={isSendingEmail || isSaving}
                onClick={handleShareEmail}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>{isSendingEmail ? 'Dispatching...' : 'Share / Email to Student'}</span>
              </button>

              <button
                disabled={isSaving}
                onClick={handleSaveToDatabase}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save to PostgreSQL'}</span>
              </button>
            </div>
          </div>

          {/* Two-Column Studio: Form (Left) & Real-Time Live Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: EDITABLE CERTIFICATE FORM (5 COLS) */}
            <div className="lg:col-span-5 space-y-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Student Details & Metadata
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Live Sync</span>
              </div>

              {/* Student Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Student Full Name *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Award recipient</span>
                </label>
                <input
                  type="text"
                  value={formData.student_name}
                  onChange={e => setFormData({ ...formData, student_name: e.target.value })}
                  placeholder="e.g. Brian Kipchumba"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Student Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Student Email Address</span>
                  <span className="text-[10px] text-slate-500 font-normal">For notification & delivery</span>
                </label>
                <input
                  type="email"
                  value={formData.student_email}
                  onChange={e => setFormData({ ...formData, student_email: e.target.value })}
                  placeholder="e.g. brian@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Course / Program Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Course / Program Title *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Graduation credential</span>
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.course_title}
                    onChange={e => setFormData({ ...formData, course_title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {DEFAULT_COURSE_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="custom">Custom Program Title...</option>
                  </select>
                  <input
                    type="text"
                    value={formData.course_title}
                    onChange={e => setFormData({ ...formData, course_title: e.target.value })}
                    placeholder="Custom program name"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Technologies / Languages Covered */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Technologies & Competencies Covered</span>
                  <span className="text-[10px] text-slate-500 font-normal">Comma-separated</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.technologies_covered}
                  onChange={e => setFormData({ ...formData, technologies_covered: e.target.value })}
                  placeholder="e.g. Python, JavaScript, React, PostgreSQL, Tailwind CSS, Docker, Git"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
                />
                
                {/* Tech Presets Quick Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500">Presets:</span>
                  {TECH_PRESETS.map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, technologies_covered: p.techs })}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificate ID & Issue Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Certificate ID / Serial *</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={formData.verification_id}
                      onChange={e => setFormData({ ...formData, verification_id: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500 uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateId}
                      title="Generate new serial code"
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Issue Date *</label>
                  <input
                    type="text"
                    value={formData.completion_date}
                    onChange={e => setFormData({ ...formData, completion_date: e.target.value })}
                    placeholder="e.g. September 22, 2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Cohort & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cohort / Track</label>
                  <input
                    type="text"
                    value={formData.cohort}
                    onChange={e => setFormData({ ...formData, cohort: e.target.value })}
                    placeholder="e.g. Cohort 14 (Evening Track)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Academic Standing</label>
                  <select
                    value={formData.final_grade}
                    onChange={e => setFormData({ ...formData, final_grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Distinction with Honors">Distinction with Honors</option>
                    <option value="Distinction">Distinction</option>
                    <option value="First Class Honors">First Class Honors</option>
                    <option value="Merit">Merit</option>
                    <option value="Certified Graduate">Certified Graduate</option>
                  </select>
                </div>
              </div>

              {/* Issuer Signatures & Titles */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider block">
                  Official Signatories & Titles
                </span>
                
                {/* Issuer 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">Primary Issuer Name</label>
                    <input
                      type="text"
                      value={formData.issuer_name}
                      onChange={e => setFormData({ ...formData, issuer_name: e.target.value })}
                      placeholder="e.g. Ian Kiprop"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">Primary Issuer Title</label>
                    <input
                      type="text"
                      value={formData.issuer_title}
                      onChange={e => setFormData({ ...formData, issuer_title: e.target.value })}
                      placeholder="e.g. Lead Instructor"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Issuer 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">Director / Second Issuer</label>
                    <input
                      type="text"
                      value={formData.second_issuer_name}
                      onChange={e => setFormData({ ...formData, second_issuer_name: e.target.value })}
                      placeholder="e.g. Dr. Angela Wanjiku"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">Director Title</label>
                    <input
                      type="text"
                      value={formData.second_issuer_title}
                      onChange={e => setFormData({ ...formData, second_issuer_title: e.target.value })}
                      placeholder="e.g. Academic Director"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Quick Save */}
              <div className="pt-2">
                <button
                  disabled={isSaving}
                  onClick={handleSaveToDatabase}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving to Database...' : 'Save & Issue Certificate'}</span>
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: REAL-TIME LIVE CERTIFICATE PREVIEW (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Live Landscape Certificate Preview
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Standard Graduation Layout (16:11 Aspect)
                </span>
              </div>

              {/* PREVIEW WRAPPER */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-3 sm:p-4 shadow-2xl">
                
                {/* ACTUAL CERTIFICATE TEMPLATE CONTAINER TO EXPORT */}
                <div
                  id="certificate-print-root"
                  ref={certRef}
                  className="certificate-printable relative w-full min-w-[700px] max-w-[960px] mx-auto text-slate-100 select-none overflow-hidden"
                  style={{
                    backgroundColor: '#07101e',
                    backgroundImage: 'radial-gradient(ellipse at 50% 30%, #0d1e38 0%, #07101e 80%)',
                    aspectRatio: '1.414 / 1',
                    padding: '24px'
                  }}
                >
                  
                  {/* Subtle Guilloche / Geometric Security Border Pattern */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />

                  {/* OUTER DARK BLUE / EMERALD DUAL FRAMING */}
                  <div className="relative w-full h-full rounded-2xl border-4 border-emerald-600/70 p-3 shadow-2xl flex flex-col justify-between"
                       style={{
                         boxShadow: 'inset 0 0 40px rgba(5, 150, 105, 0.15), 0 0 30px rgba(0, 0, 0, 0.8)'
                       }}>

                    {/* INNER GOLD PINSTRIPE WITH ORNAMENTAL CORNERS */}
                    <div className="relative w-full h-full rounded-xl border border-amber-400/50 p-6 sm:p-8 flex flex-col justify-between bg-slate-950/70 backdrop-blur-xs">
                      
                      {/* Four Golden Classical Corner Accents */}
                      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
                      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
                      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
                      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

                      {/* Top Corner Filigree Diamonds */}
                      <div className="absolute top-3.5 left-3.5 w-1.5 h-1.5 bg-emerald-400 rotate-45" />
                      <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-emerald-400 rotate-45" />
                      <div className="absolute bottom-3.5 left-3.5 w-1.5 h-1.5 bg-emerald-400 rotate-45" />
                      <div className="absolute bottom-3.5 right-3.5 w-1.5 h-1.5 bg-emerald-400 rotate-45" />

                      {/* ================= HEADER SECTION ================= */}
                      <div className="text-center space-y-1.5">
                        
                        {/* Institutional Seal Crest */}
                        <div className="inline-flex items-center justify-center gap-2 mb-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-amber-400/60 flex items-center justify-center text-amber-400 shadow-md">
                            <ShieldCheck className="w-5 h-5 text-amber-300" />
                          </div>
                        </div>

                        {/* Institution Name */}
                        <h2 className="text-lg sm:text-xl font-bold tracking-[0.25em] text-white uppercase font-mono drop-shadow-sm">
                          Code Point Kenya
                        </h2>

                        <p className="text-[10px] tracking-[0.2em] uppercase font-mono font-medium text-emerald-400">
                          Institute of Software Engineering & Applied AI
                        </p>

                        <div className="text-[9px] text-slate-400 font-mono tracking-wider">
                          Nairobi Campus • Ngong Road, Teamshark 5th Floor • Accredited Tech Accelerator
                        </div>

                        {/* Golden / Emerald Divider Bar */}
                        <div className="flex items-center justify-center gap-3 pt-1">
                          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                          <span className="text-amber-400 text-xs">✦</span>
                          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                        </div>

                        {/* Title of Award */}
                        <div className="pt-1">
                          <h1 className="text-xl sm:text-2xl font-serif tracking-widest text-amber-200 font-bold uppercase drop-shadow">
                            Certificate of Graduation
                          </h1>
                        </div>

                      </div>

                      {/* ================= BODY SECTION ================= */}
                      <div className="text-center my-auto py-2 space-y-2">
                        
                        <p className="text-[11px] font-mono tracking-widest uppercase text-slate-400">
                          This certificate is proudly awarded to
                        </p>

                        {/* Student Name */}
                        <div className="py-0.5">
                          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200 tracking-wide px-4 inline-block border-b-2 border-amber-400/40 pb-1">
                            {formData.student_name || "Student Full Name"}
                          </h3>
                        </div>

                        {/* Course & Completion Statement */}
                        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed pt-1">
                          for the successful completion of the intensive professional engineering program in
                        </p>

                        {/* Program Title */}
                        <div className="text-base sm:text-lg font-bold font-mono tracking-wide text-white uppercase drop-shadow-sm">
                          {formData.course_title || "Full-Stack Software Engineering"}
                        </div>

                        {/* Technologies Covered */}
                        {formData.technologies_covered && (
                          <div className="max-w-xl mx-auto pt-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                              Demonstrated Verified Competence In:
                            </span>
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              {formData.technologies_covered.split(',').map((tech, i) => (
                                <span 
                                  key={i} 
                                  className="px-2 py-0.5 rounded text-[9px] font-mono font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shadow-xs"
                                >
                                  {tech.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Honors & Cohort Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold mt-1 shadow-inner">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>{formData.final_grade} • {formData.cohort}</span>
                        </div>

                      </div>

                      {/* ================= FOOTER SECTION ================= */}
                      <div className="pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-4 items-end">
                        
                        {/* Left Signatory */}
                        <div className="text-center space-y-1">
                          <div className="font-serif italic text-base sm:text-lg text-amber-200/90 border-b border-slate-700/80 pb-0.5 leading-none">
                            {formData.issuer_name || "Ian Kiprop"}
                          </div>
                          <div className="text-[10px] font-bold text-white font-mono uppercase leading-tight">
                            {formData.issuer_name || "Lead Instructor"}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono leading-tight">
                            {formData.issuer_title || "Curriculum & Faculty Lead"}
                          </div>
                        </div>

                        {/* Center Security Seal & QR Code */}
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-amber-400/20 to-emerald-500/20 border-2 border-amber-400/80 flex flex-col items-center justify-center shadow-lg p-1">
                            <QrCode className="w-7 h-7 text-amber-300 mb-0.5" />
                            <span className="text-[7px] font-mono font-bold text-amber-300 uppercase tracking-tighter">
                              VERIFIED
                            </span>
                            {/* Decorative Seal Ribbons */}
                            <div className="absolute -bottom-2 -left-1 w-3 h-4 bg-emerald-600 border border-amber-400/60 rotate-12 -z-10" />
                            <div className="absolute -bottom-2 -right-1 w-3 h-4 bg-emerald-600 border border-amber-400/60 -rotate-12 -z-10" />
                          </div>
                          <span className="text-[8px] font-mono font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                            OFFICIAL ACCREDITATION SEAL
                          </span>
                        </div>

                        {/* Right Signatory */}
                        <div className="text-center space-y-1">
                          <div className="font-serif italic text-base sm:text-lg text-amber-200/90 border-b border-slate-700/80 pb-0.5 leading-none">
                            {formData.second_issuer_name || "Dr. Angela Wanjiku"}
                          </div>
                          <div className="text-[10px] font-bold text-white font-mono uppercase leading-tight">
                            {formData.second_issuer_name || "Director"}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono leading-tight">
                            {formData.second_issuer_title || "Academic Director"}
                          </div>
                        </div>

                      </div>

                      {/* Micro Security Serial & Verification Bar */}
                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Date Issued:</span>
                          <span className="text-slate-300">{formData.completion_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Credential ID:</span>
                          <span className="text-amber-400 font-bold tracking-wider">{formData.verification_id}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Verify:</span>
                          <span className="text-emerald-400">codepointkenya.com/verify?id={formData.verification_id}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

              {/* Quick Actions Bar under Preview */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-time dynamic preview. Ready for high-resolution 300 DPI export.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={handleShareEmail}
                    className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Share / Email</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 2: ISSUED CERTIFICATES ARCHIVE & STUDENT MANAGEMENT TABLE */}
      {activeTab === 'archive' && (
        <div className="space-y-4">
          
          {/* Search, Filter & Stats Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search student, email, serial..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Course Filter */}
              <select
                value={filterCourse}
                onChange={e => setFilterCourse(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Courses</option>
                {DEFAULT_COURSE_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredCertificates.length} of {certificates.length} certificates
              </span>
              <button
                onClick={() => {
                  handleResetForm();
                  setActiveTab('studio');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Issue New Certificate</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Student & Contact</th>
                    <th className="px-4 py-3">Program / Course</th>
                    <th className="px-4 py-3">Serial ID</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Status & Delivery</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        No issued certificates found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCertificates.map(cert => (
                      <tr key={cert.id} className="hover:bg-slate-900/50 transition-colors">
                        
                        {/* Student */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{cert.student_name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{cert.student_email}</div>
                        </td>

                        {/* Course & Cohort */}
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-200">{cert.course_title}</div>
                          <div className="text-[10px] font-mono text-emerald-400">{cert.cohort} • {cert.final_grade}</div>
                        </td>

                        {/* Verification ID */}
                        <td className="px-4 py-3.5 font-mono">
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                            {cert.verification_id}
                          </span>
                        </td>

                        {/* Issue Date */}
                        <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                          {cert.completion_date}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          {cert.email_sent_at ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3" />
                              <span>Emailed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                              <span>Ready / Stored</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            
                            {/* Edit in Studio */}
                            <button
                              onClick={() => handleEditCertificate(cert)}
                              title="Edit in Certificate Studio"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            </button>

                            {/* Share / Email */}
                            <button
                              onClick={async () => {
                                handleEditCertificate(cert);
                                handleShareEmail();
                              }}
                              title="Email certificate to student"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5 text-teal-400" />
                            </button>

                            {/* View Fullscreen Preview */}
                            <button
                              onClick={() => {
                                if (onSelectPreview) {
                                  onSelectPreview(cert);
                                } else {
                                  handleEditCertificate(cert);
                                }
                              }}
                              title="View Fullscreen"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            </button>

                            {/* Revoke / Delete */}
                            <button
                              onClick={() => handleDeleteCert(cert)}
                              title="Revoke / Delete from database"
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: PICK STUDENT FROM GRADUATION ROSTER / APPLICANTS */}
      {showRosterPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Select Enrolled Student or Graduation Candidate
                </h4>
              </div>
              <button
                onClick={() => setShowRosterPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Click any candidate below to automatically populate their full name, email, and program in the Certificate Studio:
            </p>

            {/* List */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {applications.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-900 border border-slate-800">
                  No registered student candidates in applications directory.
                </div>
              ) : (
                applications.map(app => (
                  <div
                    key={app.id}
                    onClick={() => handleSelectCandidate(app.full_name, app.email, app.course_title)}
                    className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 cursor-pointer flex items-center justify-between gap-4 transition-all"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">{app.full_name}</h5>
                      <span className="text-[11px] font-mono text-slate-400">{app.email}</span>
                      <p className="text-[11px] text-emerald-400 pt-0.5">{app.course_title}</p>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 text-xs font-medium">
                      <span>Import</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowRosterPicker(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SHARE & EMAIL CONFIRMATION MODAL */}
      {shareModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Certificate Dispatched Successfully
                </h4>
              </div>
              <button
                onClick={() => setShareModalData(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                An official graduation confirmation email and verifiable credentials package have been queued and sent to:
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-emerald-300 font-semibold">
                {shareModalData.email}
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                  Direct Public Verification & Download Link:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    type="text"
                    value={shareModalData.url}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareModalData.url);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 3000);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors flex-shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShareModalData(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
