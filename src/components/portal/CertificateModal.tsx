import React, { useRef, useState } from 'react';
import { Certificate } from '../../types';
import { Award, CheckCircle, ExternalLink, Printer, ShieldCheck, X, QrCode, Download, Mail, Copy, Check } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      const element = certRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#07101e'
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`CodePointKenya_Certificate_${certificate.verification_id}.pdf`);
    } catch (err: any) {
      console.warn('PDF generation encountered a rendering issue, falling back to print dialog:', err?.message || err);
      // Fallback to print if browser canvas capture is restricted
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const verificationUrl = `https://codepointkenya.com/verify?id=${certificate.verification_id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Official Digital Certificate of Graduation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Copy public verification link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-teal-400" />}
              <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
            </button>

            <button
              disabled={isDownloading}
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body Container */}
        <div className="p-6 sm:p-8 bg-slate-950 flex flex-col items-center justify-center overflow-x-auto">
          
          {/* RENDER NODE FOR CAPTURE & PRINT */}
          <div
            id="certificate-print-root"
            ref={certRef}
            className="certificate-printable relative w-full min-w-[680px] max-w-[880px] text-slate-100 select-none overflow-hidden rounded-2xl"
            style={{
              backgroundColor: '#07101e',
              backgroundImage: 'radial-gradient(ellipse at 50% 30%, #0d1e38 0%, #07101e 80%)',
              aspectRatio: '1.414 / 1',
              padding: '20px'
            }}
          >
            
            {/* Outer Emerald Framing */}
            <div className="relative w-full h-full rounded-xl border-4 border-emerald-600/70 p-2.5 shadow-2xl flex flex-col justify-between"
                 style={{
                   boxShadow: 'inset 0 0 35px rgba(5, 150, 105, 0.15), 0 0 30px rgba(0, 0, 0, 0.8)'
                 }}>
              
              {/* Inner Gold Pinstripe */}
              <div className="relative w-full h-full rounded-lg border border-amber-400/50 p-6 flex flex-col justify-between bg-slate-950/70 backdrop-blur-xs">
                
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
                  <h3 className="text-2xl sm:text-3xl font-serif italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-200 tracking-wide px-4 inline-block border-b-2 border-amber-400/40 pb-0.5">
                    {certificate.student_name}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto pt-1 leading-relaxed">
                    for the successful completion of the intensive professional engineering program in
                  </p>
                  <div className="text-sm sm:text-base font-bold font-mono tracking-wide text-white uppercase">
                    {certificate.course_title}
                  </div>

                  {certificate.technologies_covered && (
                    <div className="max-w-lg mx-auto pt-1">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {certificate.technologies_covered.split(',').map((tech, i) => (
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
                    <span>{certificate.final_grade} • {certificate.cohort}</span>
                  </div>
                </div>

                {/* Signatures & Accreditation Seal */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-3 items-end">
                  
                  {/* Left Signatory */}
                  <div className="text-center space-y-0.5">
                    <div className="font-serif italic text-sm text-amber-200/90 border-b border-slate-700/80 pb-0.5">
                      {certificate.issuer_name || "Ian Kiprop"}
                    </div>
                    <div className="text-[9px] font-bold text-white font-mono uppercase">
                      {certificate.issuer_name || "Lead Instructor"}
                    </div>
                    <div className="text-[8px] text-slate-400 font-mono">
                      {certificate.issuer_title || "Curriculum & Faculty Lead"}
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
                      {certificate.second_issuer_name || certificate.approved_by || "Dr. Angela Wanjiku"}
                    </div>
                    <div className="text-[9px] font-bold text-white font-mono uppercase">
                      {certificate.second_issuer_name || "Academic Director"}
                    </div>
                    <div className="text-[8px] text-slate-400 font-mono">
                      {certificate.second_issuer_title || "Academic Council"}
                    </div>
                  </div>

                </div>

                {/* Micro Security Bar */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-1 text-[8px] font-mono text-slate-400">
                  <span>Issued: {certificate.completion_date}</span>
                  <span className="text-amber-400 font-bold">ID: {certificate.verification_id}</span>
                  <span className="text-emerald-400">codepointkenya.com/verify?id={certificate.verification_id}</span>
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

      </div>
    </div>
  );
};

