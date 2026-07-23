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

export function normalizeProfile(raw: any): User {
  if (!raw) return raw;
  return {
    id: raw.id,
    email: raw.email || '',
    username: raw.username || raw.display_name || (raw.email ? raw.email.split('@')[0] : 'Member'),
    avatar: raw.avatar || raw.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    isVerified: Boolean(raw.isVerified ?? raw.is_verified ?? false),
    pwcBalance: Number(raw.pwcBalance ?? raw.pwc_balance ?? 0),
    pendingBalance: Number(raw.pendingBalance ?? raw.pending_balance ?? 0),
    lockedBalance: Number(raw.lockedBalance ?? raw.locked_balance ?? 0),
    lifetimeEarned: Number(raw.lifetimeEarned ?? raw.lifetime_earned ?? 0),
    lifetimeWithdrawn: Number(raw.lifetimeWithdrawn ?? raw.lifetime_withdrawn ?? 0),
    trustScore: Number(raw.trustScore ?? raw.trust_score ?? 100),
    xp: Number(raw.xp ?? 0),
    level: Number(raw.level ?? 1),
    membershipTier: (raw.membershipTier || raw.membership_tier || 'Dark Bronze') as MembershipTier,
    referralCode: raw.referralCode || raw.referral_code || '',
    referredBy: raw.referredBy || raw.referred_by || null,
    onboardingCompleted: Boolean(raw.onboardingCompleted ?? raw.onboarding_completed ?? true),
    welcomeCompleted: Boolean(raw.welcomeCompleted ?? raw.welcome_completed ?? true),
    emailVerified: Boolean(raw.emailVerified ?? raw.email_verified ?? false),
    achievementsClaimed: raw.achievementsClaimed || raw.achievements_claimed || [],
    dailyRewardClaimedAt: raw.dailyRewardClaimedAt || raw.daily_reward_claimed_at || null,
    luckyWheelSpinsRemaining: Number(raw.luckyWheelSpinsRemaining ?? raw.lucky_wheel_spins_remaining ?? 1),
    gamesPlayedToday: raw.gamesPlayedToday || raw.games_played_today || {},
    selectedGamesToday: raw.selectedGamesToday || raw.selected_games_today || [],
    completedWelcomeCampaigns: raw.completedWelcomeCampaigns || raw.completed_welcome_campaigns || [],
    verifiedWelcomeCampaigns: raw.verifiedWelcomeCampaigns || raw.verified_welcome_campaigns || [],
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    kycStatus: raw.kycStatus || raw.kyc_status || 'unverified',
    trustHistory: raw.trustHistory || raw.trust_history || [],
    virtualAccount: raw.virtualAccount || raw.virtual_account || null,
    walletNumber: raw.walletNumber || raw.wallet_number || '',
    walletStatus: raw.walletStatus || raw.wallet_status || 'active',
    walletPin: raw.walletPin || raw.wallet_pin || null,
    dailyLimit: Number(raw.dailyLimit ?? raw.daily_limit ?? 5000),
    monthlyLimit: Number(raw.monthlyLimit ?? raw.monthly_limit ?? 50000),
    spendingLimit: Number(raw.spendingLimit ?? raw.spending_limit ?? 2000),
    walletLevel: Number(raw.walletLevel ?? raw.wallet_level ?? 1),
    miningState: raw.miningState || raw.mining_state || undefined,
  };
}

