import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  RefreshCw, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Unlock, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  Download, 
  Check, 
  X, 
  Filter, 
  DollarSign, 
  UserCheck, 
  UserX,
  ShieldAlert,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';
import { StudentFeeAccount, FeePaymentStatus } from '../../types';

interface StudentFeeManagerProps {
  onRefreshStats?: () => void;
  showToast?: (msg: string) => void;
}

interface FeeSummary {
  totalStudents: number;
  totalBilledKes: number;
  totalPaidKes: number;
  totalBalanceKes: number;
  clearedCount: number;
  pendingCount: number;
  overdueCount: number;
}

export const StudentFeeManager: React.FC<StudentFeeManagerProps> = ({ 
  onRefreshStats,
  showToast 
}) => {
  const [fees, setFees] = useState<StudentFeeAccount[]>([]);
  const [summary, setSummary] = useState<FeeSummary>({
    totalStudents: 0,
    totalBilledKes: 0,
    totalPaidKes: 0,
    totalBalanceKes: 0,
    clearedCount: 0,
    pendingCount: 0,
    overdueCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit / Create Modal State
  const [editingAccount, setEditingAccount] = useState<Partial<StudentFeeAccount> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<StudentFeeAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/student-fees?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFees(data.fees || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to fetch student fees:', err);
      showNotification('Failed to load student fees ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    if (showToast) showToast(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFees();
  };

  // Quick 1-click access toggle
  const handleToggleAccess = async (fee: StudentFeeAccount) => {
    try {
      setActionLoadingId(fee.id);
      const isCurrentlyGranted = fee.portal_access_granted === 1 || fee.portal_access_granted === true;
      const targetAccess = isCurrentlyGranted ? 0 : 1;

      // If we are granting access and status was overdue, offer to keep pending or cleared
      const targetStatus: FeePaymentStatus = targetAccess === 0 
        ? 'overdue' 
        : (fee.balance_kes <= 0 ? 'cleared' : 'pending');

      const res = await fetch(`/api/admin/student-fees/${fee.id}/toggle-access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal_access_granted: targetAccess,
          payment_status: targetStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        setFees(prev => prev.map(f => f.id === fee.id ? { 
          ...f, 
          portal_access_granted: targetAccess,
          payment_status: targetStatus 
        } : f));
        showNotification(
          targetAccess === 1 
            ? `Online & Live Class Access GRANTED to ${fee.student_name}.` 
            : `Access RESTRICTED / LOCKED OUT for ${fee.student_name}.`,
          'success'
        );
        fetchFees();
        if (onRefreshStats) onRefreshStats();
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to toggle access', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error updating access', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingAccount({
      id: '',
      student_name: '',
      student_email: '',
      course_id: 'course-software-engineering',
      course_title: 'Full-Stack Software Engineering',
      cohort: 'Cohort 14 (Evening & Hybrid)',
      total_fee_kes: 85000,
      paid_fee_kes: 37000,
      balance_kes: 48000,
      payment_status: 'pending',
      deadline_date: 'April 30, 2026',
      portal_access_granted: 1,
      installment_plan: '5-Month Flexible Installments',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (account: StudentFeeAccount) => {
    setEditingAccount({
      ...account,
      total_fee_kes: Number(account.total_fee_kes),
      paid_fee_kes: Number(account.paid_fee_kes),
      balance_kes: Number(account.balance_kes),
      portal_access_granted: (account.portal_access_granted === 1 || account.portal_access_granted === true || account.portal_access_granted === '1') ? 1 : 0
    });
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount?.student_email || !editingAccount?.student_name) {
      showNotification('Student Name and Email are required', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const total = Number(editingAccount.total_fee_kes) || 0;
      const paid = Number(editingAccount.paid_fee_kes) || 0;
      const balance = Math.max(0, total - paid);

      const payload = {
        ...editingAccount,
        total_fee_kes: total,
        paid_fee_kes: paid,
        balance_kes: balance
      };

      const res = await fetch('/api/admin/student-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showNotification(`Student fee account for ${editingAccount.student_name} successfully saved.`);
        setIsModalOpen(false);
        setEditingAccount(null);
        fetchFees();
        if (onRefreshStats) onRefreshStats();
      } else {
        const data = await res.json();
        showNotification(data.error || 'Failed to save account', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error saving fee record', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/student-fees/${deleteTarget.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showNotification(`Fee record for ${deleteTarget.student_name} deleted.`);
        setDeleteTarget(null);
        fetchFees();
      } else {
        const err = await res.json();
        showNotification(err.error || 'Failed to delete record', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error deleting record', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter list by access filter in UI
  const filteredFees = fees.filter(f => {
    if (accessFilter === 'all') return true;
    const isGranted = f.portal_access_granted === 1 || f.portal_access_granted === true;
    if (accessFilter === 'granted') return isGranted;
    if (accessFilter === 'denied') return !isGranted;
    return true;
  });

  const collectionPercent = summary.totalBilledKes > 0 
    ? Math.round((summary.totalPaidKes / summary.totalBilledKes) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between border transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-500/40 text-rose-200'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Finance & Admissions Oversight</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Student Tuition & Access Restriction Control</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Manage total program fees, payments to date, auto-calculated balances, and real-time live lecture / portal lockouts. Students with overdue balances or revoked access are immediately barred from joining online class calls and lab sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFees}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Student Fee Record</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Tuition Billed</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            KES {summary.totalBilledKes.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="font-mono font-medium text-slate-300">{summary.totalStudents}</span>
            <span>enrolled students tracked</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Collected to Date</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            KES {summary.totalPaidKes.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, collectionPercent)}%` }}
              />
            </div>
            <span className="font-mono text-emerald-400 font-bold">{collectionPercent}%</span>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Outstanding Balance</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            KES {summary.totalBalanceKes.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {summary.pendingCount + summary.overdueCount} student accounts
          </div>
        </div>

        {/* Overdue / Locked Out */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Overdue / Locked Out</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {summary.overdueCount}
          </div>
          <div className="text-[11px] text-rose-300 flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3 text-rose-400" />
            <span>Portal access automatically restricted</span>
          </div>
        </div>
      </div>

      {/* Filters, Search & Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 flex items-center relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5" />
          <input
            type="text"
            placeholder="Search student, email, program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </form>

        {/* Status and Access Dropdowns */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Payment Statuses</option>
              <option value="cleared">Cleared / Up to Date ({summary.clearedCount})</option>
              <option value="pending">Payment Pending ({summary.pendingCount})</option>
              <option value="overdue">Overdue / Locked Out ({summary.overdueCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Access:</span>
            <select
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Portal Access</option>
              <option value="granted">Granted (Active)</option>
              <option value="denied">Denied / Restricted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Fees Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student & Program</th>
                <th className="py-3.5 px-4 text-right">Total Fee</th>
                <th className="py-3.5 px-4 text-right">Paid to Date</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4">Payment Deadline</th>
                <th className="py-3.5 px-4 text-center">Online & Live Class Access</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
                    Loading student fee accounts...
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No student fee accounts matched the current filters.
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const total = Number(fee.total_fee_kes);
                  const paid = Number(fee.paid_fee_kes);
                  const balance = Number(fee.balance_kes);
                  const paidRatio = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
                  const isAccessGranted = fee.portal_access_granted === 1 || fee.portal_access_granted === true;
                  const isOverdue = fee.payment_status === 'overdue' || !isAccessGranted;

                  return (
                    <tr 
                      key={fee.id} 
                      className={`hover:bg-slate-900/50 transition-colors ${
                        isOverdue ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      {/* Student Info */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white text-sm">{fee.student_name}</div>
                        <div className="text-slate-400 font-mono text-[11px] mt-0.5">{fee.student_email}</div>
                        <div className="text-[11px] text-emerald-400/90 mt-1 font-sans">
                          {fee.course_title} • <span className="text-slate-400">{fee.cohort}</span>
                        </div>
                      </td>

                      {/* Total Fee */}
                      <td className="py-4 px-4 text-right font-mono font-medium text-slate-200">
                        KES {total.toLocaleString()}
                      </td>

                      {/* Paid to Date + Progress */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-emerald-400">
                          KES {paid.toLocaleString()}
                        </div>
                        <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-slate-400 font-mono">
                          <span>{paidRatio}%</span>
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden inline-block">
                            <div 
                              className="bg-emerald-500 h-full rounded-full" 
                              style={{ width: `${paidRatio}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Balance Due */}
                      <td className="py-4 px-4 text-right">
                        <div className={`font-mono font-bold text-sm ${
                          balance === 0 
                            ? 'text-emerald-400' 
                            : isOverdue 
                            ? 'text-rose-400' 
                            : 'text-amber-400'
                        }`}>
                          KES {balance.toLocaleString()}
                        </div>
                        {fee.installment_plan && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] ml-auto">
                            {fee.installment_plan}
                          </div>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4 text-center">
                        {fee.payment_status === 'cleared' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Cleared / Up to Date
                          </span>
                        ) : fee.payment_status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Payment Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-200 border border-rose-500/40 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            Overdue / Locked Out
                          </span>
                        )}
                      </td>

                      {/* Payment Deadline */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{fee.deadline_date || 'None set'}</span>
                        </div>
                        {isOverdue && balance > 0 && (
                          <span className="text-[10px] font-mono text-rose-400 block mt-0.5">
                            Payment past due
                          </span>
                        )}
                      </td>

                      {/* Access Status & Manual Toggle */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {isAccessGranted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <Unlock className="w-3 h-3 text-emerald-400" />
                              Access Granted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <Lock className="w-3 h-3 text-rose-400" />
                              Access Denied (Locked)
                            </span>
                          )}

                          {/* Quick Toggle Button */}
                          <button
                            onClick={() => handleToggleAccess(fee)}
                            disabled={actionLoadingId === fee.id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                              isAccessGranted
                                ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/60'
                                : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800/60'
                            }`}
                            title={isAccessGranted ? "Deny student live class & portal access" : "Grant student live class & portal access"}
                          >
                            {actionLoadingId === fee.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : isAccessGranted ? (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Deny Access</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Grant Access</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(fee)}
                            className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Student Financials & Access"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(fee)}
                            className="p-1.5 rounded-lg bg-slate-850 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Fee Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT / CREATE STUDENT FINANCIAL MODAL */}
      {isModalOpen && editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingAccount.id ? 'Edit Student Tuition & Access Control' : 'Register New Student Fee Account'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure tuition numbers, payment dates, and portal access rights</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveAccount} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Student Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingAccount.student_name || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, student_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Brian Kipchumba"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Student Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingAccount.student_email || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, student_email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="student@codepointkenya.com"
                  />
                </div>
              </div>

              {/* Course & Cohort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Enrolled Program</label>
                  <input
                    type="text"
                    value={editingAccount.course_title || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, course_title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Full-Stack Software Engineering"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cohort</label>
                  <input
                    type="text"
                    value={editingAccount.cohort || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, cohort: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Cohort 14 (Evening & Hybrid)"
                  />
                </div>
              </div>

              {/* Fee Financials & Real-Time Balance */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tuition Payment Ledger (KES)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Total Program Fee (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingAccount.total_fee_kes !== undefined ? editingAccount.total_fee_kes : 85000}
                      onChange={(e) => {
                        const total = Number(e.target.value) || 0;
                        const paid = Number(editingAccount.paid_fee_kes) || 0;
                        setEditingAccount({
                          ...editingAccount,
                          total_fee_kes: total,
                          balance_kes: Math.max(0, total - paid)
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Amount Paid to Date (KES) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editingAccount.paid_fee_kes !== undefined ? editingAccount.paid_fee_kes : 0}
                      onChange={(e) => {
                        const paid = Number(e.target.value) || 0;
                        const total = Number(editingAccount.total_fee_kes) || 0;
                        setEditingAccount({
                          ...editingAccount,
                          paid_fee_kes: paid,
                          balance_kes: Math.max(0, total - paid)
                        });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono text-sm text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Auto-Calculated Balance Box */}
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Auto-Calculated Balance Due:</span>
                    <span className="text-base font-bold font-mono text-amber-400">
                      KES {(Math.max(0, (Number(editingAccount.total_fee_kes) || 0) - (Number(editingAccount.paid_fee_kes) || 0))).toLocaleString()}
                    </span>
                  </div>

                  {/* Quick Shortcuts */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const total = Number(editingAccount.total_fee_kes) || 85000;
                        setEditingAccount({
                          ...editingAccount,
                          paid_fee_kes: total,
                          balance_kes: 0,
                          payment_status: 'cleared',
                          portal_access_granted: 1
                        });
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono cursor-pointer"
                    >
                      Clear in Full
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const currentPaid = Number(editingAccount.paid_fee_kes) || 0;
                        const total = Number(editingAccount.total_fee_kes) || 85000;
                        const newPaid = Math.min(total, currentPaid + 16000);
                        setEditingAccount({
                          ...editingAccount,
                          paid_fee_kes: newPaid,
                          balance_kes: Math.max(0, total - newPaid),
                          payment_status: total - newPaid === 0 ? 'cleared' : 'pending'
                        });
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-[10px] font-mono cursor-pointer"
                    >
                      +KES 16,000
                    </button>
                  </div>
                </div>
              </div>

              {/* Status and Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Status Dropdown *</label>
                  <select
                    value={editingAccount.payment_status || 'pending'}
                    onChange={(e) => {
                      const newStatus = e.target.value as FeePaymentStatus;
                      setEditingAccount({
                        ...editingAccount,
                        payment_status: newStatus,
                        // If admin sets to overdue, auto-recommend turning off access
                        portal_access_granted: newStatus === 'overdue' ? 0 : (editingAccount.portal_access_granted !== undefined ? editingAccount.portal_access_granted : 1)
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="cleared">Cleared / Up to Date</option>
                    <option value="pending">Payment Pending</option>
                    <option value="overdue">Overdue / Locked Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Deadline Date *</label>
                  <input
                    type="text"
                    value={editingAccount.deadline_date || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, deadline_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. April 30, 2026 or 2026-04-30"
                  />
                </div>
              </div>

              {/* Manual Access Toggle: Grant/Deny Online Portal & Live Class Access */}
              <div className={`p-4 rounded-xl border transition-all ${
                (editingAccount.portal_access_granted === 1 || editingAccount.portal_access_granted === true)
                  ? 'bg-emerald-950/30 border-emerald-500/40'
                  : 'bg-rose-950/30 border-rose-500/40'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {(editingAccount.portal_access_granted === 1 || editingAccount.portal_access_granted === true) ? (
                        <Unlock className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-rose-400" />
                      )}
                      <span className="font-semibold text-white">
                        Grant/Deny Online Portal & Live Class Access
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {(editingAccount.portal_access_granted === 1 || editingAccount.portal_access_granted === true)
                        ? "Currently GRANTED. Student has full access to Zoom/Meet lectures, recorded lessons, curriculum materials, and lab reservations."
                        : "Currently DENIED / LOCKED OUT. Student is immediately barred from joining live calls, viewing recordings, booking lab seats, and submitting coursework."}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={editingAccount.portal_access_granted === 1 || editingAccount.portal_access_granted === true}
                      onChange={(e) => setEditingAccount({
                        ...editingAccount,
                        portal_access_granted: e.target.checked ? 1 : 0
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Installment Plan & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Installment Plan Label</label>
                  <input
                    type="text"
                    value={editingAccount.installment_plan || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, installment_plan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. 5-Month Flexible Installments"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Internal Finance Remarks</label>
                  <input
                    type="text"
                    value={editingAccount.notes || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Paid via M-Pesa Ref QK98762"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Saving...' : 'Save Fee & Access Settings'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Student Fee Record</h3>
              <p className="text-slate-400 mt-1">
                Are you sure you want to delete the financial record for <strong className="text-white">{deleteTarget.student_name}</strong> ({deleteTarget.student_email})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
