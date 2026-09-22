import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  UserX,
  Filter,
  Mail,
  User,
  FileText,
  Key,
  ExternalLink,
  Send,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { LoginAttempt, UserRole, AccessStatus } from '../../types';

interface AccessControlManagerProps {
  onRefreshStats?: () => void;
}

export const AccessControlManager: React.FC<AccessControlManagerProps> = ({ onRefreshStats }) => {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Teacher Password Setup Modal State
  const [teacherPasswordModal, setTeacherPasswordModal] = useState<{
    email: string;
    name: string;
    initialPassword: string;
    setupToken?: string;
    setupLink?: string;
    copiedPassword?: boolean;
    copiedLink?: boolean;
    emailSent?: boolean;
  } | null>(null);

  // Delete User Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string; name?: string | null } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Manual Pre-authorization modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'instructor' | 'student'>('instructor');
  const [newNotes, setNewNotes] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/login-attempts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAttempts(data);
      }
    } catch (err) {
      console.error('Failed to fetch login attempts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [statusFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttempts();
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateStatus = async (
    id: string, 
    newStatus: AccessStatus, 
    assignedRole?: UserRole | null
  ) => {
    try {
      setActionLoadingId(id);
      const res = await fetch(`/api/admin/login-attempts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assigned_role: assignedRole
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAttempts(prev => prev.map(a => a.id === id ? data.attempt : a));
        const roleLabel = assignedRole === 'instructor' ? 'Teacher' : assignedRole === 'student' ? 'Student' : '';
        showNotification(`Successfully updated status to "${newStatus}"${roleLabel ? ` as ${roleLabel}` : ''}.`);
        
        // If teacher approved, trigger initial password setup modal
        if (data.teacherPasswordSetup) {
          setTeacherPasswordModal(data.teacherPasswordSetup);
        }

        if (onRefreshStats) onRefreshStats();
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to update access status', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error updating access status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;
    const { id, email } = deleteTarget;
    try {
      setIsDeleting(true);
      setActionLoadingId(id);
      const res = await fetch(`/api/admin/login-attempts/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAttempts(prev => prev.filter(a => a.id !== id && a.email.toLowerCase() !== email.toLowerCase()));
        showNotification(`Successfully deleted user record and login logs for ${email}`);
        if (onRefreshStats) onRefreshStats();
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to delete record', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete record', 'error');
    } finally {
      setIsDeleting(false);
      setActionLoadingId(null);
      setDeleteTarget(null);
    }
  };

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCreateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setSubmittingAuth(true);
      console.log('[AccessControl] Submitting email pre-authorization:', { email: newEmail.trim().toLowerCase(), role: newRole, full_name: newFullName });
      const res = await fetch('/api/admin/login-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          full_name: newFullName.trim() || undefined,
          role: newRole,
          status: 'approved',
          notes: newNotes.trim() || `Authorized manually by Admin for ${newRole === 'instructor' ? 'Teacher' : 'Student'} access`
        })
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('[AccessControl] Response was not valid JSON:', jsonErr);
        throw new Error(`Server returned status ${res.status} (${res.statusText})`);
      }

      if (res.ok && data.success) {
        console.log('[AccessControl] Successfully authorized email:', data);
        showNotification(`Pre-approved access for ${newEmail} as ${newRole === 'instructor' ? 'Teacher' : 'Student'}`);
        setIsAuthModalOpen(false);
        setNewEmail('');
        setNewFullName('');
        setNewNotes('');
        fetchAttempts();

        if (data.teacherPasswordSetup) {
          setTeacherPasswordModal(data.teacherPasswordSetup);
        }
        if (onRefreshStats) onRefreshStats();
      } else {
        console.error('[AccessControl] Authorization failed:', data);
        showNotification(data?.error || 'Failed to authorize email', 'error');
      }
    } catch (err: any) {
      console.error('[AccessControl] Authorization exception:', err);
      showNotification(err.message || 'Error authorizing email', 'error');
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Metrics
  const totalCount = attempts.length;
  const pendingCount = attempts.filter(a => a.status === 'pending').length;
  const approvedTeachers = attempts.filter(a => a.status === 'approved' && a.assigned_role === 'instructor').length;
  const approvedStudents = attempts.filter(a => a.status === 'approved' && a.assigned_role === 'student').length;

  return (
    <div id="access-control-manager" className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div 
          id="access-control-toast" 
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div id="metric-total-attempts" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Attempts</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalCount}</p>
          <span className="text-xs text-slate-500 mt-0.5 block">Logged in system</span>
        </div>

        <div id="metric-pending-approval" className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Review</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-2">{pendingCount}</p>
          <span className="text-xs text-amber-700/80 mt-0.5 block">Awaiting administrator</span>
        </div>

        <div id="metric-approved-teachers" className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Approved Teachers</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-900 mt-2">{approvedTeachers}</p>
          <span className="text-xs text-indigo-700/80 mt-0.5 block">Faculty staff access</span>
        </div>

        <div id="metric-approved-students" className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Approved Students</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-2">{approvedStudents}</p>
          <span className="text-xs text-emerald-700/80 mt-0.5 block">Verified enrollments</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, Add Pre-authorization */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-access-search"
              type="text"
              placeholder="Search by email, applicant name, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
            />
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter by approval status"
              className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              id="select-role-filter"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              aria-label="Filter by requested role"
              className="text-xs font-medium py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="instructor">Teacher (Instructor)</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="btn-refresh-access-logs"
            onClick={fetchAttempts}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Refresh login attempts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            id="btn-open-authorize-modal"
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Authorize Email</span>
          </button>
        </div>
      </div>

      {/* Attempts Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Portal Login Attempts & Access Control Log</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review real-time email login attempts and assign verified Teacher or Student dashboard access.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
            {attempts.length} {attempts.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading access control records...</p>
          </div>
        ) : attempts.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No login attempts match your criteria</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Login attempts from the portal form will appear here in real-time. You can also manually pre-authorize an email address.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Authorize An Email
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User & Email Address</th>
                  <th className="py-3 px-4">Requested Role</th>
                  <th className="py-3 px-4">Status & Permissions</th>
                  <th className="py-3 px-4">Attempts & Activity</th>
                  <th className="py-3 px-4">Notes / Background</th>
                  <th className="py-3 px-4 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map(attempt => {
                  const isPending = attempt.status === 'pending';
                  const isApproved = attempt.status === 'approved';
                  const isRejected = attempt.status === 'rejected';
                  const isLoading = actionLoadingId === attempt.id;

                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Email & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                            attempt.requested_role === 'instructor' 
                              ? 'bg-indigo-100 text-indigo-700' 
                              : attempt.requested_role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {attempt.full_name ? attempt.full_name.charAt(0).toUpperCase() : attempt.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {attempt.full_name || 'Unregistered User'}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-slate-600 select-all">{attempt.email}</span>
                              <button
                                onClick={() => handleCopy(attempt.email)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                                title="Copy email address"
                              >
                                {copiedEmail === attempt.email ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Requested Role */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                          attempt.requested_role === 'instructor'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : attempt.requested_role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {attempt.requested_role === 'instructor' ? 'Teacher' : attempt.requested_role}
                        </span>
                      </td>

                      {/* Status & Permissions */}
                      <td className="py-3.5 px-4">
                        {isApproved ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved: {attempt.assigned_role === 'instructor' ? 'Teacher' : attempt.assigned_role === 'student' ? 'Student' : 'Admin'}</span>
                          </div>
                        ) : isPending ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>Pending Admin Approval</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Access Rejected</span>
                          </div>
                        )}
                      </td>

                      {/* Attempts & Activity */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-600">
                          <span className="font-semibold text-slate-800">{attempt.attempt_count}</span> {attempt.attempt_count === 1 ? 'attempt' : 'attempts'}
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(attempt.last_attempt_at).toLocaleString('en-KE', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Notes / Background */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                        {attempt.notes || (
                          <span className="text-slate-400 italic">No notes recorded</span>
                        )}
                        {attempt.reviewed_by && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Reviewed by {attempt.reviewed_by}
                          </div>
                        )}
                      </td>

                      {/* Access Controls */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Grant Teacher Access */}
                          <button
                            id={`btn-grant-teacher-${attempt.id}`}
                            onClick={() => handleUpdateStatus(attempt.id, 'approved', 'instructor')}
                            disabled={isLoading || (isApproved && attempt.assigned_role === 'instructor')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              isApproved && attempt.assigned_role === 'instructor'
                                ? 'bg-indigo-100 text-indigo-700 cursor-default opacity-80'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            }`}
                            title="Grant Teacher (Instructor) access to this email"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>{isApproved && attempt.assigned_role === 'instructor' ? 'Teacher' : 'Grant Teacher'}</span>
                          </button>

                          {/* Grant Student Access */}
                          <button
                            id={`btn-grant-student-${attempt.id}`}
                            onClick={() => handleUpdateStatus(attempt.id, 'approved', 'student')}
                            disabled={isLoading || (isApproved && attempt.assigned_role === 'student')}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              isApproved && attempt.assigned_role === 'student'
                                ? 'bg-emerald-100 text-emerald-800 cursor-default opacity-80'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                            title="Grant Student access to this email"
                          >
                            <GraduationCap className="w-3 h-3" />
                            <span>{isApproved && attempt.assigned_role === 'student' ? 'Student' : 'Grant Student'}</span>
                          </button>

                          {/* Reset to Pending / Revoke */}
                          {isApproved && (
                            <button
                              id={`btn-set-pending-${attempt.id}`}
                              onClick={() => handleUpdateStatus(attempt.id, 'pending', null)}
                              disabled={isLoading}
                              className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[11px] font-medium transition-colors"
                              title="Revoke and set to Pending Approval"
                            >
                              Revoke
                            </button>
                          )}

                          {/* Reject Access */}
                          {!isRejected && (
                            <button
                              id={`btn-reject-${attempt.id}`}
                              onClick={() => handleUpdateStatus(attempt.id, 'rejected', null)}
                              disabled={isLoading}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Reject access"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete User & Record */}
                          <button
                            id={`btn-delete-${attempt.id}`}
                            onClick={() => setDeleteTarget({ id: attempt.id, email: attempt.email, name: attempt.full_name })}
                            disabled={isLoading}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Permanently delete user and login record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* If approved teacher with initial password, show quick view credentials button */}
                        {isApproved && attempt.assigned_role === 'instructor' && attempt.initial_password && (
                          <div className="mt-1.5 flex justify-end">
                            <button
                              onClick={() => setTeacherPasswordModal({
                                email: attempt.email,
                                name: attempt.full_name || attempt.email.split('@')[0],
                                initialPassword: attempt.initial_password!,
                                setupToken: attempt.setup_token || undefined,
                                setupLink: `${window.location.origin}/?setup_token=${attempt.setup_token || ''}&email=${encodeURIComponent(attempt.email)}`
                              })}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors"
                              title="View assigned initial password and setup link"
                            >
                              <Key className="w-2.5 h-2.5" />
                              <span>Pass: {attempt.initial_password}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Confirm Permanent Delete of User */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete User & Access Record?</h3>
                <p className="text-xs text-slate-500">Permanent database removal</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Target User:</span>{' '}
                <span className="font-mono text-slate-900 font-bold">{deleteTarget.email}</span>
                {deleteTarget.name && <span className="text-slate-500"> ({deleteTarget.name})</span>}
              </div>
              <p className="text-slate-500 leading-relaxed">
                This action will permanently delete the login attempt history, remove the user record from the database, and immediately revoke their dashboard access.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User & Records</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Teacher Password Setup & Credentials Generated */}
      {teacherPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Teacher Password Setup</h3>
                  <p className="text-xs text-slate-500">Credentials & password setup link dispatched</p>
                </div>
              </div>
              <button
                onClick={() => setTeacherPasswordModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <div className="font-semibold text-indigo-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Teacher Access Approved for {teacherPasswordModal.name || teacherPasswordModal.email}</span>
                </div>
                <p className="text-indigo-800/90 text-[11px] leading-relaxed">
                  An initial password has been assigned. When the teacher logs in, they will be required to update it to their permanent private password.
                </p>
              </div>

              {/* Initial Password Field */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Assigned Initial Password
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 select-all">
                    {teacherPasswordModal.initialPassword}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(teacherPasswordModal.initialPassword);
                      setTeacherPasswordModal(prev => prev ? { ...prev, copiedPassword: true } : null);
                      setTimeout(() => setTeacherPasswordModal(prev => prev ? { ...prev, copiedPassword: false } : null), 2000);
                    }}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {teacherPasswordModal.copiedPassword ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Setup Link Field */}
              {teacherPasswordModal.setupLink && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Password Setup Email Link
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-600 truncate select-all">
                      {teacherPasswordModal.setupLink}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(teacherPasswordModal.setupLink || '');
                        setTeacherPasswordModal(prev => prev ? { ...prev, copiedLink: true } : null);
                        setTimeout(() => setTeacherPasswordModal(prev => prev ? { ...prev, copiedLink: false } : null), 2000);
                      }}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      {teacherPasswordModal.copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Send Email Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTeacherPasswordModal(prev => prev ? { ...prev, emailSent: true } : null);
                    showNotification(`Password-setup link and credentials dispatched to ${teacherPasswordModal.email}`);
                  }}
                  disabled={teacherPasswordModal.emailSent}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    teacherPasswordModal.emailSent
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {teacherPasswordModal.emailSent ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Password-Setup Email Dispatched to {teacherPasswordModal.email}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Dispatch Password-Setup Email to Teacher ({teacherPasswordModal.email})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTeacherPasswordModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Authorize New Email Address */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pre-Authorize Email Access</h3>
                  <p className="text-xs text-slate-500">Grant Teacher or Student dashboard permissions</p>
                </div>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAuth} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. instructor.name@codepointkenya.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    style={{ color: '#111827' }}
                    className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 font-medium placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Title (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Brenda Wambui"
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    style={{ color: '#111827' }}
                    className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 font-medium placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('instructor')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      newRole === 'instructor'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Teacher (Instructor)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRole('student')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      newRole === 'student'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Notes
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={2}
                    placeholder="e.g. Lead instructor for Full Stack Web track"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    style={{ color: '#111827' }}
                    className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 font-medium placeholder:text-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAuth || !newEmail.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {submittingAuth ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Authorize Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
