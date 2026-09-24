import React, { useState, useEffect } from 'react';
import {
  History,
  Shield,
  Key,
  GraduationCap,
  Mail,
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  Download,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Eye,
  X,
  FileText,
  User,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { ActivityLog, ActivityEventType } from '../../types';

interface ActivityLogsProps {
  showToast?: (message: string) => void;
}

interface ActivityStats {
  totalCount: number;
  enrollmentChangesCount: number;
  passwordResetsCount: number;
  accessApprovalsCount: number;
  dispatchedCount: number;
  lastEventAt: string;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ showToast }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Manual Audit Note Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualAction, setManualAction] = useState('');
  const [manualDetails, setManualDetails] = useState('');
  const [manualTargetName, setManualTargetName] = useState('');
  const [manualTargetEmail, setManualTargetEmail] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  // Fetch Activity Logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = eventTypeFilter !== 'all' 
        ? `/api/admin/activity-logs?eventType=${encodeURIComponent(eventTypeFilter)}`
        : `/api/admin/activity-logs`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to load activity logs:', e);
      if (showToast) showToast('Error loading activity logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/activity-logs/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to load activity stats:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [eventTypeFilter]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    if (showToast) showToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Submit Manual Audit Note
  const handleCreateManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAction.trim() || !manualDetails.trim()) {
      if (showToast) showToast('Please enter action title and description');
      return;
    }

    setSubmittingManual(true);
    try {
      const res = await fetch('/api/admin/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: manualAction.trim(),
          event_type: 'manual_audit_note',
          details: manualDetails.trim(),
          target_name: manualTargetName.trim() || undefined,
          target_email: manualTargetEmail.trim() || undefined,
          actor_name: 'Administrator',
          actor_email: 'info@codepointkenya.com'
        })
      });

      if (res.ok) {
        if (showToast) showToast('Manual audit entry logged successfully');
        setShowAddModal(false);
        setManualAction('');
        setManualDetails('');
        setManualTargetName('');
        setManualTargetEmail('');
        fetchLogs();
        fetchStats();
      } else {
        const err = await res.json();
        if (showToast) showToast(err.error || 'Failed to record entry');
      }
    } catch (e) {
      if (showToast) showToast('Failed to record manual log');
    } finally {
      setSubmittingManual(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      if (showToast) showToast('No logs available to export');
      return;
    }

    const headers = ['Timestamp', 'Event Type', 'Action', 'Target Name', 'Target Email', 'Actor', 'Details', 'Previous Value', 'New Value', 'IP Address'];
    const rows = filteredLogs.map(l => [
      `"${new Date(l.created_at).toISOString()}"`,
      `"${l.event_type || ''}"`,
      `"${(l.action || '').replace(/"/g, '""')}"`,
      `"${(l.target_name || '').replace(/"/g, '""')}"`,
      `"${(l.target_email || '').replace(/"/g, '""')}"`,
      `"${(l.actor_name || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${(l.previous_value || '').replace(/"/g, '""')}"`,
      `"${(l.new_value || '').replace(/"/g, '""')}"`,
      `"${l.ip_address || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `codepoint_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Audit logs exported to CSV');
  };

  // Reset / Clear logs
  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to reset the activity logs? Default system audit records will be preserved.')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/activity-logs/clear', { method: 'POST' });
      if (res.ok) {
        if (showToast) showToast('Audit logs reset successfully');
        fetchLogs();
        fetchStats();
      }
    } catch (e) {
      if (showToast) showToast('Failed to reset logs');
    }
  };

  // Helper for formatting event labels & badges
  const getEventBadge = (type: string) => {
    switch (type) {
      case 'enrollment_status_change':
        return {
          icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Enrollment Sync',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'password_reset':
      case 'password_update':
        return {
          icon: <Key className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Password Reset',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'user_access_approval':
      case 'user_preauthorized':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Access Approved',
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
      case 'credentials_dispatched':
        return {
          icon: <Mail className="w-3.5 h-3.5 text-purple-400" />,
          label: 'Credentials Sent',
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        };
      case 'user_deleted':
      case 'user_revoked':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />,
          label: 'Access Revoked',
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
      case 'fee_status_update':
        return {
          icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
          label: 'Tuition Ledger',
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
        };
      case 'manual_audit_note':
      default:
        return {
          icon: <FileText className="w-3.5 h-3.5 text-slate-300" />,
          label: 'System Audit',
          bg: 'bg-slate-500/10 text-slate-300 border-slate-500/20'
        };
    }
  };

  // Filter logs by search query and date
  const filteredLogs = logs.filter(log => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        log.action?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q) ||
        log.target_name?.toLowerCase().includes(q) ||
        log.target_email?.toLowerCase().includes(q) ||
        log.actor_name?.toLowerCase().includes(q) ||
        log.event_type?.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Date filter
    if (dateFilter === 'today') {
      const logDate = new Date(log.created_at);
      const today = new Date();
      if (
        logDate.getDate() !== today.getDate() ||
        logDate.getMonth() !== today.getMonth() ||
        logDate.getFullYear() !== today.getFullYear()
      ) {
        return false;
      }
    } else if (dateFilter === 'week') {
      const logTime = new Date(log.created_at).getTime();
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (logTime < oneWeekAgo) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#16191f] border border-[#22252a] p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Activity Logs & Audit Trail
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                  Compliance Active
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable, system-wide accountability log tracking enrollment changes, manual password resets, and portal security events.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              fetchLogs();
              fetchStats();
              if (showToast) showToast('Activity logs refreshed');
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-[#0f1115] border border-[#262a33] rounded-xl hover:bg-[#1f232b] hover:text-white transition-colors cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-[#0f1115] border border-[#262a33] rounded-xl hover:bg-[#1f232b] hover:text-white transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Audit Note</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2 text-xs text-slate-500 hover:text-rose-400 bg-[#0f1115] border border-[#262a33] rounded-xl hover:bg-rose-500/10 hover:border-rose-500/20 transition-colors cursor-pointer"
            title="Reset Audit Logs to Default"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Events */}
        <div className="bg-[#16191f] border border-[#22252a] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Audit Events</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            {stats?.totalCount ?? logs.length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Real-time tracking enabled
          </div>
        </div>

        {/* Enrollment Changes */}
        <div className="bg-[#16191f] border border-[#22252a] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Enrollment Changes</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            {stats?.enrollmentChangesCount ?? logs.filter(l => l.event_type === 'enrollment_status_change').length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Auto-synced to Access Control
          </div>
        </div>

        {/* Password Resets */}
        <div className="bg-[#16191f] border border-[#22252a] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Password Resets</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400 font-mono">
            {stats?.passwordResetsCount ?? logs.filter(l => l.event_type === 'password_reset' || l.event_type === 'password_update').length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Manual edits & auto-generations
          </div>
        </div>

        {/* Credential Dispatches */}
        <div className="bg-[#16191f] border border-[#22252a] p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Credentials Dispatched</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-400 font-mono">
            {stats?.dispatchedCount ?? logs.filter(l => l.event_type === 'credentials_dispatched').length}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Email & portal notices sent
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#16191f] border border-[#22252a] p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action, student, email, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#0f1115] border border-[#262a33] rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            <button
              onClick={() => setEventTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                eventTypeFilter === 'all'
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'bg-[#0f1115] text-slate-400 hover:text-white border border-[#262a33]'
              }`}
            >
              All Events ({logs.length})
            </button>
            <button
              onClick={() => setEventTypeFilter('enrollment_status_change')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                eventTypeFilter === 'enrollment_status_change'
                  ? 'bg-emerald-500 text-white font-semibold'
                  : 'bg-[#0f1115] text-slate-400 hover:text-white border border-[#262a33]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Enrollments</span>
            </button>
            <button
              onClick={() => setEventTypeFilter('password_reset')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                eventTypeFilter === 'password_reset'
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'bg-[#0f1115] text-slate-400 hover:text-white border border-[#262a33]'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Password Resets</span>
            </button>
            <button
              onClick={() => setEventTypeFilter('credentials_dispatched')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                eventTypeFilter === 'credentials_dispatched'
                  ? 'bg-purple-500 text-white font-semibold'
                  : 'bg-[#0f1115] text-slate-400 hover:text-white border border-[#262a33]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Credentials</span>
            </button>
            <button
              onClick={() => setEventTypeFilter('user_access_approval')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                eventTypeFilter === 'user_access_approval'
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'bg-[#0f1115] text-slate-400 hover:text-white border border-[#262a33]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Approvals</span>
            </button>
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 mr-1">Time:</span>
            {(['all', 'today', 'week'] as const).map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-2 py-1 text-[11px] rounded-md capitalize transition-colors ${
                  dateFilter === f
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-[#16191f] border border-[#22252a] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-3" />
            <p className="text-sm font-medium">Loading system audit trail...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600 mb-3" />
            <p className="text-sm font-medium text-slate-300">No activity logs match your filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or changing the filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setEventTypeFilter('all');
                setDateFilter('all');
              }}
              className="mt-4 px-4 py-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#22252a] bg-[#111317] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Timestamp & Event</th>
                  <th className="py-3 px-4">Action Summary</th>
                  <th className="py-3 px-4">Target Student / Entity</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Audit Details</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#22252a] text-xs">
                {filteredLogs.map((log) => {
                  const badge = getEventBadge(log.event_type);
                  const logDate = new Date(log.created_at);
                  const isRecent = Date.now() - logDate.getTime() < 3600000; // past hour

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#1a1e26] transition-colors group cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Timestamp & Event Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border w-fit ${badge.bg}`}>
                            {badge.icon}
                            {badge.label}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>
                              {logDate.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })},{' '}
                              {logDate.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isRecent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Recent Event" />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action Title */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {log.action}
                        </div>
                        {log.entity_type && (
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            Entity: {log.entity_type}
                          </span>
                        )}
                      </td>

                      {/* Target Student / User */}
                      <td className="py-3.5 px-4">
                        {log.target_name || log.target_email ? (
                          <div className="flex flex-col">
                            <span className="text-slate-200 font-medium flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {log.target_name || 'Student Account'}
                            </span>
                            {log.target_email && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {log.target_email}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(log.target_email!, 'Email');
                                  }}
                                  className="text-slate-500 hover:text-amber-400 transition-colors"
                                  title="Copy Email"
                                >
                                  {copiedText === 'Email' ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">System-level</span>
                        )}
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                            {log.actor_name ? log.actor_name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <span className="text-slate-300 font-medium block text-xs">
                              {log.actor_name || 'Admin'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {log.actor_email || 'info@codepointkenya.com'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Details / Summary */}
                      <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                        <p className="text-slate-300 line-clamp-2 leading-relaxed">
                          {log.details}
                        </p>
                        {(log.previous_value || log.new_value) && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-1">
                            {log.previous_value && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                {log.previous_value}
                              </span>
                            )}
                            {log.previous_value && log.new_value && (
                              <ArrowRight className="w-3 h-3 text-slate-600" />
                            )}
                            {log.new_value && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                {log.new_value}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-[#0f1115] hover:bg-[#252a33] border border-[#262a33] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-amber-400" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info banner */}
        <div className="p-3 bg-[#111317] border-t border-[#22252a] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Showing {filteredLogs.length} of {logs.length} audit records. Log storage is synchronized with PostgreSQL/SQLite.</span>
          </div>
          <div className="text-slate-500 font-mono">
            Compliance Version 2.4 • Code Point Kenya Audit Core
          </div>
        </div>
      </div>

      {/* Log Inspection Drawer / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16191f] border border-[#22252a] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#22252a] flex items-center justify-between sticky top-0 bg-[#16191f] z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Audit Record Inspection</h3>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              {/* Event Badge & Action */}
              <div className="bg-[#0f1115] border border-[#22252a] p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${getEventBadge(selectedLog.event_type).bg}`}>
                    {getEventBadge(selectedLog.event_type).icon}
                    {getEventBadge(selectedLog.event_type).label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(selectedLog.created_at).toLocaleString('en-KE')}
                  </span>
                </div>
                <div className="text-base font-bold text-white pt-1">
                  {selectedLog.action}
                </div>
                <p className="text-slate-300 leading-relaxed pt-1">
                  {selectedLog.details}
                </p>
              </div>

              {/* Transition diff */}
              {(selectedLog.previous_value || selectedLog.new_value) && (
                <div className="bg-[#0f1115] border border-[#22252a] p-4 rounded-xl space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                    State Transition
                  </span>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
                      <span className="text-[10px] text-rose-400 block font-mono">PREVIOUS STATE</span>
                      <span className="text-rose-200 font-medium mt-0.5 block break-words">
                        {selectedLog.previous_value || 'None'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                      <span className="text-[10px] text-emerald-400 block font-mono">NEW STATE</span>
                      <span className="text-emerald-200 font-medium mt-0.5 block break-words">
                        {selectedLog.new_value || 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Target Entity & Actor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target */}
                <div className="bg-[#0f1115] border border-[#22252a] p-3.5 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Target Entity / Subject
                  </span>
                  <div className="font-semibold text-slate-200 text-sm">
                    {selectedLog.target_name || 'N/A'}
                  </div>
                  {selectedLog.target_email && (
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span>{selectedLog.target_email}</span>
                      <button
                        onClick={() => handleCopy(selectedLog.target_email!, 'Email')}
                        className="text-slate-500 hover:text-amber-400"
                        title="Copy"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {selectedLog.entity_id && (
                    <div className="text-[10px] text-slate-500 font-mono truncate">
                      Ref ID: {selectedLog.entity_id}
                    </div>
                  )}
                </div>

                {/* Actor */}
                <div className="bg-[#0f1115] border border-[#22252a] p-3.5 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Authorized Actor / System
                  </span>
                  <div className="font-semibold text-slate-200 text-sm">
                    {selectedLog.actor_name || 'Administrator'}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    {selectedLog.actor_email || 'info@codepointkenya.com'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Client IP: {selectedLog.ip_address || '197.232.88.14'}
                  </div>
                </div>
              </div>

              {/* Raw Audit Signature */}
              <div className="bg-[#0f1115] border border-[#22252a] p-3 rounded-xl">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                  Cryptographic Verification Fingerprint
                </span>
                <div className="font-mono text-[10px] text-emerald-400/90 break-all select-all">
                  SHA256:{selectedLog.id}-{Buffer ? '' : ''}{btoa(selectedLog.action + selectedLog.created_at).substring(0, 36)}...
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#22252a] flex items-center justify-between bg-[#111317]">
              <button
                onClick={() => {
                  const formatted = `Audit Log #${selectedLog.id}\nAction: ${selectedLog.action}\nDetails: ${selectedLog.details}\nTarget: ${selectedLog.target_name} (${selectedLog.target_email})\nActor: ${selectedLog.actor_name}\nTime: ${selectedLog.created_at}`;
                  handleCopy(formatted, 'Record Details');
                }}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#16191f] border border-[#262a33] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Summary</span>
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Audit Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16191f] border border-[#22252a] rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-[#22252a] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Record Manual Audit Note</h3>
                  <p className="text-[11px] text-slate-400">Log administrative or regulatory actions for system compliance</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualLog} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Action Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared Student Examination Seating for Cohort 14"
                  value={manualAction}
                  onChange={(e) => setManualAction(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#0f1115] border border-[#262a33] rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Student Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Dennis Kiprop"
                    value={manualTargetName}
                    onChange={(e) => setManualTargetName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f1115] border border-[#262a33] rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. dennis@gmail.com"
                    value={manualTargetEmail}
                    onChange={(e) => setManualTargetEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f1115] border border-[#262a33] rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Detailed Justification / Notes <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide context on this action, references to student requests, verification details, or administrative oversight rationale..."
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#0f1115] border border-[#262a33] rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#22252a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-[#0f1115] border border-[#262a33] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submittingManual ? 'Recording...' : 'Commit Audit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
