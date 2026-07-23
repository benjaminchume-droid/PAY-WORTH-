import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, KeyRound, X } from 'lucide-react';

interface TransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  actionDescription?: string;
}

export default function TransactionPinModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Authorize Transaction',
  actionDescription = 'Enter your 6-digit Security PIN to authorize this financial action.',
}: TransactionPinModalProps) {
  const { currentUser, setTransactionPin, verifyTransactionPin } = usePayWorth();

  const isCreatingPin = !currentUser?.walletPin;

  // States
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState<string[]>(['', '', '', '', '', '']);
  const [step, setStep] = useState<'enter' | 'create' | 'confirm'>('enter');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '', '', '']);
      setConfirmPin(['', '', '', '', '', '']);
      setErrorMsg(null);
      setSuccessMsg(null);
      setStep(isCreatingPin ? 'create' : 'enter');

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen, isCreatingPin]);

  if (!isOpen) return null;

  const currentArray = step === 'confirm' ? confirmPin : pin;
  const setCurrentArray = step === 'confirm' ? setConfirmPin : setPin;

  const handleInputChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue && value !== '') return;

    const newArr = [...currentArray];

    if (cleanValue.length > 1) {
      // Handle paste of 6 digits
      const digits = cleanValue.slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (i < 6) newArr[i] = d;
      });
      setCurrentArray(newArr);

      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newArr[index] = cleanValue;
    setCurrentArray(newArr);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !currentArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const enteredPinString = pin.join('');

    if (step === 'enter') {
      if (enteredPinString.length < 6) {
        setErrorMsg('Please enter all 6 digits of your transaction PIN.');
        return;
      }

      setLoading(true);
      const isValid = await verifyTransactionPin(enteredPinString);
      setLoading(false);

      if (isValid) {
        setSuccessMsg('PIN Verified Successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 600);
      } else {
        setErrorMsg('Incorrect Transaction PIN. Please verify and try again.');
        setPin(['', '', '', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      }
    } else if (step === 'create') {
      if (enteredPinString.length < 6) {
        setErrorMsg('PIN must be exactly 6 digits.');
        return;
      }
      setStep('confirm');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } else if (step === 'confirm') {
      const confirmedPinString = confirmPin.join('');
      if (confirmedPinString.length < 6) {
        setErrorMsg('Please confirm all 6 digits of your PIN.');
        return;
      }

      if (enteredPinString !== confirmedPinString) {
        setErrorMsg('PINs do not match. Please re-enter.');
        setConfirmPin(['', '', '', '', '', '']);
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
        return;
      }

      setLoading(true);
      const ok = await setTransactionPin(enteredPinString);
      setLoading(false);

      if (ok) {
        setSuccessMsg('Transaction PIN Created & Saved!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      } else {
        setErrorMsg('Failed to save Transaction PIN. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 relative shadow-2xl overflow-hidden backdrop-blur-2xl"
      >
        {/* Top ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Visual */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center ring-4 ring-emerald-500/5 shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {step === 'create'
              ? 'Set Transaction PIN'
              : step === 'confirm'
              ? 'Confirm Transaction PIN'
              : title}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
            {step === 'create'
              ? 'Create a secure 6-digit PIN to protect your wallet transfers and withdrawals.'
              : step === 'confirm'
              ? 'Re-type your 6-digit PIN to verify and store it securely.'
              : actionDescription}
          </p>
        </div>

        {/* Error / Success Feedback Alerts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center gap-2">
            {currentArray.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-xl border outline-none transition-all ${
                  digit
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/10'
                    : 'border-white/10 bg-slate-950/80 text-white focus:border-emerald-400 focus:bg-white/5'
                }`}
              />
            ))}
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading || currentArray.join('').length < 6}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : step === 'create' ? (
                'Continue to Confirmation'
              ) : step === 'confirm' ? (
                'Save PIN & Authorize'
              ) : (
                'Confirm & Execute Action'
              )}
            </button>

            {step === 'confirm' && (
              <button
                type="button"
                onClick={() => {
                  setStep('create');
                  setConfirmPin(['', '', '', '', '', '']);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition-all py-1 cursor-pointer"
              >
                Back to PIN Entry
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
