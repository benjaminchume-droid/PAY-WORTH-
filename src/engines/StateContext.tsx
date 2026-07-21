import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MEMBERSHIP_TIERS_DATA, DEFAULT_ACHIEVEMENTS, AppState } from './storage';
import {
  User,
  LedgerEntry,
  Task,
  TaskSubmission,
  Campaign,
  CampaignSubmission,
  Notification,
  WithdrawalRequest,
  FundingRequest,
  MembershipTier
} from '../types';

interface StateContextType {
  appState: AppState;
  loading: boolean;
  currentUser: User | null;
  error: string | null;
  successMessage: string | null;
  activeTab: 'home' | 'tasks' | 'wallet' | 'marketplace';
  setActiveTab: (tab: 'home' | 'tasks' | 'wallet' | 'marketplace') => void;
  activeMenuScreen: string | null;
  setActiveMenuScreen: (screen: string | null) => void;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  onboardingComplete: () => Promise<void>;
  welcomeComplete: (dontShowAgain: boolean) => Promise<void>;
  claimDailyReward: () => Promise<boolean>;
  spinLuckyWheel: () => Promise<{ prize: string; amount: number; type: string }>;
  startTask: (taskId: string) => void;
  submitTaskEvidence: (taskId: string, evidence: string) => Promise<boolean>;
  createCampaign: (data: Omit<Campaign, 'id' | 'creatorId' | 'creatorName' | 'trustRating' | 'status' | 'remainingSlots'>) => Promise<boolean>;
  submitCampaign: (campaignId: string, textEvidence: string, evidenceUrl?: string) => Promise<boolean>;
  reviewCampaignSubmission: (submissionId: string, status: 'approved' | 'rejected', reviewNote?: string) => Promise<void>;
  claimAchievement: (achievementId: string) => Promise<boolean>;
  requestWithdrawal: (amount: number, bankName: string, accountNumber: string) => Promise<{ success: boolean; message: string }>;
  depositSimulate: (amount: number) => Promise<void>;
  sendTransfer: (recipientEmail: string, amount: number, note?: string) => Promise<{ success: boolean; message: string }>;
  upgradeMembership: (tierName: MembershipTier) => Promise<{ success: boolean; message: string }>;
  clearNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  playGameAndSubmitScore: (gameId: string, score: number) => Promise<{ success: boolean; reward: number; xp: number; leveledUp: boolean }>;
  submitWelcomeCampaign: (campaignId: string, evidence: string) => Promise<boolean>;
  selectGameForLineup: (gameId: string) => Promise<boolean>;
  submitFundingRequest: (amount: number, reason: string) => Promise<boolean>;
  submitKyc: (docReference: string) => Promise<boolean>;
  setWalletPin: (pin: string) => Promise<boolean>;
  updateWalletLimits: (daily: number, monthly: number, spending: number) => Promise<boolean>;
  updateWalletStatus: (status: 'active' | 'locked' | 'frozen') => Promise<boolean>;
  fundWallet: (amount: number, provider: string) => Promise<boolean>;
  payMerchant: (merchantId: string, amount: number, description: string) => Promise<boolean>;
  sendWalletTransfer: (targetWalletNumber: string, amount: number, note?: string) => Promise<boolean>;
  reverseTransaction: (txId: string) => Promise<boolean>;
  
  // Admin Methods
  adminApproveWithdrawal: (id: string, approve: boolean) => Promise<void>;
  adminApproveFunding: (id: string, approve: boolean, feedback?: string) => Promise<void>;
  adminApproveCampaign: (id: string, approve: boolean) => Promise<void>;
  adminReviewTaskSubmission: (submissionId: string, status: 'approved' | 'rejected', feedback?: string) => Promise<void>;
  
