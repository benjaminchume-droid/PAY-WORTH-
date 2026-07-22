import { MembershipTier, MiningBot } from '../types';

export interface MembershipDetails {
  name: MembershipTier;
  costNaira: number;
  costPwc: number;
  multiplier: number;
  minLevel: number;
  minTrust: number;
  badge: string;
  frameColor: string;
  gradient: string;
  accentColor: string;
  hqName: string;
  hqDescription: string;
  gamesUnlockedCount: number;
  miningBotName: string | null;
  vaultName: string;
  benefits: string[];
}

export const MEMBERSHIP_FULL_SPECS: Record<MembershipTier, MembershipDetails> = {
  'Dark Bronze': {
    name: 'Dark Bronze',
    costNaira: 0,
    costPwc: 0,
    multiplier: 1.0,
    minLevel: 1,
    minTrust: 0,
    badge: '🌑 Bronze Initiate',
    frameColor: 'border-amber-900/50',
    gradient: 'from-amber-950 via-slate-900 to-black',
    accentColor: '#b45309',
    hqName: 'The Workshop',
    hqDescription: 'Entry-level hub for baseline tasks, community arcade games, and starter campaigns.',
    gamesUnlockedCount: 20,
    miningBotName: null,
    vaultName: 'Bronze Wooden Chest',
    benefits: [
      'Access to 20 Starter Arcade Mini-Games',
      '1.0x Core Earning Multiplier on Tasks',
      'Standard Settlement Processing Queue',
      'Community Chat & General Feed Access',
      'Bronze Member Badge & Frame'
    ]
  },
  'Bright Iron': {
    name: 'Bright Iron',
    costNaira: 1500,
    costPwc: 250,
    multiplier: 1.15,
    minLevel: 2,
    minTrust: 30,
    badge: '⚙️ Iron Worker',
    frameColor: 'border-slate-400/60',
    gradient: 'from-slate-800 via-zinc-900 to-black',
    accentColor: '#94a3b8',
    hqName: 'Iron Factory',
    hqDescription: 'Industrial assembly floor for accelerated campaign participation and task execution.',
    gamesUnlockedCount: 30,
    miningBotName: null,
    vaultName: 'Iron Reinforced Chest',
    benefits: [
      'Access to 30 Enhanced Games',
      '1.15x Earning Multiplier',
      'Unlock Community Campaign Creation (up to ₦10k reward pool)',
      '24h Faster Settlement Processing',
      'Iron Member Profile Emblem'
    ]
  },
  'Shining Silver': {
    name: 'Shining Silver',
    costNaira: 3000,
    costPwc: 600,
    multiplier: 1.35,
    minLevel: 4,
    minTrust: 50,
    badge: '🥈 Silver Operative',
    frameColor: 'border-slate-300',
    gradient: 'from-slate-700 via-slate-900 to-slate-950',
    accentColor: '#cbd5e1',
    hqName: 'Silver Mine',
    hqDescription: 'Subterranean mining facility extracting autonomous PWC passive yield via Mk II Miner.',
    gamesUnlockedCount: 45,
    miningBotName: 'Mk II Miner',
    vaultName: 'Silver Vault',
    benefits: [
      'Unlock Mk II PWC Mining Bot (Autopilot Yield)',
      'Access to 45 Curated Games',
      '1.35x Earning Multiplier',
      'Priority Settlement Processing Queue',
      'Silver Profile Ring & Silver Badge'
    ]
  },
  'Shimmering Gold': {
    name: 'Shimmering Gold',
    costNaira: 5000,
    costPwc: 1200,
    multiplier: 1.60,
    minLevel: 6,
    minTrust: 65,
    badge: '🥇 Gold Aristocrat',
    frameColor: 'border-amber-400',
    gradient: 'from-amber-900/80 via-yellow-950 to-slate-950',
    accentColor: '#f59e0b',
    hqName: 'Gold Vault',
    hqDescription: 'High-security financial vault housing specialized yield instruments and high-yield campaigns.',
    gamesUnlockedCount: 60,
    miningBotName: 'Mk III Miner',
    vaultName: 'Gold Vault',
    benefits: [
      'Unlock Mk III Advanced PWC Mining Bot',
      'Access to 60 Strategy & Puzzle Games',
      '1.60x Earning Multiplier',
      'Reduced Withdrawal Fees by 50%',
      'Create WhatsApp/Telegram/Discord Campaign Communities',
      'Gold Lounge & Exclusive Discord Badge'
    ]
  },
  'Aspiring Platinum': {
    name: 'Aspiring Platinum',
    costNaira: 7000,
    costPwc: 1800,
    multiplier: 1.90,
    minLevel: 8,
    minTrust: 75,
    badge: '💠 Platinum Elite',
    frameColor: 'border-cyan-400',
    gradient: 'from-cyan-950 via-slate-900 to-slate-950',
    accentColor: '#06b6d4',
    hqName: 'Platinum Nexus',
    hqDescription: 'Quantum data nexus offering ultra-fast task processing and accelerated mining speeds.',
    gamesUnlockedCount: 75,
    miningBotName: 'Quantum Miner',
    vaultName: 'Platinum Vault',
    benefits: [
      'Unlock Quantum Miner with Quantum Core Modules',
      'Access to 75 High-Tier Games',
      '1.90x Earning Multiplier',
      'Advanced Campaign Creator Studio & Analytics',
      'Dedicated VIP Support Manager'
    ]
  },
  'Resilient Diamond': {
    name: 'Resilient Diamond',
    costNaira: 10000,
    costPwc: 2800,
    multiplier: 2.30,
    minLevel: 12,
    minTrust: 85,
    badge: '💎 Diamond Tycoon',
    frameColor: 'border-blue-400',
    gradient: 'from-blue-950 via-slate-900 to-slate-950',
    accentColor: '#3b82f6',
    hqName: 'Diamond Citadel',
    hqDescription: 'Impregnable fortress with zero-fee transactions and crystalized PWC passive mining.',
    gamesUnlockedCount: 90,
    miningBotName: 'Crystal Miner',
    vaultName: 'Diamond Vault',
    benefits: [
      'Unlock Crystal Miner (Highest Base Output)',
      'Access to 90 Premium Games',
      '2.30x Earning Multiplier',
      'Zero Withdrawal Fees Forever',
      'Featured Campaign Spotlights on Home Screen'
    ]
  },
  'Epic': {
    name: 'Epic',
    costNaira: 12000,
    costPwc: 3500,
    multiplier: 2.80,
    minLevel: 15,
    minTrust: 90,
    badge: '🔥 Epic Vanguard',
    frameColor: 'border-purple-500',
    gradient: 'from-purple-950 via-slate-900 to-slate-950',
    accentColor: '#a855f7',
    hqName: 'Epic Sanctum',
    hqDescription: 'Mystical technological sanctuary holding high-stakes sponsored campaign tools.',
    gamesUnlockedCount: 100,
    miningBotName: 'Hyper Miner',
    vaultName: 'Epic Vault',
    benefits: [
      'Unlock Hyper Miner with 2x Speed Multipliers',
      'Access to All 100 Mainstream Catalog Games',
      '2.80x Earning Multiplier',
      'Sponsored Campaigns & Advanced Reward Configuration',
      'Epic Animated Avatar Ring & Purple Neon Glow'
    ]
  },
  'Legend': {
    name: 'Legend',
    costNaira: 15000,
    costPwc: 4500,
    multiplier: 3.50,
    minLevel: 20,
    minTrust: 95,
    badge: '👑 Legend Overlord',
    frameColor: 'border-yellow-300',
    gradient: 'from-amber-950 via-purple-950 to-slate-950',
    accentColor: '#eab308',
    hqName: 'Hall of Legends',
    hqDescription: 'Hall of fame for platform leaders, early beta game access, and AI mining management.',
    gamesUnlockedCount: 100, // + Beta Games
    miningBotName: 'Legendary AI Miner',
    vaultName: 'Legend Vault',
    benefits: [
      'Unlock Legendary AI Miner (Self-Optimizing Yield)',
      'Access to All 100 Games + Beta Release Games',
      '3.50x Earning Multiplier',
      'Instant Settlement Guarantee',
      'Priority Campaign Approval Queue'
    ]
  },
  'Mythical': {
    name: 'Mythical',
    costNaira: 20000,
    costPwc: 6000,
    multiplier: 5.00,
    minLevel: 25,
    minTrust: 98,
    badge: '🌌 Mythical Cosmic Entity',
    frameColor: 'border-emerald-400',
    gradient: 'from-emerald-950 via-cyan-950 to-black',
    accentColor: '#10b981',
    hqName: 'Mythical Realm',
    hqDescription: 'Cosmic dimension granting total platform privilege, experimental games, and founder council access.',
    gamesUnlockedCount: 100, // + Experimental Games
    miningBotName: 'Celestial Miner',
    vaultName: 'Mythical Galaxy Vault',
    benefits: [
      'Unlock Celestial Miner with Infinite Yield Capacity',
      'Access to All Games + Experimental Releases + Early Drops',
      '5.0x Hyper Earning Multiplier',
      'Direct Direct Line to PayWorth Founders',
      'Mythical Cosmic Title & Animated Golden Star Aura'
    ]
  }
};

