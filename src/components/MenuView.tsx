import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { MEMBERSHIP_TIERS_DATA, DEFAULT_ACHIEVEMENTS } from '../engines/storage';
import { User, MembershipTier } from '../types';
import MiniGames from './MiniGames';
import CreateCampaignView from './CreateCampaignView';
import LegalCenterView from './LegalCenterView';
import SettingsView from './SettingsView';
import AboutView from './AboutView';
import AdminLegalDashboard from './AdminLegalDashboard';
import MembershipView from './MembershipView';
import MiningView from './MiningView';
import GamesView from './GamesView';
import ReferralView from './ReferralView';
import AdminPlatformView from './AdminPlatformView';
import {
  Sparkles,
  Award,
  Trophy,
  Coins,
  Users,
  BadgeDollarSign,
  PieChart,
  Bell,
  Sliders,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Calendar,
  Layers,
  Trash2,
  Copy,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function MenuView() {
  const { activeMenuScreen, setActiveMenuScreen } = usePayWorth();

  if (!activeMenuScreen) return null;

  const legalScreenMap: Record<string, string> = {
    terms: 'terms-of-service',
    privacy: 'privacy-policy',
    community: 'community-guidelines',
    acceptable_use: 'acceptable-use-policy',
    reward_policy: 'reward-withdrawal-policy',
    kyc: 'kyc-aml-policy',
    cookies: 'cookie-policy'
  };

  if (activeMenuScreen === 'legal_center' || legalScreenMap[activeMenuScreen]) {
    return (
      <LegalCenterView
        initialDocId={legalScreenMap[activeMenuScreen] || 'terms'}
        onClose={() => setActiveMenuScreen(null)}
      />
    );
  }

  if (activeMenuScreen === 'settings') {
    return <SettingsView />;
  }

  if (activeMenuScreen === 'about') {
    return <AboutView />;
  }

  if (activeMenuScreen === 'legal_admin') {
    return <AdminLegalDashboard />;
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 space-y-4">
      {/* Return header */}
      {activeMenuScreen !== 'create_campaign' && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveMenuScreen(null)}
            className="text-xs text-slate-400 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all"
          >
            ← Return to Dashboard
          </button>
          <span className="text-xs text-slate-600 font-mono">/ {activeMenuScreen.toUpperCase()}</span>
        </div>
      )}

      {activeMenuScreen === 'create_campaign' && <CreateCampaignView />}
      {activeMenuScreen === 'membership' && <MembershipView />}
      {activeMenuScreen === 'mining' && <MiningView />}
      {activeMenuScreen === 'games' && <GamesView />}
      {activeMenuScreen === 'referrals' && <ReferralView />}
      {activeMenuScreen === 'leaderboard' && <LeaderboardView />}
      {activeMenuScreen === 'wheel' && <LuckyWheelView />}
      {activeMenuScreen === 'achievements' && <AchievementsView />}
      {activeMenuScreen === 'payfunds' && <PayFundsView />}
      {activeMenuScreen === 'statistics' && <StatisticsView />}
      {activeMenuScreen === 'notifications' && <NotificationsView />}
      {(activeMenuScreen === 'dashboard' || activeMenuScreen === 'admin') && <AdminPlatformView />}

      {/* Static Info footers */}
      {['profile', 'help', 'contact', 'security'].includes(activeMenuScreen) && (
        <StaticInfoView page={activeMenuScreen} />
      )}
    </div>
  );
}

/* ==========================================================================
   LEGACY MEMBERSHIP VIEW
   ========================================================================== */