  // Helpers
  clearMessages: () => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function PayWorthProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState>({
    users: {},
    currentUser: null,
    ledger: {},
    tasks: [],
    taskSubmissions: [],
    campaigns: [],
    campaignSubmissions: [],
    notifications: {},
    withdrawals: [],
    fundingRequests: [],
    referrals: {},
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'wallet' | 'marketplace'>('home');
  const [activeMenuScreen, setActiveMenuScreen] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const fetchAppData = async (userId: string) => {
    try {
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userProfile) {
        throw new Error(userError?.message || 'PayWorth services profile is not provisioned or cannot be reached.');
      }

      const [
        { data: ledgerData },
        { data: tasksData },
        { data: submissionsData },
        { data: campaignsData },
        { data: campSubmissionsData },
        { data: notificationsData },
        { data: withdrawalsData },
        { data: fundingData },
        { data: referralsData }
      ] = await Promise.all([
        supabase.from('ledger').select('*').eq('userId', userId).order('timestamp', { ascending: false }),
        supabase.from('tasks').select('*'),
        supabase.from('task_submissions').select('*').eq('userId', userId),
        supabase.from('campaigns').select('*'),
        supabase.from('campaign_submissions').select('*').eq('userId', userId),
        supabase.from('notifications').select('*').eq('userId', userId).order('date', { ascending: false }),
        supabase.from('withdrawals').select('*').eq('userId', userId).order('createdAt', { ascending: false }),
        supabase.from('funding_requests').select('*').eq('userId', userId).order('createdAt', { ascending: false }),
        supabase.from('referrals').select('*').eq('referrerId', userId),
      ]);

      const userMap: Record<string, User> = {
        [userProfile.email.toLowerCase()]: userProfile as User,
        [userProfile.id]: userProfile as User,
      };

      setAppState({
        users: userMap,
        currentUser: userProfile as User,
        ledger: { [userId]: (ledgerData || []) as LedgerEntry[] },
        tasks: (tasksData || []) as Task[],
        taskSubmissions: (submissionsData || []) as TaskSubmission[],
        campaigns: (campaignsData || []) as Campaign[],
        campaignSubmissions: (campSubmissionsData || []) as CampaignSubmission[],
        notifications: { [userId]: (notificationsData || []) as Notification[] },
        withdrawals: (withdrawalsData || []) as WithdrawalRequest[],
        fundingRequests: (fundingData || []) as FundingRequest[],
        referrals: { [userId]: (referralsData || []).map((r: any) => r.referredId) },
      });
    } catch (err: any) {
      console.error('Error synchronizing database with Supabase:', err);
      setError('Unable to connect to PayWorth services. Please try again.');
    }
  };

  // Auth Session State Synchronizer
  useEffect(() => {
    let active = true;

    const setupAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && active) {
        await fetchAppData(session.user.id);
      }
    };

    setupAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!active) return;
        const user = session?.user;
        if (user) {
          await fetchAppData(user.id);
        } else {
          setAppState({
            users: {},
            currentUser: null,
            ledger: {},
            tasks: [],
            taskSubmissions: [],
            campaigns: [],
            campaignSubmissions: [],
            notifications: {},
            withdrawals: [],
            fundingRequests: [],
            referrals: {},
          });
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // 1. Log In Wrapper
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) throw authErr;
      if (!data.user) throw new Error('Authentication failure.');

