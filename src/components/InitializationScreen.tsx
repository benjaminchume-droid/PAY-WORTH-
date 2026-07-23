import React, { useState, useEffect } from 'react';
import { usePayWorth } from '../engines/StateContext';
import { ShieldCheck, CheckCircle2, Loader2, AlertTriangle, RefreshCw, LogOut, Wallet, Sparkles } from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

const INITIALIZATION_STEPS: Step[] = [
  { id: 'identity', label: 'Verifying identity & session' },
  { id: 'profile', label: 'Creating PayWorth user profile' },
  { id: 'wallet', label: 'Creating virtual wallet & account number' },
  { id: 'security', label: 'Initializing security & trust score' },
  { id: 'sync', label: 'Syncing account & preferences' },
];

export interface InitializationScreenProps {
  onComplete?: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export default function InitializationScreen({
  onComplete,
  error = null,
  onRetry,
}: InitializationScreenProps) {
  const { logout, appState } = usePayWorth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [localError, setLocalError] = useState<string | null>(error);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  useEffect(() => {
    if (localError) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < INITIALIZATION_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsDone(true);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 600);

    return () => clearInterval(interval);
  }, [localError, onComplete]);

  const handleSignOut = async () => {
    await logout();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Background Refraction Orbs */}
      <div className="absolute top-[20%] left-[25%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[25%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative z-10 text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center font-extrabold text-emerald-400 text-lg">
              P
            </div>
          </div>
          <span className="font-extrabold text-2xl tracking-wider text-white">
            PAY<span className="text-emerald-400">WORTH</span>
          </span>
        </div>

        {localError ? (
          /* Failure Handling View */
          <div className="space-y-6 py-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                We couldn't finish setting up your account.
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                {localError || 'A connection delay occurred during user initialization. Please retry or sign in again.'}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={onRetry || (() => window.location.reload())}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Setup</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Progress Steps View */
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Initializing Secure Environment</span>
              </div>
              <h2 className="text-xl font-bold text-white">Setting Up Your Account</h2>
              <p className="text-xs text-slate-400 mt-1">
                Configuring your PayWorth account, wallet number, and security preferences.
              </p>
            </div>

            {/* Checklist of steps */}
            <div className="space-y-2.5 text-left bg-slate-950/60 border border-white/5 rounded-2xl p-4">
              {INITIALIZATION_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex || isDone;
                const isCurrent = idx === currentStepIndex && !isDone;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                      isCompleted
                        ? 'text-emerald-400 font-medium'
                        : isCurrent
                        ? 'text-white font-semibold bg-white/5 border border-white/10'
                        : 'text-slate-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span className="text-xs font-mono">{step.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protected by 256-bit SSL encryption & Supabase Auth</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
