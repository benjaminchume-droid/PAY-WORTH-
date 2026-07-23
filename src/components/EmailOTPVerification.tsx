import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ArrowLeft, Edit3, Sparkles, Lock, Coins } from 'lucide-react';

interface EmailOTPVerificationProps {
  email?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export default function EmailOTPVerification({
  email: initialEmail,
  onSuccess,
  onCancel,
  isModal = false,
}: EmailOTPVerificationProps) {
  const {
    currentUser,
    pendingOtpEmail,
    verifyOtpCode,
    resendOtpCode,
    changeEmail,
    setActiveMenuScreen,
    setActiveTab,
    logout,
    loading: globalLoading,
    setError: setGlobalError,
    setSuccessMessage: setGlobalSuccess,
  } = usePayWorth();

  // Target Email: explicit prop -> pendingOtpEmail -> currentUser email -> fallback
  const targetEmail = initialEmail || pendingOtpEmail || currentUser?.email || '';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [activeInputIndex, setActiveInputIndex] = useState<number>(0);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);

  // Cooldown & Resend state
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [resendCount, setResendCount] = useState<number>(0);

  // Email Editing state
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [editingEmailValue, setEditingEmailValue] = useState<string>(targetEmail);

  // Input Refs array for auto-focus navigation
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input box on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown timer interval
  useEffect(() => {
    let interval: any;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle individual OTP input changes
  const handleOtpChange = (val: string, index: number) => {
    const digit = val.replace(/\D/g, '').slice(-1); // Only numeric digits
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Clear error message on user input
    if (errorMessage) setErrorMessage(null);
    if (status === 'error') setStatus('idle');

    // Auto-advance to next input field
    if (digit && index < 5) {
      setActiveInputIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are populated
    const fullCode = newOtp.join('');
    if (fullCode.length === 6 && !verifying) {
      handleVerify(fullCode);
    }
  };

  // Handle backspace and keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous box if current box is empty
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setActiveInputIndex(index - 1);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveInputIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      setActiveInputIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Clipboard Paste (e.g. 123456)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const digits = pastedData.split('');
      const newOtp = ['', '', '', '', '', ''];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);

      const focusIndex = Math.min(digits.length, 5);
      setActiveInputIndex(focusIndex);
      inputRefs.current[focusIndex]?.focus();

      // Auto verify if full 6 digits pasted
      if (pastedData.length === 6) {
        handleVerify(pastedData);
      }
    }
  };

  // Submit & Verify OTP via Supabase Auth
  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join('');
    if (code.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      triggerShake();
      return;
    }

    if (!targetEmail) {
      setErrorMessage('Missing target email address. Please request a new code.');
      return;
    }

    setVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await verifyOtpCode(targetEmail, code);
      if (res.success) {
        setStatus('success');
        setSuccessMessage('Email verified successfully! Loading your dashboard...');

        // Trigger success callback after short animation delay
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            setActiveMenuScreen(null);
            setActiveTab('home');
          }
        }, 1500);
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'Invalid verification code. Please check your email and try again.');
        triggerShake();
      }
    } catch (err: any) {
      console.error('OTP verification failed:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Verification failed. Token may have expired.');
      triggerShake();
    } finally {
      setVerifying(false);
    }
  };

  // Resend OTP Code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    if (resendCount >= 5) {
      setErrorMessage('Maximum resend attempts reached. Please wait a few minutes before requesting another code.');
      triggerShake();
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const success = await resendOtpCode(targetEmail);
    if (success) {
      setResendCooldown(60);
      setResendCount((prev) => prev + 1);
      setSuccessMessage(`A fresh 6-digit OTP code has been dispatched to ${targetEmail}`);
      // Clear current input
      setOtp(['', '', '', '', '', '']);
      setActiveInputIndex(0);
      inputRefs.current[0]?.focus();
    } else {
      setErrorMessage('Failed to send verification code. Please try again.');
      triggerShake();
    }
  };

  // Handle Email Change Submit
  const handleSaveNewEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingEmailValue)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage(null);
    const ok = await changeEmail(editingEmailValue.trim());
    if (ok) {
      setIsEditingEmail(false);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setActiveInputIndex(0);
      inputRefs.current[0]?.focus();
    }
  };

  // Trigger error shake animation
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const isOtpComplete = otp.join('').length === 6;

  return (
    <div className={`flex flex-col items-center justify-center ${isModal ? 'p-2' : 'min-h-screen bg-slate-950 p-4 md:p-6'} relative overflow-hidden select-none`}>
      {/* Background Liquid Glass Ambient Glows */}
      {!isModal && (
        <>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Main OTP Verification Card */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-emerald-950/50 text-center relative z-10 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Top Accent Emerald Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-t-3xl" />

        {/* Brand/Portal Header */}
        <div className="flex items-center justify-between mb-6">
          {onCancel ? (
            <button
              onClick={onCancel}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-white">PAY<span className="text-emerald-400">WORTH</span></span>
            </div>
          )}

          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-semibold">
            <Lock className="w-3 h-3" /> OTP Verification
          </div>
        </div>

        {/* Verification Icon Header */}
        <div className="relative inline-flex items-center justify-center mb-5">
          {status === 'success' ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner relative group">
              <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 animate-pulse pointer-events-none" />
              <Mail className="w-9 h-9 text-emerald-400 relative z-10" />
            </div>
          )}
        </div>

        {/* Title & Email Display */}
        <h2 className="text-2xl font-black text-white tracking-tight mb-2">
          {status === 'success' ? 'Email Verified!' : 'Verify Your Email'}
        </h2>

        {!isEditingEmail ? (
          <div className="text-slate-300 text-xs mb-6 space-y-1">
            <p>We've dispatched a secure 6-digit verification code to:</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-emerald-400 font-mono font-bold text-xs mt-1">
              <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px]">{targetEmail}</span>
              <button
                type="button"
                onClick={() => {
                  setIsEditingEmail(true);
                  setEditingEmailValue(targetEmail);
                }}
                className="ml-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Edit email address"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveNewEmail} className="mb-6 space-y-3 bg-slate-950 border border-slate-800 p-3 rounded-2xl">
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block text-left">Update Email Address</label>
            <input
              type="email"
              value={editingEmailValue}
              onChange={(e) => setEditingEmailValue(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl outline-none focus:border-emerald-500 font-mono"
              placeholder="e.g. user@payworth.com"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
              >
                Save &amp; Request OTP
              </button>
              <button
                type="button"
                onClick={() => setIsEditingEmail(false)}
                className="bg-slate-800 text-slate-300 font-medium text-xs px-3 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Feedback Banners */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-left font-sans flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-left font-sans flex items-start gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </motion.div>
        )}

        {/* 6-Digit Segmented OTP Input Boxes */}
        {status !== 'success' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 md:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  onFocus={() => setActiveInputIndex(index)}
                  className={`w-11 h-14 md:w-12 md:h-16 text-center text-xl md:text-2xl font-black font-mono rounded-2xl border transition-all outline-none ${
                    digit
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10 scale-105'
                      : activeInputIndex === index
                      ? 'bg-slate-950 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                  disabled={verifying}
                />
              ))}
            </div>

            {/* Verification Submit Button */}
            <button
              onClick={() => handleVerify()}
              disabled={!isOtpComplete || verifying}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 active:scale-98 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {verifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend OTP Section */}
            <div className="pt-2 flex flex-col items-center gap-2 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || globalLoading || verifying}
                  className="text-emerald-400 hover:text-emerald-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {resendCooldown > 0 ? (
                    `Resend in 00:${resendCooldown < 10 ? `0${resendCooldown}` : resendCooldown}`
                  ) : (
                    'Resend Code'
                  )}
                </button>
              </div>

              {resendCooldown > 0 && (
                <span className="text-[10px] font-mono text-slate-500">
                  Rate limit protection active to prevent abuse.
                </span>
              )}
            </div>

            {/* Security Guarantee Note */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 text-left space-y-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Instant Account Activation
              </div>
              <p>Entering the 6-digit OTP code immediately verifies your email, unlocks your virtual wallet ledger, and awards your welcome bonus.</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              Authentication token verified &amp; profile active! Redirecting to PayWorth workspace...
            </div>
          </div>
        )}

        {/* Option to Logout / Sign in as different user */}
        {logout && currentUser && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs text-slate-400">
            <span>Signed in as <strong className="text-white font-mono">{currentUser.username}</strong></span>
            <button
              onClick={() => logout()}
              className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
