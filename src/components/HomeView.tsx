import React, { useState } from 'react';
import { motion } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import {
  Coins,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Gift,
  HelpCircle,
  Copy,
  ChevronRight,
  UserCheck,
  UserPlus
} from 'lucide-react';

export default function HomeView() {
  const {
    currentUser,
    claimDailyReward,
    setActiveTab,
    setActiveMenuScreen,
    state,
  } = usePayWorth();

  const [claimLoading, setClaimLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if daily reward claimed today
  const nowStr = new Date().toISOString().split('T')[0];
  const dailyClaimed = currentUser?.dailyRewardClaimedAt === nowStr;

  const handleCopyCode = () => {
    if (currentUser?.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimReward = async () => {
    setClaimLoading(true);
    await claimDailyReward();
    setClaimLoading(false);
  };

  // Get active tasks previews (up to 3)
  const taskPreviews = state.tasks.slice(0, 3);

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 space-y-5">
      {/* Dynamic Greetings header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">
            System Online • UTC Core
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5 tracking-tight">
            Greetings, {currentUser?.username || 'Operative'}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-900 border border-white/5 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono font-medium text-slate-300">SECURE SHELL</span>
        </div>
      </div>

      {/* CORE FINANCIAL LEDGER CARD - LIQUID GLASS */}
      <div className="relative rounded-3xl border border-white/10 bg-white/5 p-5 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="absolute top-[-40px] right-[-40px] w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              Verified Ledger Balance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold tracking-tight text-white font-sans">
                {currentUser?.pwcBalance.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold uppercase">
                PWC Coins
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/10 px-2 py-0.5 rounded-full font-mono uppercase">
              {currentUser?.membershipTier}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-2">
              Level {currentUser?.level} • {currentUser?.xp} XP
            </span>
          </div>
        </div>

        {/* Level Progress Slider */}
        <div className="mt-4">
          <div className="flex justify-between text-[9px] text-slate-500 font-mono mb-1">
            <span>XP LEVEL PROGRESSION</span>
            <span>{currentUser?.xp || 0} / {(currentUser?.level || 1) * 100} XP</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (((currentUser?.xp || 0) / ((currentUser?.level || 1) * 100)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Trust Score & Profile Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
          <div className="bg-white/2 border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 font-mono block">TRUST SCORE</span>
              <span className="text-sm font-extrabold text-white mt-0.5 font-sans">
                {currentUser?.trustScore || 0}%
              </span>
            </div>
            <ShieldCheck className={`w-5 h-5 ${currentUser && currentUser.trustScore >= 60 ? 'text-emerald-400' : 'text-amber-500'}`} />
          </div>

          <div className="bg-white/2 border border-white/5 p-2 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] text-slate-500 font-mono block">KYC SECURITY</span>
              <span className="text-xs font-bold text-slate-300 mt-1 uppercase font-mono block leading-none">
                {currentUser?.kycStatus === 'verified' ? 'Cleared' : currentUser?.kycStatus === 'pending' ? 'Review' : 'Required'}
              </span>
            </div>
            <UserCheck className={`w-5 h-5 ${currentUser?.kycStatus === 'verified' ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
        </div>

        {/* Action button grids */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          <button
            onClick={() => { setActiveTab('wallet'); setActiveMenuScreen(null); }}
            className="flex flex-col items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-1 tracking-tight">Deposit</span>
          </button>

          <button
            onClick={() => { setActiveTab('wallet'); setActiveMenuScreen(null); }}
            className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 p-2.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-1 tracking-tight">Withdraw</span>
          </button>

          <button
            onClick={() => { setActiveTab('wallet'); setActiveMenuScreen(null); }}
            className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 p-2.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span className="text-[9px] font-medium mt-1 tracking-tight">Transfer</span>
          </button>

          <button
            onClick={() => { setActiveMenuScreen('statistics'); }}
            className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 p-2.5 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-[9px] font-medium mt-1 tracking-tight">Perks</span>
          </button>
        </div>
      </div>

      {/* DAILY STREAK CLAIM & LUCKY WHEEL QUICK LINKS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Daily Streak Card */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">Daily reward</span>
            <h4 className="text-white text-sm font-semibold mt-1">Streaks Multiplier</h4>
            <p className="text-[10px] text-slate-400 mt-1">Claim 20+ PWC daily based on active tiers.</p>
          </div>
          <button
            onClick={handleClaimReward}
            disabled={dailyClaimed || claimLoading}
            className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all ${
              dailyClaimed
                ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95'
            }`}
          >
            {claimLoading ? 'Processing...' : dailyClaimed ? 'Claimed Today' : 'Claim Daily Reward'}
          </button>
        </div>

        {/* Lucky Wheel Card */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
          <div>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block">Probability Engine</span>
            <h4 className="text-white text-sm font-semibold mt-1">Lucky Wheel Spins</h4>
            <p className="text-[10px] text-slate-400 mt-1">Spin the wheel of fortune to win coins & multipliers.</p>
          </div>
          <button
            onClick={() => setActiveMenuScreen('wheel')}
            className="mt-4 w-full bg-white/5 hover:bg-white/10 active:scale-95 text-white border border-white/10 py-2 rounded-xl text-xs font-bold transition-all"
          >
            Launch Spin Engine
          </button>
        </div>
      </div>

      {/* ACTIVE TASKS DIRECT PREVIEWS */}
      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400">Featured Tasks Preview</h3>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center"
          >
            See All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {taskPreviews.map((task) => (
            <div
              key={task.id}
              onClick={() => setActiveTab('tasks')}
              className="bg-white/2 hover:bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex-1 mr-4">
                <span className="text-[8px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded-full font-mono uppercase">
                  {task.category}
                </span>
                <h4 className="text-xs font-semibold text-white mt-1.5 line-clamp-1">{task.title}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-400 font-mono">+{task.reward} PWC</span>
                <span className="text-[9px] text-slate-400 block font-mono">Req Trust {task.trustRequirement}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REFERRALS AND INVITE CODE CARD */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-white text-xs font-bold font-sans">Invite Referrals, Multiply Payouts</h4>
            <p className="text-[10px] text-slate-400 mt-1">
              Earn <strong className="text-emerald-400">50 PWC</strong> for each verified member that initializes credentials with your referral code.
            </p>
            
            {currentUser?.referralCode && (
              <div className="mt-3 bg-black/40 border border-white/5 rounded-xl px-3 py-1.5 flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-300 select-all">
                  {currentUser.referralCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-semibold"
                >
                  {copied ? 'Copied' : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PLATFORM ANNOUNCEMENTS */}
      <div className="bg-white/2 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles className="w-4.5 h-4.5" />
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider">System Broadcast</h4>
        </div>
        <p className="text-xs font-semibold text-white mt-2">
          Liquid Refraction System Upgrade V1.0
        </p>
        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
          The security audit ledger is completely deployed. We are monitoring withdrawals dynamically. Any false task evidence attempts will automatically penalize Trust Rating scores by -15. Keep transactions clean!
        </p>
      </div>
    </div>
  );
}
