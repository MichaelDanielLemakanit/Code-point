import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  Save, 
  RefreshCw, 
  Bell, 
  Calendar, 
  Smartphone, 
  Mail, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle2, 
  PhoneCall 
} from 'lucide-react';
import { FeeNotificationSettings, FeeNotificationChannel } from '../../types';

interface FeeNotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const FeeNotificationSettingsModal: React.FC<FeeNotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [settings, setSettings] = useState<FeeNotificationSettings>({
    id: 'default',
    auto_deadline_alerts_enabled: true,
    deadline_days_threshold: 5,
    auto_overdue_alerts_enabled: true,
    preferred_channel: 'both',
    sms_sender_id: 'CODEPOINT',
    email_sender_name: 'Code Point Kenya Finance',
    paybill_number: '522522',
    whatsapp_finance_phone: '+254 756 295 128',
    updated_at: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/fee-notification-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch('/api/admin/fee-notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        const data = await res.json();
        if (onSuccess) onSuccess(data.message || 'Notification settings updated successfully.');
        onClose();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update notification settings');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Automated Notification Engine Configuration</h3>
              <p className="text-xs text-slate-400">
                Configure automated rule triggers, reminder schedules, M-Pesa gateway credentials, and sender IDs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs">Loading configuration...</span>
            </div>
          ) : (
            <>
              {/* Section 1: Automated Rule Triggers */}
              <div className="space-y-4">
                <div className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span>Rule Triggers & Automation Policies</span>
                </div>

                <div className="space-y-3">
                  {/* Deadline Approaching Toggle */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>Approaching Deadline Alerts</span>
                        {settings.auto_deadline_alerts_enabled && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Automatically dispatch reminder alerts before payment deadline expires.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.auto_deadline_alerts_enabled}
                        onChange={(e) => setSettings({ ...settings, auto_deadline_alerts_enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {/* Deadline Days Threshold */}
                  {settings.auto_deadline_alerts_enabled && (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-4 ml-2">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-slate-200">
                          Deadline Threshold Window
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Number of days before deadline to initiate reminder dispatches.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={settings.deadline_days_threshold}
                          onChange={(e) => setSettings({ ...settings, deadline_days_threshold: Number(e.target.value) || 1 })}
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center font-mono focus:border-emerald-500"
                        />
                        <span className="text-xs text-slate-400 font-mono">Days</span>
                      </div>
                    </div>
                  )}

                  {/* Overdue Alerts on Status Change */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>Automatic Overdue Notices</span>
                        {settings.auto_overdue_alerts_enabled && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Automatically trigger alert when status changes to 'Overdue' or student access is restricted.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.auto_overdue_alerts_enabled}
                        onChange={(e) => setSettings({ ...settings, auto_overdue_alerts_enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Channel Configuration */}
              <div className="space-y-4">
                <div className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Delivery Channels & Gateways</span>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2">Default Notification Channel:</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, preferred_channel: 'both' })}
                      className={`p-3 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                        settings.preferred_channel === 'both'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Both SMS & Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, preferred_channel: 'sms' })}
                      className={`p-3 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                        settings.preferred_channel === 'sms'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      SMS Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, preferred_channel: 'email' })}
                      className={`p-3 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                        settings.preferred_channel === 'email'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Email Only
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      SMS Sender ID:
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={settings.sms_sender_id}
                      onChange={(e) => setSettings({ ...settings, sms_sender_id: e.target.value.toUpperCase() })}
                      placeholder="CODEPOINT"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Max 11 alphanumeric characters</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Email Sender Display Name:
                    </label>
                    <input
                      type="text"
                      value={settings.email_sender_name}
                      onChange={(e) => setSettings({ ...settings, email_sender_name: e.target.value })}
                      placeholder="Code Point Kenya Finance"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Financial Reconciliation Details */}
              <div className="space-y-4">
                <div className="text-xs font-mono font-medium text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Payment Gateway & Desk Contacts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      M-Pesa Business Paybill No:
                    </label>
                    <input
                      type="text"
                      value={settings.paybill_number}
                      onChange={(e) => setSettings({ ...settings, paybill_number: e.target.value })}
                      placeholder="522522"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Finance WhatsApp Desk Phone:
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp_finance_phone}
                      onChange={(e) => setSettings({ ...settings, whatsapp_finance_phone: e.target.value })}
                      placeholder="+254 756 295 128"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notification Policy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
