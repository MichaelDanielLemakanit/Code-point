import React, { useState } from 'react';
import { 
  Banknote, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Course, SiteSettings, FAQItem } from '../types';

interface AdmissionsFeesProps {
  onApplyNow: (courseId?: string) => void;
  courses?: Course[];
  siteSettings?: SiteSettings;
}

export const AdmissionsFees: React.FC<AdmissionsFeesProps> = ({ 
  onApplyNow,
  courses = [],
  siteSettings
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const defaultFaqs: FAQItem[] = [
    {
      q: "Where is Code Point Kenya located physically?",
      a: "Our physical headquarters, collaborative learning lab, and classrooms are situated on Ngong Road, Teamshark, 5th Floor in Nairobi. Enrolled fellows can use our high-speed internet, power backup, study pods, and attend Saturday clinics here."
    },
    {
      q: "How does the Online-First model work?",
      a: "Lectures occur live via Zoom on scheduled evenings (7:00 PM - 9:30 PM EAT), enabling working professionals and university students to learn without quitting their jobs. All sessions are recorded and paired with Discord chat and physical campus lab access."
    },
    {
      q: "Are there flexible installment plans for tuition in KES?",
      a: "Yes! While full upfront payment provides a discount, all core programs (Software Engineering KES 85K, Data Science KES 75K, AI KES 95K, Cybersecurity KES 80K) can be split into manageable 5-month installment plans from as low as KES 16,500/month."
    },
    {
      q: "Do I need a Computer Science background to apply?",
      a: "No. Our foundational modules are specifically structured to take beginners from scratch. All you need is a working laptop, consistency, and problem-solving dedication."
    },
    {
      q: "How can I contact admissions or get advice on which course fits me?",
      a: "You can chat with our admissions advisors on WhatsApp directly at 0756295128 (https://wa.me/254756295128), email us at info@codepointkenya.com, or drop by our Ngong Road offices Monday through Saturday."
    }
  ];

  let faqs = defaultFaqs;
  if (siteSettings?.faqs_json) {
    try {
      const parsed = JSON.parse(siteSettings.faqs_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        faqs = parsed;
      }
    } catch (e) {
      console.warn("Failed to parse faqs_json", e);
    }
  }

  const formatKES = (val: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section id="curriculum" className="py-20 bg-slate-900 text-slate-100 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full theme-badge text-xs font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Transparent Tuition & Flexible Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Accessible Tech Education in Kenya
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Invest in your future with zero hidden fees. All tuition quotes in Kenyan Shillings (KES) include both online instruction and full access to our Ngong Road campus.
          </p>
        </div>

        {/* Dynamic Upcoming Intake & Enrollment Urgency Callout */}
        <div 
          style={{ borderColor: 'var(--card-highlight-border)' }}
          className="mt-10 p-5 rounded-2xl bg-slate-950 border shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl theme-icon-box flex items-center justify-center font-bold shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Next Cohort Admissions</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold theme-badge uppercase">
                  {siteSettings?.intake_status || "Enrollment Open"}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                Kickoff Date: <strong className="theme-text-primary">{siteSettings?.next_intake_date || "October 15, 2026"}</strong>
              </div>
              <p className="text-xs text-slate-300">
                Registration Deadline: <strong className="text-amber-300">{siteSettings?.registration_deadline || "October 10, 2026"}</strong> • {siteSettings?.announcement_banner_text || "Early bird flexible tuition available"}
              </p>
            </div>
          </div>

          <button
            onClick={() => onApplyNow()}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all hover:scale-105 cursor-pointer shrink-0"
          >
            <span>Apply for this Intake</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Payment Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-mono theme-text-primary uppercase font-semibold">Plan 01</span>
              <h3 className="text-lg font-bold text-white mt-1">Upfront One-Time Payment</h3>
              <p className="text-xs text-slate-400 mt-2">
                Pay your full program fee before cohort kickoff and receive an automatic 5% scholarship deduction.
              </p>

              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>5% tuition discount applied</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>Single invoice & official receipt</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>Guaranteed campus desk allocation</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onApplyNow()}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Choose Upfront
            </button>
          </div>

          <div 
            style={{ borderColor: 'var(--primary-color)' }}
            className="p-6 rounded-2xl bg-slate-950 border-2 shadow-xl flex flex-col justify-between space-y-6 relative"
          >
            <div 
              style={{ backgroundColor: 'var(--primary-color)', color: '#020617' }}
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md"
            >
              Most Popular
            </div>

            <div>
              <span className="text-[10px] font-mono theme-text-primary uppercase font-semibold">Plan 02</span>
              <h3 className="text-lg font-bold text-white mt-1">5-Month Flexible Installments</h3>
              <p className="text-xs text-slate-400 mt-2">
                Spread tuition into 5 predictable monthly installments while studying. Pay via M-Pesa or Bank transfer.
              </p>

              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>From KES 16,500 – KES 20,500 / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>Deposit down-payment before Day 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>Zero predatory interest or debt penalties</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onApplyNow()}
              style={{ backgroundColor: 'var(--primary-color)' }}
              className="w-full py-2.5 rounded-xl text-slate-950 text-xs font-bold shadow-md hover:brightness-110 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Apply with Installment Plan
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-mono theme-text-primary uppercase font-semibold">Plan 03</span>
              <h3 className="text-lg font-bold text-white mt-1">Employer & Corporate Sponsorship</h3>
              <p className="text-xs text-slate-400 mt-2">
                Have your employer or organization sponsor your software, data, or AI training with official tax invoices.
              </p>

              <div className="mt-6 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>Corporate tax receipt & reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>Custom employee cohort analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 theme-text-primary shrink-0" />
                  <span>Ngong Road team meeting room access</span>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/254756295128?text=Hello%20Code%20Point%20Kenya,%20we%20want%20to%20inquire%20about%20corporate%20sponsorship%20invoicing."
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold border border-slate-700 transition-colors text-center block cursor-pointer"
            >
              Inquire on WhatsApp
            </a>
          </div>

        </div>

        {/* Dynamic Program Tuition Breakdown Section (Syncs with CMS) */}
        {courses.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-800">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-[10px] font-mono theme-text-primary uppercase font-semibold tracking-wider">
                Real-Time Course Fee Schedules
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Program Tuition & Installment Schedules (KES)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Transparent fees across all technical cohorts. Instant M-Pesa & bank installment options.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px]">
                    <th className="py-3.5 px-4 font-semibold">Program</th>
                    <th className="py-3.5 px-4 font-semibold">Duration</th>
                    <th className="py-3.5 px-4 font-semibold">Full Upfront (KES)</th>
                    <th className="py-3.5 px-4 font-semibold">Monthly Plan (5x)</th>
                    <th className="py-3.5 px-4 font-semibold">Next Intake</th>
                    <th className="py-3.5 px-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{c.title}</div>
                        <span className="text-[10px] theme-text-primary font-mono">{c.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {c.duration_weeks} Weeks
                      </td>
                      <td className="py-3.5 px-4 text-white font-mono font-bold">
                        {formatKES(c.price_kes)}
                      </td>
                      <td className="py-3.5 px-4 theme-text-primary font-mono font-medium">
                        {formatKES(c.monthly_kes)} / mo
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          <Calendar className="w-3 h-3 theme-text-primary" />
                          {c.next_intake}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onApplyNow(c.id)}
                          style={{ backgroundColor: 'var(--primary-color)' }}
                          className="px-3 py-1.5 rounded-lg text-slate-950 font-bold text-xs shadow-sm hover:brightness-110 transition-all hover:scale-105 cursor-pointer"
                        >
                          Enroll Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FAQs Section */}
        <div className="mt-20 pt-12 border-t border-slate-800 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white">Frequently Asked Questions</h3>
            <p className="text-xs text-slate-400 mt-1">Everything you need to know about joining Code Point Kenya</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 theme-text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-850 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
