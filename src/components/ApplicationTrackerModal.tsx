import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CheckCircle, 
  Clock, 
  Calendar, 
  AlertCircle, 
  Phone, 
  ExternalLink,
  BookOpen,
  MapPin
} from 'lucide-react';
import { TrackingResult } from '../types';

interface ApplicationTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const ApplicationTrackerModal: React.FC<ApplicationTrackerModalProps> = ({
  isOpen,
  onClose,
  initialCode = ''
}) => {
  const [queryInput, setQueryInput] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch(`/api/applications/track/${encodeURIComponent(queryInput.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Application not found');
      }

      setResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'No application record found for this tracking code or email.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Application Submitted' },
    { num: 2, title: 'Admissions Review' },
    { num: 3, title: 'Interview & Assessment' },
    { num: 4, title: 'Offer Accepted' },
    { num: 5, title: 'Enrolled & Campus Pass' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 theme-text-primary text-xs font-mono font-semibold uppercase tracking-wider">
          <Search className="w-4 h-4" />
          <span>Code Point Kenya Live Tracking</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white mt-1">
          Track Your Application Status
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Enter your Tracking ID (e.g. <span className="font-mono theme-text-primary">CPK-2026-4821</span>) or the email address you applied with.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-5 flex gap-2">
          <input
            type="text"
            required
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="e.g. CPK-2026-4821 or your-email@gmail.com"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700 font-mono transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="px-5 py-2.5 rounded-xl text-slate-950 text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer shrink-0"
          >
            {isLoading ? 'Checking...' : 'Check Status'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 space-y-6 pt-4 border-t border-slate-800 animate-in fade-in">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">Tracking Code</span>
                <div className="text-base font-bold font-mono theme-text-primary">
                  {result.application.tracking_code}
                </div>
                <div className="text-sm font-semibold text-white mt-1">
                  {result.application.full_name}
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400">Selected Program</span>
                <div className="text-xs font-semibold text-white">
                  {result.application.course_title}
                </div>
                <div className="text-[11px] text-slate-400">
                  {result.application.intake}
                </div>
              </div>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Admissions Timeline:
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center">
                {steps.map((s) => {
                  const isDone = s.num < result.meta.currentStep;
                  const isCurrent = s.num === result.meta.currentStep;
                  return (
                    <div key={s.num} className="space-y-1.5">
                      <div
                        style={{
                          backgroundColor: isDone || isCurrent ? 'var(--primary-color)' : undefined
                        }}
                        className={`h-2 rounded-full transition-all ${
                          isDone
                            ? ''
                            : isCurrent
                            ? 'animate-pulse'
                            : 'bg-slate-800'
                        }`}
                      />
                      <span
                        className={`block text-[10px] font-medium leading-tight ${
                          isCurrent
                            ? 'theme-text-primary font-bold'
                            : isDone
                            ? 'text-slate-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {s.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Status Box */}
            <div className="p-4 rounded-xl theme-badge text-slate-200 space-y-2">
              <div className="flex items-center gap-2 theme-text-primary text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Current Stage: {result.meta.label}</span>
              </div>
              <p className="text-xs text-slate-300">
                {result.meta.description}
              </p>
              {result.application.notes && (
                <div className="pt-2 border-t border-slate-700/50 text-xs">
                  <span className="theme-text-primary font-medium">Admissions Note: </span>
                  <span className="text-slate-200">{result.application.notes}</span>
                </div>
              )}
            </div>

            {/* Campus & Admissions Help */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 theme-text-primary shrink-0" />
                <span>In-person visit: Ngong Road, Teamshark 5th Floor, Nairobi</span>
              </div>
              <a
                href={`https://wa.me/254756295128?text=Hello%20Admissions%20Team,%20I%20am%20tracking%20application%20${result.application.tracking_code}.`}
                target="_blank"
                rel="noreferrer"
                className="theme-text-primary hover:underline font-semibold flex items-center gap-1 shrink-0"
              >
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