export const MINING_BOT_SPECS: Record<string, MiningBot> = {
  'Mk II Miner': {
    tierRequired: 'Shining Silver',
    botName: 'Mk II Miner',
    model: 'SLV-MK2-BOT',
    speedPwcPerHour: 15,
    multiplier: 1.2,
    maxStoragePwc: 120,
    collectionIntervalMinutes: 30,
    maxDurationHours: 8,
    accentColor: '#cbd5e1',
    bgGradient: 'from-slate-800 to-slate-950',
    headquartersName: 'Silver Mine',
    hqDescription: 'Subterranean silver extractor running on dual hydraulic servos.',
    modules: ['Core Driver', 'Silver Sieve Filter']
  },
  'Mk III Miner': {
    tierRequired: 'Shimmering Gold',
    botName: 'Mk III Miner',
    model: 'GLD-MK3-BOT',
    speedPwcPerHour: 30,
    multiplier: 1.5,
    maxStoragePwc: 300,
    collectionIntervalMinutes: 20,
    maxDurationHours: 10,
    accentColor: '#f59e0b',
    bgGradient: 'from-amber-900 to-black',
    headquartersName: 'Gold Vault',
    hqDescription: 'High-speed laser excavator operating inside fortified vault vaults.',
    modules: ['Core Driver', 'Laser Cutter', 'Gold Sieve Filter']
  },
  'Quantum Miner': {
    tierRequired: 'Aspiring Platinum',
    botName: 'Quantum Miner',
    model: 'PLT-Q1-BOT',
    speedPwcPerHour: 60,
    multiplier: 2.0,
    maxStoragePwc: 600,
    collectionIntervalMinutes: 15,
    maxDurationHours: 12,
    accentColor: '#06b6d4',
    bgGradient: 'from-cyan-900 to-slate-950',
    headquartersName: 'Platinum Nexus',
    hqDescription: 'Quantum entanglement generator extracting micro-PWC yields.',
    modules: ['Quantum Processor', 'Liquid Cooling', 'Laser Cutter']
  },
  'Crystal Miner': {
    tierRequired: 'Resilient Diamond',
    botName: 'Crystal Miner',
    model: 'DMD-CST-BOT',
    speedPwcPerHour: 100,
    multiplier: 2.5,
    maxStoragePwc: 1200,
    collectionIntervalMinutes: 10,
    maxDurationHours: 16,
    accentColor: '#3b82f6',
    bgGradient: 'from-blue-900 to-slate-950',
    headquartersName: 'Diamond Citadel',
    hqDescription: 'Sub-zero diamond crystal synthesizer with zero heat loss.',
    modules: ['Crystal Synthesizer', 'Quantum Processor', 'Supercooling Core']
  },
  'Hyper Miner': {
    tierRequired: 'Epic',
    botName: 'Hyper Miner',
    model: 'EPC-HYP-BOT',
    speedPwcPerHour: 160,
    multiplier: 3.2,
    maxStoragePwc: 2000,
    collectionIntervalMinutes: 10,
    maxDurationHours: 18,
    accentColor: '#a855f7',
    bgGradient: 'from-purple-900 to-slate-950',
    headquartersName: 'Epic Sanctum',
    hqDescription: 'Hyper-drive particle accelerator running plasma extraction channels.',
    modules: ['Plasma Injector', 'Crystal Synthesizer', 'Supercooling Core', 'AI Optimizer']
  },
  'Legendary AI Miner': {
    tierRequired: 'Legend',
    botName: 'Legendary AI Miner',
    model: 'LGD-AI9-BOT',
    speedPwcPerHour: 250,
    multiplier: 4.2,
    maxStoragePwc: 3500,
    collectionIntervalMinutes: 5,
    maxDurationHours: 24,
    accentColor: '#eab308',
    bgGradient: 'from-amber-800 via-purple-950 to-black',
    headquartersName: 'Hall of Legends',
    hqDescription: 'Autonomous Neural AI Bot adjusting extraction algorithms in real-time.',
    modules: ['Neural AI Engine', 'Plasma Injector', 'Quantum Core', 'Overclock Battery']
  },
  'Celestial Miner': {
    tierRequired: 'Mythical',
    botName: 'Celestial Miner',
    model: 'MYTH-CLS-BOT',
    speedPwcPerHour: 500,
    multiplier: 6.0,
    maxStoragePwc: 8000,
    collectionIntervalMinutes: 1,
    maxDurationHours: 24,
    accentColor: '#10b981',
    bgGradient: 'from-emerald-900 via-cyan-950 to-black',
    headquartersName: 'Mythical Realm',
    hqDescription: 'Cosmic reactor harvesting multi-dimensional PWC yields directly from the platform core.',
    modules: ['Cosmic Singularity Engine', 'Neural AI Engine', 'Infinite Storage Array', 'Starlight Battery']
  }
};
