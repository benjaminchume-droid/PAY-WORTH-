import {
  User,
  LedgerEntry,
  Task,
  TaskSubmission,
  Campaign,
  CampaignSubmission,
  Achievement,
  Notification,
  WithdrawalRequest,
  FundingRequest,
  MembershipTier,
  TaskCategory
} from '../types';

export const MEMBERSHIP_TIERS_DATA: Array<{
  name: MembershipTier;
  multiplier: number;
  cost: number;
  minLevel: number;
  minTrust: number;
  benefits: string[];
}> = [
  {
    name: 'Dark Bronze',
    multiplier: 1.0,
    cost: 0,
    minLevel: 1,
    minTrust: 0,
    benefits: ['1.0x Core Earning Multiplier', 'Standard Settlement Queue', 'Basic Support Email'],
  },
  {
    name: 'Bright Iron',
    multiplier: 1.1,
    cost: 250,
    minLevel: 2,
    minTrust: 50,
    benefits: ['1.1x Earning Multiplier', '24h Faster Settlement Queue', 'Unlock Community Task Creation'],
  },
  {
    name: 'Shining Silver',
    multiplier: 1.25,
    cost: 750,
    minLevel: 4,
    minTrust: 60,
    benefits: ['1.25x Earning Multiplier', 'Priority Settlement Processing', 'Silver Profile Emblem'],
  },
  {
    name: 'Shimmering Gold',
    multiplier: 1.5,
    cost: 2000,
    minLevel: 7,
    minTrust: 70,
    benefits: ['1.5x Earning Multiplier', 'Reduced Withdrawal Fees by 50%', 'Gold Discord Badge & Lounge Access'],
  },
  {
    name: 'Aspiring Platinum',
    multiplier: 1.8,
    cost: 5000,
    minLevel: 10,
    minTrust: 80,
    benefits: ['1.8x Earning Multiplier', 'Dedicated VIP Manager', 'Early Access to Creator Campaigns'],
  },
  {
    name: 'Resilient Diamond',
    multiplier: 2.2,
    cost: 12000,
    minLevel: 15,
    minTrust: 90,
    benefits: ['2.2x Earning Multiplier', 'Zero Withdrawal Fees', 'Diamond Profile Ring'],
  },
  {
    name: 'Epic Legend',
    multiplier: 3.0,
    cost: 30000,
    minLevel: 20,
    minTrust: 95,
    benefits: ['3.0x Earning Multiplier', 'Instant Settlement Guarantee', 'Legendary Badge & Special Avatar Ring'],
  },
  {
    name: 'Mythical',
    multiplier: 5.0,
    cost: 100000,
    minLevel: 30,
    minTrust: 98,
    benefits: ['5.0x Hyper Earning Multiplier', 'Direct Line to Founder & Board', 'Mythical Title & Golden Aura Glow'],
  },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_task',
    title: 'Initiate Worker',
    description: 'Complete your first legitimacy task successfully.',
    targetType: 'tasks',
    targetValue: 1,
    rewardXP: 100,
    rewardPWC: 50,
  },
  {
    id: 'ach_ten_tasks',
    title: 'Veteran Operative',
    description: 'Complete 10 legitimacy tasks successfully.',
    targetType: 'tasks',
    targetValue: 10,
    rewardXP: 500,
    rewardPWC: 250,
  },
  {
    id: 'ach_earn_1000',
    title: 'PWC Elite',
    description: 'Accumulate a lifetime earning of 1,000 PayWorth Coins.',
    targetType: 'pwc',
    targetValue: 1000,
    rewardXP: 300,
    rewardPWC: 150,
  },
  {
    id: 'ach_three_referrals',
    title: 'Viral Networker',
    description: 'Invite 3 active members through your referral link.',
    targetType: 'referrals',
    targetValue: 3,
    rewardXP: 400,
    rewardPWC: 200,
  },
  {
    id: 'ach_ten_games',
    title: 'Recreation Master',
    description: 'Play mini-games 10 times.',
    targetType: 'games',
    targetValue: 10,
    rewardXP: 200,
    rewardPWC: 80,
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_email_verify',
    title: 'Verify Your Profile Credentials',
    description: 'Confirm your email and complete basic security verification setup to start earning higher tiers of rewards.',
    category: 'daily',
    reward: 20,
    difficulty: 'Easy',
    estTime: '1 Min',
    slots: 10000,
    remainingSlots: 9845,
    trustRequirement: 0,
  },
  {
    id: 'task_kyc_submit',
    title: 'Submit Basic KYC Identification',
    description: 'Verify your ID securely to unlock withdrawal mechanics, secure virtual account bindings, and higher membership tiers.',
    category: 'business',
    reward: 150,
    difficulty: 'Medium',
    estTime: '5 Mins',
    slots: 5000,
    remainingSlots: 4920,
    trustRequirement: 20,
  },
  {
    id: 'task_ad_video',
    title: 'Watch PayWorth Introduction & Platform Tour',
    description: 'Learn the principles of PayWorth, how to avoid fraud penalties, and how our trust ledger guarantees reward verification.',
    category: 'education',
    reward: 35,
    difficulty: 'Easy',
    estTime: '3 Mins',
    slots: 10000,
    remainingSlots: 7450,
    trustRequirement: 0,
  },
  {
    id: 'task_subscribe_channel',
    title: 'Subscribe to Our Official Community Channel',
    description: 'Subscribe, click notifications, and upload a proof screenshot of your subscription page showing the subscription button.',
    category: 'community',
    reward: 40,
    difficulty: 'Easy',
    estTime: '2 Mins',
    slots: 5000,
    remainingSlots: 4120,
    trustRequirement: 10,
  },
  {
    id: 'task_game_score',
    title: 'Reach 30 Points in Mini Games',
    description: 'Play Snake or Memory Match and achieve a score of 30+ to prove bot resistance and human motor response.',
    category: 'gaming',
    reward: 50,
    difficulty: 'Medium',
    estTime: '4 Mins',
    slots: 2000,
    remainingSlots: 1842,
    trustRequirement: 10,
  },
  {
    id: 'task_promote_worth',
    title: 'Write an Analytical Post about PayWorth',
    description: 'Share a high-quality review of PayWorth’s modern finance ecosystem on your social feed, blog, or professional network.',
    category: 'advertiser',
    reward: 200,
    difficulty: 'Hard',
    estTime: '15 Mins',
    slots: 500,
    remainingSlots: 485,
    trustRequirement: 30,
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_01',
    title: 'Product Beta Testing Feedback',
    description: 'Test our latest secure payment dashboard, submit a 3-sentence user experience analysis, and screenshot.',
    category: 'Business',
    reward: 80,
    slots: 100,
    remainingSlots: 72,
    rewardPool: 8000,
    creatorId: 'user_admin',
    creatorName: 'PayWorth Admin',
    trustRating: 98,
    deadline: '2026-08-30',
    status: 'active',
    approvalMethod: 'manual',
  },
  {
    id: 'camp_02',
    title: 'Tech Blog Referral Share',
    description: 'Share our platform on your professional network or social feed, and submit the link below for immediate validation review.',
    category: 'Advertiser',
    reward: 120,
    slots: 50,
    remainingSlots: 31,
    rewardPool: 6000,
    creatorId: 'user_dev_creator',
    creatorName: 'ViteMaster Labs',
    trustRating: 92,
    deadline: '2026-08-15',
    status: 'active',
    approvalMethod: 'manual',
  },
];

