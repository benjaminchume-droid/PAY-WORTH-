import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { generateReadableUsername, saveOnboardingDraft, getOnboardingDraft } from '../lib/draftRecovery';
import { checkUsernameUniquenessRealtime } from '../lib/usernameCheck';
import { Coins, ShieldAlert, Award, ArrowRight, ArrowLeft, Layers, Trophy, UserCheck, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

export default function Onboarding() {
  const { currentUser, onboardingComplete, checkUsernameAvailability, completeProfile, loading, setActiveMenuScreen } = usePayWorth();
  
  // Restore draft or start at page 1
  const savedDraft = getOnboardingDraft();
  const [page, setPage] = useState(savedDraft?.step || 1);

  // Check URL ref or local ref
  const urlRef = new URLSearchParams(window.location.search).get('ref') || localStorage.getItem('pw_ref') || '';
  const isUrlRefLocked = Boolean(new URLSearchParams(window.location.search).get('ref'));

  // Profile setup states
  const [usernameInput, setUsernameInput] = useState(savedDraft?.username || currentUser?.username || '');
  const [referralInput, setReferralInput] = useState(urlRef || savedDraft?.referralCode || '');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Save progress draft whenever inputs or step change
  useEffect(() => {
    saveOnboardingDraft({
      step: page,
      username: usernameInput,
      referralCode: referralInput,
    });
  }, [page, usernameInput, referralInput]);

  const handleNext = async () => {
    if (page < 5) {
      setPage((p) => p + 1);
    } else if (page === 5) {
      setPage(6); // Go to Profile Completion step
    } else if (page === 6) {
      // Execute profile completion
      setProfileError(null);
      let targetUsername = usernameInput.trim();

      // If user left username blank: Automatically generate a premium readable username!
      if (!targetUsername) {
        let generated = generateReadableUsername();
        let availCheck = await checkUsernameAvailability(generated);
        let retries = 0;
        while (!availCheck.available && retries < 5) {
          generated = generateReadableUsername();
          availCheck = await checkUsernameAvailability(generated);
          retries++;
        }
        if (!availCheck.available) {
          generated = `${generated}-${Math.floor(10 + Math.random() * 90)}`;
        }
        targetUsername = generated;
        setUsernameInput(generated);
      }

      setCheckingUsername(true);
      const avail = await checkUsernameAvailability(targetUsername);
      setCheckingUsername(false);

      if (!avail.available) {
        setUsernameAvailable(false);
        setSuggestions(avail.suggestions || [
          generateReadableUsername(),
          generateReadableUsername(),
          generateReadableUsername()
        ]);
        setProfileError('This handle is reserved or taken. Please select one of the suggested handles below or type a unique handle.');
        return;
      }

      const ok = await completeProfile({
        username: targetUsername,
        referralCode: referralInput || undefined,
      });

      if (ok) {
        onboardingComplete();
      }
    }
  };

  const handleAutoGenerate = () => {
    const sug = generateReadableUsername();
    setUsernameInput(sug);
    setUsernameAvailable(true);
    setSuggestions([]);
    setProfileError(null);
  };

  const handleCheckUsername = async (val: string) => {
    setUsernameInput(val);
    setProfileError(null);
    if (val.trim().length >= 3) {
      setCheckingUsername(true);
      const res = await checkUsernameUniquenessRealtime(val, currentUser?.id);
      setCheckingUsername(false);
      setUsernameAvailable(res.isAvailable);
      setSuggestions(res.suggestions || []);
      if (!res.isAvailable) {
        setProfileError(res.message);
      }
    } else {
      setUsernameAvailable(null);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (sug: string) => {
    setUsernameInput(sug);
    setUsernameAvailable(true);
    setSuggestions([]);
    setProfileError(null);
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
        {page < 6 && (
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
                  Trust Score &amp; Safety Guards
                </h2>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Our core security engine tracks user trust levels. Fake evidence or spam triggers automatic score penalties. Maintain high trust to request wires, cash out, and access high-paying business contracts.
                </p>
              </>
            )}

            {page === 6 && (
              <div className="w-full text-left space-y-4">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Complete Your Handle</h2>
                  <p className="text-xs text-slate-300 mt-1">Set your unique platform handle &amp; referral link.</p>
                </div>

                {profileError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Unique Handle</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAutoGenerate}
                        className="text-[10px] text-emerald-400 font-mono hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> Auto-generate
                      </button>
                      {checkingUsername && <span className="text-[10px] text-amber-400 font-mono animate-pulse">Checking...</span>}
                      {usernameAvailable === true && <span className="text-[10px] text-emerald-400 font-mono font-bold">✓ Available!</span>}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => handleCheckUsername(e.target.value)}
                    placeholder="Leave blank to auto-generate readable handle"
                    className="w-full bg-slate-950/80 border border-white/10 focus:border-emerald-500 outline-none text-white text-xs px-3.5 py-3 rounded-xl transition-all font-mono"
                  />
                  <p className="text-[10px] text-slate-400 font-sans">
                    Leaving handle blank will automatically generate a premium readable name (e.g. emerald-horizon).
                  </p>
                </div>

                {/* Suggestions if handle taken */}
                {suggestions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono block">Available Suggested Handles:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => handleSelectSuggestion(sug)}
                          className="text-xs font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          @{sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Referral Code (Optional)</label>
                    {isUrlRefLocked && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                        Locked from referral link
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    readOnly={isUrlRefLocked}
                    placeholder="e.g. FOUNDER99"
                    className={`w-full bg-slate-950/80 border border-white/10 outline-none text-white text-xs px-3.5 py-3 rounded-xl transition-all font-mono ${
                      isUrlRefLocked ? 'opacity-80 text-emerald-400 cursor-not-allowed' : 'focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Page dot indicator */}
            <div className="flex gap-1.5 mt-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
      <div className="flex flex-col gap-3 z-10 max-w-sm mx-auto w-full">
        <div className="flex justify-between items-center w-full">
          {page > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all font-medium bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl px-5 py-3 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all font-bold rounded-2xl px-6 py-3.5 shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {page === 6 ? (
              <>
                {loading ? 'Finalizing Profile...' : 'Complete Profile & Enter'} <CheckCircle className="w-4 h-4" />
              </>
            ) : page === 5 ? (
              <>
                Set Handle <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {page === 6 && (
          <p className="text-[11px] text-slate-400 text-center font-sans leading-relaxed pt-1">
            By selecting Continue, you agree to the{' '}
            <button
              type="button"
              onClick={() => setActiveMenuScreen('terms')}
              className="text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Terms of Service
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => setActiveMenuScreen('privacy')}
              className="text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Privacy Policy
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open_cookie_preferences'))}
              className="text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Cookie Policy
            </button>
            , and{' '}
            <button
              type="button"
              onClick={() => setActiveMenuScreen('legal_center')}
              className="text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Community Guidelines
            </button>
            .
          </p>
        )}
      </div>
    </div>
  );
}

