import React from 'react';
import { Check, X, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export interface PasswordStrengthMeterProps {
  password: string;
  themeColor?: string;
  showRequirements?: boolean;
  className?: string;
}

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export function calculatePasswordStrength(password: string): {
  score: number; // 0 - 4
  percentage: number;
  label: string;
  colorClass: string;
  requirements: PasswordRequirement[];
} {
  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: password.length >= 8
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter (A-Z)',
      met: /[A-Z]/.test(password)
    },
    {
      id: 'number',
      label: 'Contains a number (0-9)',
      met: /[0-9]/.test(password)
    },
    {
      id: 'special',
      label: 'Contains special symbol (!@#$%^&*)',
      met: /[^A-Za-z0-9]/.test(password)
    }
  ];

  if (!password) {
    return {
      score: 0,
      percentage: 0,
      label: '',
      colorClass: 'bg-slate-700',
      requirements
    };
  }

  let metCount = requirements.filter(r => r.met).length;
  // Bonus if longer than 12
  if (password.length >= 12 && metCount >= 3) {
    metCount = 4;
  }

  let label = 'Very Weak';
  let colorClass = 'bg-rose-500';

  switch (metCount) {
    case 1:
      label = 'Weak';
      colorClass = 'bg-rose-500';
      break;
    case 2:
      label = 'Fair';
      colorClass = 'bg-amber-500';
      break;
    case 3:
      label = 'Good';
      colorClass = 'bg-blue-500';
      break;
    case 4:
      label = 'Strong';
      colorClass = 'bg-emerald-500';
      break;
    default:
      label = password.length > 0 ? 'Too Short' : '';
      colorClass = 'bg-rose-500';
      break;
  }

  const percentage = Math.min(100, Math.max(10, metCount * 25));

  return {
    score: metCount,
    percentage,
    label,
    colorClass,
    requirements
  };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  themeColor,
  showRequirements = false,
  className = ''
}) => {
  if (!password) return null;

  const { score, percentage, label, colorClass, requirements } = calculatePasswordStrength(password);

  return (
    <div className={`space-y-1.5 pt-1 ${className}`}>
      {/* Progress Bars */}
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-slate-400 flex items-center gap-1">
          {score >= 3 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : score >= 2 ? (
            <Shield className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          )}
          Security Strength:
        </span>
        <span
          className={`font-semibold tracking-wide ${
            score >= 4
              ? 'text-emerald-400'
              : score === 3
              ? 'text-blue-400'
              : score === 2
              ? 'text-amber-400'
              : 'text-rose-400'
          }`}
          style={themeColor && score >= 3 ? { color: themeColor } : undefined}
        >
          {label}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => {
          const isActive = score >= step;
          return (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                isActive
                  ? colorClass
                  : 'bg-slate-700/60'
              }`}
              style={
                isActive && themeColor && score >= 4
                  ? { backgroundColor: themeColor }
                  : undefined
              }
            />
          );
        })}
      </div>

      {showRequirements && (
        <div className="pt-1.5 grid grid-cols-1 gap-1 text-[11px]">
          {requirements.map((req) => (
            <div
              key={req.id}
              className={`flex items-center gap-1.5 transition-colors ${
                req.met ? 'text-emerald-400' : 'text-slate-400'
              }`}
            >
              {req.met ? (
                <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              ) : (
                <X className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
