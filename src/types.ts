export type MembershipTier =
  | 'Dark Bronze'
  | 'Bright Iron'
  | 'Shining Silver'
  | 'Shimmering Gold'
  | 'Aspiring Platinum'
  | 'Resilient Diamond'
  | 'Epic'
  | 'Legend'
  | 'Mythical';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  pwcBalance: number;
  pendingBalance: number;
  lockedBalance: number;
  lifetimeEarned: number;
  lifetimeWithdrawn: number;
  trustScore: number; // 0 to 100
  xp: number;
  level: number;
  membershipTier: MembershipTier;
  referralCode: string;
  referredBy: string | null;
  onboardingCompleted: boolean;
  welcomeCompleted: boolean;
  emailVerified: boolean;
  achievementsClaimed: string[];
  dailyRewardClaimedAt: string | null;
  luckyWheelSpinsRemaining: number;
  gamesPlayedToday: Record<string, number>;
  selectedGamesToday?: string[]; // track the 5 selected games for the day
  completedWelcomeCampaigns?: string[]; // IDs of completed welcome campaigns
  verifiedWelcomeCampaigns?: string[]; // IDs of welcome campaigns submitted/pending
  createdAt?: string; // Account creation timestamp
  lastPlayResetDate?: string; // track the date of last games reset for midnight auto-reset
  kycStatus: 'unverified' | 'pending' | 'verified';
  trustHistory: Array<{ date: string; change: number; reason: string }>;
  virtualAccount: {
    accountNumber: string;
    bankName: string;
    holderName: string;
  } | null;
  walletNumber: string;
  walletStatus: 'active' | 'locked' | 'frozen';
  walletPin: string | null;
  dailyLimit: number;
  monthlyLimit: number;
  spendingLimit: number;
  walletLevel: number;
  currentStreak?: number;
  lastStreakDate?: string;
  inventory?: InventoryItem[];
  miningState?: MiningSession;
  legalAcceptedVersion?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'booster' | 'frame' | 'theme' | 'title' | 'coupon' | 'chest';
  description: string;
  quantity: number;
  acquiredAt: string;
  expiresAt?: string;
  iconName?: string;
}

export interface MiningBot {
  tierRequired: MembershipTier;
  botName: string;
  model: string;
  speedPwcPerHour: number;
  multiplier: number;
  maxStoragePwc: number;
  collectionIntervalMinutes: number;
  maxDurationHours: number;
  accentColor: string;
  bgGradient: string;
  headquartersName: string;
  hqDescription: string;
  modules: string[];
}

export interface MiningSession {
  botName: string;
  tier: MembershipTier;
  startedAt: string;
  lastCollectedAt: string;
  minedPwc: number;
  status: 'active' | 'storage_full' | 'idle';
  activeBoosters: string[];
  totalCollectedLifetime: number;
}

export interface MiningModule {
  id: string;
  name: string;
  type: 'core' | 'processor' | 'cooling' | 'power' | 'ai';
  boostPercentage: number;
  level: number;
  unlockedAtTier: MembershipTier;
}

export type GameCategory =
  | 'Arcade'
  | 'Puzzle'
  | 'Trivia'
  | 'Strategy'
  | 'Reflex'
  | 'Memory'
  | 'Board'
  | 'Card'
  | 'Word'
  | 'Racing'
  | 'Adventure'
  | 'Casual'
  | 'Skill'
  | 'Tournament'
  | 'Seasonal';

export interface CatalogGame {
  id: string;
  title: string;
  category: GameCategory;
  description: string;
  minTier: MembershipTier;
  baseRewardPwc: number;
  xpReward: number;
  playsRemainingToday: number;
  maxDailyPlays: number;
  icon: string;
  isHot?: boolean;
  isNew?: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
}

export interface ReferralStat {
  code: string;
  url: string;
  deepLink: string;
  totalClicks: number;
  totalSignups: number;
  qualifiedReferrals: number;
  premiumReferrals: number;
  totalEarningsPwc: number;
  pendingEarningsPwc: number;
  riskScore: number; // 0 - 100
  holdingPeriodDays: number;
}

export interface ReferralRecord {
  id: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  joinedAt: string;
  type: 'standard' | 'premium';
  tierPurchased?: MembershipTier;
  rewardPwc: number;
  status: 'visited' | 'signed_up' | 'qualified' | 'pending' | 'approved' | 'rejected' | 'fraud';
  releaseDate: string;
  riskScore: number;
  ipAddress?: string;
  country?: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  description: string;
  category:
    | 'task'
    | 'referral'
    | 'daily_reward'
    | 'wheel'
    | 'game'
    | 'deposit'
    | 'withdrawal'
    | 'membership_upgrade'
    | 'transfer_sent'
    | 'transfer_received'
    | 'campaign_escrow'
    | 'campaign_refund'
    | 'merchant_payment'
    | 'cashback'
    | 'transfer_reversal';
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  referenceId?: string;
}

export type TaskCategory =
  | 'daily'
  | 'weekly'
  | 'advertiser'
  | 'community'
  | 'gaming'
  | 'education'
  | 'business';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  reward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  estTime: string;
  slots: number;
  remainingSlots: number;
  trustRequirement: number;
  link?: string;
  status?: 'active' | 'completed' | 'pending';
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  evidence: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  reward: number;
  slots: number;
  remainingSlots: number;
  rewardPool: number;
  creatorId: string;
  creatorName: string;
  trustRating: number;
  deadline: string;
  status: 'pending_approval' | 'active' | 'ended';
  approvalMethod: 'auto' | 'manual';
}

export interface CampaignSubmission {
  id: string;
  campaignId: string;
  userId: string;
  userName: string;
  evidenceUrl?: string;
  textEvidence: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  targetType: 'tasks' | 'pwc' | 'referrals' | 'games';
  targetValue: number;
  rewardXP: number;
  rewardPWC: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'task' | 'reward' | 'withdrawal' | 'marketplace' | 'membership' | 'system';
  read: boolean;
  date: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  fee: number;
  receiveAmount: number;
  settlementDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
}

export interface FundingRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  feedback?: string;
}
