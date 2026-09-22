import React from 'react';
import { Certificate } from '../../types';
import { Award, CheckCircle, ExternalLink, Printer, ShieldCheck, X, QrCode } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Official Digital Certificate
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Print / PDF</span>
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
        <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 relative">
          
          {/* Ornamental Border Frame */}
          <div className="border-2 border-amber-500/30 rounded-xl p-8 sm:p-10 relative bg-slate-950/60 shadow-inner">
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
                Code Point Kenya
              </h2>
              <p className="text-xs text-amber-400/90 font-mono tracking-wider uppercase">
                Institute of Software Engineering & Applied AI
              </p>
              <div className="text-[10px] text-slate-400 font-mono">
                Ngong Road, Teamshark 5th Floor, Nairobi, Kenya
              </div>
            </div>

            {/* Statement */}
            <div className="my-6 space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                This is to certify that
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif italic font-bold text-emerald-300 py-1 border-b border-slate-800 inline-block px-8">
                {certificate.student_name}
              </h3>
              <p className="text-xs text-slate-300 max-w-lg mx-auto pt-2 leading-relaxed">
                has successfully completed all rigorous curriculum milestones, laboratory projects, and peer evaluations for
              </p>
              <h4 className="text-base sm:text-lg font-bold text-white font-mono tracking-wide">
                {certificate.course_title}
              </h4>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mt-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Grade: {certificate.final_grade} • {certificate.cohort}</span>
              </div>
            </div>

            {/* Signatures & Verification Meta */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-left">
              
              {/* Left: Signatory */}
              <div className="text-center sm:text-left space-y-1">
                <div className="font-serif italic text-sm text-slate-300 border-b border-slate-700 pb-1">
                  Brenda Wambui
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">Curriculum Director</div>
                <div className="text-[9px] text-slate-500 font-mono">Faculty of Engineering</div>
              </div>

              {/* Center: Verification ID & QR */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <QrCode className="w-10 h-10 text-emerald-400 mb-1" />
                <span className="text-[9px] font-mono text-slate-400 uppercase">Verifiable ID</span>
                <span className="text-[11px] font-mono font-bold text-amber-400 tracking-wider">
                  {certificate.verification_id}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono mt-0.5">Authenticated 100%</span>
              </div>

              {/* Right: Academic Board */}
              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic text-sm text-slate-300 border-b border-slate-700 pb-1">
                  {certificate.approved_by}
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase">Issued Date</div>
                <div className="text-[10px] text-emerald-400 font-mono">{certificate.completion_date}</div>
              </div>

            </div>

          </div>

          {/* Public Verification Link */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Public Verification URL:</span>
            <span className="font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 select-all">
              https://codepointkenya.com/verify?id={certificate.verification_id}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
