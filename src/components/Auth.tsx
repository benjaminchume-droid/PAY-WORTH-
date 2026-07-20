import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { Coins, LogIn, UserPlus, Key, Mail, ShieldCheck, MailCheck, ShieldAlert, ArrowRight, Lock } from 'lucide-react';

export default function Auth() {
  const {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    forgotPassword,
    verifyEmail,
    logout,
    loading,
    error,
    successMessage,
    clearMessages,
  } = usePayWorth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) return;
    await signup(email, password, username, referralCode || undefined);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await forgotPassword(email);
  };

  // If user is authenticated but email is not verified, show verification portal!
  if (currentUser && !currentUser.emailVerified) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-amber-500/5 rounded-full blur-[100px]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative flex flex-col items-center text-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5 ring-4 ring-amber-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">Email Verification Portal</h2>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            A confirmation dispatch has been routed to <strong className="text-white">{currentUser.email}</strong>. Please confirm your credentials. Unverified accounts cannot access financial ledgers or rewards.
          </p>

          {error && (
            <div className="mt-4 p-3 w-full text-left rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-3 w-full text-left rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              {successMessage}
            </div>
          )}

          <div className="mt-6 w-full space-y-3">
            <button
              onClick={verifyEmail}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Verify Email Address'}
            </button>
            <button
              onClick={() => verifyEmail()}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-medium text-xs py-2.5 rounded-xl transition-all border border-white/5"
            >
              Resend Verification Code
            </button>
            <button
              onClick={logout}
              className="w-full bg-transparent hover:text-red-400 text-slate-400 font-medium text-xs py-2 rounded-xl transition-all"
            >
              Log Out Securely
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative select-none">
      {/* Dynamic Refraction Orb background */}
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

        {/* Auth Glass Box */}
        <motion.div
          layout
          className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative shadow-2xl overflow-hidden"
        >
          {error && (
            <div className="mb-4 p-3 text-left rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {error}
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
                        setMode('forgot');
                      }}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium transition-all"
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
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Ledger'}
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
                  <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Master Password</label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-2"
                >
                  {loading ? 'Creating Account...' : 'Initialize Credentials'}
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
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Dispatched...' : 'Dispatch Reset Credentials'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setMode('signin');
                  }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white transition-all font-medium pt-2 block"
                >
                  Back to Log In
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Social login option */}
          {mode !== 'forgot' && (
            <div className="mt-5 pt-5 border-t border-white/5 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest block mb-4">
                Or secure single sign-on
              </span>

              <button
                onClick={async () => {
                  clearMessages();
                  await loginWithGoogle();
                }}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 active:scale-95 text-white font-medium text-xs py-3 rounded-xl transition-all border border-white/10"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.28-.19-.57-.26-.87z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google SSO Verification
              </button>
            </div>
          )}
        </motion.div>

        {/* Auth mode toggle footer */}
        <div className="mt-5 text-center text-xs">
          {mode === 'signin' ? (
            <p className="text-slate-400">
              New to PayWorth?{' '}
              <button
                onClick={() => {
                  clearMessages();
                  setMode('signup');
                }}
                className="text-emerald-400 font-bold hover:underline"
              >
                Register Here
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-slate-400">
              Already possess an account?{' '}
              <button
                onClick={() => {
                  clearMessages();
                  setMode('signin');
                }}
                className="text-emerald-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
