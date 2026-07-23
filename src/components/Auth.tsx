import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { Coins, LogIn, UserPlus, Mail, ShieldAlert, Lock, RefreshCw, KeyRound } from 'lucide-react';
import EmailOTPVerification from './EmailOTPVerification';

export default function Auth() {
  const {
    currentUser,
    pendingOtpEmail,
    login,
    signup,
    loginWithOAuth,
    forgotPassword,
    updatePassword,
    resendVerificationEmail,
    refreshUserSession,
    isPasswordRecovery,
    logout,
    loading,
    error,
    successMessage,
    clearMessages,
  } = usePayWorth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Rate limiting cooldown timer
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset');
    }
  }, [isPasswordRecovery]);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearMessages();

    if (!email || !password) {
      setLocalError('Please enter both email address and password.');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    await login(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearMessages();

    if (!username.trim()) {
      setLocalError('Username is required.');
      return;
    }

    if (username.trim().length < 3) {
      setLocalError('Username must be at least 3 characters in length.');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please verify your entries.');
      return;
    }

    await signup(email, password, username, referralCode || undefined);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearMessages();

    if (!email || !validateEmail(email)) {
      setLocalError('Please enter a valid email address to receive password recovery instructions.');
      return;
    }

    if (cooldown > 0) {
      setLocalError(`Rate limit protection active. Please wait ${cooldown} seconds before requesting another email.`);
      return;
    }

    await forgotPassword(email);
    setCooldown(60);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearMessages();

    if (password.length < 8) {
      setLocalError('New password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please verify your entries.');
      return;
    }

    const ok = await updatePassword(password);
    if (ok) {
      setPassword('');
      setConfirmPassword('');
      setMode('signin');
    }
  };

  const handleResendVerification = async () => {
    setLocalError(null);
    clearMessages();

    if (cooldown > 0) {
      setLocalError(`Please wait ${cooldown} seconds before requesting another verification email.`);
      return;
    }

    const ok = await resendVerificationEmail();
    if (ok) {
      setCooldown(60);
    }
  };

  // If user is undergoing registration or authenticated but email is not verified, show OTP verification screen
  if (pendingOtpEmail || (currentUser && !currentUser.emailVerified)) {
    return <EmailOTPVerification email={pendingOtpEmail || currentUser?.email} />;
  }

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative select-none">
      {/* Background Refraction Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[50%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[15%] right-[20%] w-[45%] h-[25%] bg-blue-500/5 rounded-full blur-[90px]" />

      <div className="w-full max-w-sm z-10">
        {/* Brand identity header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/10 mb-3">
            <Coins className="text-slate-950 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">PayWorth Ledger</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Authenticate to sync secure reward hashes, transactions, and membership scoreboards.
          </p>
        </div>

        {/* Auth Glass Container */}
        <motion.div
          layout
          className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative shadow-2xl overflow-hidden"
        >
          {displayError && (
            <div className="mb-4 p-3 text-left rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {displayError}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 text-left rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              {successMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === 'signin' && (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. operator@payworth.com"
                      required
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setLocalError(null);
                        setMode('forgot');
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium transition-all cursor-pointer"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In with Password'}
                </button>
              </motion.form>
            )}

            {mode === 'signup' && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSignUp}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Unique Username</label>
                  <div className="relative">
                    <LogIn className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. LedgerKing"
                      required
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. operator@payworth.com"
                      required
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      required
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Referral Code (Optional)</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="e.g. FOUNDER99"
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                {/* Mandatory Legal Consent Checkboxes */}
                <div className="pt-2 pb-1 space-y-2 border-t border-white/10 text-[11px] text-slate-300">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span>
                      I agree to the PayWorth{' '}
                      <a href="#terms" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">
                        Terms of Service
                      </a>{' '}
                      &amp;{' '}
                      <a href="#privacy" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">
                        Privacy Policy
                      </a>.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span>
                      I understand the{' '}
                      <a href="#rewards" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">
                        Reward &amp; Withdrawal Policy
                      </a>{' '}
                      and PWC conversion rules.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <span>I confirm I am at least the minimum legal age required in my jurisdiction.</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? 'Registering Account...' : 'Create Account'}
                </button>
              </motion.form>
            )}

            {mode === 'forgot' && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleForgot}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. operator@payworth.com"
                      required
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    'Sending Instructions...'
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    'Send Password Reset Instructions'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setLocalError(null);
                    setMode('signin');
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white transition-all font-medium pt-2 block cursor-pointer"
                >
                  Back to Sign In
                </button>
              </motion.form>
            )}

            {mode === 'reset' && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div className="text-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Set New Password</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Please enter your new master password below.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      required
                      className="w-full bg-white/2 hover:bg-white/5 focus:bg-black/20 border border-white/5 focus:border-emerald-500/40 outline-none text-white text-xs px-10 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Social OAuth Providers */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
              <div className="relative text-center">
                <span className="bg-slate-900/90 text-slate-400 text-[10px] font-mono px-3 uppercase tracking-wider relative z-10">
                  Or authenticate with
                </span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => loginWithOAuth('google')}
                  disabled={loading}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>
          )}

        </motion.div>

        {/* Auth mode toggle footer */}
        <div className="mt-5 text-center text-xs space-y-3">
          {mode === 'signin' ? (
            <p className="text-slate-400">
              New to PayWorth?{' '}
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setLocalError(null);
                  setMode('signup');
                }}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Register Here
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-slate-400">
              Already possess an account?{' '}
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setLocalError(null);
                  setMode('signin');
                }}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          ) : null}

          <p className="text-[11px] text-slate-500 font-mono pt-2">
            Made with care by <span className="text-slate-400 font-semibold">Glass Line Studio</span>
          </p>
        </div>
      </div>
    </div>
  );
}
