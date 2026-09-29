import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowLeft, 
  LogOut, 
  User as UserIcon, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  Clock,
  RefreshCw,
  Key,
  Check,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Radio,
  ArrowRight
} from 'lucide-react';
import { User, UserRole, Course, SiteSettings } from '../../types';
import { StudentDashboard } from './StudentDashboard';
import { InstructorDashboard } from './InstructorDashboard';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onOpenAdminCMS?: () => void;
  courses?: Course[];
  onRefreshCourses?: () => void;
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (settings: SiteSettings) => Promise<boolean>;
}

export const PortalModal: React.FC<PortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onOpenAdminCMS,
  courses = [],
  onRefreshCourses,
  siteSettings,
  onUpdateSiteSettings
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTeacherApprovalPopup, setShowTeacherApprovalPopup] = useState(false);
  const [pendingInstructorEmail, setPendingInstructorEmail] = useState('');

  // Password Setup on First Login or Email Setup Link
  const [isPasswordSetupMode, setIsPasswordSetupMode] = useState(false);
  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSetupSuccess, setPasswordSetupSuccess] = useState(false);
  const [setupUser, setSetupUser] = useState<User | null>(null);

  // Check for password setup link in URL parameters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('setup_token');
      const emailParam = params.get('email');
      if (token) {
        setSetupToken(token);
        if (emailParam) setEmail(emailParam);
        setSelectedRole('instructor');
        setIsPasswordSetupMode(true);
      }
    } catch (e) {
      console.warn("Could not parse setup parameters from URL", e);
    }
  }, []);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: selectedRole,
          email: email.trim(), 
          password: password.trim() 
        })
      });
      const data = await res.json();

      if (!res.ok) {
        // Teacher/instructor pending approval detection
        if (data.pendingApproval || (selectedRole === 'instructor' && (data.error?.includes('approval of the admin') || data.error?.includes('wait for the approval')))) {
          setPendingInstructorEmail(email.trim());
          setShowTeacherApprovalPopup(true);
          return;
        }
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      if (data.pendingApproval) {
        setPendingInstructorEmail(email.trim());
        setShowTeacherApprovalPopup(true);
        return;
      }

      // If user must update password on first login
      if (data.mustUpdatePassword) {
        setSetupUser(data.user);
        setIsPasswordSetupMode(true);
        return;
      }

      // Enforce strict role mapping: instructor selection routes exclusively to instructor role
      const finalRole: UserRole = selectedRole === 'instructor' ? 'instructor' : 'student';
      const authenticatedUser: User = {
        ...data.user,
        role: finalRole
      };

      try {
        localStorage.setItem('cpk_portal_user', JSON.stringify(authenticatedUser));
        if (data.token) {
          localStorage.setItem('cpk_portal_token', data.token);
        }
      } catch (e) {}

      onLogin(authenticatedUser);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          setupToken: setupToken || undefined,
          newPassword: newPassword.trim()
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordSetupSuccess(true);
      setTimeout(() => {
        setIsPasswordSetupMode(false);
        setPasswordSetupSuccess(false);
        const authenticatedUser: User = {
          ...data.user,
          role: 'instructor'
        };
        try {
          localStorage.setItem('cpk_portal_user', JSON.stringify(authenticatedUser));
        } catch (e) {}
        onLogin(authenticatedUser);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100">
        
        {/* Top Portal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Website</span>
            </button>
          </div>

          {/* Current User Status */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-emerald-400 uppercase font-mono">{currentUser.role}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* AUTHENTICATION BARRIER: When user is not logged in */}
          {!currentUser ? (
            <div className="max-w-md mx-auto py-4 sm:py-6 space-y-5">
              
              {/* Icon-Forward Header */}
              <div className="text-center space-y-2">
                <div 
                  style={{ 
                    backgroundColor: 'rgba(var(--primary-rgb), 0.12)', 
                    borderColor: 'rgba(var(--primary-rgb), 0.3)', 
                    color: 'var(--primary-color)',
                    boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.15)'
                  }}
                  className="w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto shadow-sm"
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Code Point Kenya Portal
                </h3>
              </div>

              {/* 4-Icon Feature Strip: Replaces wordy explanations with visual cues */}
              <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-800/80 my-2">
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 text-center">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200">Classes</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 text-center">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1">
                    <Code2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200">Labs</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 text-center">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-1">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200">Certs</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 text-center">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200">Live Sync</span>
                </div>
              </div>

              {errorMsg && (
                errorMsg.toLowerCase().includes('pending') || errorMsg.toLowerCase().includes('wait') ? (
                  <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 animate-in fade-in">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-amber-300 text-sm">Access Status Notice</div>
                      <div className="leading-relaxed">{errorMsg}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-rose-300">Access Denied</div>
                      <div>{errorMsg}</div>
                    </div>
                  </div>
                )
              )}

              {/* Clean, Production-Ready Login Form or Teacher Password Setup Form */}
              {isPasswordSetupMode ? (
                <form onSubmit={handlePasswordSetupSubmit} className="space-y-4 bg-slate-950/90 p-5 rounded-2xl border border-indigo-500/30 shadow-xl backdrop-blur-md animate-in fade-in">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 text-indigo-400">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Create Permanent Password</h4>
                      <p className="text-[10px] text-slate-400">First-time faculty access</p>
                    </div>
                  </div>

                  {passwordSetupSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Password set! Redirecting...</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Email</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="portal-new-password" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                      <span>New Password</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="portal-new-password"
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="portal-confirm-password" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Confirm</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="portal-confirm-password"
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || passwordSetupSuccess}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Save & Enter Portal</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPasswordSetupMode(false);
                        setErrorMsg('');
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4 bg-slate-950/90 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
                  
                  {/* 1. Visual 2-Card Role Selector with prominent icons (replaces boring dropdown & paragraphs) */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('student');
                          setErrorMsg('');
                        }}
                        style={{
                          borderColor: selectedRole === 'student' ? 'var(--primary-color)' : 'rgba(51, 65, 85, 0.6)',
                          backgroundColor: selectedRole === 'student' ? 'rgba(var(--primary-rgb), 0.12)' : 'rgba(15, 23, 42, 0.5)'
                        }}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                          selectedRole === 'student' ? 'shadow-md' : 'hover:border-slate-700'
                        }`}
                      >
                        <div 
                          style={{
                            backgroundColor: selectedRole === 'student' ? 'rgba(var(--primary-rgb), 0.2)' : 'rgba(30, 41, 59, 0.8)',
                            color: selectedRole === 'student' ? 'var(--primary-color)' : '#94a3b8'
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-800 transition-colors"
                        >
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Student</span>
                            {selectedRole === 'student' && (
                              <CheckCircle className="w-3 h-3 theme-text-primary" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">Learner</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole('instructor');
                          setErrorMsg('');
                        }}
                        style={{
                          borderColor: selectedRole === 'instructor' ? 'var(--secondary-color)' : 'rgba(51, 65, 85, 0.6)',
                          backgroundColor: selectedRole === 'instructor' ? 'rgba(var(--secondary-rgb), 0.12)' : 'rgba(15, 23, 42, 0.5)'
                        }}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                          selectedRole === 'instructor' ? 'shadow-md' : 'hover:border-slate-700'
                        }`}
                      >
                        <div 
                          style={{
                            backgroundColor: selectedRole === 'instructor' ? 'rgba(var(--secondary-rgb), 0.2)' : 'rgba(30, 41, 59, 0.8)',
                            color: selectedRole === 'instructor' ? 'var(--secondary-color)' : '#94a3b8'
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-800 transition-colors"
                        >
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Faculty</span>
                            {selectedRole === 'instructor' && (
                              <CheckCircle className="w-3 h-3 text-cyan-400" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">Instructor</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 2. Email Address Input */}
                  <div className="space-y-1">
                    <label htmlFor="portal-email-input" className="text-xs font-semibold text-slate-300 flex items-center">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 theme-text-primary" />
                        <span>Email Address</span>
                      </span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="portal-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          selectedRole === 'student'
                            ? 'student@example.com'
                            : 'staff@codepointkenya.com'
                        }
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  {/* 3. Password Input */}
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <label htmlFor="portal-password-input" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 theme-text-primary" />
                        <span>Password</span>
                      </label>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="portal-password-input"
                        type="password"
                        required={selectedRole !== 'student'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  {/* 4. Action CTA Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      background: selectedRole === 'student'
                        ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))'
                        : 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))',
                      boxShadow: '0 8px 20px -4px rgba(var(--primary-rgb), 0.25)'
                    }}
                    className="w-full py-3 rounded-xl text-slate-950 text-xs font-bold shadow-md hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2 mt-3"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Enter {selectedRole === 'student' ? 'Student' : 'Faculty'} Portal</span>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          ) : (
            /* ROLE-BASED DASHBOARD CONTENT */
            <div>
              {currentUser.role === 'admin' && (
                <div className="max-w-md mx-auto py-12 px-6 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Administrator Access Restricted</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Administrative workflows and system controls are consolidated exclusively under the dedicated Admin CMS panel.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenAdminCMS) onOpenAdminCMS();
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Open Dedicated Admin CMS</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {currentUser.role === 'student' && (
                <StudentDashboard currentUser={currentUser} />
              )}

              {currentUser.role === 'instructor' && (
                <InstructorDashboard currentUser={currentUser} />
              )}
            </div>
          )}

        </div>

      </div>

      {/* Teacher/Instructor Approval Required Popup Modal */}
      {showTeacherApprovalPopup && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 sm:p-7 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">
                Please wait for the approval of the admin.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your login attempt with staff email <span className="font-mono text-amber-300 font-semibold">{pendingInstructorEmail}</span> has been securely logged in the Code Point Kenya authentication register.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                A system administrator must review and approve your teacher account before you can enter the instructor portal, manage cohorts, and grade assignments.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Status: Pending Admin Approval
              </span>
              <span className="font-mono text-slate-400">Request Logged</span>
            </div>

            <button
              type="button"
              onClick={() => setShowTeacherApprovalPopup(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
