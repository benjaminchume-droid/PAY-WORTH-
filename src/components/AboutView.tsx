import React from 'react';
import { motion } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  Users,
  CheckCircle2,
  FileText,
  Lock,
  ArrowRight,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export default function AboutView() {
  const { setActiveMenuScreen } = usePayWorth();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 max-w-5xl mx-auto space-y-10 pb-20">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" /> Empowering Next-Gen Crowd Micro-Economy
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">PayWorth</span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
          PayWorth is a modern digital rewards platform and micro-task marketplace bridging campaign creators, workers, and digital commerce.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Our Mission</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            To make digital earning transparent, accessible, and instantly verifiable for millions of individuals while giving businesses verified crowd engagement powered by escrow protection.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Our Vision</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            To build the world’s most trusted micro-tasks & community ledger ecosystem—where every task performed is cryptographically audited and every reward is backed by real value.
          </p>
        </div>
      </div>

      {/* How PayWorth Works Step-by-Step */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white">How PayWorth Works</h2>
          <p className="text-xs text-slate-400 font-mono">Simple four-step ecosystem flow</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400">01. Join & Verify</span>
            <h3 className="text-sm font-bold text-white">Create Account</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Sign up securely with email and password, verify your email address, and unlock your starter PWC wallet.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400">02. Perform Tasks</span>
            <h3 className="text-sm font-bold text-white">Earn PWC Coins</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Complete verified social, survey, or app tasks to earn PayWorth Coins (PWC) with tier multipliers.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400">03. Marketplace Escrow</span>
            <h3 className="text-sm font-bold text-white">Create Campaigns</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Advertisers lock PWC in escrow pools to launch engagement campaigns with automated worker proof audits.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400">04. Settlement</span>
            <h3 className="text-sm font-bold text-white">Withdraw Funds</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Convert verified PWC to supported fiat virtual accounts or bank transfers seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Security Specifications */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h2 className="text-base font-bold text-white">Trust, Compliance & Security</h2>
            <p className="text-xs text-slate-400 font-mono">Enterprise Grade Protections</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300 font-sans">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> AES-256 Encryption
            </h3>
            <p className="text-[11px] text-slate-400">
              All transaction records, user proofs, and ledger balances are cryptographically signed and encrypted.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Fraud Detection
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time bot prevention, IP cluster monitoring, and proof verification stop fake task submissions.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" /> Full Regulatory Compliance
            </h3>
            <p className="text-[11px] text-slate-400">
              Complete KYC/AML verification tiers and transparent, accessible legal documentation repository.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Legal Repository Nav Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 text-center">
        <h2 className="text-base font-bold text-white">Official Legal & Transparency Repository</h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto font-sans">
          Access our complete 18-part legal agreements directly in the Legal Center.
        </p>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <button
            onClick={() => setActiveMenuScreen('legal_center')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Open Legal Center
          </button>
          <button
            onClick={() => setActiveMenuScreen('terms')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700/60 transition-all"
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveMenuScreen('privacy')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700/60 transition-all"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open_cookie_preferences'));
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700/60 transition-all"
          >
            Cookie Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
