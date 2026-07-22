import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, Shield, Check, X, Sliders, ChevronRight } from 'lucide-react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  updatedAt: string;
}

export function getStoredCookiePreferences(): CookiePreferences | null {
  try {
    const saved = localStorage.getItem('payworth_cookie_preferences');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveCookiePreferences(prefs: Omit<CookiePreferences, 'updatedAt'>) {
  const full: CookiePreferences = {
    ...prefs,
    necessary: true,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem('payworth_cookie_preferences', JSON.stringify(full));
  } catch (err) {
    console.error('Failed to save cookie preferences:', err);
  }
  return full;
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Preference states
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [personalization, setPersonalization] = useState(true);

  useEffect(() => {
    const saved = getStoredCookiePreferences();
    if (!saved) {
      setIsVisible(true);
    } else {
      setAnalytics(saved.analytics);
      setMarketing(saved.marketing);
      setPersonalization(saved.personalization);
    }

    // Listen for custom event to re-open banner/settings anytime
    const handleReopen = () => {
      setShowCustomizeModal(true);
    };
    window.addEventListener('open_cookie_preferences', handleReopen);
    return () => window.removeEventListener('open_cookie_preferences', handleReopen);
  }, []);

  const handleAcceptAll = () => {
    saveCookiePreferences({ necessary: true, analytics: true, marketing: true, personalization: true });
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    saveCookiePreferences({ necessary: true, analytics: false, marketing: false, personalization: false });
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    saveCookiePreferences({ necessary: true, analytics, marketing, personalization });
    setShowCustomizeModal(false);
    setIsVisible(false);
  };

  return (
    <>
      {/* Floating Bottom Cookie Consent Banner */}
      <AnimatePresence>
        {isVisible && !showCustomizeModal && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50 bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Cookie & Privacy Preferences
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  PayWorth uses essential cookies to ensure secure logins and fraud protection, alongside optional cookies to improve performance and personalize experience.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 px-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-3 rounded-xl border border-slate-700/60 transition-all"
              >
                Reject Optional
              </button>
              <button
                onClick={() => setShowCustomizeModal(true)}
                className="p-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700/50 transition-all text-xs flex items-center gap-1 font-mono"
                title="Customize preferences"
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">Customize</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customize Cookie Modal */}
      <AnimatePresence>
        {showCustomizeModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full relative shadow-2xl space-y-5"
            >
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl shrink-0">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Customize Cookie Preferences</h3>
                  <p className="text-xs text-slate-400 font-mono">Manage granular consent choices</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {/* Necessary (Always Active) */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Strictly Necessary</span>
                      <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">Always Active</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Essential for authentication, secure wallet sessions, and anti-fraud monitoring.
                    </p>
                  </div>
                  <input type="checkbox" checked disabled className="w-4 h-4 accent-emerald-500 opacity-50 cursor-not-allowed" />
                </div>

                {/* Analytics */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Analytics & Performance</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Allows us to gather aggregate metrics to optimize page load speeds and task verification queues.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Marketing */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Marketing & Campaigns</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Enables targeted task recommendations, referral promotional events, and partner campaign alerts.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Personalization */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">Personalization</span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Remembers theme preferences, currency displays, and favorite marketplace filters.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={personalization}
                    onChange={(e) => setPersonalization(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowCustomizeModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
