import React, { useState, useEffect } from 'react';
import { 
  History, 
  X, 
  Search, 
  RefreshCw, 
  Mail, 
  Smartphone, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Filter, 
  User, 
  Calendar,
  Send,
  ShieldAlert,
  Download
} from 'lucide-react';
import { FeeNotification } from '../../types';

interface FeeNotificationLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeeNotificationLogsModal: React.FC<FeeNotificationLogsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [logs, setLogs] = useState<FeeNotification[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    emailCount: 0,
    smsCount: 0,
    deadlineCount: 0,
    overdueCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedNotif, setSelectedNotif] = useState<FeeNotification | null>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/fee-notifications');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.notifications || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notification logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.course_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || log.alert_type === typeFilter;
    const matchesChannel = channelFilter === 'all' || log.channel === channelFilter || (channelFilter !== 'all' && log.channel === 'both');

    return matchesSearch && matchesType && matchesChannel;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border bg-blue-500/10 border-blue-500/30 text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Fee Notification & Alert Audit History</h3>
              <p className="text-xs text-slate-400">
                Complete dispatch log of automated rules, overdue lockout notices, and SMS/Email reminders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase">Total Dispatched</span>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{summary.total}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-emerald-400" />
              <span>SMS Delivered</span>
            </span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{summary.smsCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase flex items-center gap-1">
              <Mail className="w-3 h-3 text-blue-400" />
              <span>Emails Sent</span>
            </span>
            <div className="text-lg font-bold font-mono text-blue-400 mt-0.5">{summary.emailCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Deadline Alerts</span>
            </span>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">{summary.deadlineCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono uppercase flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Overdue Notices</span>
            </span>
            <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">{summary.overdueCount}</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-950/20 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, email, phone or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <span className="text-[11px] text-slate-500 px-2">Type:</span>
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${typeFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('deadline_approaching')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${typeFilter === 'deadline_approaching' ? 'bg-amber-950 text-amber-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Deadlines
              </button>
              <button
                onClick={() => setTypeFilter('status_overdue')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${typeFilter === 'status_overdue' ? 'bg-rose-950 text-rose-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Overdue
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
              <span className="text-[11px] text-slate-500 px-2">Channel:</span>
              <button
                onClick={() => setChannelFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${channelFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                All
              </button>
              <button
                onClick={() => setChannelFilter('sms')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${channelFilter === 'sms' ? 'bg-emerald-950 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                SMS
              </button>
              <button
                onClick={() => setChannelFilter('email')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${channelFilter === 'email' ? 'bg-blue-950 text-blue-300 font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Email
              </button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              <span className="text-xs">Fetching notification logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <p className="text-sm">No notification records found matching your filters.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Student & Recipient</th>
                  <th className="py-3 px-4">Course & Balance</th>
                  <th className="py-3 px-4">Alert Type</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Triggered By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLogs.map((log) => {
                  const dateFormatted = new Date(log.created_at).toLocaleString('en-KE', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{log.student_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                          {log.recipient}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300 truncate max-w-[180px]">{log.course_title}</div>
                        <div className="font-mono font-semibold text-amber-400 text-[11px]">
                          KES {Number(log.balance_kes).toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.alert_type === 'status_overdue' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue Lockout
                          </span>
                        ) : log.alert_type === 'deadline_approaching' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            Deadline Reminder
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Custom Notice
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] uppercase font-bold text-slate-300 flex items-center gap-1">
                          {log.channel === 'both' ? (
                            <>
                              <Smartphone className="w-3 h-3 text-emerald-400" />
                              <Mail className="w-3 h-3 text-blue-400" />
                              <span>SMS & EMAIL</span>
                            </>
                          ) : log.channel === 'sms' ? (
                            <>
                              <Smartphone className="w-3 h-3 text-emerald-400" />
                              <span>SMS ONLY</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3 h-3 text-blue-400" />
                              <span>EMAIL ONLY</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {log.triggered_by === 'automated_rule' ? '⚡ Auto Cron' :
                           log.triggered_by === 'status_change' ? '🔄 Status Change' : '👤 Admin Manual'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedNotif(log)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Payload</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredLogs.length} of {logs.length} logged dispatches</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer transition-colors"
          >
            Close History
          </button>
        </div>
      </div>

      {/* View Payload Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Dispatched Message Payload</h4>
                <p className="text-xs text-slate-400">Recipient: {selectedNotif.recipient}</p>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Subject:</span>
                <div className="text-xs font-semibold text-white mt-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  {selectedNotif.subject}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Dispatched Body:</span>
                <div className="mt-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[350px] overflow-y-auto">
                  {selectedNotif.message_body}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