export interface AppState {
  users: Record<string, User>; // keyed by id/email
  currentUser: User | null;
  ledger: Record<string, LedgerEntry[]>; // keyed by userId
  tasks: Task[];
  taskSubmissions: TaskSubmission[];
  campaigns: Campaign[];
  campaignSubmissions: CampaignSubmission[];
  notifications: Record<string, Notification[]>; // keyed by userId
  withdrawals: WithdrawalRequest[];
  fundingRequests: FundingRequest[];
  referrals: Record<string, string[]>; // referrerId -> list of referredIds
}

const STORAGE_KEY = 'payworth_state_v1';

export function getInitialState(): AppState {
  const adminUser: User = {
    id: 'user_admin',
    email: 'admin@payworth.com',
    username: 'PayWorth Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    isVerified: true,
    pwcBalance: 15000,
    pendingBalance: 0,
    lockedBalance: 0,
    lifetimeEarned: 25000,
    lifetimeWithdrawn: 10000,
    trustScore: 100,
    xp: 4500,
    level: 15,
    membershipTier: 'Mythical',
    referralCode: 'FOUNDER99',
    referredBy: null,
    onboardingCompleted: true,
    welcomeCompleted: true,
    emailVerified: true,
    achievementsClaimed: ['ach_first_task'],
    dailyRewardClaimedAt: null,
    luckyWheelSpinsRemaining: 10,
    gamesPlayedToday: {},
    selectedGamesToday: [],
    completedWelcomeCampaigns: [],
    verifiedWelcomeCampaigns: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days old so within 7-day Welcome period
    kycStatus: 'verified',
    trustHistory: [{ date: '2026-07-01', change: 100, reason: 'Founding account status' }],
    virtualAccount: {
      accountNumber: 'VA-994851240',
      bankName: 'PayWorth Core Bank',
      holderName: 'PAYWORTH FOUNDATION',
    },
    walletNumber: '4125839471',
    walletStatus: 'active',
    walletPin: '1234',
    dailyLimit: 25000,
    monthlyLimit: 250000,
    spendingLimit: 15000,
    walletLevel: 3,
  };

  const initialLedger: LedgerEntry[] = [
    {
      id: 'tx_seed_1',
      timestamp: '2026-07-01T12:00:00Z',
      type: 'credit',
      amount: 15000,
      balanceAfter: 15000,
      description: 'System Provision Ledger Entry',
      category: 'deposit',
      status: 'completed',
    },
  ];

  const state: AppState = {
    users: {
      'admin@payworth.com': adminUser,
    },
    currentUser: null,
    ledger: {
      'user_admin': initialLedger,
    },
    tasks: INITIAL_TASKS,
    taskSubmissions: [],
    campaigns: INITIAL_CAMPAIGNS,
    campaignSubmissions: [],
    notifications: {
      'user_admin': [
        {
          id: 'n_welcome',
          title: 'Welcome to PayWorth Admin Core',
          message: 'System initialization was completed successfully. Use the Admin Dashboard to supervise tasks and financial flows.',
          category: 'system',
          read: false,
          date: '2026-07-20T02:00:00Z',
        },
      ],
    },
    withdrawals: [],
    fundingRequests: [],
    referrals: {},
  };

  return state;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = getInitialState();
      saveState(state);
      return state;
    }
    const state = JSON.parse(raw);
    // Integrity checks
    if (!state.users || !state.tasks || !state.campaigns || !state.ledger) {
      const fresh = getInitialState();
      saveState(fresh);
      return fresh;
    }

    // Dynamic backward compatibility migration for pre-existing records
    if (state.users) {
      Object.keys(state.users).forEach((key) => {
        const u = state.users[key];
        if (!u.walletNumber) {
          // Generate deterministic/stable wallet numbers based on username length or random value
          u.walletNumber = `412${Math.floor(1000000 + Math.random() * 9000000)}`;
          u.walletStatus = u.walletStatus || 'active';
          u.walletPin = u.walletPin || '1234';
          u.dailyLimit = u.dailyLimit || (u.kycStatus === 'verified' ? 25000 : 5000);
          u.monthlyLimit = u.monthlyLimit || (u.kycStatus === 'verified' ? 250000 : 50000);
          u.spendingLimit = u.spendingLimit || (u.kycStatus === 'verified' ? 15000 : 2000);
          u.walletLevel = u.walletLevel || (u.kycStatus === 'verified' ? 2 : 1);
        }
      });
      if (state.currentUser && !state.currentUser.walletNumber) {
        const matching = state.users[state.currentUser.email.toLowerCase()] || state.users[state.currentUser.id];
        if (matching) {
          state.currentUser = matching;
        } else {
          const u = state.currentUser;
          u.walletNumber = `412${Math.floor(1000000 + Math.random() * 9000000)}`;
          u.walletStatus = u.walletStatus || 'active';
          u.walletPin = u.walletPin || '1234';
          u.dailyLimit = u.dailyLimit || (u.kycStatus === 'verified' ? 25000 : 5000);
          u.monthlyLimit = u.monthlyLimit || (u.kycStatus === 'verified' ? 250000 : 50000);
          u.spendingLimit = u.spendingLimit || (u.kycStatus === 'verified' ? 15000 : 2000);
          u.walletLevel = u.walletLevel || (u.kycStatus === 'verified' ? 2 : 1);
        }
      }
    }
    return state;
  } catch (err) {
    console.error('Failed to load PayWorth State from storage, resetting', err);
    return getInitialState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to persist state to storage', err);
  }
}

