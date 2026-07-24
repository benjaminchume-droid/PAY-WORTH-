import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { Sparkles, HelpCircle, Gift, Coins, Users, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export default function WelcomePopup() {
  const { currentUser, welcomeComplete } = usePayWorth();
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navError, setNavError] = useState<string | null>(null);

  if (!currentUser || currentUser.welcomeCompleted) return null;

  const handleStartExploring = async () => {
    setNavError(null);
    setIsNavigating(true);
    try {
      await welcomeComplete(dontShowAgain);
      navigate('/home');
    } catch (err: any) {
      console.error('Welcome screen navigation error:', err);
      setNavError('Unable to open PayWorth. Please try again.');
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full relative overflow-hidden shadow-2xl font-sans"
        >
          {/* Glass lighting effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Welcome to PayWorth</h3>
              <p className="text-[10px] text-slate-400 font-mono">Secure ledger ID: {currentUser.id}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Congratulations! Your profile has been cleared by our security engines. Here is how to navigate the platform safely:
          </p>

          <div className="space-y-3.5 mb-5">
            <div className="flex gap-3">
              <Coins className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Earn Genuine Coins</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Complete verify-and-payout tasks or play interactive mini-games to credit real PWC.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Users className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Referrals Network</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Share your code. When a contact signs up, both of you are rewarded with instant PWC credit.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Gift className="w-5 h-5 text-pink-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Daily Login & Lucky Wheel</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Spin the lucky wheel or claim daily multipliers. Active tiers scale reward payouts up to 5x.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-white">Trust & Fraud Mitigation</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Always upload real proof. Fraud penalties reduce Trust score. Keep it above 60 to request wires.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <button
              type="button"
              onClick={() => setDontShowAgain(!dontShowAgain)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                dontShowAgain
                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
            >
              {dontShowAgain && <Check className="w-3 h-3 stroke-[3]" />}
            </button>
            <span className="text-[11px] text-slate-400 select-none cursor-pointer" onClick={() => setDontShowAgain(!dontShowAgain)}>
              Never show this welcome popup again
            </span>
          </div>

          {navError && (
            <div className="mb-4 text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{navError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartExploring}
            disabled={isNavigating}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isNavigating ? 'Opening PayWorth...' : 'Start Exploring PayWorth'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