interface StateContextType {
  appState: AppState;
  loading: boolean;
  currentUser: User | null;
  error: string | null;
  successMessage: string | null;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (val: boolean) => void;
  isInitializingAccount: boolean;
  initializationError: string | null;
  retryInitialization: () => Promise<void>;
  activeTab: 'home' | 'tasks' | 'wallet' | 'marketplace';
  setActiveTab: (tab: 'home' | 'tasks' | 'wallet' | 'marketplace') => void;
  activeMenuScreen: string | null;
  setActiveMenuScreen: (screen: string | null) => void;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string, fullName?: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  resendVerificationEmail: (targetEmail?: string) => Promise<boolean>;
  changeEmail: (newEmail: string) => Promise<boolean>;
  refreshUserSession: () => Promise<void>;
  verifyEmail: () => Promise<boolean>;
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
  setTransactionPin: (pin: string) => Promise<boolean>;
  verifyTransactionPin: (pin: string) => Promise<boolean>;
  loginWithOAuth: (provider: 'google') => Promise<boolean>;
  checkUsernameAvailability: (username: string) => Promise<{ available: boolean; suggestions?: string[] }>;
  completeProfile: (data: { username: string; displayName?: string; referralCode?: string }) => Promise<boolean>;
  changeUsername: (newUsername: string) => Promise<{ success: boolean; error?: string }>;
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
  collectMinedPwc: () => Promise<boolean>;
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
  const [isInitializingAccount, setIsInitializingAccount] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'wallet' | 'marketplace'>('home');
  const [activeMenuScreen, setActiveMenuScreen] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const retryInitialization = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchAppData(session.user.id);
    }
  };

  const fetchAppData = async (userId: string) => {
    setIsInitializingAccount(true);
    setInitializationError(null);
    try {
      let { data: rawProfile, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError || !rawProfile) {
        // Check if there is an authenticated Supabase user (e.g. Google OAuth sign-in)
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const meta = authUser.user_metadata || {};
          const email = authUser.email || '';
          const baseUsername = meta.username || (email ? email.split('@')[0] : 'user') + Math.floor(100 + Math.random() * 900);
          const genRefCode = `PW${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          const walletNumber = `412${Math.floor(1000000 + Math.random() * 9000000)}`;

          const newProfile = {
            id: userId,
            email,
            username: baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, ''),
            avatar: meta.avatar_url || meta.picture || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
            isVerified: true,
            pwcBalance: 100,
            pendingBalance: 0,
            lockedBalance: 0,
            lifetimeEarned: 100,
            lifetimeWithdrawn: 0,
            trustScore: 80,
            xp: 50,
            level: 1,
            membershipTier: 'Dark Bronze',
            referralCode: genRefCode,
            referredBy: null,
            onboardingCompleted: false,
            welcomeCompleted: false,
            emailVerified: Boolean(authUser.email_confirmed_at || meta.email_verified),
            achievementsClaimed: [],
            dailyRewardClaimedAt: null,
            luckyWheelSpinsRemaining: 1,
            gamesPlayedToday: {},
            selectedGamesToday: [],
            completedWelcomeCampaigns: [],
            verifiedWelcomeCampaigns: [],
            createdAt: new Date().toISOString(),
            kycStatus: 'unverified',
            trustHistory: [{ date: new Date().toISOString().split('T')[0], change: 80, reason: 'Initial Account Provisioning' }],
            virtualAccount: null,
            walletNumber,
            walletStatus: 'active',
            walletPin: null,
            dailyLimit: 5000,
            monthlyLimit: 50000,
            spendingLimit: 2000,
            walletLevel: 1,
          };

          const { error: insErr } = await supabase.from('profiles').insert(newProfile);
          if (!insErr) {
            rawProfile = newProfile;
          } else {
            console.warn('Auto-provision profile insert note:', insErr);
            rawProfile = newProfile; // Safe fallback
          }
        }
      }

      if (!rawProfile) {
        throw new Error('User profile record could not be loaded or created.');
      }

      // Guarantee walletNumber & membership defaults if rawProfile was missing fields
      if (!rawProfile.walletNumber) {
        rawProfile.walletNumber = `412${Math.floor(1000000 + Math.random() * 9000000)}`;
      }
      if (!rawProfile.membershipTier) {
        rawProfile.membershipTier = 'Dark Bronze';
      }

      const userProfile = normalizeProfile(rawProfile);

      // Check real Supabase Auth email verification status
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const isAuthVerified = Boolean(authUser?.email_confirmed_at || authUser?.user_metadata?.email_verified);
      const effectiveVerified = isAuthVerified || userProfile.emailVerified || false;

      if (effectiveVerified && !userProfile.emailVerified) {
        try {
          await supabase.from('profiles').update({ emailVerified: true }).eq('id', userId);
        } catch (e) {
          console.warn('Email verified flag update note:', e);
        }
        userProfile.emailVerified = true;
      } else {
        userProfile.emailVerified = effectiveVerified;
      }

      const safeQuery = async <T,>(queryPromise: PromiseLike<{ data: T[] | null; error: any }>): Promise<T[]> => {
        try {
          const res = await queryPromise;
          return res.data || [];
        } catch {
          return [];
        }
      };

      const [
        ledgerData,
        tasksData,
        submissionsData,
        campaignsData,
        campSubmissionsData,
        notificationsData,
        withdrawalsData,
        fundingData,
        referralsData
      ] = await Promise.all([
        safeQuery<LedgerEntry>(supabase.from('ledger').select('*').eq('userId', userId).order('timestamp', { ascending: false })),
        safeQuery<Task>(supabase.from('tasks').select('*')),
        safeQuery<TaskSubmission>(supabase.from('task_submissions').select('*').eq('userId', userId)),
        safeQuery<Campaign>(supabase.from('campaigns').select('*')),
        safeQuery<CampaignSubmission>(supabase.from('campaign_submissions').select('*').eq('userId', userId)),
        safeQuery<Notification>(supabase.from('notifications').select('*').eq('userId', userId).order('date', { ascending: false })),
        safeQuery<WithdrawalRequest>(supabase.from('withdrawals').select('*').eq('userId', userId).order('createdAt', { ascending: false })),
        safeQuery<FundingRequest>(supabase.from('funding_requests').select('*').eq('userId', userId).order('createdAt', { ascending: false })),
        safeQuery<any>(supabase.from('referrals').select('*').eq('referrerId', userId)),
      ]);

      const userNotifs = (notificationsData || []) as Notification[];
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
        notifications: { [userId]: userNotifs },
        withdrawals: (withdrawalsData || []) as WithdrawalRequest[],
        fundingRequests: (fundingData || []) as FundingRequest[],
        referrals: { [userId]: (referralsData || []).map((r: any) => r.referredId) },
      });
      setIsInitializingAccount(false);
    } catch (err: any) {
      console.error('Account initialization error:', err);
      setInitializationError(err?.message || "We couldn't finish setting up your account.");
      setIsInitializingAccount(false);
    }
  };

  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);

  // Auth Session State Synchronizer
  useEffect(() => {
    let active = true;

    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token')) {
      setIsPasswordRecovery(true);
    }

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
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }
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

  // Helper for human-readable error messages
  const parseAuthError = (err: any): string => {
    if (!err) return 'An unexpected authentication error occurred.';
    const msg = typeof err === 'string' ? err : err.message || '';
    if (msg.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (msg.includes('Email not confirmed')) {
      return 'Your email address is not verified yet. Please check your inbox or resend the verification code.';
    }
    if (msg.includes('User already registered') || msg.includes('already exists')) {
      return 'An account with this email address already exists. Please log in instead.';
    }
    if (msg.includes('Password should be at least')) {
      return 'Password must be at least 8 characters in length.';
    }
    if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('429')) {
      return 'Security rate limit reached. Please wait a moment before trying again.';
    }
    return msg || 'Authentication request failed. Please try again.';
  };

  // 1. Log In Wrapper
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      if (!email.trim() || !password) {
        setError('Please enter both email and password.');
        return false;
      }
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authErr) throw authErr;
      if (!data.user) throw new Error('Authentication failure.');

      await fetchAppData(data.user.id);
      setSuccessMessage('Welcome back to PayWorth Secure Wallet.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(parseAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 2. Sign Up Wrapper
  const signup = async (
    email: string,
    password: string,
    username: string,
    fullName?: string,
    referralCode?: string
  ): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      if (!email.trim() || !password || !username.trim()) {
        setError('Please fill in all required registration fields.');
        return false;
      }
      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters in length.');
        return false;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters in length.');
        return false;
      }

      let referredBy: string | null = null;
      if (referralCode && referralCode.trim()) {
        const { data: refUser, error: refErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('referralCode', referralCode.trim().toUpperCase())
          .maybeSingle();

        if (refUser && !refErr) {
          referredBy = refUser.id;
        } else {
          setError('Referral code was not found. Please check or leave blank.');
          return false;
        }
      }

      const { data, error: authErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            username: username.trim(),
            fullName: fullName?.trim() || username.trim(),
            referredBy,
            avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9999999)}?auto=format&fit=crop&q=80&w=200`,
          }
        }
      });

      if (authErr) throw authErr;
      if (!data.user) throw new Error('Sign up failure.');

      // Ensure user is signed in immediately after registration without waiting for email verification
      let activeUserId = data.session?.user?.id || data.user.id;
      if (!data.session) {
        const { data: loginData } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginData?.user) {
          activeUserId = loginData.user.id;
        }
      }

      // Check / provision DB user profile if not yet created
      const { data: existingProf } = await supabase.from('profiles').select('id').eq('id', activeUserId).maybeSingle();
      if (!existingProf) {
        const genRefCode = `PW${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const walletNumber = `412${Math.floor(1000000 + Math.random() * 9000000)}`;
        await supabase.from('profiles').insert({
          id: activeUserId,
          email: email.trim(),
          username: username.trim(),
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9999999)}?auto=format&fit=crop&q=80&w=200`,
          isVerified: false,
          pwcBalance: 100,
          pendingBalance: 0,
          lockedBalance: 0,
          lifetimeEarned: 100,
          lifetimeWithdrawn: 0,
          trustScore: 80,
          xp: 50,
          level: 1,
          membershipTier: 'Dark Bronze',
          referralCode: genRefCode,
          referredBy,
          onboardingCompleted: false,
          welcomeCompleted: false,
          emailVerified: false,
          achievementsClaimed: [],
          dailyRewardClaimedAt: null,
          luckyWheelSpinsRemaining: 1,
          gamesPlayedToday: {},
          selectedGamesToday: [],
          completedWelcomeCampaigns: [],
          verifiedWelcomeCampaigns: [],
          createdAt: new Date().toISOString(),
          kycStatus: 'unverified',
          trustHistory: [{ date: new Date().toISOString(), change: 80, reason: 'Initial Registration' }],
          virtualAccount: null,
          walletNumber,
          walletStatus: 'active',
          walletPin: null,
          dailyLimit: 5000,
          monthlyLimit: 50000,
          spendingLimit: 2000,
          walletLevel: 1,
        });
      }

      await fetchAppData(activeUserId);
      setSuccessMessage(`Account created successfully! A verification link has been sent to ${email.trim()}. Please check your inbox and click the link to verify your account.`);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(parseAuthError(err));
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
      setIsPasswordRecovery(false);
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

  // 6. Forgot Password Wrapper
  const forgotPassword = async (email: string) => {
    setLoading(true);
    clearMessages();
    try {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/verify`,
      });
      if (resetErr) throw resetErr;
      setSuccessMessage(`Password recovery instructions sent to: ${email}`);
    } catch (err: any) {
      console.error(err);
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // 7. Update Password (When in recovery mode)
  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      if (!newPassword || newPassword.length < 8) {
        setError('Password must be at least 8 characters long.');
        return false;
      }
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateErr) throw updateErr;
      setIsPasswordRecovery(false);
      setSuccessMessage('Password updated successfully! You can now log in with your new credentials.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(parseAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Link
  const resendVerificationEmail = async (targetEmail?: string): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      const emailToSend = targetEmail || appState.currentUser?.email;
      if (!emailToSend) {
        setError('No email address found to resend verification link.');
        return false;
      }
      const { error: err } = await supabase.auth.resend({
        type: 'signup',
        email: emailToSend.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (err) throw err;
      setSuccessMessage(`A verification link was sent to ${emailToSend.trim()}. Please check your inbox.`);
      return true;
    } catch (err: any) {
      console.error('resendVerificationEmail error:', err);
      setError(parseAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 7. Refresh User Session (check if email verified)
  const refreshUserSession = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchAppData(user.id);
        setSuccessMessage('Session updated.');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (): Promise<boolean> => {
    return await resendVerificationEmail();
  };

  // 7. Change Email Address
  const changeEmail = async (newEmail: string): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        setError('Please enter a valid new email address.');
        return false;
      }
      const { error: updateErr } = await supabase.auth.updateUser({ email: newEmail });
      if (updateErr) throw updateErr;

      if (appState.currentUser) {
        await supabase.from('profiles').update({ email: newEmail, emailVerified: false }).eq('id', appState.currentUser.id);
        await fetchAppData(appState.currentUser.id);
      }
      setSuccessMessage(`Email address updated to ${newEmail}. A verification email has been dispatched to your new address.`);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(parseAuthError(err));
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
        .from('profiles')
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
        .from('profiles')
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
        .from('profiles')
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
        .from('profiles')
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
          .from('profiles')
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
        .from('profiles')
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
        .from('profiles')
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
        .from('profiles')
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
        .from('profiles')
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
        .from('profiles')
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
        .from('profiles')
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

  // Hash PIN helper
  const hashPin = async (pin: string, userId: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`pw_pin_${userId}_${pin}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return pin;
    }
  };

  // 28. Set secure wallet transaction PIN (hashed with SHA-256)
  const setWalletPin = async (pin: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const hashedPin = await hashPin(pin, appState.currentUser.id);
      const { error: upErr } = await supabase
        .from('profiles')
        .update({ walletPin: hashedPin })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Secure transaction PIN registered successfully.');
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to save transaction PIN. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 28b. Verify transaction PIN (compares SHA-256 hash or plaintext fallback for legacy)
  const verifyTransactionPin = async (pin: string): Promise<boolean> => {
    if (!appState.currentUser || !appState.currentUser.walletPin) return false;
    const hashedPin = await hashPin(pin, appState.currentUser.id);
    return appState.currentUser.walletPin === hashedPin || appState.currentUser.walletPin === pin;
  };

  // 28c. OAuth Login Wrapper (Google & Facebook)
  const loginWithOAuth = async (provider: 'google' | 'facebook'): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (authErr) throw authErr;
      return true;
    } catch (err: any) {
      console.error(`OAuth ${provider} error:`, err);
      setError(parseAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 28d. Check Username Availability & Generate Suggestions
  const checkUsernameAvailability = async (
    username: string
  ): Promise<{ available: boolean; suggestions?: string[] }> => {
    const clean = username.trim().toLowerCase();
    const RESERVED = ['admin', 'support', 'official', 'system', 'security', 'wallet', 'payworth', 'glasslinestudio', 'velocitylabs', 'moderator', 'verify', 'staff'];
    
    if (RESERVED.includes(clean)) {
      const sug1 = `${clean}_user`;
      const sug2 = `${clean}_pwc`;
      return { available: false, suggestions: [sug1, sug2] };
    }

    if (!clean || clean.length < 3 || clean.length > 20 || !/^[a-z0-9_-]+$/.test(clean)) {
      return { available: false };
    }

    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', clean)
        .maybeSingle();

      if (err) {
        console.error('Username availability check error:', err);
      }

      if (data) {
        const rand = Math.floor(100 + Math.random() * 900);
        return {
          available: false,
          suggestions: [`${clean}${rand}`, `${clean}-pwc`, `${clean}-official`],
        };
      }

      return { available: true };
    } catch (e) {
      return { available: true };
    }
  };

  // 28d2. Change Username (Settings -> Account) with 30-day cooldown and history
  const changeUsername = async (newUsername: string): Promise<{ success: boolean; error?: string }> => {
    if (!appState.currentUser) return { success: false, error: 'Not authenticated.' };
    
    const clean = newUsername.trim().toLowerCase();
    
    if (!clean || clean.length < 3 || clean.length > 20 || !/^[a-z0-9_-]+$/.test(clean)) {
      return {
        success: false,
        error: 'Username must be 3-20 characters long and contain only lowercase letters, numbers, hyphens, or underscores.',
      };
    }

    const RESERVED = ['admin', 'support', 'official', 'system', 'security', 'wallet', 'payworth', 'glasslinestudio', 'velocitylabs', 'moderator', 'verify', 'staff'];
    if (RESERVED.includes(clean)) {
      return { success: false, error: 'This username is reserved by system operations.' };
    }

    if (clean === appState.currentUser.username.toLowerCase()) {
      return { success: false, error: 'New username is identical to your current username.' };
    }

    const lastChanged = (appState.currentUser as any).usernameLastChangedAt;
    if (lastChanged) {
      const days = (Date.now() - new Date(lastChanged).getTime()) / (1000 * 60 * 60 * 24);
      if (days < 30) {
        const remainingDays = Math.ceil(30 - days);
        return {
          success: false,
          error: `Username can only be changed once every 30 days. Please try again in ${remainingDays} days.`,
        };
      }
    }

    const check = await checkUsernameAvailability(clean);
    if (!check.available) {
      return { success: false, error: 'This username is already taken. Please choose another.' };
    }

    setLoading(true);
    try {
      const history = (appState.currentUser as any).usernameHistory || [];
      const updatedHistory = [...history, { oldUsername: appState.currentUser.username, changedAt: new Date().toISOString() }];
      const now = new Date().toISOString();

      const { error: upErr } = await supabase
        .from('profiles')
        .update({
          username: clean,
          usernameLastChangedAt: now,
          usernameHistory: updatedHistory,
        })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage(`Username successfully changed to @${clean}!`);
      return { success: true };
    } catch (err: any) {
      console.error('changeUsername error:', err);
      return { success: false, error: err.message || 'Failed to update username.' };
    } finally {
      setLoading(false);
    }
  };

  // 28e. Complete Profile & Onboarding
  const completeProfile = async (data: {
    username: string;
    displayName?: string;
    referralCode?: string;
  }): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    clearMessages();
    try {
      const { username, displayName, referralCode } = data;
      const cleanUsername = username.trim();

      if (!cleanUsername || cleanUsername.length < 3) {
        setError('Username must be at least 3 characters in length.');
        return false;
      }

      let referredBy: string | null = appState.currentUser.referredBy;
      if (referralCode && referralCode.trim() && !referredBy) {
        const { data: refUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('referralCode', referralCode.trim().toUpperCase())
          .maybeSingle();

        if (refUser && refUser.id !== appState.currentUser.id) {
          referredBy = refUser.id;
        }
      }

      const walletNum = appState.currentUser.walletNumber || `412${Math.floor(1000000 + Math.random() * 9000000)}`;

      const { error: upErr } = await supabase
        .from('profiles')
        .update({
          username: cleanUsername,
          walletNumber: walletNum,
          referredBy,
          onboardingCompleted: true,
        })
        .eq('id', appState.currentUser.id);

      if (upErr) throw upErr;

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage('Profile setup complete!');
      return true;
    } catch (err: any) {
      console.error('completeProfile error:', err);
      setError(err.message || 'Failed to complete profile.');
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
        .from('profiles')
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
        .from('profiles')
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
        .from('profiles')
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

  const collectMinedPwc = async (): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    try {
      const currentMined = appState.currentUser.miningState?.minedPwc || 15.5;
      if (currentMined <= 0) return false;

      await supabase.rpc('credit_wallet', {
        p_user_id: appState.currentUser.id,
        p_amount: currentMined,
        p_description: 'Collected PWC Mining Bot Yield',
        p_category: 'daily_reward'
      });

      const updatedMiningState = {
        ...(appState.currentUser.miningState || {
          botName: 'Active Bot',
          tier: appState.currentUser.membershipTier,
          startedAt: new Date().toISOString(),
          status: 'active' as const,
          activeBoosters: []
        }),
        lastCollectedAt: new Date().toISOString(),
        minedPwc: 0,
        totalCollectedLifetime: ((appState.currentUser.miningState?.totalCollectedLifetime || 0) + currentMined)
      };

      await supabase
        .from('profiles')
        .update({ miningState: updatedMiningState })
        .eq('id', appState.currentUser.id);

      await fetchAppData(appState.currentUser.id);
      setSuccessMessage(`Successfully collected +${currentMined.toFixed(1)} PWC into main wallet!`);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to collect mining yield. Please try again.');
      return false;
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
        isPasswordRecovery,
        setIsPasswordRecovery,
        isInitializingAccount,
        initializationError,
        retryInitialization,
        activeTab,
        setActiveTab,
        activeMenuScreen,
        setActiveMenuScreen,
        login,
        signup,
        logout,
        forgotPassword,
        updatePassword,
        resendVerificationEmail,
        changeEmail,
        refreshUserSession,
        verifyEmail,
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
        setTransactionPin: setWalletPin,
        verifyTransactionPin,
        loginWithOAuth,
        checkUsernameAvailability,
        completeProfile,
        changeUsername,
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
        collectMinedPwc,
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
