import React, { useState } from 'react';
import { Certificate } from '../../types';
import { Award, CheckCircle, Printer, ShieldCheck, X, QrCode, Download, Loader2 } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('certificate-card');
    if (!element) return;

    try {
      setIsDownloading(true);
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule as any).default || html2pdfModule;

      const studentName = certificate.studentName || certificate.student_name || 'Student';
      const opt = {
        margin:       0,
        filename:     `${studentName}_Certificate.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error generating certificate PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn certificate-modal-overlay">
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          html, body {
            background: #020617 !important;
            color: #ffffff !important;
            height: auto !important;
          }
          body * {
            visibility: hidden !important;
          }
          .certificate-modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            backdrop-filter: none !important;
            display: block !important;
          }
          .certificate-modal-box {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            overflow: visible !important;
          }
          .no-print, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
          #certificate-card,
          #certificate-card * {
            visibility: visible !important;
          }
          #certificate-card {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 950px !important;
            box-shadow: none !important;
            background-color: #020617 !important;
            border: 2px solid #f59e0b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 certificate-modal-box">
        
        {/* Header Bar */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Official Digital Certificate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
              title="Download Certificate as PDF file"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              title="Print Certificate card"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body Container */}
        <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 relative">
          
          {/* Ornamental Border Frame - Assigned certificate-card ID */}
          <div
            id="certificate-card"
            className="border-2 border-amber-500/40 rounded-xl p-8 sm:p-10 relative bg-slate-950 shadow-2xl text-center"
            style={{ backgroundColor: '#020617' }}
          >
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

            {/* Institution Header */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-white uppercase font-mono">
                {certificate.institutionName || 'CODE POINT KENYA'}
              </h2>
              <p className="text-xs text-amber-400/90 font-mono tracking-wider uppercase">
                {certificate.subHeading || 'INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI'}
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                {certificate.addressText || 'Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya'}
              </div>
            </div>

            {/* Statement */}
            <div className="my-6 space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                This is to certify that
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif italic font-bold text-emerald-300 py-1 border-b border-slate-800 inline-block px-8">
                {certificate.studentName || certificate.student_name || 'Graduating Fellow'}
              </h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto pt-2 leading-relaxed">
                has successfully completed all rigorous curriculum milestones, laboratory projects, and peer evaluations for
              </p>
              <h4 className="text-base sm:text-lg font-bold text-white font-mono tracking-wide">
                {certificate.courseName || certificate.course_title || 'Software Engineering Immersive'}
              </h4>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mt-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>
                  {certificate.grade || (certificate.final_grade ? `Grade: ${certificate.final_grade} • ${certificate.cohort || 'Cohort 14'}` : 'Grade Distinction - Cohort 14')}
                </span>
              </div>
            </div>

            {/* Signatures & Verification Meta */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-left">
              
              {/* Left: Signatory 1 */}
              <div className="text-center sm:text-left space-y-1">
                <div className="font-serif italic text-sm text-slate-300 border-b border-slate-700 pb-1">
                  {certificate.signatory1Name || 'Brenda Wambui'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">
                  {certificate.signatory1Title || 'CURRICULUM DIRECTOR - Faculty of Engineering'}
                </div>
              </div>

              {/* Center: Verification ID & QR */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <QrCode className="w-10 h-10 text-emerald-400 mb-1" />
                <span className="text-[9px] font-mono text-slate-400 uppercase">Verifiable ID</span>
                <span className="text-[11px] font-mono font-bold text-amber-400 tracking-wider">
                  {certificate.certIdNumber || certificate.verification_id || 'CPK-CERT-VERIFIED'}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono mt-0.5">Authenticated 100%</span>
              </div>

              {/* Right: Signatory 2 & Issue Date */}
              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic text-sm text-slate-300 border-b border-slate-700 pb-1">
                  {certificate.signatory2Name || certificate.approved_by || 'Code Point Kenya Academic Board & Admin'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">
                  {certificate.signatory2Title || 'ISSUED DATE'}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  {certificate.issueDate ? (
                    certificate.issueDate.includes('T')
                      ? new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : certificate.issueDate
                  ) : (certificate.completion_date || 'October 2026')}
                </div>
              </div>

            </div>

          </div>

          {/* Public Verification Link */}
          <div className="no-print mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Public Verification URL:</span>
            <span className="font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 select-all">
              https://codepointkenya.com/verify?id={certificate.certIdNumber || certificate.verification_id}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
