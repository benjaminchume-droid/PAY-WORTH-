export type MembershipTier =
  | 'Dark Bronze'
  | 'Bright Iron'
  | 'Shining Silver'
  | 'Shimmering Gold'
  | 'Aspiring Platinum'
  | 'Resilient Diamond'
  | 'Epic Legend'
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
  kycStatus: 'unverified' | 'pending' | 'verified';
  trustHistory: Array<{ date: string; change: number; reason: string }>;
  virtualAccount: {
    accountNumber: string;
    bankName: string;
    holderName: string;
  } | null;
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
    | 'campaign_refund';
  status: 'completed' | 'pending' | 'failed';
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