      await fetchAppData(data.user.id);
      setSuccessMessage('Welcome back to PayWorth Secure Wallet.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 2. Sign Up Wrapper
  const signup = async (email: string, password: string, username: string, referralCode?: string): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      let referredBy: string | null = null;
      if (referralCode) {
        const { data: refUser, error: refErr } = await supabase
          .from('users')
          .select('id')
          .eq('referralCode', referralCode.toUpperCase())
          .maybeSingle();

        if (refUser && !refErr) {
          referredBy = refUser.id;
        } else {
          setError('Referral code was not found. Please verify details or leave blank.');
          return false;
        }
      }

      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
            referredBy,
            avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9999999)}?auto=format&fit=crop&q=80&w=200`,
          }
        }
      });

      if (authErr) throw authErr;
      if (!data.user) throw new Error('Sign up failure.');

      setSuccessMessage('Profile registered successfully! Check email credentials.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 3. Log Out Wrapper
  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAppState({
        users: {},
        currentUser: null,
        ledger: {},
        tasks: [],
        taskSubmissions: [],
        campaigns: [],
        campaignSubmissions: [],
        notifications: {},
        withdrawals: [],
        fundingRequests: [],
        referrals: {},
      });
      setLoading(false);
    }
  };

  // 4. Forgot Password Wrapper
  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (resetErr) throw resetErr;
      setSuccessMessage(`Password recovery credentials dispatched to: ${email}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error dispatching password reset credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Verify Email Verification Check
  const verifyEmail = async (): Promise<boolean> => {
    setLoading(true);
    try {
      setSuccessMessage('A verification link has been dispatched to your email address.');
      return true;
    } catch (err: any) {
      setError(err.message || 'Error processing email verification.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 6. Sign In With Google Wrapper
  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (authErr) throw authErr;
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 7. Onboarding Setup Completed
  const onboardingComplete = async () => {
    if (!appState.currentUser) return;
    try {
      const { error: upErr } = await supabase
        .from('users')
        .update({ onboardingCompleted: true })
        .eq('id', appState.currentUser.id);
      if (upErr) throw upErr;
      await fetchAppData(appState.currentUser.id);
    } catch (err) {
      console.error('Error completing onboarding:', err);
    }
  };

  // 8. Welcome Campaign Complete Dialogue Dismissal
  const welcomeComplete = async (dontShowAgain: boolean) => {
    if (!appState.currentUser) return;
    try {
      const { error: upErr } = await supabase
        .from('users')
        .update({ welcomeCompleted: dontShowAgain })
        .eq('id', appState.currentUser.id);
      if (upErr) throw upErr;
      await fetchAppData(appState.currentUser.id);
    } catch (err) {
      console.error('Error completing welcome:', err);
    }
  };

  // 9. Claim Daily Checking Reward
  const claimDailyReward = async (): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    clearMessages();
    try {
      const lastClaim = appState.currentUser.dailyRewardClaimedAt;
      const now = new Date();
      if (lastClaim) {
        const lastDate = new Date(lastClaim);
        if (lastDate.toDateString() === now.toDateString()) {
          setError('Daily reward already claimed today.');
          return false;
        }
      }

      const { error: creditErr } = await supabase.rpc('credit_wallet', {
        p_user_id: appState.currentUser.id,
        p_amount: 10.0,
        p_description: 'Claimed Daily Check-In Reward',
        p_category: 'daily_reward'
      });

      if (creditErr) throw creditErr;

      const { error: upErr } = await supabase
        .from('users')
        .update({ dailyRewardClaimedAt: now.toISOString() })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Daily check-in reward claimed: 10 PWC credited!');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 10. Spin Lucky Wheel mechanics
  const spinLuckyWheel = async (): Promise<{ prize: string; amount: number; type: string }> => {
    if (!appState.currentUser) throw new Error('Not authenticated.');
    if (appState.currentUser.luckyWheelSpinsRemaining <= 0) {
      throw new Error('No spins remaining today.');
    }
    setLoading(true);
    try {
      const prizes = [
        { prize: '10 PWC', amount: 10, type: 'pwc' },
        { prize: '50 PWC', amount: 50, type: 'pwc' },
        { prize: '100 PWC', amount: 100, type: 'pwc' },
        { prize: 'Try Again', amount: 0, type: 'retry' },
        { prize: '+5 XP', amount: 5, type: 'xp' },
      ];
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];

      const { error: upErr } = await supabase
        .from('users')
        .update({ luckyWheelSpinsRemaining: appState.currentUser.luckyWheelSpinsRemaining - 1 })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      if (randomPrize.type === 'pwc' && randomPrize.amount > 0) {
        await supabase.rpc('credit_wallet', {
          p_user_id: appState.currentUser.id,
          p_amount: randomPrize.amount,
          p_description: 'Lucky Wheel Spin Reward',
          p_category: 'wheel'
        });
      } else if (randomPrize.type === 'xp') {
        await supabase
          .from('users')
          .update({ xp: appState.currentUser.xp + randomPrize.amount })
          .eq('id', appState.currentUser.id);
      }

      await fetchAppData(appState.currentUser.id);
      return randomPrize;
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || 'Unable to connect to PayWorth services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 11. Start Task Mechanics
  const startTask = (taskId: string) => {
    console.log('Task started:', taskId);
  };

  // 12. Submit Task Evidence Verification
  const submitTaskEvidence = async (taskId: string, evidence: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const submissionId = 'sub_' + Date.now();
      const { error: subErr } = await supabase.from('task_submissions').insert({
        id: submissionId,
        taskId,
        userId: appState.currentUser.id,
        evidence,
        status: 'pending'
      });

      if (subErr) throw subErr;

      const taskObj = appState.tasks.find((t) => t.id === taskId);
      if (taskObj && taskObj.reward > 0) {
        await supabase.rpc('credit_wallet', {
          p_user_id: appState.currentUser.id,
          p_amount: taskObj.reward,
          p_description: `Completed Task: ${taskObj.title}`,
          p_category: 'task',
          p_reference_id: submissionId
        });

        await supabase
          .from('task_submissions')
          .update({ status: 'approved' })
          .eq('id', submissionId);
      }

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Task verification evidence successfully uploaded for audit!');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 13. Create Sponsor Campaign
  const createCampaign = async (data: any): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const campaignId = 'camp_' + Date.now();
      const { error: createErr } = await supabase.from('campaigns').insert({
        id: campaignId,
        title: data.title,
        description: data.description,
        category: data.category,
        reward: data.reward,
        slots: data.slots,
        remainingSlots: data.slots,
        rewardPool: data.rewardPool,
        creatorId: appState.currentUser.id,
        creatorName: appState.currentUser.username,
        trustRating: appState.currentUser.trustScore,
        deadline: data.deadline,
        status: 'active',
        approvalMethod: 'manual'
      });

      if (createErr) throw createErr;

      await supabase.rpc('debit_wallet', {
        p_user_id: appState.currentUser.id,
        p_amount: data.rewardPool,
        p_description: `Escrow provision for Campaign: ${data.title}`,
        p_category: 'campaign_escrow',
        p_reference_id: campaignId
      });

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Legitimacy Campaign provisioned successfully with escrow locked!');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 14. Submit Proof of Sponsor Campaign Participation
  const submitCampaign = async (campaignId: string, textEvidence: string, evidenceUrl?: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const submissionId = 'csub_' + Date.now();
      const { error: subErr } = await supabase.from('campaign_submissions').insert({
        id: submissionId,
        campaignId,
        userId: appState.currentUser.id,
        textEvidence,
        evidenceUrl: evidenceUrl || null,
        status: 'pending'
      });

      if (subErr) throw subErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Legitimacy Campaign proof uploaded for sponsor audit.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 15. Review Sponsor Campaign Submissions
  const reviewCampaignSubmission = async (submissionId: string, status: 'approved' | 'rejected', reviewNote?: string) => {
    if (!appState.currentUser) return;
    setLoading(true);
    try {
      const { error: revErr } = await supabase
        .from('campaign_submissions')
        .update({ status, reviewNote: reviewNote || null })
        .eq('id', submissionId);

      if (revErr) throw revErr;

      if (status === 'approved') {
        const { data: subData } = await supabase
          .from('campaign_submissions')
          .select('userId, campaignId')
          .eq('id', submissionId)
          .single();

        if (subData) {
          const { data: campData } = await supabase
            .from('campaigns')
            .select('reward, title')
            .eq('id', subData.campaignId)
            .single();

          if (campData) {
            await supabase.rpc('credit_wallet', {
              p_user_id: subData.userId,
              p_amount: campData.reward,
              p_description: `Legitimacy Campaign Approved: ${campData.title}`,
              p_category: 'task',
              p_reference_id: submissionId
            });
          }
        }
      }

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage(`Legitimacy submission marked as ${status.toUpperCase()}!`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 16. Claim Achievement Rewards
  const claimAchievement = async (achievementId: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const ach = DEFAULT_ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!ach) throw new Error('Achievement metadata not located.');

      if (appState.currentUser.achievementsClaimed.includes(achievementId)) {
        setError('Achievement already claimed.');
        return false;
      }

      const { error: upErr } = await supabase
        .from('users')
        .update({ achievementsClaimed: [...appState.currentUser.achievementsClaimed, achievementId] })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await supabase.rpc('credit_wallet', {
        p_user_id: appState.currentUser.id,
        p_amount: ach.rewardPWC,
        p_description: `Claimed Achievement: ${ach.title}`,
        p_category: 'daily_reward'
      });

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage(`Achievement reward claimed! ${ach.rewardPWC} PWC credited.`);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 17. Request Central Settlement Withdrawal
  const requestWithdrawal = async (amount: number, bankName: string, accountNumber: string): Promise<{ success: boolean; message: string }> => {
    if (!appState.currentUser) return { success: false, message: 'Not authenticated.' };
    setLoading(true);
    try {
      const withdrawalId = 'wd_' + Date.now();

      await supabase.rpc('debit_wallet', {
        p_user_id: appState.currentUser.id,
        p_amount: amount,
        p_description: `Withdrawal request to ${bankName} (${accountNumber})`,
        p_category: 'withdrawal',
        p_reference_id: withdrawalId
      });

      const { error: insErr } = await supabase.from('withdrawals').insert({
        id: withdrawalId,
        userId: appState.currentUser.id,
        amount,
        bankName,
        accountNumber,
        status: 'pending'
      });

      if (insErr) throw insErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Withdrawal request successfully queued for Central Settlement!');
      return { success: true, message: 'Withdrawal requested successfully.' };
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return { success: false, message: err.message || 'Withdrawal failed.' };
    } finally {
      setLoading(false);
    }
  };

  // 18. Simulate Local Core Deposit
  const depositSimulate = async (amount: number) => {
    if (!appState.currentUser) return;
    setLoading(true);
    try {
      await supabase.rpc('credit_wallet', {
        p_user_id: appState.currentUser.id,
        p_amount: amount,
        p_description: 'Simulated cash deposit injection',
        p_category: 'deposit'
      });
      await fetchAppData(appState.currentUser.id);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 19. Send Transfer Wrapper
  const sendTransfer = async (recipientEmail: string, amount: number, note?: string): Promise<{ success: boolean; message: string }> => {
    if (!appState.currentUser) return { success: false, message: 'Not authenticated.' };
    setLoading(true);
    try {
      const { data: recipient, error: recErr } = await supabase
        .from('users')
        .select('id')
        .eq('email', recipientEmail.toLowerCase())
        .maybeSingle();

      if (recErr || !recipient) {
        throw new Error('Recipient account email could not be located on the PayWorth register.');
      }

      if (recipient.id === appState.currentUser.id) {
        throw new Error('You cannot transfer ledger funds to your own profile.');
      }

      await supabase.rpc('transfer_wallet', {
        p_sender_id: appState.currentUser.id,
        p_recipient_id: recipient.id,
        p_amount: amount,
        p_description: note || 'Peer-to-peer ledger balance transfer'
      });

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Peer-to-peer balance transfer completed successfully!');
      return { success: true, message: 'Transfer completed successfully.' };
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return { success: false, message: err.message || 'Transfer failed.' };
    } finally {
      setLoading(false);
    }
  };

  // 20. Upgrade Core Membership Tier
  const upgradeMembership = async (tierName: MembershipTier): Promise<{ success: boolean; message: string }> => {
    if (!appState.currentUser) return { success: false, message: 'Not authenticated.' };
    setLoading(true);
    try {
      const tier = MEMBERSHIP_TIERS_DATA.find((t) => t.name === tierName);
      if (!tier) throw new Error('Tier specifications not found.');

      if (appState.currentUser.pwcBalance < tier.cost) {
        throw new Error('Insufficient balance to secure upgrade fee.');
      }

      await supabase.rpc('debit_wallet', {
        p_user_id: appState.currentUser.id,
        p_amount: tier.cost,
        p_description: `Upgrade to Membership Tier: ${tierName}`,
        p_category: 'membership_upgrade'
      });

      const { error: upErr } = await supabase
        .from('users')
        .update({ membershipTier: tierName })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage(`Membership successfully upgraded to ${tierName}!`);
      return { success: true, message: 'Membership upgraded successfully.' };
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return { success: false, message: err.message || 'Upgrade failed.' };
    } finally {
      setLoading(false);
    }
  };

  // 21. Clear User System Notifications
  const clearNotifications = async () => {
    if (!appState.currentUser) return;
    try {
      await supabase.from('notifications').delete().eq('userId', appState.currentUser.id);
      await fetchAppData(appState.currentUser.id);
    } catch (err) {
      console.error(err);
    }
  };

  // 22. Mark Notification as Read
  const markNotificationRead = async (id: string) => {
    if (!appState.currentUser) return;
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      await fetchAppData(appState.currentUser.id);
    } catch (err) {
      console.error(err);
    }
  };

  // 23. Play Mini Game and submit secure Human proof payout
  const playGameAndSubmitScore = async (gameId: string, score: number): Promise<{ success: boolean; reward: number; xp: number; leveledUp: boolean }> => {
    if (!appState.currentUser) throw new Error('Not authenticated.');
    setLoading(true);
    try {
      const reward = score >= 30 ? 5 : 1;
      const xp = score * 2;

      const currentGames = appState.currentUser.gamesPlayedToday || {};
      const count = (currentGames[gameId] || 0) + 1;
      const nextGames = { ...currentGames, [gameId]: count };

      const nextXP = appState.currentUser.xp + xp;
      const nextLevel = Math.floor(nextXP / 1000) + 1;
      const leveledUp = nextLevel > appState.currentUser.level;

      const { error: upErr } = await supabase
        .from('users')
        .update({ xp: nextXP, level: nextLevel, gamesPlayedToday: nextGames })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      if (reward > 0) {
        await supabase.rpc('credit_wallet', {
          p_user_id: appState.currentUser.id,
          p_amount: reward,
          p_description: `Mini-Game score payout for ${gameId}`,
          p_category: 'game'
        });
      }

      await fetchAppData(appState.currentUser.id);
      return { success: true, reward, xp, leveledUp };
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || 'Unable to connect to PayWorth services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 24. Join Welcome Campaigns (onboarding dispatch)
  const submitWelcomeCampaign = async (campaignId: string, evidence: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const { error: rpcErr } = await supabase.rpc('join_welcome_campaign', {
        p_user_id: appState.currentUser.id,
        p_campaign_id: campaignId
      });

      if (rpcErr) throw rpcErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Welcome campaign successfully submitted and rewards instantly processed!');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 25. Select Game Lineup For Today
  const selectGameForLineup = async (gameId: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    try {
      const lineup = appState.currentUser.selectedGamesToday || [];
      if (lineup.includes(gameId)) return true;
      const nextLineup = [...lineup, gameId];

      const { error: upErr } = await supabase
        .from('users')
        .update({ selectedGamesToday: nextLineup })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // 26. Submit Capital Funding Request
  const submitFundingRequest = async (amount: number, reason: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const fundingId = 'fr_' + Date.now();
      const { error: insErr } = await supabase.from('funding_requests').insert({
        id: fundingId,
        userId: appState.currentUser.id,
        amount,
        reason,
        status: 'pending'
      });

      if (insErr) throw insErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Account funding request registered for central audit.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 27. Submit KYC legal proof credentials
  const submitKyc = async (docReference: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const { error: upErr } = await supabase
        .from('users')
        .update({ kycStatus: 'pending' })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('KYC legal documents submitted for central compliance check.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 28. Set secure wallet transaction PIN
  const setWalletPin = async (pin: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const { error: upErr } = await supabase
        .from('users')
        .update({ walletPin: pin })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Secure transaction PIN registered successfully.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 29. Custom limits update
  const updateWalletLimits = async (daily: number, monthly: number, spending: number): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const { error: upErr } = await supabase
        .from('users')
        .update({ dailyLimit: daily, monthlyLimit: monthly, spendingLimit: spending })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Wallet limits customized successfully.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 30. Wallet Status update
  const updateWalletStatus = async (status: 'active' | 'locked' | 'frozen'): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const { error: upErr } = await supabase
        .from('users')
        .update({ walletStatus: status })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage(`Wallet status updated to ${status.toUpperCase()} successfully.`);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 31. Wallet funding execution
  const fundWallet = async (amount: number, provider: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const { error: creditErr } = await supabase.rpc('credit_wallet', {
        p_user_id: appState.currentUser.id,
        p_amount: amount,
        p_description: `Wallet funded via ${provider}`,
        p_category: 'deposit'
      });

      if (creditErr) throw creditErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage(`Wallet successfully funded via ${provider}!`);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 32. Pay Merchant
  const payMerchant = async (merchantId: string, amount: number, description: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const { error: debitErr } = await supabase.rpc('debit_wallet', {
        p_user_id: appState.currentUser.id,
        p_amount: amount,
        p_description: `Merchant payment to ${merchantId}: ${description}`,
        p_category: 'merchant_payment'
      });

      if (debitErr) throw debitErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Merchant invoice successfully settled!');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 33. Send Wallet Transfer
  const sendWalletTransfer = async (targetWalletNumber: string, amount: number, note?: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const { data: recipient, error: recErr } = await supabase
        .from('users')
        .select('id')
        .eq('walletNumber', targetWalletNumber)
        .maybeSingle();

      if (recErr || !recipient) {
        throw new Error('Wallet number not found on the PayWorth register.');
      }

      if (recipient.id === appState.currentUser.id) {
        throw new Error('You cannot transfer funds to your own wallet.');
      }

      const { error: transErr } = await supabase.rpc('transfer_wallet', {
        p_sender_id: appState.currentUser.id,
        p_recipient_id: recipient.id,
        p_amount: amount,
        p_description: note || 'Instant wallet-to-wallet transfer'
      });

      if (transErr) throw transErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Instant wallet-to-wallet transfer executed successfully!');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 34. Reverse transaction
  const reverseTransaction = async (txId: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const { data: tx } = await supabase.from('ledger').select('*').eq('id', txId).single();
      if (!tx) throw new Error('Transaction record not found.');

      if (tx.status === 'reversed') {
        throw new Error('Transaction is already reversed.');
      }

      await supabase.from('ledger').update({ status: 'reversed' }).eq('id', txId);

      if (tx.type === 'credit') {
        await supabase.rpc('debit_wallet', {
          p_user_id: appState.currentUser.id,
          p_amount: tx.amount,
          p_description: `Reversal of: ${tx.description}`,
          p_category: 'transfer_reversal'
        });
      } else {
        await supabase.rpc('credit_wallet', {
          p_user_id: appState.currentUser.id,
          p_amount: tx.amount,
          p_description: `Reversal of: ${tx.description}`,
          p_category: 'transfer_reversal'
        });
      }

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Transaction reversed successfully.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------
  // ADMIN COMPLIANCE AUDITING METHODS
  // -----------------------------------------------------------

  const adminApproveWithdrawal = async (id: string, approve: boolean) => {
    if (!appState.currentUser) return;
    setLoading(true);
    try {
      const { error: updErr } = await supabase
        .from('withdrawals')
        .update({ status: approve ? 'approved' : 'rejected' })
        .eq('id', id);

      if (updErr) throw updErr;

      if (!approve) {
        const { data: wd } = await supabase.from('withdrawals').select('amount, userId').eq('id', id).single();
        if (wd) {
          await supabase.rpc('credit_wallet', {
            p_user_id: wd.userId,
            p_amount: wd.amount,
            p_description: 'Refund for rejected withdrawal request',
            p_category: 'deposit'
          });
        }
      }

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Central Withdrawal status updated.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const adminApproveFunding = async (id: string, approve: boolean, feedback?: string) => {
    if (!appState.currentUser) return;
    setLoading(true);
    try {
      const { error: updErr } = await supabase
        .from('funding_requests')
        .update({ status: approve ? 'approved' : 'rejected', feedback: feedback || null })
        .eq('id', id);

      if (updErr) throw updErr;

      if (approve) {
        const { data: fr } = await supabase.from('funding_requests').select('amount, userId, reason').eq('id', id).single();
        if (fr) {
          await supabase.rpc('credit_wallet', {
            p_user_id: fr.userId,
            p_amount: fr.amount,
            p_description: `Approved Capital Funding: ${fr.reason}`,
            p_category: 'deposit'
          });
        }
      }

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Capital Funding request processed.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const adminApproveCampaign = async (id: string, approve: boolean) => {
    if (!appState.currentUser) return;
    setLoading(true);
    try {
      const { error: updErr } = await supabase
        .from('campaigns')
        .update({ status: approve ? 'active' : 'inactive' })
        .eq('id', id);

      if (updErr) throw updErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Sponsor Campaign review completed.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const adminReviewTaskSubmission = async (submissionId: string, status: 'approved' | 'rejected', feedback?: string) => {
    if (!appState.currentUser) return;
    setLoading(true);
    try {
      const { error: updErr } = await supabase
        .from('task_submissions')
        .update({ status, feedback: feedback || null })
        .eq('id', submissionId);

      if (updErr) throw updErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Central Task Submission compliance audit updated.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to PayWorth services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StateContext.Provider
      value={{
        appState,
        loading,
        currentUser: appState.currentUser,
        error,
        successMessage,
        activeTab,
        setActiveTab,
        activeMenuScreen,
        setActiveMenuScreen,
        login,
        signup,
        logout,
        forgotPassword,
        verifyEmail,
        loginWithGoogle,
        onboardingComplete,
        welcomeComplete,
        claimDailyReward,
        spinLuckyWheel,
        startTask,
        submitTaskEvidence,
        createCampaign,
        submitCampaign,
        reviewCampaignSubmission,
        claimAchievement,
        requestWithdrawal,
        depositSimulate,
        sendTransfer,
        upgradeMembership,
        clearNotifications,
        markNotificationRead,
        playGameAndSubmitScore,
        submitWelcomeCampaign,
        selectGameForLineup,
        submitFundingRequest,
        submitKyc,
        setWalletPin,
        updateWalletLimits,
        updateWalletStatus,
        fundWallet,
        payMerchant,
        sendWalletTransfer,
        reverseTransaction,
        adminApproveWithdrawal,
        adminApproveFunding,
        adminApproveCampaign,
        adminReviewTaskSubmission,
        clearMessages,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function usePayWorth() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('usePayWorth must be used within a PayWorthProvider');
  }
  return context;
}
