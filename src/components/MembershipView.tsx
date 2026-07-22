import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { MEMBERSHIP_FULL_SPECS } from '../data/membershipData';
import { MembershipTier } from '../types';
import {
  Sparkles,
  Shield,
  Zap,
  Award,
  Crown,
  Lock,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Coins,
  Cpu,
  Package,
  Star,
  Flame,
  Globe,
  Sliders,
  AlertCircle
} from 'lucide-react';

export default function MembershipView() {
  const { currentUser, upgradeMembership, error, successMessage, clearMessages } = usePayWorth();
  const [activeTab, setActiveTab] = useState<'hq' | 'roadmap' | 'comparison' | 'vault'>('hq');
  const [selectedTierForUpgrade, setSelectedTierForUpgrade] = useState<MembershipTier | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  if (!currentUser) return null;

  const currentTier = currentUser.membershipTier || 'Dark Bronze';
  const currentSpec = MEMBERSHIP_FULL_SPECS[currentTier] || MEMBERSHIP_FULL_SPECS['Dark Bronze'];

  const allTiers: MembershipTier[] = [
    'Dark Bronze',
    'Bright Iron',
    'Shining Silver',
    'Shimmering Gold',
    'Aspiring Platinum',
    'Resilient Diamond',
    'Epic',
    'Legend',
    'Mythical'
  ];

  const handleUpgradeClick = async (tier: MembershipTier) => {
    clearMessages();
    setUpgrading(true);
    const res = await upgradeMembership(tier);
    setUpgrading(false);
    if (res.success) {
      setSelectedTierForUpgrade(null);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-28 space-y-6">
      {/* Top Banner & Active HQ Header */}
      <div className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${currentSpec.gradient} border ${currentSpec.frameColor} shadow-2xl backdrop-blur-xl`}>
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase inline-flex items-center gap-1.5 border border-white/10 mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" /> Active Membership Tier
            </span>
            <h2 className="text-2xl font-black text-white flex items-center gap-2 font-display">
              {currentSpec.badge}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              Headquarters: <strong className="text-emerald-300">{currentSpec.hqName}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-mono block">EARNING MULTIPLIER</span>
            <div className="text-3xl font-black text-amber-400 font-mono tracking-tight flex items-center justify-end gap-1">
              <Zap className="w-6 h-6 fill-amber-400" /> {currentSpec.multiplier}x
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
          <div className="bg-black/30 p-2.5 rounded-2xl backdrop-blur-sm border border-white/5">
            <span className="text-[9px] text-slate-400 block font-mono">UNLOCKED GAMES</span>
            <span className="text-sm font-bold text-white font-mono">{currentSpec.gamesUnlockedCount}+ Games</span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-2xl backdrop-blur-sm border border-white/5">
            <span className="text-[9px] text-slate-400 block font-mono">PWC MINER BOT</span>
            <span className="text-xs font-bold text-emerald-400 font-mono truncate block">
              {currentSpec.miningBotName || 'Locked'}
            </span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-2xl backdrop-blur-sm border border-white/5">
            <span className="text-[9px] text-slate-400 block font-mono">REWARD VAULT</span>
            <span className="text-xs font-bold text-amber-300 font-mono truncate block">
              {currentSpec.vaultName}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-lg text-center">
        <button
          onClick={() => setActiveTab('hq')}
          className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
            activeTab === 'hq'
              ? 'bg-emerald-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Headquarters
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
            activeTab === 'roadmap'
              ? 'bg-emerald-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Roadmap
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
            activeTab === 'comparison'
              ? 'bg-emerald-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Compare 9 Tiers
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all ${
            activeTab === 'vault'
              ? 'bg-emerald-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Vault & Assets
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: HEADQUARTERS VIEW */}
      {activeTab === 'hq' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" /> {currentSpec.hqName} Overview
              </h3>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                HQ SECURE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentSpec.hqDescription}
            </p>

            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Active Membership Privileges
              </h4>
              <ul className="space-y-2">
                {currentSpec.benefits.map((b, idx) => (
                  <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Upgrade Callout */}
          {currentTier !== 'Mythical' && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white font-sans">Ready for Higher Multipliers?</h4>
                <p className="text-[10px] text-slate-300 mt-0.5">Upgrade your membership to unlock automated PWC mining and 100+ catalog games.</p>
              </div>
              <button
                onClick={() => setActiveTab('roadmap')}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1"
              >
                Upgrade <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROGRESSION ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="mb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> 9-Tier Membership Roadmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review unlock fees in Naira (₦) or PWC tokens. Every upgrade permanently expands your earning rate.
            </p>
          </div>

          <div className="space-y-3">
            {allTiers.map((tierName, index) => {
              const spec = MEMBERSHIP_FULL_SPECS[tierName];
              const isCurrent = currentTier === tierName;
              const isPassed = allTiers.indexOf(currentTier) > index;
              const isLocked = !isCurrent && !isPassed;

              return (
                <div
                  key={tierName}
                  className={`p-4 rounded-3xl border transition-all ${
                    isCurrent
                      ? `bg-gradient-to-r ${spec.gradient} ${spec.frameColor} shadow-xl ring-1 ring-amber-400/50`
                      : isPassed
                      ? 'bg-slate-900/40 border-white/5 opacity-75'
                      : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                        isCurrent ? 'bg-amber-400 text-slate-950 shadow-lg' : isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{spec.badge}</h4>
                          {isCurrent && (
                            <span className="text-[9px] font-mono bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                              CURRENT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{spec.hqName}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-amber-400 font-mono block">
                        {spec.multiplier}x Rate
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {spec.costNaira === 0 ? 'FREE' : `₦${spec.costNaira.toLocaleString()} / ${spec.costPwc} PWC`}
                      </span>
                    </div>
                  </div>

                  {/* Benefits summary list */}
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                    {spec.benefits.slice(0, 3).map((b, i) => (
                      <div key={i} className="text-[11px] text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA */}
                  {isLocked && (
                    <div className="mt-4 pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Lock className="w-3.5 h-3.5 text-slate-500" /> Requires Min Level {spec.minLevel}
                      </span>
                      <button
                        onClick={() => setSelectedTierForUpgrade(tierName)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                      >
                        Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETE COMPARISON TABLE */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="p-3">Membership Tier</th>
                  <th className="p-3">Fee (₦ / PWC)</th>
                  <th className="p-3">Multiplier</th>
                  <th className="p-3">Games</th>
                  <th className="p-3">Mining Bot</th>
                  <th className="p-3">Vault</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {allTiers.map((t) => {
                  const spec = MEMBERSHIP_FULL_SPECS[t];
                  const isCurrent = currentTier === t;
                  return (
                    <tr key={t} className={isCurrent ? 'bg-amber-500/10 text-white font-bold' : 'text-slate-300 hover:bg-white/5'}>
                      <td className="p-3 flex items-center gap-2 truncate">
                        <span>{spec.badge}</span>
                        {isCurrent && <span className="text-[9px] text-amber-400 font-mono font-bold">(YOU)</span>}
                      </td>
                      <td className="p-3 font-mono">
                        {spec.costNaira === 0 ? 'FREE' : `₦${spec.costNaira.toLocaleString()}`}
                      </td>
                      <td className="p-3 font-mono text-amber-400 font-bold">{spec.multiplier}x</td>
                      <td className="p-3 font-mono">{spec.gamesUnlockedCount}+</td>
                      <td className="p-3 text-emerald-400 font-mono">{spec.miningBotName || 'None'}</td>
                      <td className="p-3 text-slate-400">{spec.vaultName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VAULT & ASSETS */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-400" /> {currentSpec.vaultName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stores your earned PWC rewards, active profile cosmetics, collectible frames, and membership badges.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">STORED VAULT BALANCE</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  {currentUser.pwcBalance.toLocaleString()} PWC
                </span>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block">PROFILE EMBLEM</span>
                <span className="text-sm font-bold text-amber-300 truncate block">
                  {currentSpec.badge}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE CONFIRMATION MODAL */}
      <AnimatePresence>
        {selectedTierForUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-white/15 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                  <Crown className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">
                  Upgrade to {selectedTierForUpgrade}
                </h3>
                <p className="text-xs text-slate-300">
                  Confirm membership elevation to unlock enhanced multipliers, higher mining bot output, and expanded games access.
                </p>
              </div>

              {(() => {
                const targetSpec = MEMBERSHIP_FULL_SPECS[selectedTierForUpgrade];
                return (
                  <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Upgrade Fee (Naira):</span>
                      <span className="font-mono font-bold text-amber-400">₦{targetSpec.costNaira.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Alternative PWC Fee:</span>
                      <span className="font-mono font-bold text-emerald-400">{targetSpec.costPwc} PWC</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>New Multiplier:</span>
                      <span className="font-mono font-bold text-amber-300">{targetSpec.multiplier}x Rate</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTierForUpgrade(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={upgrading}
                  onClick={() => handleUpgradeClick(selectedTierForUpgrade)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {upgrading ? 'Upgrading...' : 'Confirm Upgrade'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
