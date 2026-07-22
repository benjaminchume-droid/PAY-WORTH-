import React from 'react';
import { usePayWorth } from '../engines/StateContext';
import { ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { setActiveMenuScreen } = usePayWorth();

  const handleOpenCookiePrefs = () => {
    window.dispatchEvent(new CustomEvent('open_cookie_preferences'));
  };

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 py-10 px-4 md:px-8 mt-auto font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-xs">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">PayWorth</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-sans text-xs max-w-sm">
              The premier crowdsourced micro-tasks and digital rewards platform. Built on transparent ledger auditing, escrow campaign pools, and instant settlement.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Status: All Operational (99.99%)</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setActiveMenuScreen('about')} className="hover:text-emerald-400 transition-colors">
                  About PayWorth
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Task Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('rewards')} className="hover:text-emerald-400 transition-colors">
                  Rewards & Multipliers
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('referral')} className="hover:text-emerald-400 transition-colors">
                  Referral Program
                </button>
              </li>
              <li>
                <span className="text-slate-600 cursor-not-allowed flex items-center gap-1">
                  Careers <span className="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-mono">Soon</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Governance */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Legal Repository</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setActiveMenuScreen('legal_center')} className="hover:text-emerald-400 font-semibold text-emerald-400/90 transition-colors flex items-center gap-1">
                  Legal Center <Sparkles className="w-3 h-3 text-amber-400" />
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('terms')} className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('privacy')} className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={handleOpenCookiePrefs} className="hover:text-emerald-400 transition-colors">
                  Cookie Preferences
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('community')} className="hover:text-emerald-400 transition-colors">
                  Community Guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Compliance & Support */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Compliance & Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setActiveMenuScreen('kyc')} className="hover:text-emerald-400 transition-colors">
                  KYC & AML Rules
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('acceptable_use')} className="hover:text-emerald-400 transition-colors">
                  Acceptable Use Policy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('reward_policy')} className="hover:text-emerald-400 transition-colors">
                  Reward & Campaign Policy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('contact')} className="hover:text-emerald-400 transition-colors">
                  Support Desk Ticket
                </button>
              </li>
              <li>
                <button onClick={() => setActiveMenuScreen('security')} className="hover:text-emerald-400 transition-colors">
                  Ledger Security
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © 2026 PayWorth Inc. All rights reserved. Registered Digital Rewards Platform.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveMenuScreen('legal_center')} className="hover:text-slate-300">
              v2026.1 Compliance Build
            </button>
            <span>•</span>
            <button onClick={() => setActiveMenuScreen('privacy')} className="hover:text-slate-300">
              Data Privacy Standard
            </button>
            <span>•</span>
            <button onClick={handleOpenCookiePrefs} className="hover:text-slate-300">
              Cookie Preferences
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
