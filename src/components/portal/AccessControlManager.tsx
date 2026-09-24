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
  Lock,
  CreditCard,
  Eye,
  EyeOff,
  Sparkles,
  Share2,
  Edit3
} from 'lucide-react';
import { LoginAttempt, UserRole, AccessStatus } from '../../types';
import { StudentFeeManager } from './StudentFeeManager';

interface AccessControlManagerProps {
  onRefreshStats?: () => void;
}

export const AccessControlManager: React.FC<AccessControlManagerProps> = ({ onRefreshStats }) => {
  const [subTab, setSubTab] = useState<'auth' | 'fees'>('auth');
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Credentials visibility & copying per row
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);
  const [copiedDetailsId, setCopiedDetailsId] = useState<string | null>(null);

  // Unified Credentials & Sharing Modal State
  const [credentialsModal, setCredentialsModal] = useState<{
    attemptId: string;
    email: string;
    name: string;
    role: string;
    password: string;
    portalUrl: string;
    formattedText: string;
    isSendingEmail?: boolean;
    emailSent?: boolean;
    copied?: boolean;
  } | null>(null);

  // Set / Edit Password Modal State
  const [passwordEditModal, setPasswordEditModal] = useState<{
    attemptId: string;
    email: string;
    name: string;
    currentPassword?: string;
    newPassword: string;
    isSubmitting?: boolean;
  } | null>(null);

  // Teacher Password Setup Modal State (legacy compatibility)
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
  const [newRole, setNewRole] = useState<'instructor' | 'student'>('student');
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

  const handleToggleRevealPassword = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleCopyPassword = (id: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedPasswordId(id);
    showNotification('Password copied to clipboard');
    setTimeout(() => setCopiedPasswordId(null), 2000);
  };

  const buildFormattedCredentials = (attempt: LoginAttempt, customPass?: string) => {
    const portalUrl = window.location.origin;
    const roleLabel = attempt.assigned_role === 'instructor' ? 'Teacher / Instructor' : 'Approved Student';
    const recipientName = attempt.full_name || attempt.email.split('@')[0];
    const pass = customPass || attempt.initial_password || 'CPK-Std-2026!';

    return [
      `🎓 Code Point Kenya - ${roleLabel} Portal Login Details`,
      `------------------------------------------------`,
      `Name: ${recipientName}`,
      `Portal Link: ${portalUrl}`,
      `Login Email: ${attempt.email}`,
      `Temporary Password: ${pass}`,
      `Assigned Role: ${roleLabel}`,
      `Status: Approved / Enrolled`,
      ``,
      `Instructions:`,
      `1. Open ${portalUrl} in your browser.`,
      `2. Click "Portal Login" and select ${roleLabel.includes('Teacher') ? 'Teacher' : 'Student'} mode.`,
      `3. Enter your email and temporary password to access your coursework and schedule.`
    ].join('\n');
  };

  // 1-Click Copy Login Details
  const handleCopyLoginDetails = (attempt: LoginAttempt) => {
    const formatted = buildFormattedCredentials(attempt);
    navigator.clipboard.writeText(formatted);
    setCopiedDetailsId(attempt.id);
    showNotification(`Login details for ${attempt.email} copied to clipboard!`);
    setTimeout(() => setCopiedDetailsId(null), 2500);
  };

  // Open Full Credentials Modal / Send via Email
  const handleOpenCredentialsModal = (attempt: LoginAttempt) => {
    const pass = attempt.initial_password || (attempt.assigned_role === 'instructor' ? 'Teacher2026!' : 'CPK-Std-2026!');
    const roleLabel = attempt.assigned_role === 'instructor' ? 'Teacher / Faculty' : 'Approved Student';
    const portalUrl = window.location.origin;
    const formatted = buildFormattedCredentials(attempt, pass);

    setCredentialsModal({
      attemptId: attempt.id,
      email: attempt.email,
      name: attempt.full_name || attempt.email.split('@')[0],
      role: roleLabel,
      password: pass,
      portalUrl,
      formattedText: formatted,
      emailSent: false,
      copied: false
    });
  };

  // Send credentials via email backend dispatch
  const handleSendCredentialsEmail = async (attemptId: string) => {
    try {
      if (credentialsModal) {
        setCredentialsModal(prev => prev ? { ...prev, isSendingEmail: true } : null);
      }
      const res = await fetch(`/api/admin/login-attempts/${attemptId}/send-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        showNotification(`Credentials successfully dispatched to ${data.recipient_email}`);
        if (credentialsModal) {
          setCredentialsModal(prev => prev ? { ...prev, emailSent: true, isSendingEmail: false } : null);
        }
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to dispatch email', 'error');
        if (credentialsModal) {
          setCredentialsModal(prev => prev ? { ...prev, isSendingEmail: false } : null);
        }
      }
    } catch (e: any) {
      showNotification(e.message || 'Error sending email', 'error');
      if (credentialsModal) {
        setCredentialsModal(prev => prev ? { ...prev, isSendingEmail: false } : null);
      }
    }
  };

  // Quick Reset Password
  const handleQuickResetPassword = async (attempt: LoginAttempt) => {
    try {
      setActionLoadingId(attempt.id);
      const res = await fetch(`/api/admin/login-attempts/${attempt.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setAttempts(prev => prev.map(a => a.id === attempt.id ? data.attempt : a));
        showNotification(`New temporary password generated: ${data.password}`);
        
        // Also open credentials modal so admin can copy or send right away
        handleOpenCredentialsModal(data.attempt);
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to reset password', 'error');
      }
    } catch (e: any) {
      showNotification(e.message || 'Error resetting password', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Save Custom Password
  const handleSaveCustomPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordEditModal) return;

    if (!passwordEditModal.newPassword || passwordEditModal.newPassword.trim().length < 4) {
      showNotification('Password must be at least 4 characters', 'error');
      return;
    }

    try {
      setPasswordEditModal(prev => prev ? { ...prev, isSubmitting: true } : null);
      const res = await fetch(`/api/admin/login-attempts/${passwordEditModal.attemptId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordEditModal.newPassword.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setAttempts(prev => prev.map(a => a.id === passwordEditModal.attemptId ? data.attempt : a));
        showNotification(`Password updated for ${passwordEditModal.email}`);
        const updatedAttempt = data.attempt;
        setPasswordEditModal(null);
        
        // Open credentials modal to allow instant copying or emailing
        handleOpenCredentialsModal(updatedAttempt);
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to update password', 'error');
      }
    } catch (e: any) {
      showNotification(e.message || 'Error updating password', 'error');
    }
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
        
        // If student approved, trigger credentials modal with generated password
        if (data.studentPasswordSetup) {
          handleOpenCredentialsModal(data.attempt);
        } else if (data.teacherPasswordSetup) {
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
      const res = await fetch(`/api/admin/login-attempts/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setAttempts(prev => prev.filter(a => a.id !== id && a.email.toLowerCase() !== email.toLowerCase()));
        showNotification(`Permanently deleted user and credentials for ${email}.`);
        setDeleteTarget(null);
        if (onRefreshStats) onRefreshStats();
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to delete user', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error deleting user', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      showNotification('Email address is required', 'error');
      return;
    }

    try {
      setSubmittingAuth(true);
      const res = await fetch('/api/admin/login-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          full_name: newFullName.trim() || undefined,
          assigned_role: newRole,
          status: 'approved',
          notes: newNotes.trim() || `Pre-authorized via Admin Console as ${newRole}`
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showNotification(`Pre-approved access for ${newEmail} as ${newRole === 'instructor' ? 'Teacher' : 'Student'}`);
        setIsAuthModalOpen(false);
        setNewEmail('');
        setNewFullName('');
        setNewNotes('');
        fetchAttempts();

        if (data.studentPasswordSetup) {
          handleOpenCredentialsModal(data.attempt);
        } else if (data.teacherPasswordSetup) {
          setTeacherPasswordModal(data.teacherPasswordSetup);
        }
        if (onRefreshStats) onRefreshStats();
      } else {
        showNotification(data?.error || 'Failed to authorize email', 'error');
      }
    } catch (err: any) {
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
      
      {/* Sub-navigation Switcher: User Auth vs Student Fees & Access Control */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          type="button"
          onClick={() => setSubTab('auth')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            subTab === 'auth'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <ShieldCheck className={`w-4 h-4 ${subTab === 'auth' ? 'text-amber-400' : 'text-slate-500'}`} />
          <span>User Authentication & Login Oversight</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('fees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            subTab === 'fees'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-850'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${subTab === 'fees' ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>Tuition & Fee Policy Enforcement</span>
        </button>
      </div>

      {subTab === 'fees' ? (
        <StudentFeeManager onRefreshStats={onRefreshStats} />
      ) : (
        <>
          {/* Notification Toast */}
          {notification && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
              notification.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          )}

          {/* Automatic Enrollment Sync Alert Header */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-100 flex items-center gap-2">
                  <span>Automated Enrollment & Credentials Sync Active</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-semibold">Live System</span>
                </p>
                <p className="text-slate-400 mt-0.5">
                  When a student is enrolled in the Admissions Inbox or Tuition Ledger, an active account is automatically created in Access Control with an auto-generated temporary password ready for instant copy or direct email dispatch.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pre-Authorize User</span>
            </button>
          </div>

          {/* Top Stat Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-medium">Total Tracked Users</span>
                <ShieldCheck className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-900">{totalCount}</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-amber-600 mb-1">
                <span className="text-xs font-medium">Pending Approvals</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 mb-1">
                <span className="text-xs font-medium">Approved Students</span>
                <GraduationCap className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-700">{approvedStudents}</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-indigo-600 mb-1">
                <span className="text-xs font-medium">Approved Faculty</span>
                <UserCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-indigo-700">{approvedTeachers}</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Status
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    statusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    statusFilter === 'approved' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Approved
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    statusFilter === 'rejected' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Rejected
                </button>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    roleFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Roles
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('student')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    roleFilter === 'student' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Students
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('instructor')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    roleFilter === 'instructor' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Teachers
                </button>
              </div>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by email, name, notes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ color: '#111827' }}
                  className="w-full pl-9 pr-4 py-2 text-xs text-gray-900 font-medium placeholder:text-gray-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
              <button
                type="button"
                onClick={fetchAttempts}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Refresh table"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </form>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading && attempts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                <span>Loading access control records...</span>
              </div>
            ) : attempts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No login attempts or access requests match criteria</p>
                <p className="text-slate-400 mt-1">Try clearing filters or pre-authorize a student / instructor email.</p>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Authorize An Email
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">User & Email</th>
                      <th className="py-3 px-4">Role & Sync Status</th>
                      <th className="py-3 px-4">Portal Temporary Password</th>
                      <th className="py-3 px-4">Status & Permissions</th>
                      <th className="py-3 px-4">Origin & Notes</th>
                      <th className="py-3 px-4 text-right">Credentials & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attempts.map(attempt => {
                      const isPending = attempt.status === 'pending';
                      const isApproved = attempt.status === 'approved';
                      const isRejected = attempt.status === 'rejected';
                      const isLoading = actionLoadingId === attempt.id;
                      const isStudent = attempt.assigned_role === 'student' || attempt.requested_role === 'student';
                      const isInstructor = attempt.assigned_role === 'instructor' || attempt.requested_role === 'instructor';
                      const effectivePassword = attempt.initial_password || (isInstructor ? 'Teacher2026!' : 'CPK-Std-2026!');
                      const isRevealed = !!revealedPasswords[attempt.id];
                      const isEnrolledAutoSynced = (attempt.notes && (attempt.notes.includes('Enrolled') || attempt.notes.includes('Admissions') || attempt.notes.includes('Tuition')));

                      return (
                        <tr key={attempt.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* User & Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-2.5">
                              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                                isInstructor
                                  ? 'bg-indigo-100 text-indigo-700' 
                                  : attempt.requested_role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {attempt.full_name ? attempt.full_name.charAt(0).toUpperCase() : attempt.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  <span>{attempt.full_name || 'Enrolled Student'}</span>
                                  {isEnrolledAutoSynced && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Auto-Synced
                                    </span>
                                  )}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-mono text-slate-600 select-all">{attempt.email}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(attempt.email)}
                                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
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

                          {/* Role & Sync Status */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                                isInstructor
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : attempt.requested_role === 'admin'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {isInstructor ? (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Teacher</span>
                                  </>
                                ) : (
                                  <>
                                    <GraduationCap className="w-3 h-3" />
                                    <span>Student</span>
                                  </>
                                )}
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {attempt.attempt_count} login {attempt.attempt_count === 1 ? 'attempt' : 'attempts'}
                              </div>
                            </div>
                          </td>

                          {/* Portal Temporary Password & Management */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1.5">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-medium text-slate-800 w-fit">
                                <Key className="w-3 h-3 text-amber-500 shrink-0" />
                                <span className="tracking-wide select-all font-bold">
                                  {isRevealed ? effectivePassword : '••••••••••••'}
                                </span>
                                
                                {/* Reveal / Hide */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleRevealPassword(attempt.id)}
                                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                                  title={isRevealed ? "Mask password" : "Show password"}
                                >
                                  {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>

                                {/* Quick Copy Password */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyPassword(attempt.id, effectivePassword)}
                                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                                  title="Copy password to clipboard"
                                >
                                  {copiedPasswordId === attempt.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>

                              {/* Password Management Controls: Reset or Edit */}
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => handleQuickResetPassword(attempt)}
                                  disabled={isLoading}
                                  className="text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                                  title="Auto-generate a new temporary password"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                  <span>Generate Fresh</span>
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  type="button"
                                  onClick={() => setPasswordEditModal({
                                    attemptId: attempt.id,
                                    email: attempt.email,
                                    name: attempt.full_name || attempt.email.split('@')[0],
                                    currentPassword: effectivePassword,
                                    newPassword: effectivePassword
                                  })}
                                  className="text-slate-500 hover:text-emerald-600 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                                  title="Set a custom password"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                  <span>Set Custom</span>
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Status & Permissions */}
                          <td className="py-3.5 px-4">
                            {isApproved ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Approved {attempt.assigned_role === 'instructor' ? 'Teacher' : 'Student'}</span>
                              </div>
                            ) : isPending ? (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>Pending Approval</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Access Rejected</span>
                              </div>
                            )}
                          </td>

                          {/* Origin & Notes */}
                          <td className="py-3.5 px-4 max-w-xs truncate text-slate-500">
                            <div className="truncate font-medium text-slate-700">
                              {attempt.notes || <span className="text-slate-400 italic">No notes recorded</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {attempt.reviewed_by ? `Reviewed by ${attempt.reviewed_by}` : 'Pending review'}
                            </div>
                          </td>

                          {/* Credentials Sharing & Admin Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              
                              {/* Primary Credentials Sharing Buttons (Always accessible) */}
                              <div className="flex items-center gap-1">
                                {/* Copy Login Details Button */}
                                <button
                                  type="button"
                                  onClick={() => handleCopyLoginDetails(attempt)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                                    copiedDetailsId === attempt.id
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                                  }`}
                                  title="Copy student login email, temporary password, and portal link"
                                >
                                  {copiedDetailsId === attempt.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-300" />
                                      <span>Details Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Login Details</span>
                                    </>
                                  )}
                                </button>

                                {/* Send Credentials via Email Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenCredentialsModal(attempt)}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                                  title="Preview credentials and send notification to student"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Send / Share</span>
                                </button>
                              </div>

                              {/* Access Role Approval Actions */}
                              <div className="flex items-center gap-1 mt-0.5">
                                {/* Grant Student Access */}
                                <button
                                  type="button"
                                  id={`btn-grant-student-${attempt.id}`}
                                  onClick={() => handleUpdateStatus(attempt.id, 'approved', 'student')}
                                  disabled={isLoading || (isApproved && attempt.assigned_role === 'student')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                    isApproved && attempt.assigned_role === 'student'
                                      ? 'bg-emerald-100 text-emerald-800 cursor-default opacity-80'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                  title="Approve as Student"
                                >
                                  <GraduationCap className="w-3 h-3" />
                                  <span>{isApproved && attempt.assigned_role === 'student' ? 'Student' : 'Grant Student'}</span>
                                </button>

                                {/* Grant Teacher Access */}
                                <button
                                  type="button"
                                  id={`btn-grant-teacher-${attempt.id}`}
                                  onClick={() => handleUpdateStatus(attempt.id, 'approved', 'instructor')}
                                  disabled={isLoading || (isApproved && attempt.assigned_role === 'instructor')}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                    isApproved && attempt.assigned_role === 'instructor'
                                      ? 'bg-indigo-100 text-indigo-700 cursor-default opacity-80'
                                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  }`}
                                  title="Approve as Teacher"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>{isApproved && attempt.assigned_role === 'instructor' ? 'Teacher' : 'Grant Teacher'}</span>
                                </button>

                                {/* Revoke / Set Pending */}
                                {isApproved && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(attempt.id, 'pending', null)}
                                    disabled={isLoading}
                                    className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[10px] font-medium transition-colors cursor-pointer"
                                    title="Revoke and set to Pending Approval"
                                  >
                                    Revoke
                                  </button>
                                )}

                                {/* Reject Access */}
                                {!isRejected && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(attempt.id, 'rejected', null)}
                                    disabled={isLoading}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                    title="Reject access"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Delete User Record */}
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget({ id: attempt.id, email: attempt.email, name: attempt.full_name })}
                                  disabled={isLoading}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Permanently delete user and record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal: Full Student / Teacher Credentials Preview & Dispatch */}
          {credentialsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Portal Credentials & Login Info</h3>
                      <p className="text-xs text-slate-500">Ready for instant sharing and student email notification</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCredentialsModal(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{credentialsModal.role} Account Active & Ready</span>
                    </div>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      The credentials below are fully registered in the live database. The student can immediately sign into the Student Portal using their email and temporary password.
                    </p>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">Student Name</span>
                      <span className="font-bold text-slate-900 truncate block mt-0.5">{credentialsModal.name}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-400 text-[10px] block uppercase font-semibold">Login Role</span>
                      <span className="font-bold text-emerald-700 block mt-0.5">{credentialsModal.role}</span>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Login Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 select-all">
                        {credentialsModal.email}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(credentialsModal.email)}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Copy Email
                      </button>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Temporary Portal Password
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 select-all tracking-wide">
                        {credentialsModal.password}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(credentialsModal.password);
                          setCredentialsModal(prev => prev ? { ...prev, copied: true } : null);
                          setTimeout(() => setCredentialsModal(prev => prev ? { ...prev, copied: false } : null), 2000);
                        }}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {credentialsModal.copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Pass</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Formatted Preview Box */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Formatted Text for WhatsApp / SMS / Email
                    </label>
                    <textarea
                      readOnly
                      rows={4}
                      value={credentialsModal.formattedText}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 select-all resize-none focus:outline-hidden"
                    />
                  </div>

                  {/* Dispatch Email Notification Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleSendCredentialsEmail(credentialsModal.attemptId)}
                      disabled={credentialsModal.isSendingEmail || credentialsModal.emailSent}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        credentialsModal.emailSent
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {credentialsModal.isSendingEmail ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching Credentials Email...</span>
                        </>
                      ) : credentialsModal.emailSent ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Credentials Email Dispatched to {credentialsModal.email}!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Credentials via Email ({credentialsModal.email})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <a
                    href={`mailto:${credentialsModal.email}?subject=Your Code Point Kenya Student Portal Access&body=${encodeURIComponent(credentialsModal.formattedText)}`}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Open in Email Client</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(credentialsModal.formattedText);
                      showNotification('All credentials details copied to clipboard!');
                      setCredentialsModal(null);
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy All & Done</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Set / Edit Custom Password */}
          {passwordEditModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Set / Reset Password</h3>
                      <p className="text-xs text-slate-500">Update portal credentials for {passwordEditModal.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasswordEditModal(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCustomPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student / User Email
                    </label>
                    <input
                      type="text"
                      disabled
                      value={passwordEditModal.email}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        New Temporary Password <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const rand = Math.floor(1000 + Math.random() * 9000);
                          setPasswordEditModal(prev => prev ? { ...prev, newPassword: `CPK-Std-${rand}!` } : null);
                        }}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Auto-Generate</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={passwordEditModal.newPassword}
                        onChange={e => setPasswordEditModal(prev => prev ? { ...prev, newPassword: e.target.value } : null)}
                        style={{ color: '#111827' }}
                        className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 font-mono font-bold bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      This password will immediately become active for portal authentication.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setPasswordEditModal(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordEditModal.isSubmitting}
                      className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {passwordEditModal.isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save & Activate Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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

          {/* Modal: Authorize New Email Address */}
          {isAuthModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Pre-Authorize Email Access</h3>
                      <p className="text-xs text-slate-500">Grant Student or Teacher portal permissions</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
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
                        placeholder="e.g. student.name@example.com"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        style={{ color: '#111827' }}
                        className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 font-medium placeholder:text-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
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
                        className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 font-medium placeholder:text-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
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
                        onClick={() => setNewRole('student')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newRole === 'student'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Student</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewRole('instructor')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newRole === 'instructor'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-600/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Teacher (Instructor)</span>
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
                        placeholder="e.g. Enrolled student for April intake"
                        value={newNotes}
                        onChange={e => setNewNotes(e.target.value)}
                        style={{ color: '#111827' }}
                        className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 font-medium placeholder:text-gray-400 bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAuth || !newEmail.trim()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
        </>
      )}
    </div>
  );
};
