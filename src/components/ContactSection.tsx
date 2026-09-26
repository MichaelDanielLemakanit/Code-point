import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Clock, 
  Building2, 
  ExternalLink, 
  Send, 
  CheckCircle2
} from 'lucide-react';
import { SiteSettings } from '../types';

interface ContactSectionProps {
  siteSettings?: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteSettings }) => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquirySubject, setInquirySubject] = useState('Admission & Tuition Options');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const cleanPhone = (siteSettings?.primary_phone || "0756295128").replace(/[^0-9]/g, '');

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Persist inquiry into the backend SQLite messages & applications tables
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryName.trim(),
          email: inquiryEmail.trim(),
          phone: inquiryPhone.trim(),
          subject: inquirySubject,
          course_title: inquirySubject,
          message: inquiryMsg.trim() || 'Requesting admission information and cohort details.'
        })
      });

      // 2. Dispatch real-time event so open Admin CMS Inbox immediately re-fetches
      window.dispatchEvent(new CustomEvent('cpk_inbox_updated'));
    } catch (err) {
      console.error('Failed to save inquiry to database:', err);
    } finally {
      setIsSubmitting(false);
      setSentSuccess(true);
    }

    // Prefilled WhatsApp message
    const prefilledText = `Hello ${encodeURIComponent(siteSettings?.brand_name || 'Code Point Kenya')} Admissions! My name is ${encodeURIComponent(inquiryName)}. I am inquiring about ${encodeURIComponent(inquirySubject)}. Message: ${encodeURIComponent(inquiryMsg || 'I would like more information on upcoming intakes.')}`;
    const waUrl = `https://wa.me/${cleanPhone || '254756295128'}?text=${prefilledText}`;
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 500);
  };

  return (
    <section id="contact" className="w-full max-w-full overflow-x-hidden py-20 bg-slate-950 text-slate-100 relative scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Visit Our Nairobi Campus or Chat with Us
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-14 items-start">
          
          {/* Left Column: Official Contact & Campus Card */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Campus Physical Address Card */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl theme-icon-box flex items-center justify-center">
                  <MapPin className="w-6 h-6 theme-text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Nairobi Innovation Hub</h3>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <Building2 className="w-5 h-5 theme-text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-white block">Official Office Location:</span>
                    <span className="text-slate-300">{siteSettings?.address || "Ngong Road, Teamshark, 5th Floor, Nairobi, Kenya"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <Clock className="w-5 h-5 theme-text-secondary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-white block">Physical Office Hours:</span>
                    <span className="text-slate-300">{siteSettings?.weekday_hours || "Monday – Friday: 8:00 AM – 8:00 PM EAT"}</span>
                    <span className="block text-slate-400 text-xs">{siteSettings?.weekend_hours || "Saturday Labs & Clinics: 9:00 AM – 4:00 PM EAT"}</span>
                  </div>
                </div>
              </div>

              {/* Direct Communication Channels */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp Card */}
                <a
                  href={`https://wa.me/${cleanPhone || '254756295128'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 rounded-xl theme-badge flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 theme-text-primary" />
                    <div>
                      <div className="text-[10px] uppercase font-mono theme-text-primary font-bold">WhatsApp Support</div>
                      <div className="text-xs font-bold text-white group-hover:underline font-mono">{siteSettings?.primary_phone || "0756295128"}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 theme-text-primary group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* Email Card */}
                <a
                  href={`mailto:${siteSettings?.email || 'info@codepointkenya.com'}`}
                  className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 theme-text-secondary" />
                    <div className="overflow-hidden">
                      <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">Official Email</div>
                      <div className="text-xs font-bold text-white group-hover:text-white truncate">{siteSettings?.email || "info@codepointkenya.com"}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>
              </div>

              {/* Social Media Link */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">Instagram Community</div>
                    <div className="text-xs font-bold text-white">{siteSettings?.social_instagram || "Code Point Kenya"} (@codepointkenya)</div>
                  </div>
                </div>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1"
                >
                  <span>Follow Us</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>

          </div>

          {/* Right Column: Quick WhatsApp Consultation & Callback Form */}
          <div className="lg:col-span-6">
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              
              <div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Have a Question? Talk to Our Advisors
                </h3>
              </div>

              {sentSuccess ? (
                <div className="p-6 rounded-xl theme-badge text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 theme-text-primary mx-auto" />
                  <h4 className="text-base font-bold text-white">Opening WhatsApp Chat...</h4>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Connecting you directly to Code Point Kenya admissions at <strong className="theme-text-primary">0756295128</strong>.
                  </p>
                  <button
                    onClick={() => setSentSuccess(false)}
                    className="text-xs theme-text-primary hover:underline pt-2 inline-block cursor-pointer"
                  >
                    Send another question
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitInquiry} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Your Name <span className="theme-text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        placeholder="e.g. Mercy Wanjiku"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Phone / WhatsApp <span className="theme-text-primary">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="e.g. mercy@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Topic of Inquiry
                    </label>
                    <select
                      value={inquirySubject}
                      onChange={(e) => setInquirySubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-slate-700 transition-colors"
                    >
                      <option value="Admission & Tuition Options">Admission & Tuition Options (KES)</option>
                      <option value="Software Engineering Track Details">Software Engineering Track Details</option>
                      <option value="Data Science & AI Programs">Data Science & AI Programs</option>
                      <option value="Campus Tour at Ngong Road 5th Floor">Campus Tour at Ngong Road 5th Floor</option>
                      <option value="Corporate / Team Upskilling">Corporate / Team Upskilling</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Your Message or Questions
                    </label>
                    <textarea
                      rows={3}
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                      placeholder="Tell us about your background or questions you'd like answered..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-slate-700 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: 'var(--primary-color)' }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md hover:brightness-110 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sending inquiry to Admissions...</span>
                    ) : (
                      <>
                        <span>Submit Inquiry & Connect via WhatsApp (0756295128)</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
