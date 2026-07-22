import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { ShieldCheck, ShieldAlert, Mail, RefreshCw, CheckCircle2, Edit3, ArrowLeft, Lock } from 'lucide-react';

export default function EmailVerificationView() {
  const {
    currentUser,
    resendVerificationEmail,
    refreshUserSession,
    changeEmail,
    setActiveMenuScreen,
    loading,
    error,
    successMessage,
    clearMessages,
  } = usePayWorth();

  const [cooldown, setCooldown] = useState(0);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-poll verification status every 6 seconds while on this view
  useEffect(() => {
    if (currentUser && !currentUser.emailVerified) {
      const interval = setInterval(() => {
        refreshUserSession();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.emailVerified]);

  const handleResend = async () => {
    setLocalError(null);
    clearMessages();
    if (cooldown > 0) {
      setLocalError(`Please wait ${cooldown} seconds before requesting another email.`);
      return;
    }
    const ok = await resendVerificationEmail();
    if (ok) {
      setCooldown(60);
    }
  };

  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearMessages();

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setLocalError('Please enter a valid new email address.');
      return;
    }

    if (currentUser && newEmail.toLowerCase() === currentUser.email.toLowerCase()) {
      setLocalError('The new email address matches your current email address.');
      return;
    }

    const ok = await changeEmail(newEmail);
    if (ok) {
      setEditingEmail(false);
      setNewEmail('');
      setCooldown(60);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-24">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveMenuScreen(null)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          PayWorth Security Portal
        </span>
      </div>

      {currentUser?.emailVerified ? (
        /* ALREADY VERIFIED STATE */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl relative overflow-hidden"
        >
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <ShieldCheck className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">Email Verified Successfully!</h1>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Your email address <strong className="text-emerald-400 font-mono">{currentUser.email}</strong> is fully verified. All financial features, gaming rewards, task submissions, and withdrawal operations are unlocked.
          </p>

          <div className="pt-4">
            <button
              onClick={() => setActiveMenuScreen(null)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Return to Platform Dashboard
            </button>
          </div>
        </motion.div>
      ) : (
        /* UNVERIFIED STATE PORTAL */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400" />

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center ring-4 ring-amber-500/5">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">Email Verification Portal</h1>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              We have dispatched a cryptographic verification link to your inbox. Please click the link to confirm your ownership and unlock your wallet ledger.
            </p>
          </div>

          {/* Current Email Display Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Registered Email Address</span>
              {!editingEmail && (
                <button
                  onClick={() => {
                    setEditingEmail(true);
                    setNewEmail(currentUser?.email || '');
                    setLocalError(null);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Email
                </button>
              )}
            </div>

            {!editingEmail ? (
              <div className="flex items-center gap-2 text-sm font-bold font-mono text-white">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{currentUser?.email}</span>
              </div>
            ) : (
              <form onSubmit={handleChangeEmailSubmit} className="space-y-3 pt-1">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2.5 rounded-xl outline-none focus:border-emerald-500"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Save &amp; Send Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEmail(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {displayError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono text-left">
              {displayError}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono text-left flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleResend}
              disabled={loading || cooldown > 0}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              {loading ? (
                'Transmitting verification link...'
              ) : cooldown > 0 ? (
                `Resend Verification Email (${cooldown}s)`
              ) : (
                'Resend Verification Email'
              )}
            </button>

            <button
              onClick={async () => {
                clearMessages();
                setLocalError(null);
                await refreshUserSession();
              }}
              disabled={loading}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold text-xs py-3 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
              Check / Refresh Verification Status
            </button>
          </div>

          {/* Locked Features Summary */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Protected Features (Pending Email Verification):
            </h3>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside font-sans">
              <li>PWC Wallet Deposits, Payouts &amp; Bank Withdrawals</li>
              <li>Task Submissions &amp; Micro-Task Reward Claims</li>
              <li>Mini Games Play &amp; Arcade Prize Payouts</li>
              <li>Referral Network Commissions &amp; Tier Upgrades</li>
              <li>Marketplace Campaign Creation &amp; Escrow Deposit</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