// Global ledger updates require strict validation logic - everything financial must be verified
export function applyLedgerCredit(
  state: AppState,
  userId: string,
  amount: number,
  description: string,
  category: LedgerEntry['category'],
  status: LedgerEntry['status'] = 'completed'
): AppState {
  const user = Object.values(state.users).find((u) => u.id === userId);
  if (!user) return state;

  const currentBalance = user.pwcBalance;
  const newBalance = status === 'completed' ? currentBalance + amount : currentBalance;
  const pendingChange = status === 'pending' ? amount : 0;

  const newEntry: LedgerEntry = {
    id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    type: 'credit',
    amount,
    balanceAfter: newBalance,
    description,
    category,
    status,
  };

  const userLedger = state.ledger[userId] || [];
  const updatedLedger = [newEntry, ...userLedger];

  const updatedUser: User = {
    ...user,
    pwcBalance: newBalance,
    pendingBalance: user.pendingBalance + pendingChange,
    lifetimeEarned: status === 'completed' ? user.lifetimeEarned + amount : user.lifetimeEarned,
  };

  // Level up progression calculation
  const xpReward = Math.floor(amount * 0.5);
  const result = awardXP(updatedUser, xpReward);

  const updatedState = {
    ...state,
    users: {
      ...state.users,
      [user.email.toLowerCase()]: result.user,
    },
    ledger: {
      ...state.ledger,
      [userId]: updatedLedger,
    },
  };

  if (state.currentUser && state.currentUser.id === userId) {
    updatedState.currentUser = result.user;
  }

  // Create XP level-up system alert if needed
  if (result.leveledUp) {
    updatedState.notifications = {
      ...updatedState.notifications,
      [userId]: [
        {
          id: `notif_level_${Date.now()}`,
          title: '🔥 Level Up!',
          message: `Congratulations! You reached Level ${result.user.level}. Complete higher stakes tasks with enhanced trust multipliers.`,
          category: 'membership',
          read: false,
          date: new Date().toISOString(),
        },
        ...(updatedState.notifications[userId] || []),
      ],
    };
  }

  return updatedState;
}

