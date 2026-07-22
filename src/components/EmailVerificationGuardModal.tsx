import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { ShieldAlert, Mail, RefreshCw, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EmailVerificationGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
}

export default function EmailVerificationGuardModal({
  isOpen,
  onClose,
  actionName = 'this feature',
}: EmailVerificationGuardModalProps) {
  const {
    currentUser,
    resendVerificationEmail,
    refreshUserSession,
    setActiveMenuScreen,
    loading,
    error,
    successMessage,
    clearMessages,
  } = usePayWorth();

  const [cooldown, setCooldown] = useState(0);

  if (!isOpen) return null;

  const handleResend = async () => {
    clearMessages();
    const ok = await resendVerificationEmail();
    if (ok) {
      setCooldown(60);
    }
  };

  const handleGoToPortal = () => {
    onClose();
    setActiveMenuScreen('email_verification');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Accent top banner */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-emerald-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center ring-4 ring-amber-500/5">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">Email Verification Required</h3>

            <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-sm">
              To perform <strong className="text-amber-400 font-semibold">{actionName}</strong>, your account email must be verified. This prevents fraud, double-spending, and unauthorized bot activity on PayWorth.
            </p>

            {currentUser && (
              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Account Email:</span>
                <span className="text-emerald-400 font-bold truncate max-w-[200px]">{currentUser.email}</span>
              </div>
            )}

            {error && (
              <div className="w-full p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left font-mono">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="w-full p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-left font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {successMessage}
              </div>
            )}

            <div className="w-full pt-2 space-y-2">
              <button
                onClick={handleGoToPortal}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                Open Verification Portal <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleResend}
                  disabled={loading || cooldown > 0}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 rounded-xl transition-all border border-slate-700 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {cooldown > 0 ? `${cooldown}s` : 'Resend Email'}
                </button>

                <button
                  onClick={async () => {
                    await refreshUserSession();
                  }}
                  disabled={loading}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 rounded-xl transition-all border border-slate-700 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Check Status
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
