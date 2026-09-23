import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, Send } from 'lucide-react';
import { SiteSettings } from '../types';

interface WhatsAppWidgetProps {
  siteSettings?: SiteSettings;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ siteSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const phone = siteSettings?.primary_phone || "0756295128";
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const brandName = siteSettings?.brand_name || "Code Point Kenya";

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim() 
      ? encodeURIComponent(message.trim()) 
      : encodeURIComponent(`Hello ${brandName} Admissions! I'm interested in your upcoming tech training cohorts.`);
    
    window.open(`https://wa.me/${cleanPhone || '254756295128'}?text=${text}`, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Quick Chat Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div 
            style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}
            className="p-4 text-white flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">
                  CPK
                </div>
                <span 
                  style={{ backgroundColor: 'var(--primary-color)' }}
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900" 
                />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">{brandName} Support</h4>
                <p className="text-[11px] text-white/90 flex items-center gap-1">
                  <span>Admissions Online (Replies in &lt;5 mins)</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-950/90 text-xs space-y-3">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
              <p className="font-semibold theme-text-primary">👋 Karibu to {brandName}!</p>
              <p>Need help choosing between Software Engineering, Data Science, AI, or Cybersecurity?</p>
              <p className="text-[11px] text-slate-400 pt-1">
                📍 Physical campus: {siteSettings?.address || "Ngong Road, Teamshark 5th Floor, Nairobi"}.
              </p>
            </div>

            <form onSubmit={handleSend} className="space-y-2 pt-1">
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question here..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
              />

              <div className="flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${cleanPhone || '254756295128'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] theme-text-primary hover:underline flex items-center gap-1 font-mono"
                >
                  <span>{phone}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--primary-color)' }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-950 font-bold text-xs shadow-md hover:brightness-110 transition-colors cursor-pointer"
                >
                  <span>Start WhatsApp Chat</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: 'var(--primary-color)' }}
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full text-slate-950 font-bold text-xs shadow-xl hover:scale-105 hover:brightness-110 transition-all cursor-pointer select-none"
        title={`Chat on WhatsApp (${phone})`}
        aria-label="Open WhatsApp Chat"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 fill-slate-950" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
          </span>
        </div>
        <span className="hidden sm:inline">WhatsApp Support ({phone})</span>
      </button>
    </div>
  );
};
