import React, { useMemo } from 'react';
import { Check, X, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';

export interface PasswordStrengthValidatorProps {
  password?: string;
  onValidationChange?: (
    isValid: boolean,
    details: { score: number; label: string; passedCount: number }
  ) => void;
  showRequirements?: boolean;
  className?: string;
}

export function evaluatePasswordStrength(password: string = '') {
  const requirements = [
    {
      id: 'length',
      label: 'At least 8 characters',
      passed: password.length >= 8,
    },
    {
      id: 'number',
      label: 'At least one number (0-9)',
      passed: /\d/.test(password),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%...)',
      passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    },
    {
      id: 'mixedCase',
      label: 'Upper & lowercase letters (recommended)',
      passed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
  ];

  const mandatoryPassed =
    requirements[0].passed && requirements[1].passed && requirements[2].passed;

  const passedCount = requirements.filter((r) => r.passed).length;
  let score = 0;
  let label = 'Very Weak';
  let color = 'bg-rose-500';
  let textColor = 'text-rose-400';

  if (password.length === 0) {
    score = 0;
    label = 'Enter Password';
    color = 'bg-slate-700';
    textColor = 'text-slate-500';
  } else if (!mandatoryPassed) {
    score = Math.min(60, passedCount * 20);
    label = 'Weak';
    color = 'bg-rose-500';
    textColor = 'text-rose-400';
  } else if (passedCount === 3) {
    score = 80;
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-400';
  } else if (passedCount === 4) {
    score = 100;
    label = 'Excellent';
    color = 'bg-cyan-400';
    textColor = 'text-cyan-400';
  }

  return {
    requirements,
    mandatoryPassed,
    passedCount,
    score,
    label,
    color,
    textColor,
    isValid: mandatoryPassed,
  };
}

export default function PasswordStrengthValidator({
  password = '',
  onValidationChange,
  showRequirements = true,
  className = '',
}: PasswordStrengthValidatorProps) {
  const result = useMemo(() => {
    const res = evaluatePasswordStrength(password);
    if (onValidationChange) {
      onValidationChange(res.isValid, {
        score: res.score,
        label: res.label,
        passedCount: res.passedCount,
      });
    }
    return res;
  }, [password, onValidationChange]);

  if (!password && !showRequirements) return null;

  return (
    <div className={`space-y-2 mt-2 ${className}`}>
      {/* Strength meter bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-mono">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Password Security Level:
          </span>
          <span className={`font-bold ${result.textColor}`}>{result.label}</span>
        </div>

        <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 flex gap-1 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${result.color}`}
            style={{ width: `${Math.max(5, result.score)}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
          {result.requirements.map((req) => (
            <div
              key={req.id}
              className={`flex items-center gap-1.5 text-[10px] font-mono p-1.5 rounded-lg border transition-all ${
                req.passed
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-slate-900/50 border-white/5 text-slate-500'
              }`}
            >
              {req.passed ? (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <X className="w-3 h-3 text-slate-600 shrink-0" />
              )}
              <span className="truncate">{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
