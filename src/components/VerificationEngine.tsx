import React, { useEffect, useState } from 'react';
import { usePayWorth } from '../engines/StateContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, AlertCircle, Wallet, Sparkles, RefreshCw } from 'lucide-react';

export default function VerificationEngine() {
  const { currentUser, setSuccessMessage, setError, setActiveTab, setActiveMenuScreen } = usePayWorth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'already_verified' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(4);

  useEffect(() => {
    let mounted = true;

    async function processVerification() {
      try {
        setStatus('verifying');

        // 1. Check if Supabase passed a token hash in URL query or hash fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
        const type = hashParams.get('type') || queryParams.get('type');
        const code = queryParams.get('code');

        // If tokens exist in hash, set session explicitly
        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionErr) throw sessionErr;
        } else if (code) {
          const { error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (codeErr) console.warn('PKCE code exchange note:', codeErr.message);
        }

        // 2. Retrieve active session
        const { data: { session }, error: authErr } = await supabase.auth.getSession();
        
        if (authErr) throw authErr;

        if (session?.user) {
          const user = session.user;
          setUserEmail(user.email || '');

          // Check DB user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('emailVerified, id')
            .eq('id', user.id)
            .maybeSingle();

          // Mark email as verified in database profiles table
          await supabase
            .from('profiles')
            .update({ emailVerified: true, email: user.email })
            .eq('id', user.id);

          if (profile?.emailVerified) {
            if (mounted) setStatus('already_verified');
          } else {
            if (mounted) setStatus('success');
          }

          // Clean up hash/query params from URL bar cleanly
          window.history.replaceState({}, document.title, '/verify');

          // Trigger state refresh in background
          setSuccessMessage('Your PayWorth account email has been verified successfully!');
        } else {
          // If no active session found, check if user is already logged in via app state
          if (currentUser) {
            setUserEmail(currentUser.email);
            if (currentUser.emailVerified) {
              setStatus('already_verified');
            } else {
              await supabase.from('profiles').update({ emailVerified: true }).eq('id', currentUser.id);
              setStatus('success');
            }
          } else {
            setStatus('error');
            setErrorMessage('No active verification payload or authentication token found. Please click the link directly from your verification email or sign in.');
          }
        }
      } catch (err: any) {
        console.error('Verification engine error:', err);
        if (mounted) {
          setStatus('error');
          setErrorMessage(err?.message || 'An error occurred during verification. Please request a new verification link from your account settings.');
        }
      }
    }

    processVerification();

    return () => {
      mounted = false;
    };
  }, [currentUser, setSuccessMessage]);

  // Auto-redirect countdown on success
  useEffect(() => {
    if (status === 'success' || status === 'already_verified') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleProceedToApp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status]);

  const handleProceedToApp = () => {
    setActiveMenuScreen(null);
    setActiveTab('home');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glass background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Liquid Glass Verification Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-indigo-950/40 text-center">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center font-bold text-white text-lg">
              P
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-wider text-white">PAY<span className="text-emerald-400">WORTH</span></span>
        </div>

        {/* State: Verifying */}
        {status === 'verifying' && (
          <div className="py-8 space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin flex items-center justify-center" />
              <ShieldCheck className="w-8 h-8 text-indigo-400 absolute" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Authenticating Verification Payload</h2>
              <p className="text-slate-400 text-sm">
                Validating cryptographic tokens and synchronizing your account verification status with the ledger...
              </p>
            </div>
          </div>
        )}

        {/* State: Success */}
        {status === 'success' && (
          <div className="py-4 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Account Verified
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Successfully Verified!</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {userEmail ? <span className="font-semibold text-white">{userEmail}</span> : 'Your account'} is now fully verified on PayWorth. All withdrawal features, task rewards, and referral bonuses have been unlocked.
              </p>
            </div>

            {/* Unlocked Benefits summary */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Wallet className="w-4 h-4" /> Virtual Wallet Unlocked & PWC Ledger Active
              </div>
              <div className="flex items-center gap-2 text-indigo-400 font-medium">
                <ShieldCheck className="w-4 h-4" /> Trust Score Rating Boost (+20 Points)
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleProceedToApp}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Enter PayWorth App ({countdown}s)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* State: Already Verified */}
        {status === 'already_verified' && (
          <div className="py-4 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/10">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Account Already Verified</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Your email address {userEmail && <span className="font-semibold text-white">({userEmail})</span>} is already fully verified and active on the platform.
              </p>
            </div>

            <button
              onClick={handleProceedToApp}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Go to Dashboard ({countdown}s)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* State: Error */}
        {status === 'error' && (
          <div className="py-4 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10">
              <AlertCircle className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">Verification Error</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleProceedToApp}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all cursor-pointer"
              >
                Go to Sign In / App
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
