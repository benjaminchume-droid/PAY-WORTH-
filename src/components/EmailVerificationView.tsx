import React, { useState, useEffect } from 'react';
import { usePayWorth } from '../engines/StateContext';
import { supabase } from '../lib/supabase';
import { Mail, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Send, Sparkles, LogOut, AlertCircle } from 'lucide-react';

export default function EmailVerificationView() {
  const { currentUser, resendVerificationEmail, logout, refreshUserSession, error, successMessage, clearMessages } = usePayWorth();
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [cooldown, setCooldown] = useState<number>(0);
  const [checking, setChecking] = useState<boolean>(false);
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendLink = async () => {
    clearMessages();
    setLocalMsg(null);

    if (cooldown > 0) return;

    if (!email.trim()) {
      setLocalMsg('Please enter a valid email address.');
      return;
    }

    const ok = await resendVerificationEmail(email.trim());
    if (ok) {
      setCooldown(60);
      setLocalMsg(`Verification link sent to ${email.trim()}. Please check your inbox.`);
    }
  };

  const handleCheckStatus = async () => {
    clearMessages();
    setLocalMsg(null);
    setChecking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await refreshUserSession();
        if (user.email_confirmed_at || user.user_metadata?.email_verified) {
          setLocalMsg('Your email address has been verified successfully!');
        } else {
          setLocalMsg('Email is not verified yet. Please check your inbox and click the link.');
        }
      }
    } catch (err: any) {
      setLocalMsg('Unable to verify email status right now. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const isVerified = currentUser?.emailVerified;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative select-none">
      {/* Ambient glass background glows */}
      <div className="absolute top-[15%] left-[20%] w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative z-10 text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10">
          {isVerified ? <CheckCircle2 className="w-8 h-8" /> : <Mail className="w-8 h-8" />}
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Email Verification Portal</span>
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-2">
          {isVerified ? 'Account Verified!' : 'Verify Your Email'}
        </h2>

        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto mb-6">
          {isVerified ? (
            <>Your email address <span className="text-white font-bold">{email}</span> is fully verified. All features, rewards, and transfers are unlocked.</>
          ) : (
            <>We sent an email verification link to <span className="text-white font-bold">{email || 'your email address'}</span>. Please click the link to confirm your account.</>
          )}
        </p>

        {/* Display feedback messages */}
        {(localMsg || error || successMessage) && (
          <div className={`p-3 rounded-xl border text-xs font-medium mb-6 ${
            isVerified || successMessage || localMsg?.includes('verified')
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}>
            {localMsg || successMessage || error}
          </div>
        )}

        {!isVerified && (
          <div className="space-y-3 mb-6">
            <div className="text-left space-y-1">
              <label className="text-[10px] font-mono text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={Boolean(currentUser?.email)}
                placeholder="enter@email.com"
                className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-500/50 outline-none text-white text-xs px-3.5 py-2.5 rounded-xl transition-all disabled:opacity-60"
              />
            </div>

            <button
              type="button"
              onClick={handleResendLink}
              disabled={cooldown > 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{cooldown > 0 ? `Resend Link in ${cooldown}s` : 'Resend Verification Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>Check Verification Status</span>
            </button>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={logout}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <a
            href="/"
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
