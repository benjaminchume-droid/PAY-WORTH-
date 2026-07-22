import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import EmailVerificationGuardModal from './EmailVerificationGuardModal';
import { MINING_BOT_SPECS, MEMBERSHIP_FULL_SPECS } from '../data/membershipData';
import {
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Shield,
  Layers,
  Flame,
  Award,
  ChevronRight,
  Clock,
  BatteryCharging
} from 'lucide-react';

export default function MiningView() {
  const { currentUser, updateMiningSession, collectMinedPwc, setActiveMenuScreen } = usePayWorth();
  const [collecting, setCollecting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [guardModalOpen, setGuardModalOpen] = useState(false);

  if (!currentUser) return null;

  const userTier = currentUser.membershipTier || 'Dark Bronze';
  const tierSpec = MEMBERSHIP_FULL_SPECS[userTier];

  // Check if current membership has an unlocked bot
  const botName = tierSpec?.miningBotName;
  const botSpec = botName ? MINING_BOT_SPECS[botName] : null;

  // Real-time calculation of mined PWC
  const miningState = currentUser.miningState || {
    botName: botName || 'None',
    tier: userTier,
    startedAt: new Date().toISOString(),
    lastCollectedAt: new Date().toISOString(),
    minedPwc: 15.5,
    status: 'active',
    activeBoosters: [],
    totalCollectedLifetime: 120.0
  };

  const speedPerHour = botSpec ? botSpec.speedPwcPerHour * botSpec.multiplier : 0;
  const maxStorage = botSpec ? botSpec.maxStoragePwc : 0;
  const storagePercent = maxStorage > 0 ? Math.min(100, Math.round((miningState.minedPwc / maxStorage) * 100)) : 0;

  const handleCollect = async () => {
    if (!currentUser.emailVerified) {
      setGuardModalOpen(true);
      return;
    }
    if (!botSpec || miningState.minedPwc <= 0) return;
    setCollecting(true);
    setSuccessMsg(null);

    const amountCollected = miningState.minedPwc;
    const res = await collectMinedPwc();
    setCollecting(false);

    if (res) {
      setSuccessMsg(`Successfully collected +${amountCollected.toFixed(1)} PWC into your main wallet!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  if (!botSpec) {
    return (
      <div className="p-4 max-w-lg mx-auto pb-28 space-y-5">
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto text-amber-400">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">
              Autonomous PWC Mining Locked
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Mining Bots are unlocked starting at <strong className="text-slate-200">Shining Silver (Mk II Miner)</strong> and above. Upgrade your membership to generate passive PWC token yield automatically.
            </p>
          </div>

          <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-left space-y-2 text-xs text-slate-300">
            <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase tracking-wider">
              ⚡ UNLOCKABLE MINING BOTS
            </span>
            <div className="flex justify-between">
              <span>🥈 Shining Silver:</span>
              <span className="font-mono text-emerald-400 font-bold">Mk II Miner (15 PWC/hr)</span>
            </div>
            <div className="flex justify-between">
              <span>🥇 Shimmering Gold:</span>
              <span className="font-mono text-emerald-400 font-bold">Mk III Miner (30 PWC/hr)</span>
            </div>
            <div className="flex justify-between">
              <span>💠 Aspiring Platinum:</span>
              <span className="font-mono text-emerald-400 font-bold">Quantum Miner (60 PWC/hr)</span>
            </div>
          </div>

          <button
            onClick={() => setActiveMenuScreen('membership')}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            Upgrade Membership <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl mx-auto pb-28 space-y-5">
      {/* Active Bot Visual Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${botSpec.bgGradient} border border-white/15 shadow-2xl backdrop-blur-xl space-y-5`}>
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase inline-flex items-center gap-1.5 border border-white/10 mb-2">
              <Zap className="w-3 h-3 text-amber-400" /> Active Mining Bot
            </span>
            <h2 className="text-2xl font-black text-white font-display flex items-center gap-2">
              {botSpec.botName}
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              Model: <span className="text-emerald-400">{botSpec.model}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">MINING RATE</span>
            <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
              +{speedPerHour.toFixed(1)} <span className="text-xs text-slate-300">PWC/hr</span>
            </span>
          </div>
        </div>

        {/* Real-time Storage Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Storage Buffer ({storagePercent}%)
            </span>
            <span className="text-emerald-400 font-bold">
              {miningState.minedPwc.toFixed(1)} / {maxStorage} PWC
            </span>
          </div>
          <div className="w-full bg-black/60 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>

        {/* Collection Action CTA */}
        <div className="pt-2">
          <button
            onClick={handleCollect}
            disabled={collecting || miningState.minedPwc <= 0}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm py-3.5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <BatteryCharging className="w-5 h-5" />
            {collecting ? 'Transferring Yield...' : `Collect +${miningState.minedPwc.toFixed(1)} PWC to Wallet`}
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Bot Factory Modules Grid */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur-xl">
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
          <Cpu className="w-4.5 h-4.5 text-cyan-400" /> Factory Modules & Efficiency
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {botSpec.modules.map((mod, idx) => (
            <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block truncate">
                Module #{idx + 1}
              </span>
              <h4 className="text-xs font-bold text-white truncate">{mod}</h4>
              <span className="text-[10px] text-emerald-400 font-mono font-bold block">
                [ACTIVE 100%]
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mining Lifetime Stats */}
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 space-y-3 backdrop-blur-xl">
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
          <TrendingUp className="w-4.5 h-4.5 text-amber-400" /> Lifetime Mining Ledger
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-black/40 border border-white/5 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 block font-mono">LIFETIME YIELD</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {(miningState.totalCollectedLifetime || 0).toFixed(1)} PWC
            </span>
          </div>
          <div className="p-3.5 bg-black/40 border border-white/5 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 block font-mono">MAX BUFFER</span>
            <span className="text-base font-bold text-amber-300 font-mono">
              {maxStorage} PWC
            </span>
          </div>
        </div>
      </div>

      <EmailVerificationGuardModal
        isOpen={guardModalOpen}
        onClose={() => setGuardModalOpen(false)}
        actionName="Mining Rig Yield Payouts"
      />
    </div>
  );
}
