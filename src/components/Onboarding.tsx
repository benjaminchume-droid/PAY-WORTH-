import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { Coins, ShieldAlert, Award, ArrowRight, ArrowLeft, Layers, Trophy, CheckCircle } from 'lucide-react';

export default function Onboarding() {
  const { onboardingComplete } = usePayWorth();
  const [page, setPage] = useState(1);

  const handleNext = () => {
    if (page < 5) {
      setPage((p) => p + 1);
    } else {
      onboardingComplete();
    }
  };

  const handleBack = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const handleSkip = () => {
    onboardingComplete();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6 select-none overflow-hidden relative font-sans">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />

      {/* Header bar */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Coins className="text-slate-950 w-4.5 h-4.5" />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white font-mono">PAYWORTH</span>
        </div>
        {page < 5 && (
          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-white transition-all font-medium bg-white/5 px-3 py-1 rounded-full border border-white/5 hover:bg-white/10"
          >
            Skip Intro
          </button>
        )}
      </div>

      {/* Core slide container */}
      <div className="flex-1 flex items-center justify-center my-6 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 50, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center shadow-2xl"
          >
            {/* Claymorphism style circle */}
            <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-white/2 rounded-full blur-md pointer-events-none" />

            {/* Render slide visuals & details */}
            {page === 1 && (
              <>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10 animate-pulse">
                  <Coins className="text-slate-950 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  Earning Elevated to a Premium Art
                </h2>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Welcome to PayWorth, a prestigious marketplace powered by liquid glass design, trusted cryptographic ledgers, and secure task monetization.
                </p>
              </>
            )}

            {page === 2 && (
              <>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10">
                  <Layers className="text-slate-950 w-9 h-9" />
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  What is PayWorth?
                </h2>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Earn <strong className="text-emerald-400">PayWorth Coins (PWC)</strong> by completing community assignments, playing anti-bot mini games, or creating your own automated advertiser campaigns with our secure Escrow system.
                </p>
              </>
            )}

            {page === 3 && (
              <>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20 ring-4 ring-purple-500/10 animate-bounce">
                  <Award className="text-slate-950 w-9 h-9" />
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  How Earning Works
                </h2>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Select a task, submit completed evidence (screenshot upload or text link), and wait for instant system verification or dedicated advertiser auditing. Balance credits directly onto your immutable ledger.
                </p>
              </>
            )}

            {page === 4 && (
              <>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/20 ring-4 ring-amber-500/10">
                  <Trophy className="text-slate-950 w-9 h-9" />
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  Elite Membership Tiers
                </h2>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Upgrade your ranks from Bronze to Bright Iron, Shining Silver, and Shimmering Gold to unlock massive payout multipliers up to <strong className="text-amber-400">5.0x</strong>, bypass withdrawal fees, and join global leaders.
                </p>
              </>
            )}

            {page === 5 && (
              <>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center mb-6 shadow-xl shadow-teal-500/20 ring-4 ring-teal-500/10">
                  <ShieldAlert className="text-slate-950 w-9 h-9" />
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">
                  Trust Score & Safety Guards
                </h2>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Our core security engine tracks user trust levels. Fake evidence or spam triggers automatic score penalties. Maintain high trust to request wires, cash out, and access high-paying business contracts.
                </p>
              </>
            )}

            {/* Page dot indicator */}
            <div className="flex gap-1.5 mt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    page === i ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </motion.div>
          </AnimatePresence>
        </div>

      {/* Footer controls */}
      <div className="flex justify-between items-center z-10 max-w-sm mx-auto w-full">
        {page > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all font-medium bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-5 py-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all font-bold rounded-2xl px-6 py-3.5 shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          {page === 5 ? (
            <>
              Start Exploring <CheckCircle className="w-4 h-4" />
            </>
          ) : (
            <>
              Next <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