function LegacyMembershipView() {
  const {
    currentUser,
    upgradeMembership,
    error,
    successMessage,
    clearMessages,
    setActiveTab,
    setActiveMenuScreen
  } = usePayWorth();

  const [confirmTier, setConfirmTier] = useState<any | null>(null);
  const [insufficientTier, setInsufficientTier] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  const handleUpgradeClick = (tier: any) => {
    clearMessages();
    const balance = currentUser?.pwcBalance || 0;
    if (balance < tier.cost) {
      setInsufficientTier(tier);
    } else {
      setConfirmTier(tier);
    }
  };

  const handleProcessUpgrade = async () => {
    if (!confirmTier) return;
    setProcessing(true);
    clearMessages();
    
    try {
      const res = await upgradeMembership(confirmTier.name);
      if (res && res.success) {
        setUpgradeSuccess(confirmTier.name);
        setConfirmTier(null);
        setTimeout(() => {
          setUpgradeSuccess(null);
        }, 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4 relative">
      <div className="mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-amber-400 w-5.5 h-5.5" /> Premium Tiers
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Lock PWC to elevate your security ranking. Level up, gain multiplier bonuses up to 5x, and bypass withdrawal commissions.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">
          {successMessage}
        </div>
      )}

      {/* SUCCESS ANIMATION FLASHCARD */}
      <AnimatePresence>
        {upgradeSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-5 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-3 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
            <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <h4 className="text-lg font-bold text-white">Membership Upgraded!</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your account has been upgraded to <strong className="text-emerald-400">{upgradeSuccess}</strong>! Benefits and multipliers are applied to your secure profile ledger immediately.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {MEMBERSHIP_TIERS_DATA.map((tier) => {
          const isCurrent = currentUser?.membershipTier === tier.name;
          const meetsLevel = (currentUser?.level || 1) >= tier.minLevel;
          const meetsTrust = (currentUser?.trustScore || 0) >= tier.minTrust;
          const canUpgrade = meetsLevel && meetsTrust && !isCurrent;

          return (
            <div
              key={tier.name}
              className={`rounded-2xl p-4 border relative overflow-hidden transition-all ${
                isCurrent
                  ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 shadow-lg'
                  : 'bg-white/5 border-white/10 hover:border-white/15'
              }`}
            >
              {isCurrent && (
                <span className="absolute top-3 right-3 text-[10px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  ACTIVE TIER
                </span>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {tier.name}
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                    Earning Multiplier: {tier.multiplier}x
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-slate-300 block">Upgrades cost:</span>
                  <span className="text-sm font-extrabold text-white font-mono">{tier.cost.toLocaleString()} PWC</span>
                </div>
              </div>

              {/* Tier Benefits Bullet lists */}
              <ul className="mt-3.5 space-y-1.5 text-[10px] text-slate-400 font-sans border-t border-white/5 pt-3">
                {tier.benefits.map((benefit, bIdx) => (
                  <li key={bIdx} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* Requirement checkers */}
              {!isCurrent && (
                <div className="mt-4 flex gap-4 text-[10px] font-mono bg-black/25 p-2 rounded-xl">
                  <span className={meetsLevel ? 'text-emerald-400' : 'text-red-400'}>
                    Level Req: {tier.minLevel}+ ({currentUser?.level})
                  </span>
                  <span className={meetsTrust ? 'text-emerald-400' : 'text-red-400'}>
                    Trust Req: {tier.minTrust}+ ({currentUser?.trustScore}%)
                  </span>
                </div>
              )}

              {/* Buy actions */}
              {!isCurrent && (
                <button
                  onClick={() => handleUpgradeClick(tier)}
                  disabled={!canUpgrade}
                  className={`mt-4 w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    canUpgrade
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 cursor-pointer'
                      : 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  Upgrade to {tier.name}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* CONFIRMATION UPGRADE MODAL */}
      <AnimatePresence>
        {confirmTier && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full relative overflow-hidden shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Confirm Membership Upgrade</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Deducting from security ledger</p>
                </div>
              </div>

              <div className="bg-black/35 border border-white/5 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Level:</span>
                  <span className="text-white font-bold">{confirmTier.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Debit Cost:</span>
                  <span className="text-emerald-400 font-mono font-bold">-{confirmTier.cost.toLocaleString()} PWC</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span className="text-slate-400">Earning Multiplier:</span>
                  <span className="text-amber-400 font-bold">{confirmTier.multiplier}x</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setConfirmTier(null)}
                  disabled={processing}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs font-bold py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessUpgrade}
                  disabled={processing}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {processing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Deducting...
                    </>
                  ) : (
                    'Authorize Upgrade'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSUFFICIENT PWC MODAL */}
      <AnimatePresence>
        {insufficientTier && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full relative overflow-hidden shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center shrink-0 animate-bounce">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Insufficient PWC</h4>
                  <p className="text-[10px] text-red-400 font-mono">Platform ledger block</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-normal">
                You don't have enough PayWorth Coins to purchase this membership. Deposit PWC via virtual account wire transfer to lock upgrade ranks.
              </p>

              <div className="bg-black/35 border border-white/5 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Required:</span>
                  <span className="text-white font-mono font-bold">{insufficientTier.cost.toLocaleString()} PWC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Balance:</span>
                  <span className="text-red-400 font-mono font-bold">{(currentUser?.pwcBalance || 0).toLocaleString()} PWC</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setInsufficientTier(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs font-bold py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setInsufficientTier(null);
                    setActiveTab('wallet');
                    setActiveMenuScreen(null);
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-3 rounded-xl transition-all shadow-lg text-center"
                >
                  Buy PWC
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   LEADERBOARDS VIEW
   ========================================================================== */
function LeaderboardView() {
  const { state } = usePayWorth();

  // Sort and compile mock-but-live global players
  const players = [
    { username: 'Glassline Admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', balance: 25000, level: 15, tier: 'Mythical' },
    { username: 'ViteMaster Labs', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', balance: 8400, level: 9, tier: 'Shimmering Gold' },
    { username: 'PWC_Hustler', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200', balance: 4120, level: 6, tier: 'Shining Silver' },
    { username: 'CodeBreaker', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', balance: 1840, level: 4, tier: 'Bright Iron' },
    { username: 'FramerGlow', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', balance: 950, level: 3, tier: 'Bright Iron' },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="text-yellow-400 w-5.5 h-5.5" /> Global Leaderboards
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Active ledger ranking of global workers based on verified earnings, level XP, and platform trust score tiers.
        </p>
      </div>

      <div className="space-y-2">
        {players.map((player, idx) => {
          const isTop3 = idx < 3;
          const badgeColor = idx === 0 ? 'bg-yellow-500/20 text-yellow-300' : idx === 1 ? 'bg-slate-300/20 text-slate-300' : 'bg-amber-600/20 text-amber-500';

          return (
            <div
              key={player.username}
              className="bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl p-3 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${isTop3 ? badgeColor : 'bg-white/5 text-slate-500'}`}>
                  {idx + 1}
                </span>
                <img
                  src={player.avatar}
                  alt="Player profile"
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{player.username}</h4>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                    {player.tier} • Level {player.level}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-extrabold text-emerald-400 block">
                  {player.balance.toLocaleString()} PWC
                </span>
                <span className="text-[9px] text-slate-500 font-mono block">Earning Balance</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   LUCKY WHEEL VIEW
   ========================================================================== */
function LuckyWheelView() {
  const { currentUser, spinLuckyWheel, error, successMessage, clearMessages } = usePayWorth();
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<{ prize: string; type: string } | null>(null);
  const [spinError, setSpinError] = useState<string | null>(null);

  const handleSpin = async () => {
    setSpinning(true);
    setSpinResult(null);
    setSpinError(null);
    clearMessages();
    try {
      const res = await spinLuckyWheel();
      setSpinResult({ prize: res.prize, type: res.type });
    } catch (err: any) {
      setSpinError(err.message || 'Spin failed.');
    }
    setSpinning(false);
  };

  return (
    <div className="space-y-4 text-center">
      <div className="text-left mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Coins className="text-emerald-400 w-5.5 h-5.5" /> Probability Wheel
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Spin our daily automated fortune wheel. Remaining free spins: <strong className="text-white">{currentUser?.luckyWheelSpinsRemaining || 0}</strong>. Subsequent spins cost 50 PWC.
        </p>
      </div>

      {spinError && (
        <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-xs rounded-xl text-left font-mono">
          ⚠️ {spinError}
        </div>
      )}

      <div className="py-6 relative flex flex-col items-center">
        {/* Animated Spin Wheel representation using Framer Motion */}
        <motion.div
          animate={spinning ? { rotate: 3600 } : { rotate: 0 }}
          transition={{ duration: 3, ease: 'easeOut' }}
          className="w-48 h-48 rounded-full border-4 border-dashed border-emerald-400 flex items-center justify-center relative bg-gradient-to-tr from-slate-950 to-slate-900 shadow-2xl"
        >
          {/* Wheel ticks */}
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[10px] text-slate-500 pointer-events-none">
            <span className="absolute transform rotate-0 translate-y-[-70px]">💎 10</span>
            <span className="absolute transform rotate-45 translate-y-[-70px]">⭐️ 25</span>
            <span className="absolute transform rotate-90 translate-y-[-70px]">👑 100</span>
            <span className="absolute transform rotate-135 translate-y-[-70px]">🔥 XP</span>
            <span className="absolute transform rotate-180 translate-y-[-70px]">🍀 XP+</span>
            <span className="absolute transform rotate-225 translate-y-[-70px]">🎁 BOX</span>
            <span className="absolute transform rotate-270 translate-y-[-70px]">⚡️ TRST</span>
            <span className="absolute transform rotate-315 translate-y-[-70px]">🌟 50</span>
          </div>

          <div className="w-16 h-16 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center text-xs text-white z-10 font-bold shadow-lg">
            {spinning ? 'SPINNING' : 'SPIN'}
          </div>
        </motion.div>

        {/* Pointer icon */}
        <div className="absolute top-4 w-4 h-4 bg-emerald-400 transform rotate-45 border-b border-r border-slate-950 z-20" />
      </div>

      {spinResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center"
        >
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-white font-bold text-sm">Lucky Outcome Confirmed!</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Ledger transactions locked and updated. You won: <strong className="text-emerald-400">{spinResult.prize}</strong>.
          </p>
        </motion.div>
      )}

      <button
        onClick={handleSpin}
        disabled={spinning}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-40"
      >
        {spinning ? 'Rotating Probability Matrix...' : currentUser?.luckyWheelSpinsRemaining && currentUser.luckyWheelSpinsRemaining > 0 ? 'Spin for Free!' : 'Buy Spin (50 PWC)'}
      </button>
    </div>
  );
}

/* ==========================================================================
   ACHIEVEMENTS VIEW
   ========================================================================== */
function AchievementsView() {
  const { currentUser, claimAchievement, state } = usePayWorth();
  const [claiming, setClaiming] = useState<string | null>(null);

  const handleClaim = async (id: string) => {
    setClaiming(id);
    await claimAchievement(id);
    setClaiming(null);
  };

  // Compile completions list
  const userSubmissions = state.taskSubmissions.filter((s) => s.userId === currentUser?.id && s.status === 'approved').length;
  const referralCount = (Object.values(state.users) as User[]).filter((u) => u.referredBy === currentUser?.id).length;
  const gamesPlayed = (Object.values(currentUser?.gamesPlayedToday || {}) as number[]).reduce((a, b) => a + b, 0);

  const getProgress = (targetType: string, targetValue: number) => {
    if (targetType === 'tasks') return userSubmissions;
    if (targetType === 'referrals') return referralCount;
    if (targetType === 'pwc') return currentUser?.lifetimeEarned || 0;
    if (targetType === 'games') return gamesPlayed;
    return 0;
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="text-pink-400 w-5.5 h-5.5" /> Milestones & Achievements
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Complete objectives, claim badges, and receive massive secondary PWC and XP payout packages.
        </p>
      </div>

      <div className="space-y-3">
        {DEFAULT_ACHIEVEMENTS.map((ach) => {
          const isClaimed = currentUser?.achievementsClaimed.includes(ach.id);
          const progress = getProgress(ach.targetType, ach.targetValue);
          const isComplete = progress >= ach.targetValue;
          const progressPercent = Math.min(100, Math.round((progress / ach.targetValue) * 100));

          return (
            <div
              key={ach.id}
              className={`rounded-2xl p-4 border flex items-center justify-between transition-all ${
                isClaimed
                  ? 'bg-slate-900/30 border-white/5 opacity-60'
                  : isComplete
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex-1 mr-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  {ach.title}
                  {isClaimed && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded-full font-mono">CLAIMED</span>}
                </h4>
                <p className="text-[10px] text-slate-400 mt-1">{ach.description}</p>
                
                {/* Progress bar */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono mb-1">
                    <span>PROGRESSION</span>
                    <span>{progress} / {ach.targetValue} ({progressPercent}%)</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] text-slate-500 block font-mono">REWARDS:</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">+{ach.rewardPWC} PWC</span>
                <span className="text-[10px] text-indigo-400 block font-mono">+{ach.rewardXP} XP</span>

                {isComplete && !isClaimed && (
                  <button
                    onClick={() => handleClaim(ach.id)}
                    disabled={claiming !== null}
                    className="mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] px-3 py-1.5 rounded-lg active:scale-95"
                  >
                    Claim Reward
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   REFERRALS VIEW
   ========================================================================== */
function ReferralsView() {
  const { currentUser, state } = usePayWorth();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (currentUser?.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Find referred list
  const referredUsers = (Object.values(state.users) as User[]).filter((u) => u.referredBy === currentUser?.id);

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="text-indigo-400 w-5.5 h-5.5" /> Referrals Engine
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Grow the network to compound earnings. For each active user signing up with your unique referral credential, both parties receive 50 PWC.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <span className="text-[9px] text-slate-500 font-mono block">YOUR UNIQUE CODE</span>
        <div className="mt-2 bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center">
          <span className="text-sm font-mono font-bold text-white">{currentUser?.referralCode}</span>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-medium bg-white/5 px-3 py-1 rounded-lg"
          >
            {copied ? 'Copied' : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
          </button>
        </div>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">Your Referral Tree ({referredUsers.length})</h4>
        
        {referredUsers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[11px] text-slate-500 font-mono">No referrals joined on your network tree yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {referredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white/2 border border-white/5 rounded-xl p-2.5 flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-2">
                  <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" />
                  <div>
                    <h5 className="font-semibold text-white">{user.username}</h5>
                    <span className="text-[9px] text-slate-500 font-mono">Registered: {user.id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">+50 PWC Payout</span>
                  <span className="text-[9px] text-slate-500 font-mono block">Cleared</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   PAY FUNDS VIEW
   ========================================================================== */
function PayFundsView() {
  const { currentUser, submitFundingRequest, state, error, successMessage, clearMessages } = usePayWorth();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [applying, setApplying] = useState(false);

  // Filter requests
  const myRequests = state.fundingRequests.filter((f) => f.userId === currentUser?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || !reason.trim()) return;

    setApplying(true);
    clearMessages();
    await submitFundingRequest(amt, reason);
    setApplying(false);
    setAmount('');
    setReason('');
  };

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BadgeDollarSign className="text-amber-400 w-5.5 h-5.5" /> Earning Funding Portal
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Apply for audited emergency project or creator funding grants. Limit: Max 10,000 PWC. Requests undergo manual system compliance reviews.
        </p>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl">{error}</div>}
      {successMessage && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5">
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Grant Amount Requested (PWC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1000 PWC"
            required
            className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl font-mono"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Detailed Application Justification</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the structural purpose of your grant. E.g., Creating large-scale advertiser campaign escrow or funding community puzzle projects..."
            required
            rows={3}
            className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl resize-none font-sans"
          />
        </div>

        <button
          type="submit"
          disabled={applying}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-md active:scale-95"
        >
          {applying ? 'Uploading Application files...' : 'Dispatch Funding Application'}
        </button>
      </form>

      {/* History log */}
      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4">
        <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">Your Funding Log ({myRequests.length})</h4>
        
        {myRequests.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-[11px] text-slate-500 font-mono">No funding logs registered on ledger.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myRequests.map((req) => (
              <div key={req.id} className="bg-white/2 border border-white/5 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">ID: {req.id}</span>
                  <span className={`font-bold ${req.status === 'approved' ? 'text-emerald-400' : req.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between font-sans">
                  <span className="text-white font-semibold">Amount: {req.amount} PWC</span>
                  <span className="text-slate-400 text-[10px]">{new Date(req.submittedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed italic">"{req.reason}"</p>
                {req.feedback && <p className="text-amber-400 text-[10px] font-mono leading-none mt-1">Feedback: {req.feedback}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   STATISTICS VIEW
   ========================================================================== */
function StatisticsView() {
  const { currentUser, state } = usePayWorth();
  const historyList = currentUser ? (state.ledger[currentUser.id] || []) : [];

  // Manual bar calculations based on transaction category distribution (PWC categories)
  const stats = {
    tasks: 0,
    referrals: 0,
    rewards: 0,
    withdrawn: currentUser?.lifetimeWithdrawn || 0,
  };

  historyList.forEach((tx) => {
    if (tx.type === 'credit') {
      if (tx.category === 'task') stats.tasks += tx.amount;
      if (tx.category === 'referral') stats.referrals += tx.amount;
      if (tx.category === 'daily_reward' || tx.category === 'wheel' || tx.category === 'game') stats.rewards += tx.amount;
    }
  });

  const grandTotal = stats.tasks + stats.referrals + stats.rewards + 1; // avoid division by zero

  const breakdown = [
    { label: 'Legitimacy Tasks', amount: stats.tasks, color: 'bg-emerald-500', pct: Math.round((stats.tasks / grandTotal) * 100) },
    { label: 'Referrals network', amount: stats.referrals, color: 'bg-indigo-400', pct: Math.round((stats.referrals / grandTotal) * 100) },
    { label: 'Streaks & Wheel', amount: stats.rewards, color: 'bg-pink-500', pct: Math.round((stats.rewards / grandTotal) * 100) },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <PieChart className="text-indigo-400 w-5.5 h-5.5" /> Wallet Statistics
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Detailed cryptographic breakdown of credits generated on your platform ledger.
        </p>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
        <span className="text-[10px] text-slate-500 font-mono block">LEDGER DISTRIBUTION PROFILE</span>

        <div className="space-y-3.5">
          {breakdown.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">{item.label}</span>
                <span className="text-white font-bold">{item.amount} PWC ({item.pct}%)</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">CROWD ENGAGEMENT</span>
            <span className="text-sm font-extrabold text-white font-mono mt-1 block">
              {historyList.filter((tx) => tx.category === 'task').length} completed
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">LEDGER RETENTION</span>
            <span className="text-sm font-extrabold text-white font-mono mt-1 block">
              {Math.max(0, Math.round(((currentUser?.pwcBalance || 0) / (currentUser?.lifetimeEarned || 1)) * 100))}% Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   NOTIFICATIONS VIEW
   ========================================================================== */
function NotificationsView() {
  const { currentUser, state, markNotificationRead, clearNotifications } = usePayWorth();
  const list = currentUser ? (state.notifications[currentUser.id] || []) : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="text-pink-400 w-5.5 h-5.5" /> In-App Inbox
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            System dispatch summaries, settlement notifications, and verification alerts.
          </p>
        </div>
        <button
          onClick={clearNotifications}
          className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl border border-white/5 flex items-center gap-1.5 text-[10px] font-bold transition-all"
        >
          <Trash2 className="w-4 h-4" /> Clear All
        </button>
      </div>

      <div className="space-y-2.5">
        {list.length === 0 ? (
          <div className="text-center py-12 bg-white/2 border border-white/5 rounded-2xl">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-slate-500 font-mono">No system dispatches in your inbox.</p>
          </div>
        ) : (
          list.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`border rounded-2xl p-4 transition-all relative overflow-hidden cursor-pointer ${
                n.read
                  ? 'bg-slate-950/20 border-white/5 opacity-60'
                  : 'bg-white/5 border-emerald-500/20 shadow-md hover:bg-white/10'
              }`}
            >
              {!n.read && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400" />}

              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">{n.title}</h4>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed font-sans">{n.message}</p>
              <span className="text-[9px] text-slate-500 font-mono mt-2 block">
                {new Date(n.date).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   ADMIN DASHBOARD VIEW (Visible ONLY to admin@payworth.com)
   ========================================================================== */
function AdminDashboardView() {
  const {
    state,
    adminApproveWithdrawal,
    adminApproveCampaign,
    adminApproveFunding,
    adminReviewTaskSubmission,
    currentUser,
    error,
    successMessage,
    clearMessages,
  } = usePayWorth();

  const [activeAdminTab, setActiveAdminTab] = useState<'withdrawals' | 'campaigns' | 'funding' | 'tasks'>('withdrawals');

  // Skip rendering if not admin
  if (currentUser?.email !== 'admin@payworth.com') {
    return <div className="text-center py-6 text-red-400 font-semibold text-xs font-mono">Access Restricted. Administrator clearance required.</div>;
  }

  // Pending lists
  const pendingWds = state.withdrawals.filter((w) => w.status === 'pending');
  const pendingCamps = state.campaigns.filter((c) => c.status === 'pending_approval');
  const pendingFunds = state.fundingRequests.filter((f) => f.status === 'pending');
  const pendingTasks = state.taskSubmissions.filter((t) => t.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="text-emerald-400 w-5.5 h-5.5" /> Auditor Control Dashboard
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Manual validation queues for withdrawal wires, advertiser campaign escrows, emergency grants, and task evidence reviews.
        </p>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl">{error}</div>}
      {successMessage && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">{successMessage}</div>}

      {/* Admin tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] font-semibold text-slate-400 border-b border-white/5">
        <button
          onClick={() => setActiveAdminTab('withdrawals')}
          className={`px-3 py-1.5 rounded-t-xl transition-all ${
            activeAdminTab === 'withdrawals' ? 'bg-white/5 text-emerald-400 border-b border-emerald-500' : 'hover:text-white'
          }`}
        >
          Withdrawals ({pendingWds.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('campaigns')}
          className={`px-3 py-1.5 rounded-t-xl transition-all ${
            activeAdminTab === 'campaigns' ? 'bg-white/5 text-emerald-400 border-b border-emerald-500' : 'hover:text-white'
          }`}
        >
          Campaigns ({pendingCamps.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('funding')}
          className={`px-3 py-1.5 rounded-t-xl transition-all ${
            activeAdminTab === 'funding' ? 'bg-white/5 text-emerald-400 border-b border-emerald-500' : 'hover:text-white'
          }`}
        >
          Grants ({pendingFunds.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('tasks')}
          className={`px-3 py-1.5 rounded-t-xl transition-all ${
            activeAdminTab === 'tasks' ? 'bg-white/5 text-emerald-400 border-b border-emerald-500' : 'hover:text-white'
          }`}
        >
          Tasks ({pendingTasks.length})
        </button>
      </div>

      <div className="space-y-4 pt-2">
        {/* WITHDRAWAL AUDITING QUEUE */}
        {activeAdminTab === 'withdrawals' && (
          <div className="space-y-3">
            {pendingWds.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">No pending withdrawal settlements in queue.</div>
            ) : (
              pendingWds.map((wd) => (
                <div key={wd.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5">
                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">SETTLEMENT ID:</span>
                      <span className="font-semibold text-white">{wd.id}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono block">REQUESTED BY:</span>
                      <span className="font-semibold text-slate-300">{wd.userName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-black/25 p-3 rounded-xl text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 block">BANK ROUTING:</span>
                      <span className="text-slate-300">{wd.bankName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">ACCOUNT ID:</span>
                      <span className="text-slate-300">{wd.accountNumber}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-[9px] text-slate-500 block">GROSS LEDGER SUM:</span>
                      <span className="text-white font-bold">{wd.amount} PWC</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-[9px] text-slate-500 block">NET WIRE SUM:</span>
                      <span className="text-emerald-400 font-bold">{wd.receiveAmount} PWC</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => adminApproveWithdrawal(wd.id, true)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl active:scale-95 transition-all"
                    >
                      Authorize Disburse
                    </button>
                    <button
                      onClick={() => adminApproveWithdrawal(wd.id, false)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs px-4 py-2 rounded-xl transition-all border border-red-500/15"
                    >
                      Decline & Refund
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CAMPAIGN BRIEF AUDITING QUEUE */}
        {activeAdminTab === 'campaigns' && (
          <div className="space-y-3">
            {pendingCamps.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">No pending campaign escrows to audit.</div>
            ) : (
              pendingCamps.map((camp) => (
                <div key={camp.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div>
                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono uppercase">{camp.category}</span>
                    <h4 className="text-xs font-bold text-white mt-1.5">{camp.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal italic">"{camp.description}"</p>
                  </div>

                  <div className="bg-black/25 p-3 rounded-xl text-xs font-mono grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-500 block">CREATOR:</span>
                      <span className="text-slate-300">{camp.creatorName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">DEADLINE:</span>
                      <span className="text-slate-300">{camp.deadline}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-[9px] text-slate-500 block">REQUIRED ESCROW LOCKED:</span>
                      <span className="text-emerald-400 font-bold">{camp.rewardPool} PWC</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => adminApproveCampaign(camp.id, true)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl active:scale-95 transition-all"
                    >
                      Authorize & Launch live
                    </button>
                    <button
                      onClick={() => adminApproveCampaign(camp.id, false)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs px-4 py-2 rounded-xl transition-all border border-red-500/15"
                    >
                      Reject & Refund Escrow
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* EMERGENCY GRANT AUDITING QUEUE */}
        {activeAdminTab === 'funding' && (
          <div className="space-y-3">
            {pendingFunds.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">No pending funding grant logs in queue.</div>
            ) : (
              pendingFunds.map((fund) => (
                <div key={fund.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">APPLICANT: {fund.userName}</span>
                    <span className="text-white font-bold">{fund.amount} PWC requested</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal italic bg-black/25 p-2.5 rounded-xl">"{fund.reason}"</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => adminApproveFunding(fund.id, true)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl active:scale-95 transition-all"
                    >
                      Authorize grant
                    </button>
                    <button
                      onClick={() => {
                        const feedback = prompt('Enter rejection auditor feedback:');
                        if (feedback !== null) {
                          adminApproveFunding(fund.id, false, feedback || undefined);
                        }
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs px-4 py-2 rounded-xl transition-all border border-red-500/15"
                    >
                      Decline request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TASK EVIDENCE VERIFICATION QUEUE */}
        {activeAdminTab === 'tasks' && (
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">No task evidence verifications pending.</div>
            ) : (
              pendingTasks.map((sub) => {
                const task = state.tasks.find((t) => t.id === sub.taskId);
                return (
                  <div key={sub.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">USER: {sub.userName}</span>
                      <span className="text-emerald-400 font-bold">Reward: {task?.reward} PWC</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{task?.title}</h5>
                      <span className="text-[9px] text-slate-500 font-mono">Doc reference ID: {sub.id}</span>
                    </div>

                    <div className="bg-black/30 p-2.5 rounded-xl text-[11px] text-slate-300 leading-normal break-all">
                      <span className="text-[9px] text-slate-500 block mb-1 font-mono">SUBMITTED PROOF:</span>
                      {sub.evidence}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => adminReviewTaskSubmission(sub.id, 'approved')}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl active:scale-95 transition-all"
                      >
                        Approve & Credit Balance
                      </button>
                      <button
                        onClick={() => {
                          const feedback = prompt('Enter rejection reason (penalizes user trust score):');
                          if (feedback !== null) {
                            adminReviewTaskSubmission(sub.id, 'rejected', feedback || undefined);
                          }
                        }}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs px-4 py-2 rounded-xl transition-all border border-red-500/15"
                      >
                        Reject & Penalize
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   STATIC INFO VIEW
   ========================================================================== */
function StaticInfoView({ page }: { page: string }) {
  const { currentUser, verifyEmail, state } = usePayWorth();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMsg.trim()) return;
    setContactSending(true);
    // Secure contact dispatch simulation
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setContactSending(false);
    setContactSuccess(true);
    setContactName('');
    setContactMsg('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      {page === 'profile' && (
        <>
          <div className="flex flex-col items-center text-center">
            <img
              src={currentUser?.avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 mb-3"
            />
            <h4 className="text-base font-bold text-white">{currentUser?.username}</h4>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono mt-1">
              {currentUser?.membershipTier}
            </span>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-4 text-xs font-sans">
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-white font-medium">{currentUser?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Security ID:</span>
              <span className="text-white font-mono">{currentUser?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Clearance status:</span>
              <span className="text-emerald-400 font-semibold uppercase">{currentUser?.kycStatus}</span>
            </div>
          </div>
        </>
      )}

      {page === 'help' && (
        <>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" /> Platform Knowledge Base
          </h4>
          <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-sans">
            <div>
              <h5 className="font-bold text-white">How do I request a withdrawal?</h5>
              <p className="text-slate-400 text-[11px] mt-1">
                Once your verified balance exceeds 100 PWC and your Trust Score is above 60%, click "Withdraw" on the Wallet tab. Provide bank routing details to initiate a wire transfer.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-white">What is the Escrow system?</h5>
              <p className="text-slate-400 text-[11px] mt-1">
                When you publish briefs on the marketplace, your total slot rewards are locked in an audited escrow, guaranteeing work payments for workers who provide verified reports.
              </p>
            </div>
          </div>
        </>
      )}

      {page === 'privacy' && (
        <>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Privacy & Encryption Standards
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            We employ bank-grade SSL and custom ledger hashing. Your linked routing accounts, legal identities, and screenshot uploads are end-to-end encrypted and completely scrubbed from commercial advertising crawlers.
          </p>
        </>
      )}

      {page === 'terms' && (
        <>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" /> Terms of Use & Policies
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            By joining PayWorth, you guarantee logical, human-reflex cooperation. Bots, click farms, and fake screenshot uploads are immediately tracked. Violation triggers irreversible -15 Trust penalties and ledger freezes.
          </p>
        </>
      )}

      {page === 'about' && (
        <>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" /> About Glassline Studio
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            PayWorth is engineered by Glassline Foundry, a next-gen communications and fintech pioneer. Our platform combines beautiful liquid glass interfaces, physical responsiveness, and secure crowd-sourced micro-task ledgers.
          </p>
        </>
      )}

      {page === 'contact' && (
        <>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400" /> Secure Support Desk
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Have queries regarding compliance settlements, escrow claims, or business briefs? Submit a ticket directly to the Glassline Foundry audit desk.
          </p>

          {contactSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-xl">
              ✓ Ticket securely dispatched to Glassline audit team. Case ID: PW-{Math.floor(Math.random() * 8999 + 1000)}
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-mono uppercase block">Your Full Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Satoshi Nakamoto"
                className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-mono uppercase block">Secure Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@provider.com"
                required
                className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-slate-500 font-mono uppercase block">Message / Escalation Brief</label>
              <textarea
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                placeholder="Describe your inquiry or case context..."
                required
                rows={3}
                className="w-full bg-black/40 border border-white/5 outline-none text-white text-xs p-2.5 rounded-xl resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={contactSending}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-55"
            >
              {contactSending ? 'Dispatching encrypted ticket...' : 'Transmit Encrypted Ticket'}
            </button>
          </form>
        </>
      )}

      {page === 'security' && (
        <>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cryptographic Ledger Security
          </h4>
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
            <p>
              PayWorth leverages enterprise-grade cryptographic ledger validation. Every credit, transfer, or withdrawal action triggers a secure server-authoritative handshake, completely avoiding double-spending and unauthorized client state manipulation.
            </p>
            <div className="bg-black/35 border border-white/5 p-3 rounded-xl space-y-2 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between">
                <span>SECURE HASH METHOD:</span>
                <span className="text-emerald-400">SHA-256</span>
              </div>
              <div className="flex justify-between">
                <span>DATABASE ENCRYPTION:</span>
                <span className="text-emerald-400">AES-256 (GCM)</span>
              </div>
              <div className="flex justify-between">
                <span>OAUTH TRANSPORT:</span>
                <span className="text-emerald-400">TLS 1.3 / SSL Verified</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Our code and database schema are fully audited. Platform auditors actively monitor verification queues with automated fraud detection and brute-force protection algorithms.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