export function applyLedgerDebit(
  state: AppState,
  userId: string,
  amount: number,
  description: string,
  category: LedgerEntry['category'],
  status: LedgerEntry['status'] = 'completed'
): { success: boolean; state: AppState } {
  const user = Object.values(state.users).find((u) => u.id === userId);
  if (!user) return { success: false, state };

  if (user.pwcBalance < amount) {
    return { success: false, state };
  }

  const newBalance = user.pwcBalance - amount;

  const newEntry: LedgerEntry = {
    id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    type: 'debit',
    amount,
    balanceAfter: newBalance,
    description,
    category,
    status,
  };

  const userLedger = state.ledger[userId] || [];
  const updatedLedger = [newEntry, ...userLedger];

  const updatedUser: User = {
    ...user,
    pwcBalance: newBalance,
    lifetimeWithdrawn: category === 'withdrawal' ? user.lifetimeWithdrawn + amount : user.lifetimeWithdrawn,
  };

  const updatedState = {
    ...state,
    users: {
      ...state.users,
      [user.email.toLowerCase()]: updatedUser,
    },
    ledger: {
      ...state.ledger,
      [userId]: updatedLedger,
    },
  };

  if (state.currentUser && state.currentUser.id === userId) {
    updatedState.currentUser = updatedUser;
  }

  return { success: true, state: updatedState };
}

export function awardXP(user: User, amount: number): { user: User; leveledUp: boolean } {
  let newXp = user.xp + amount;
  let newLevel = user.level;
  let leveledUp = false;

  // Level formula: Level = Math.floor(Math.sqrt(XP / 100)) + 1
  // Let's do simple linear levels: 100 * level required to level up. E.g., Level 1 -> 2 needs 100XP, Level 2 -> 3 needs 200XP, etc.
  while (true) {
    const xpNeededForNext = newLevel * 100;
    if (newXp >= xpNeededForNext) {
      newXp -= xpNeededForNext;
      newLevel += 1;
      leveledUp = true;
    } else {
      break;
    }
  }

  return {
    user: {
      ...user,
      xp: newXp,
      level: newLevel,
    },
    leveledUp,
  };
}

export function updateTrustScore(user: User, change: number, reason: string): User {
  const newTrustScore = Math.min(100, Math.max(0, user.trustScore + change));
  const newHistory = [
    { date: new Date().toISOString().split('T')[0], change, reason },
    ...user.trustHistory,
  ];
  return {
    ...user,
    trustScore: newTrustScore,
    trustHistory: newHistory,
  };
}
