import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mail, 
  Smartphone, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Eye, 
  ShieldAlert, 
  DollarSign, 
  User, 
  Calendar,
  CreditCard,
  MessageSquare,
  Check
} from 'lucide-react';
import { StudentFeeAccount, FeeNotificationChannel, FeeNotificationType } from '../../types';

interface FeeAlertDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: StudentFeeAccount;
  onSuccess?: (message: string) => void;
}

export const FeeAlertDispatcherModal: React.FC<FeeAlertDispatcherModalProps> = ({
  isOpen,
  onClose,
  fee,
  onSuccess
}) => {
  const [alertType, setAlertType] = useState<FeeNotificationType>(
    fee.payment_status === 'overdue' || !fee.portal_access_granted 
      ? 'status_overdue' 
      : 'deadline_approaching'
  );
  const [channel, setChannel] = useState<FeeNotificationChannel>('both');
  const [phone, setPhone] = useState(fee.student_phone || '+254 712 345 678');
  const [email, setEmail] = useState(fee.student_email || '');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  
  const [previewTab, setPreviewTab] = useState<'sms' | 'email'>('sms');
  const [previewData, setPreviewData] = useState<{ smsText: string; emailHtml: string; subject: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

  // Fetch or update preview
  const fetchPreview = async () => {
    try {
      setLoadingPreview(true);
      const res = await fetch('/api/admin/fee-notifications/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_fee_id: fee.id,
          alert_type: alertType,
          custom_subject: customSubject.trim() || undefined,
          custom_message: customMessage.trim() || undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.preview) {
          setPreviewData(data.preview);
        }
      }
    } catch (err) {
      console.error('Failed to fetch preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPreview();
    }
  }, [isOpen, alertType, fee.id]);

  const handleSend = async () => {
    try {
      setIsSending(true);
      const recipientOverride = channel === 'both' 
        ? `${email} / ${phone}` 
        : (channel === 'sms' ? phone : email);

      const res = await fetch('/api/admin/fee-notifications/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_fee_id: fee.id,
          alert_type: alertType,
          channel: channel,
          custom_subject: customSubject.trim() || undefined,
          custom_message: customMessage.trim() || undefined,
          recipient_override: recipientOverride
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (onSuccess) onSuccess(data.message || `Alert successfully dispatched to ${fee.student_name}.`);
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to dispatch alert');
      }
    } catch (err: any) {
      console.error('Failed to send alert:', err);
      alert(err.message || 'Error dispatching notification');
    } finally {
      setIsSending(false);
    }
  };

  const copySmsText = () => {
    if (previewData?.smsText) {
      navigator.clipboard.writeText(previewData.smsText);
      setCopiedSms(true);
      setTimeout(() => setCopiedSms(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              alertType === 'status_overdue' 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dispatch Tuition Notification</h3>
              <p className="text-xs text-slate-400">
                Send official Email and SMS alerts regarding upcoming deadlines or overdue tuition balances.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Info Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-white">{fee.student_name}</span>
            </div>
            <div className="text-slate-400">
              Program: <span className="text-slate-200">{fee.course_title}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-slate-400">
              Balance: <span className="font-mono font-bold text-amber-400">KES {Number(fee.balance_kes).toLocaleString()}</span>
            </div>
            <div className="text-slate-400">
              Deadline: <span className="font-mono text-slate-200">{fee.deadline_date || 'None'}</span>
            </div>
            <div className="text-slate-400">
              Access: <span className={`font-mono font-bold ${fee.portal_access_granted ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fee.portal_access_granted ? 'Active' : 'Locked'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form Settings */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Alert Type Selection */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
                Notification Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAlertType('deadline_approaching')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    alertType === 'deadline_approaching'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-sm shadow-emerald-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Deadline Approaching</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Friendly reminder of upcoming installment due date.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAlertType('status_overdue')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    alertType === 'status_overdue'
                      ? 'bg-rose-950/40 border-rose-500/50 text-white shadow-sm shadow-rose-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Status Overdue Notice</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Urgent notice regarding restricted access and settlement.
                  </p>
                </button>
              </div>
            </div>

            {/* Delivery Channel */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
                Delivery Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('both')}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                    channel === 'both'
                      ? 'bg-emerald-500 text-white border-emerald-500 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  SMS & Email
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                    channel === 'sms'
                      ? 'bg-emerald-500 text-white border-emerald-500 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  SMS Only
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                    channel === 'email'
                      ? 'bg-emerald-500 text-white border-emerald-500 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  Email Only
                </button>
              </div>
            </div>

            {/* Contact Endpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Recipient Email:</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Student Phone (SMS):</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Custom Subject (Optional) */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Custom Subject Line (Leave blank for default official subject):
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => {
                  setCustomSubject(e.target.value);
                }}
                onBlur={fetchPreview}
                placeholder="e.g. Code Point Kenya - Important Tuition Notice"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Custom Addendum / Note */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Custom Message Addendum (Optional):
              </label>
              <textarea
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                onBlur={fetchPreview}
                placeholder="Add special arrangements, custom payment extension notes, or bursary notes..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* M-Pesa Info Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 text-xs">
              <CreditCard className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-slate-300">
                <span className="font-semibold text-white">Automated M-Pesa Instructions:</span> Alerts automatically embed Paybill <strong className="text-emerald-400 font-mono">522522</strong>, Account <strong className="text-white font-mono">CPK-{(fee.student_name.split(' ')[0] || 'STU').toUpperCase()}</strong>, and amount due.
              </div>
            </div>
          </div>

          {/* Right Column: Live Message Preview */}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider">
                  Live Dispatch Preview
                </span>
              </div>

              {/* Preview Tab Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setPreviewTab('sms')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    previewTab === 'sms' 
                      ? 'bg-slate-800 text-emerald-300 font-semibold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SMS View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('email')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    previewTab === 'email' 
                      ? 'bg-slate-800 text-emerald-300 font-semibold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Email HTML
                </button>
              </div>
            </div>

            {/* Preview Canvas */}
            <div className="flex-1 min-h-[300px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col">
              {loadingPreview ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  <span className="text-xs">Generating message preview...</span>
                </div>
              ) : previewTab === 'sms' ? (
                /* SMS Simulator Phone Bubble */
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sender: <strong className="text-slate-200">CODEPOINT</strong></span>
                      </div>
                      <span>To: <strong className="font-mono text-slate-200">{phone}</strong></span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 text-xs leading-relaxed font-sans shadow-md">
                      {previewData?.smsText || 'No SMS generated'}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Length: {previewData?.smsText?.length || 0} characters (1 SMS segment)</span>
                      <button
                        type="button"
                        onClick={copySmsText}
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSms ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <span>Copy SMS Text</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Formatted for instant delivery across Safaricom, Airtel, and Telkom Kenya.</span>
                  </div>
                </div>
              ) : (
                /* Email Preview */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-slate-800 bg-slate-900 text-xs flex items-center justify-between text-slate-300">
                    <div className="truncate">
                      Subject: <strong className="text-white">{previewData?.subject}</strong>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">Sender: admissions@codepointkenya.com</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-slate-900/50">
                    <div 
                      className="text-xs scale-90 origin-top"
                      dangerouslySetInnerHTML={{ __html: previewData?.emailHtml || '' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchPreview}
              disabled={loadingPreview || isSending}
              className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPreview ? 'animate-spin' : ''}`} />
              <span>Refresh Preview</span>
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={isSending}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Alert...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Alert Now ({channel.toUpperCase()})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
