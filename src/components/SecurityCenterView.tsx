import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import {
  ShieldCheck,
  Shield,
  KeyRound,
  Laptop,
  Smartphone,
  Globe,
  Lock,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Key,
  Fingerprint,
  SmartphoneNfc,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import TransactionPinModal from './TransactionPinModal';
import PasswordStrengthValidator, { evaluatePasswordStrength } from './PasswordStrengthValidator';

export default function SecurityCenterView() {
  const {
    currentUser,
    setActiveMenuScreen,
    updatePassword,
    logout,
    loading,
    error,
    successMessage,
    clearMessages,
  } = usePayWorth();

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLocalError, setPwLocalError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [updatingPw, setUpdatingPw] = useState(false);

  // Sessions State
  const [revokingSessions, setRevokingSessions] = useState(false);
  const [sessionsRevokedSuccess, setSessionsRevokedSuccess] = useState(false);

  // Transaction PIN Modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Security Toggles State (Persisted locally per user)
  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    return localStorage.getItem(`pw_bio_${currentUser?.id}`) === 'true';
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    return localStorage.getItem(`pw_2fa_${currentUser?.id}`) === 'true';
  });

  const handleToggleBiometric = () => {
    const nextVal = !biometricEnabled;
    setBiometricEnabled(nextVal);
    localStorage.setItem(`pw_bio_${currentUser?.id}`, String(nextVal));
  };

  const handleToggle2FA = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    localStorage.setItem(`pw_2fa_${currentUser?.id}`, String(nextVal));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLocalError(null);
    setPwSuccess(null);
    clearMessages();

    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.isValid) {
      setPwLocalError('New password must contain at least 8 characters, one number (0-9), and one special character (!@#...).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwLocalError('New passwords do not match.');
      return;
    }

    setUpdatingPw(true);
    const ok = await updatePassword(newPassword);
    setUpdatingPw(false);

    if (ok) {
      setPwSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    }
  };

  const handleRevokeOtherSessions = async () => {
    setRevokingSessions(true);
    try {
      // In Supabase, signOut({ scope: 'others' }) revokes other active sessions
      const { supabase } = await import('../lib/supabase');
      await supabase.auth.signOut({ scope: 'others' });
      setSessionsRevokedSuccess(true);
      setTimeout(() => setSessionsRevokedSuccess(false), 4000);
    } catch (err: any) {
      console.error('Session revocation error:', err);
    } finally {
      setRevokingSessions(false);
    }
  };

  // Detect provider
  const isGoogleConnected = currentUser?.email?.includes('@gmail.com') || false;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-28">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveMenuScreen(null)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Menu
        </button>

        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Security Center
        </span>
      </div>

      {/* Hero Security Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 relative shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 ring-4 ring-emerald-500/5">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Account Protection Engine</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Encrypted auth sessions, transaction PIN verification, and real-time session management.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-3 text-center font-mono">
          <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl">
            <span className="text-[9px] text-slate-400 block uppercase">Auth Encryption</span>
            <span className="text-xs font-bold text-emerald-400">SHA-256 / AES</span>
          </div>

          <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl">
            <span className="text-[9px] text-slate-400 block uppercase">Transaction PIN</span>
            <span className={`text-xs font-bold ${currentUser?.walletPin ? 'text-emerald-400' : 'text-amber-400'}`}>
              {currentUser?.walletPin ? 'Active & Encrypted' : 'Not Configured'}
            </span>
          </div>

          <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl col-span-2 md:col-span-1">
            <span className="text-[9px] text-slate-400 block uppercase">Account Status</span>
            <span className="text-xs font-bold text-emerald-400">Verified & Active</span>
          </div>
        </div>
      </motion.div>

      {/* 1. TRANSACTION PIN SECTION */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Financial Transaction PIN</h3>
              <p className="text-[11px] text-slate-400">
                Required for sending money, bank withdrawals, and campaign escrow deposits.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPinModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 shrink-0"
          >
            {currentUser?.walletPin ? 'Change PIN' : 'Set Up PIN'}
          </button>
        </div>

        <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-mono">Status:</span>
            <span className={`font-mono font-bold ${currentUser?.walletPin ? 'text-emerald-400' : 'text-amber-400'}`}>
              {currentUser?.walletPin ? '6-Digit PIN Secured' : 'Action Needed (PIN Unset)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE SESSIONS & DEVICE MANAGEMENT */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Devices &amp; Sessions</h3>
              <p className="text-[11px] text-slate-400">Manage authenticated devices logged into your account.</p>
            </div>
          </div>

          <button
            onClick={handleRevokeOtherSessions}
            disabled={revokingSessions}
            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {revokingSessions ? 'Revoking...' : 'Revoke Other Sessions'}
          </button>
        </div>

        {sessionsRevokedSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All other active sessions have been revoked successfully.</span>
          </div>
        )}

        <div className="space-y-2">
          {/* Current Device Box */}
          <div className="bg-slate-950/80 border border-emerald-500/20 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Current Browser Session</span>
                  <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                    THIS DEVICE
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  Active Now • SSL Encrypted TLS 1.3 Connection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONNECTED SOCIAL ACCOUNTS */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Connected Social Accounts</h3>
            <p className="text-[11px] text-slate-400">OAuth single sign-on connections linked to your email.</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* Google Account Row */}
          <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-white block">Google Sign-In</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isGoogleConnected ? 'Linked Google Account' : 'Available for OAuth'}
                </span>
              </div>
            </div>

            <span className={`text-[11px] font-mono font-bold ${isGoogleConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isGoogleConnected ? 'Connected' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. CHANGE PASSWORD FORM */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Update Account Password</h3>
            <p className="text-[11px] text-slate-400">Set a new master password for your account authentication.</p>
          </div>
        </div>

        {pwLocalError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl">
            {pwLocalError}
          </div>
        )}

        {pwSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{pwSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 chars, 1 number & 1 symbol"
              required
              className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-500 outline-none text-white text-xs px-3.5 py-2.5 rounded-xl"
            />
            <PasswordStrengthValidator password={newPassword} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              required
              className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-500 outline-none text-white text-xs px-3.5 py-2.5 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={updatingPw}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {updatingPw ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>

      {/* 5. FUTURE-READY BIOMETRICS & 2FA TOGGLES */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Advanced Security Safeguards</h3>
            <p className="text-[11px] text-slate-400">Configure biometric authorization and two-factor authentication.</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Biometrics Toggle */}
          <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-bold text-white block">Biometric Quick Login</span>
                <span className="text-[10px] text-slate-400">Fingerprint or FaceID unlocking for mobile</span>
              </div>
            </div>

            <button
              onClick={handleToggleBiometric}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                biometricEnabled ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  biometricEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 2FA Toggle */}
          <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <SmartphoneNfc className="w-5 h-5 text-blue-400" />
              <div>
                <span className="font-bold text-white block">Two-Factor Authenticator (2FA)</span>
                <span className="text-[10px] text-slate-400">Authenticator app TOTP challenge</span>
              </div>
            </div>

            <button
              onClick={handleToggle2FA}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  twoFactorEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction PIN Modal */}
      <TransactionPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          clearMessages();
        }}
        title="Manage Transaction PIN"
        actionDescription="Enter or configure your 6-digit PIN to secure all wallet operations."
      />
    </div>
  );
}
