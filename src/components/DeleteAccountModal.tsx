import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, Lock, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (password: string) => Promise<void>;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirmDelete
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleStep1Next = () => {
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!password) {
      setErrorMsg('Please enter your account password.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleFinalDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'DELETE MY ACCOUNT') {
      setErrorMsg('Confirmation string does not match.');
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMsg('');
      await onConfirmDelete(password);
    } catch (err: any) {
      setIsDeleting(false);
      setErrorMsg(err?.message || 'Failed to delete account. Please verify password.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full relative shadow-2xl space-y-5"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
              Irreversible Action
            </span>
            <h2 className="text-base font-bold text-white mt-1">Delete PayWorth Account</h2>
            <p className="text-xs text-slate-400 font-mono">Step {step} of 3</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: WARNING & CONSEQUENCES */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-300 font-sans">
              <p className="font-bold text-white">By deleting your account, you will permanently lose:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>All remaining PayWorth Coin (PWC) balances and pending rewards.</li>
                <li>Your membership tier status and multiplier privileges.</li>
                <li>All referral history, active worker pools, and earnings history.</li>
                <li>Your virtual bank account credentials and transaction logs.</li>
                <li>Access to created campaigns and active escrow reserves.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleStep1Next}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              I Understand the Risks, Proceed
            </button>
          </div>
        )}

        {/* STEP 2: PASSWORD VERIFICATION */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase block">
                Enter Account Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500/50"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-800 text-slate-300 font-bold text-xs py-3 rounded-xl"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Verify Password
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FINAL CONFIRMATION TEXT */}
        {step === 3 && (
          <form onSubmit={handleFinalDelete} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-mono uppercase block">
                Type <strong className="text-rose-400">DELETE MY ACCOUNT</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-rose-500/50 font-mono"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-slate-800 text-slate-300 font-bold text-xs py-3 rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={confirmText !== 'DELETE MY ACCOUNT' || isDeleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
