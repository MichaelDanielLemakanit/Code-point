import React, { useState, useEffect } from 'react';
import { Certificate, Course, CertificateStatus, CertificateRecipientType } from '../../types';
import {
  Award,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Shield,
  Calendar,
  User,
  Mail,
  BookOpen,
  FileCheck,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Ban,
  FileText
} from 'lucide-react';

interface CertificateRecipient {
  name: string;
  email: string;
  course?: string;
  cohort?: string;
  phone?: string;
  role?: string;
  department?: string;
}

interface CertificateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: Certificate | null; // null for Create New, Certificate for Edit
  courses?: Course[];
  onSaved: (cert: Certificate, isNew: boolean) => void;
}

export const CertificateEditorModal: React.FC<CertificateEditorModalProps> = ({
  isOpen,
  onClose,
  certificate,
  courses = [],
  onSaved
}) => {
  const isEditing = Boolean(certificate);

  // Recipient Type: Student vs Teacher / Instructor
  const [recipientType, setRecipientType] = useState<CertificateRecipientType>('Student');

  // Status
  const [status, setStatus] = useState<CertificateStatus>('Active');

  // Fields
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [courseName, setCourseName] = useState('');
  const [grade, setGrade] = useState('Grade Distinction - Cohort 14');
  const [issueDate, setIssueDate] = useState('');
  const [certIdNumber, setCertIdNumber] = useState('');
  const [signatory1Name, setSignatory1Name] = useState('Brenda Wambui');
  const signatory1TitleDefault = 'CURRICULUM DIRECTOR - Faculty of Engineering';
  const [signatory1Title, setSignatory1Title] = useState(signatory1TitleDefault);
  const [signatory2Name, setSignatory2Name] = useState('Code Point Kenya Academic Board & Admin');
  const [signatory2Title, setSignatory2Title] = useState('ISSUED DATE');
  const [institutionName, setInstitutionName] = useState('CODE POINT KENYA');
  const [subHeading, setSubHeading] = useState('INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI');
  const [addressText, setAddressText] = useState('Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya');

  // Recipients auto-fetch list
  const [recipientsData, setRecipientsData] = useState<{
    students: CertificateRecipient[];
    instructors: CertificateRecipient[];
  }>({ students: [], instructors: [] });
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load enrollment/recipient profiles from API
  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true);
      const res = await fetch('/api/certificates/recipients');
      if (res.ok) {
        const data = await res.json();
        setRecipientsData({
          students: Array.isArray(data.students) ? data.students : [],
          instructors: Array.isArray(data.instructors) ? data.instructors : []
        });
      }
    } catch (e) {
      console.warn('Failed to load certificate recipients roster:', e);
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecipients();
    }
  }, [isOpen]);

  // Initialize form state when opened or certificate changes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSelectedRecipientId('');
      return;
    }

    if (certificate) {
      const type = (certificate.recipientType || certificate.recipient_type || 'Student') as CertificateRecipientType;
      setRecipientType(type === 'Teacher / Instructor' ? 'Teacher / Instructor' : 'Student');
      
      const st = (certificate.status || 'Active') as CertificateStatus;
      setStatus(['Active', 'Draft', 'Revoked', 'Pending Clearance'].includes(st) ? st : 'Active');

      setStudentName(certificate.studentName || certificate.student_name || '');
      setStudentEmail(certificate.studentEmail || certificate.student_email || '');
      setCourseName(certificate.courseName || certificate.course_title || '');
      setGrade(certificate.grade || (certificate.final_grade ? `${certificate.final_grade} - ${certificate.cohort || 'Cohort 14'}` : 'Grade Distinction - Cohort 14'));
      
      let dateVal = certificate.issueDate || certificate.completion_date || '';
      if (dateVal.includes('T')) {
        dateVal = dateVal.split('T')[0];
      }
      setIssueDate(dateVal || new Date().toISOString().split('T')[0]);
      
      setCertIdNumber(certificate.certIdNumber || certificate.verification_id || '');
      setSignatory1Name(certificate.signatory1Name || 'Brenda Wambui');
      setSignatory1Title(certificate.signatory1Title || signatory1TitleDefault);
      setSignatory2Name(certificate.signatory2Name || certificate.approved_by || 'Code Point Kenya Academic Board & Admin');
      setSignatory2Title(certificate.signatory2Title || 'ISSUED DATE');
      setInstitutionName(certificate.institutionName || 'CODE POINT KENYA');
      setSubHeading(certificate.subHeading || 'INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI');
      setAddressText(certificate.addressText || 'Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya');
    } else {
      // Default blank values for Create
      setRecipientType('Student');
      setStatus('Active');
      const defaultCourse = courses[0]?.title || 'Full-Stack Software Engineering';
      setStudentName('');
      setStudentEmail('');
      setCourseName(defaultCourse);
      setGrade('Grade Distinction - Cohort 14');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setCertIdNumber(`CPK-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`);
      setSignatory1Name('Brenda Wambui');
      setSignatory1Title(signatory1TitleDefault);
      setSignatory2Name('Code Point Kenya Academic Board & Admin');
      setSignatory2Title('ISSUED DATE');
      setInstitutionName('CODE POINT KENYA');
      setSubHeading('INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI');
      setAddressText('Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya');
      setSelectedRecipientId('');
    }
    setError(null);
  }, [isOpen, certificate, courses]);

  if (!isOpen) return null;

  const handleGenerateId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setCertIdNumber(`CPK-CERT-2026-${randomNum}`);
  };

  // When recipient type toggle changes
  const handleToggleRecipientType = (type: CertificateRecipientType) => {
    setRecipientType(type);
    setSelectedRecipientId('');
    if (type === 'Teacher / Instructor') {
      setGrade('Faculty Excellence & Mentorship - 2026');
      if (!isEditing && recipientsData.instructors.length > 0) {
        const first = recipientsData.instructors[0];
        setStudentName(first.name);
        setStudentEmail(first.email);
        setCourseName(first.department || first.role || 'Faculty of Software Engineering');
      }
    } else {
      setGrade('Grade Distinction - Cohort 14');
      if (!isEditing && recipientsData.students.length > 0) {
        const first = recipientsData.students[0];
        setStudentName(first.name);
        setStudentEmail(first.email);
        setCourseName(first.course || courses[0]?.title || 'Full-Stack Software Engineering');
      }
    }
  };

  // Handle selecting an existing enrolled profile from dropdown
  const handleSelectRecipient = (email: string) => {
    setSelectedRecipientId(email);
    if (!email) return;

    if (recipientType === 'Student') {
      const match = recipientsData.students.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (match) {
        setStudentName(match.name);
        setStudentEmail(match.email);
        if (match.course) setCourseName(match.course);
        const cohortStr = match.cohort || 'Cohort 14';
        setGrade(`Grade Distinction - ${cohortStr}`);
      }
    } else {
      const match = recipientsData.instructors.find(i => i.email.toLowerCase() === email.toLowerCase());
      if (match) {
        setStudentName(match.name);
        setStudentEmail(match.email);
        if (match.department || match.role) {
          setCourseName(match.department || `${match.role} - Software Engineering`);
        }
        setGrade('Faculty Excellence & Mentorship - 2026');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = studentName.trim();
    const cleanEmail = studentEmail.trim().toLowerCase();
    const cleanCourse = courseName.trim();

    if (!cleanName) {
      setError(`Please provide the ${recipientType === 'Student' ? 'student' : 'faculty instructor'} full name.`);
      return;
    }
    if (!cleanEmail) {
      setError('Please provide a valid recipient email address.');
      return;
    }
    if (!cleanCourse) {
      setError('Please select or specify the program / credential discipline name.');
      return;
    }

    const payload = {
      studentName: cleanName,
      student_name: cleanName,
      studentEmail: cleanEmail,
      student_email: cleanEmail,
      courseName: cleanCourse,
      course_title: cleanCourse,
      grade: grade.trim() || 'Grade Distinction - Cohort 14',
      final_grade: grade.trim().includes('Distinction') ? 'Distinction' : grade.trim(),
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      certIdNumber: certIdNumber.trim().toUpperCase(),
      verification_id: certIdNumber.trim().toUpperCase(),
      signatory1Name: signatory1Name.trim(),
      signatory1Title: signatory1Title.trim(),
      signatory2Name: signatory2Name.trim(),
      signatory2Title: signatory2Title.trim(),
      institutionName: institutionName.trim() || 'CODE POINT KENYA',
      subHeading: subHeading.trim() || 'INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI',
      addressText: addressText.trim() || 'Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya',
      status,
      recipientType,
      recipient_type: recipientType
    };

    setSaving(true);
    try {
      const url = isEditing && certificate
        ? `/api/certificates/${encodeURIComponent(certificate.id || certificate.certIdNumber || certificate.verification_id || '')}`
        : '/api/certificates';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save certificate record');
      }

      onSaved(data.certificate, !isEditing);
      onClose();
    } catch (err: any) {
      console.error('Certificate save error:', err);
      setError(err.message || 'Network error while persisting certificate');
    } finally {
      setSaving(false);
    }
  };

  const currentRosterList = recipientType === 'Student' ? recipientsData.students : recipientsData.instructors;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                {isEditing ? 'Edit Certificate Record' : 'Issue New Graduation Certificate'}
              </h2>
              <p className="text-xs text-stone-500">
                {isEditing
                  ? `Modifying authenticated credential for ${certificate?.studentName || certificate?.student_name}`
                  : 'Configure digital credential, automated profile autofill, and clearance metadata'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {error && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: RECIPIENT TYPE & STATUS SELECTORS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            {/* Recipient Type Toggle */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                <span>Recipient Type *</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-200/70 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleToggleRecipientType('Student')}
                  className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recipientType === 'Student'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleRecipientType('Teacher / Instructor')}
                  className={`py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recipientType === 'Teacher / Instructor'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Faculty / Teacher</span>
                </button>
              </div>
            </div>

            {/* Certificate Status Selector */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-stone-500" />
                <span>Certificate Status *</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CertificateStatus)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-900 bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="Active">🟢 Active (Verifiable & Authenticated)</option>
                <option value="Draft">🟡 Draft (Pending Sign-off)</option>
                <option value="Pending Clearance">🔵 Pending Clearance (Coursework Evaluation)</option>
                <option value="Revoked">🔴 Revoked (Null & Void)</option>
              </select>
            </div>
          </div>

          {/* STEP 2: AUTO-FILL FROM ENROLLMENT PROFILES */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Auto-Fill from Enrolled {recipientType === 'Student' ? 'Student' : 'Faculty / Instructor'} Profiles:</span>
              </label>
              {loadingRecipients && (
                <span className="text-[10px] text-amber-700 flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Loading roster...
                </span>
              )}
            </div>

            <select
              value={selectedRecipientId}
              onChange={(e) => handleSelectRecipient(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs text-stone-900 bg-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer"
            >
              <option value="">
                {currentRosterList.length === 0
                  ? `-- No ${recipientType.toLowerCase()} profiles found --`
                  : `-- Select existing ${recipientType.toLowerCase()} to auto-fill form --`}
              </option>
              {currentRosterList.map((r) => (
                <option key={r.email} value={r.email}>
                  {r.name} — {r.course || r.department || r.role || 'Code Point Kenya'} ({r.cohort || 'Cohort 14'}) [{r.email}]
                </option>
              ))}
            </select>
            <p className="text-[10px] text-amber-800/80">
              Selecting a profile automatically fills in the recipient name, registered email, enrolled program, and designated cohort grade.
            </p>
          </div>

          {/* STEP 3: RECIPIENT NAME & EMAIL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>{recipientType === 'Student' ? 'Student' : 'Faculty Instructor'} Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder={recipientType === 'Student' ? 'e.g. Daniel Kiptoo' : 'e.g. Brenda Wambui'}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>Recipient Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="e.g. recipient@example.com"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 font-medium"
              />
            </div>
          </div>

          {/* STEP 4: COURSE PROGRAM & GRADE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                <span>{recipientType === 'Student' ? 'Course Program Name *' : 'Department / Faculty Domain *'}</span>
              </label>
              <div className="space-y-1.5">
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Full-Stack Software Engineering"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
                />
                {courses.length > 0 && recipientType === 'Student' && (
                  <div className="flex flex-wrap gap-1">
                    {courses.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCourseName(c.title)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          courseName === c.title
                            ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
                            : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200/60'
                        }`}
                      >
                        {c.title.split(' ')[0]}...
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Grade & Honors Designation</span>
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Grade Distinction - Cohort 14"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {recipientType === 'Student' ? (
                  ['Grade Distinction - Cohort 14', 'Grade Merit - Cohort 14', 'Grade Pass - Cohort 14'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className="text-[10px] text-stone-500 underline hover:text-stone-800 cursor-pointer"
                    >
                      {g.split(' ')[1]}
                    </button>
                  ))
                ) : (
                  ['Faculty Excellence & Mentorship - 2026', 'Distinguished Lead Instructor Award', 'Honorary Faculty Fellow'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className="text-[10px] text-stone-500 underline hover:text-stone-800 cursor-pointer"
                    >
                      {g.split(' ')[0]} {g.split(' ')[1]}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* STEP 5: ISSUE DATE & CERTIFICATE ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Issue Date</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-stone-400" />
                  <span>Certificate ID Number (Unique)</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateId}
                  className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer underline"
                >
                  Regenerate
                </button>
              </div>
              <input
                type="text"
                required
                value={certIdNumber}
                onChange={(e) => setCertIdNumber(e.target.value.toUpperCase())}
                placeholder="e.g. CPK-CERT-2026-501525"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900 font-bold"
              />
            </div>
          </div>

          {/* STEP 6: SIGNATORIES CONFIGURATION */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3">
            <div className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
              Official Signatures & Titles
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Signatory 1 Name (Left)
                </label>
                <input
                  type="text"
                  value={signatory1Name}
                  onChange={(e) => setSignatory1Name(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Signatory 1 Title
                </label>
                <input
                  type="text"
                  value={signatory1Title}
                  onChange={(e) => setSignatory1Title(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Signatory 2 Name (Right)
                </label>
                <input
                  type="text"
                  value={signatory2Name}
                  onChange={(e) => setSignatory2Name(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Signatory 2 Title
                </label>
                <input
                  type="text"
                  value={signatory2Title}
                  onChange={(e) => setSignatory2Title(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* STEP 7: BRANDING CUSTOMIZATION */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{showAdvanced ? '▾ Hide' : '▸ Show'} Institution & Subheading Branding</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Institution Header Name
                  </label>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Institution Subheading
                  </label>
                  <input
                    type="text"
                    value={subHeading}
                    onChange={(e) => setSubHeading(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Campus Address Line
                  </label>
                  <input
                    type="text"
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-900 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 8: ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Changes' : 'Issue Certificate'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
