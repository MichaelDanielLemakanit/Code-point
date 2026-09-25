import React, { useState, useEffect } from 'react';
import { Certificate, Course } from '../../types';
import { Award, X, Check, RefreshCw, AlertCircle, Shield, Calendar, User, Mail, BookOpen, FileCheck } from 'lucide-react';

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

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form state when opened or certificate changes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      return;
    }

    if (certificate) {
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
    }
    setError(null);
  }, [isOpen, certificate, courses]);

  if (!isOpen) return null;

  const handleGenerateId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setCertIdNumber(`CPK-CERT-2026-${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = studentName.trim();
    const cleanEmail = studentEmail.trim().toLowerCase();
    const cleanCourse = courseName.trim();

    if (!cleanName) {
      setError('Please provide the student’s full name.');
      return;
    }
    if (!cleanEmail) {
      setError('Please provide a valid student email address.');
      return;
    }
    if (!cleanCourse) {
      setError('Please select or specify the course program name.');
      return;
    }

    const payload = {
      studentName: cleanName,
      studentEmail: cleanEmail,
      courseName: cleanCourse,
      grade: grade.trim() || 'Grade Distinction - Cohort 14',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      certIdNumber: certIdNumber.trim().toUpperCase(),
      signatory1Name: signatory1Name.trim(),
      signatory1Title: signatory1Title.trim(),
      signatory2Name: signatory2Name.trim(),
      signatory2Title: signatory2Title.trim(),
      institutionName: institutionName.trim() || 'CODE POINT KENYA',
      subHeading: subHeading.trim() || 'INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI',
      addressText: addressText.trim() || 'Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya'
    };

    setSaving(true);
    try {
      const url = isEditing && certificate
        ? `/api/certificates/${encodeURIComponent(certificate.id || certificate.certIdNumber)}`
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-serif">
                {isEditing ? 'Edit Certificate Record' : 'Issue New Graduation Certificate'}
              </h2>
              <p className="text-xs text-stone-500">
                {isEditing
                  ? `Modifying credential for ${certificate?.studentName || certificate?.student_name}`
                  : 'Create an authenticated digital certificate in the database'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Recipient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>Student Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Daniel Kiptoo"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>Student Email Address *</span>
              </label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="e.g. daniel.kiptoo@example.com"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
              />
            </div>
          </div>

          {/* Course & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                <span>Course Program Name *</span>
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
                {courses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {courses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCourseName(c.title)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
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
                <span>Grade & Cohort Designation</span>
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Grade Distinction - Cohort 14"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
              />
              <div className="flex gap-1.5 mt-1">
                {['Grade Distinction - Cohort 14', 'Grade Merit - Cohort 14', 'Grade Pass - Cohort 14'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className="text-[10px] text-stone-500 underline hover:text-stone-800"
                  >
                    {g.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Issue Date & Certificate ID Number */}
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
                  className="text-[10px] text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
                >
                  Generate New ID
                </button>
              </div>
              <input
                type="text"
                required
                value={certIdNumber}
                onChange={(e) => setCertIdNumber(e.target.value.toUpperCase())}
                placeholder="e.g. CPK-CERT-2026-501525"
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-900"
              />
            </div>
          </div>

          {/* Signatories Configuration */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
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

          {/* Toggle Advanced Branding */}
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

          {/* Action Buttons */}
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
