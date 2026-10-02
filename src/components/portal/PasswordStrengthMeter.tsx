import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  level: 'empty' | 'weak' | 'fair' | 'good' | 'strong';
  label: string;
  colorClass: string;
  barColor: string;
  feedback: string;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      level: 'empty',
      label: 'Enter password',
      colorClass: 'text-slate-500',
      barColor: 'bg-slate-800',
      feedback: 'Use at least 8 characters with letters, numbers, and symbols.',
      hasMinLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let rawScore = 0;
  if (password.length >= 6) rawScore += 1;
  if (hasMinLength) rawScore += 1;
  if (password.length >= 12) rawScore += 1;
  if (hasUpper && hasLower) rawScore += 1;
  if (hasNumber) rawScore += 1;
  if (hasSpecial) rawScore += 1;

  // Penalize repetitive or dictionary phrases
  const lower = password.toLowerCase();
  const commonWeak = ['password', '123456', 'qwerty', 'admin', 'student', 'teacher', 'codepoint'];
  const hasCommon = commonWeak.some((w) => lower.includes(w));
  if (hasCommon && rawScore > 2) {
    rawScore = 2;
  }

  // Map to 1-4 scale
  let score = 1;
  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  let label = 'Weak';
  let colorClass = 'text-rose-400';
  let barColor = 'bg-rose-500';
  let feedback = 'Add uppercase letters, numbers or symbols.';

  if (rawScore <= 2) {
    score = 1;
    level = 'weak';
    label = 'Weak';
    colorClass = 'text-rose-400';
    barColor = 'bg-rose-500';
    feedback = 'Too simple. Use at least 8 characters with mixed types.';
  } else if (rawScore <= 3) {
    score = 2;
    level = 'fair';
    label = 'Fair';
    colorClass = 'text-amber-400';
    barColor = 'bg-amber-500';
    feedback = 'Moderate security. Add numbers or symbols to strengthen.';
  } else if (rawScore <= 4) {
    score = 3;
    level = 'good';
    label = 'Good';
    colorClass = 'text-cyan-400';
    barColor = 'bg-cyan-500';
    feedback = 'Good complexity. Almost at maximum protection.';
  } else {
    score = 4;
    level = 'strong';
    label = 'Strong';
    colorClass = 'text-emerald-400';
    barColor = 'bg-emerald-500';
    feedback = 'Excellent! Highly resistant to brute-force guessing.';
  }

  return {
    score,
    level,
    label,
    colorClass,
    barColor,
    feedback,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial
  };
}

interface PasswordStrengthMeterProps {
  password: string;
  themeColor?: string;
  showRequirements?: boolean;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  themeColor,
  showRequirements = true,
  className = ''
}) => {
  if (!password) return null;

  const result = evaluatePasswordStrength(password);
  const segments = [1, 2, 3, 4];

  return (
    <div className={`space-y-2 pt-1 animate-in fade-in duration-200 ${className}`}>
      {/* 4 Segmented Progress Bars & Label */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            {result.score >= 3 ? (
              <ShieldCheck className={`w-3.5 h-3.5 ${result.colorClass}`} />
            ) : (
              <ShieldAlert className={`w-3.5 h-3.5 ${result.colorClass}`} />
            )}
            <span>Password Strength:</span>
          </span>
          <span className={`font-bold font-mono uppercase tracking-wider text-[10px] ${result.colorClass}`}>
            {result.label}
          </span>
        </div>

        {/* Segmented Bar Track */}
        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-950/80 p-0.5 rounded-full border border-slate-800/80">
          {segments.map((seg) => {
            const isFilled = result.score >= seg;
            let segmentBg = 'bg-slate-800/50';

            if (isFilled) {
              if (result.score === 1) segmentBg = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
              else if (result.score === 2) segmentBg = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
              else if (result.score === 3) segmentBg = 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]';
              else segmentBg = themeColor ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
            }

            return (
              <div
                key={seg}
                className={`h-full rounded-full transition-all duration-300 ${segmentBg}`}
                style={isFilled && result.score === 4 && themeColor ? { backgroundColor: themeColor } : undefined}
              />
            );
          })}
        </div>
      </div>

      {/* Helpful context suggestion */}
      <div className="flex items-center justify-between text-[10px] text-slate-400">
        <span className="leading-tight">{result.feedback}</span>
      </div>

      {/* Micro-requirements Checklist (Optional or Detailed) */}
      {showRequirements && (
        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/60 text-[10px]">
          <div className={`flex items-center gap-1.5 transition-colors ${result.hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
            {result.hasMinLength ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 ml-0.5" />
            )}
            <span>8+ characters</span>
          </div>

          <div className={`flex items-center gap-1.5 transition-colors ${result.hasUpper && result.hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
            {result.hasUpper && result.hasLower ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 ml-0.5" />
            )}
            <span>Upper & lowercase</span>
          </div>

          <div className={`flex items-center gap-1.5 transition-colors ${result.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
            {result.hasNumber ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 ml-0.5" />
            )}
            <span>At least 1 number</span>
          </div>

          <div className={`flex items-center gap-1.5 transition-colors ${result.hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
            {result.hasSpecial ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 ml-0.5" />
            )}
            <span>Special character (!@#$)</span>
          </div>
        </div>
      )}
    </div>
  );
};
