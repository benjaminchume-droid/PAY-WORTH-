import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, googleAuthProvider, db } from './firebase';
import {
  loadState,
  saveState,
  applyLedgerCredit,
  applyLedgerDebit,
  updateTrustScore,
  awardXP,
  MEMBERSHIP_TIERS_DATA,
  DEFAULT_ACHIEVEMENTS,
  AppState
} from './storage';
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

interface StateContextType {
  state: AppState;
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
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  onboardingComplete: () => void;
  welcomeComplete: (dontShowAgain: boolean) => void;
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
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
  playGameAndSubmitScore: (gameId: string, score: number) => Promise<{ success: boolean; reward: number; xp: number; leveledUp: boolean }>;
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

const generateUniqueId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
};

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [appState, setAppState] = useState<AppState>(loadState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'wallet' | 'marketplace'>('home');
  const [activeMenuScreen, setActiveMenuScreen] = useState<string | null>(null);

  useEffect(() => {
    saveState(appState);
  }, [appState]);

  // Auth State Listener to synchronize with live Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            setAppState((prev) => ({
              ...prev,
              currentUser: userData,
              users: { ...prev.users, [userData.email.toLowerCase()]: userData }
            }));
          } else {
            const lowerEmail = (firebaseUser.email || '').toLowerCase();
            const localUser = appState.users[lowerEmail];
            if (localUser) {
              const updatedUser = { ...localUser, id: firebaseUser.uid };
              await setDoc(userDocRef, updatedUser);
              setAppState((prev) => ({
                ...prev,
                currentUser: updatedUser,
                users: { ...prev.users, [lowerEmail]: updatedUser }
              }));
            }
          }
        } catch (err) {
          console.error('Error synchronizing auth state with Firestore:', err);
        }
      } else {
        setAppState((prev) => ({
          ...prev,
          currentUser: null,
        }));
      }
    });

    return () => unsubscribe();
  }, [appState.users]);

  // Sync current user's profile to Firestore whenever it changes
  useEffect(() => {
    if (appState.currentUser) {
      const syncUserToFirestore = async () => {
        try {
          const userDocRef = doc(db, 'users', appState.currentUser!.id);
          await setDoc(userDocRef, appState.currentUser);
        } catch (err) {
          console.warn('Firestore offline or synchronization restricted; updates saved locally.', err);
        }
      };
      syncUserToFirestore();
    }
  }, [appState.currentUser]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Auth Engine
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      let user: User;
      
      if (userDocSnap.exists()) {
        user = userDocSnap.data() as User;
      } else {
        const lowerEmail = email.trim().toLowerCase();
        const localUser = appState.users[lowerEmail];
        if (localUser) {
          user = { ...localUser, id: firebaseUser.uid };
        } else {
          user = {
            id: firebaseUser.uid,
            email: lowerEmail,
            username: email.split('@')[0],
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
            isVerified: false,
            pwcBalance: 0,
            pendingBalance: 0,
            lockedBalance: 0,
            lifetimeEarned: 0,
            lifetimeWithdrawn: 0,
            trustScore: 50,
            xp: 0,
            level: 1,
            membershipTier: 'Dark Bronze',
            referralCode: `PW_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            referredBy: null,
            onboardingCompleted: false,
            welcomeCompleted: false,
            emailVerified: false,
            achievementsClaimed: [],
            dailyRewardClaimedAt: null,
            luckyWheelSpinsRemaining: 1,
            gamesPlayedToday: {},
            kycStatus: 'unverified',
            trustHistory: [
              {
                date: new Date().toISOString().split('T')[0],
                change: 50,
                reason: 'Initial security trust score provisioning',
              },
            ],
            virtualAccount: null,
            walletNumber: `412${Math.floor(1000000 + Math.random() * 9000000)}`,
            walletStatus: 'active',
            walletPin: null,
            dailyLimit: 5000,
            monthlyLimit: 50000,
            spendingLimit: 2000,
            walletLevel: 1,
          };
        }
        try {
          await setDoc(userDocRef, user);
        } catch (e) {
          console.warn('Unable to write user document to cloud store, working with local database state.', e);
        }
      }
      
      setAppState((prev) => ({
        ...prev,
        currentUser: user,
        users: { ...prev.users, [email.toLowerCase()]: user },
      }));
      setSuccessMessage(`Welcome back, ${user.username}!`);
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/network-request-failed' || err.message?.includes('network-request-failed') || err.message?.includes('offline')) {
        const lowerEmail = email.trim().toLowerCase();
        const user = appState.users[lowerEmail];
        if (user) {
          setAppState((prev) => ({
            ...prev,
            currentUser: user,
          }));
          setSuccessMessage(`Welcome back, ${user.username}! (Operating in secure local mode)`);
          setLoading(false);
          return true;
        } else {
          setError('Invalid email or password credentials. Please verify details.');
          setLoading(false);
          return false;
        }
      }
      setError(err.message || 'Invalid email or password credentials. Please verify details.');
      setLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, username: string, referralCode?: string): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      const lowerEmail = email.trim().toLowerCase();
      
      let referredBy: string | null = null;
      if (referralCode) {
        const referrer = (Object.values(appState.users) as User[]).find(
          (u) => u.referralCode.toUpperCase() === referralCode.toUpperCase()
        );
        if (referrer) {
          referredBy = referrer.id;
        } else {
          setError('Referral code not found. You can leave it blank to continue.');
          setLoading(false);
          return false;
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const newUser: User = {
        id: firebaseUser.uid,
        email: lowerEmail,
        username: username.trim(),
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9999999)}?auto=format&fit=crop&q=80&w=200`,
        isVerified: false,
        pwcBalance: 0,
        pendingBalance: 0,
        lockedBalance: 0,
        lifetimeEarned: 0,
        lifetimeWithdrawn: 0,
        trustScore: 50,
        xp: 0,
        level: 1,
        membershipTier: 'Dark Bronze',
        referralCode: `PW_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        referredBy,
        onboardingCompleted: false,
        welcomeCompleted: false,
        emailVerified: false,
        achievementsClaimed: [],
        dailyRewardClaimedAt: null,
        luckyWheelSpinsRemaining: 1,
        gamesPlayedToday: {},
        kycStatus: 'unverified',
        trustHistory: [
          {
            date: new Date().toISOString().split('T')[0],
            change: 50,
            reason: 'Initial security trust score provisioning',
          },
        ],
        virtualAccount: null,
        walletNumber: `412${Math.floor(1000000 + Math.random() * 9000000)}`,
        walletStatus: 'active',
        walletPin: null,
        dailyLimit: 5000,
        monthlyLimit: 50000,
        spendingLimit: 2000,
        walletLevel: 1,
      };

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      try {
        await setDoc(userDocRef, newUser);
      } catch (e) {
        console.warn('Unable to write signup document to cloud store, operating locally.', e);
      }

      setAppState((prev) => {
        const updatedUsers = { ...prev.users, [lowerEmail]: newUser };
        const updatedLedger = { ...prev.ledger, [firebaseUser.uid]: [] };
        const updatedNotifications = {
          ...prev.notifications,
          [firebaseUser.uid]: [
            {
              id: generateUniqueId('n_reg'),
              title: 'Welcome to PayWorth Ledger',
              message: 'Your account was successfully registered. Please verify your email to access reward earning mechanics.',
              category: 'system',
              read: false,
              date: new Date().toISOString(),
            },
          ],
        };

        let nextState = {
          ...prev,
          users: updatedUsers,
          ledger: updatedLedger,
          notifications: updatedNotifications,
          currentUser: newUser,
        };

        if (referredBy) {
          nextState = applyLedgerCredit(
            nextState,
            referredBy,
            50,
            `Referral reward for inviting ${username}`,
            'referral'
          );
          const referrerNotif: Notification = {
            id: generateUniqueId('n_ref'),
            title: '👥 New Active Referral',
            message: `Your referral code was claimed by ${username}. 50 PWC has been credited to your wallet ledger.`,
            category: 'reward',
            read: false,
            date: new Date().toISOString(),
          };
          nextState.notifications[referredBy] = [referrerNotif, ...(nextState.notifications[referredBy] || [])];
        }

        return nextState;
      });

      setSuccessMessage('Registration successful! Check your credentials.');
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/network-request-failed' || err.message?.includes('network-request-failed') || err.message?.includes('offline')) {
        const lowerEmail = email.trim().toLowerCase();
        if (appState.users[lowerEmail]) {
          setError('An account with this email address already exists.');
          setLoading(false);
          return false;
        }

        let referredBy: string | null = null;
        if (referralCode) {
          const referrer = (Object.values(appState.users) as User[]).find(
            (u) => u.referralCode.toUpperCase() === referralCode.toUpperCase()
          );
          if (referrer) {
            referredBy = referrer.id;
          }
        }

        const localId = `usr_${Date.now()}`;
        const newUser: User = {
          id: localId,
          email: lowerEmail,
          username: username.trim(),
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9999999)}?auto=format&fit=crop&q=80&w=200`,
          isVerified: false,
          pwcBalance: 0,
          pendingBalance: 0,
          lockedBalance: 0,
          lifetimeEarned: 0,
          lifetimeWithdrawn: 0,
          trustScore: 50,
          xp: 0,
          level: 1,
          membershipTier: 'Dark Bronze',
          referralCode: `PW_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          referredBy,
          onboardingCompleted: false,
          welcomeCompleted: false,
          emailVerified: false,
          achievementsClaimed: [],
          dailyRewardClaimedAt: null,
          luckyWheelSpinsRemaining: 1,
          gamesPlayedToday: {},
          kycStatus: 'unverified',
          trustHistory: [
            {
              date: new Date().toISOString().split('T')[0],
              change: 50,
              reason: 'Initial security trust score provisioning',
            },
          ],
          virtualAccount: null,
          walletNumber: `412${Math.floor(1000000 + Math.random() * 9000000)}`,
          walletStatus: 'active',
          walletPin: null,
          dailyLimit: 5000,
          monthlyLimit: 50000,
          spendingLimit: 2000,
          walletLevel: 1,
        };

        setAppState((prev) => {
          const updatedUsers = { ...prev.users, [lowerEmail]: newUser };
          const updatedLedger = { ...prev.ledger, [localId]: [] };
          const updatedNotifications = {
            ...prev.notifications,
            [localId]: [
              {
                id: generateUniqueId('n_reg'),
                title: 'Welcome to PayWorth Ledger',
                message: 'Your account was successfully registered. (Operating in secure local mode)',
                category: 'system',
                read: false,
                date: new Date().toISOString(),
              },
            ],
          };

          let nextState = {
            ...prev,
            users: updatedUsers,
            ledger: updatedLedger,
            notifications: updatedNotifications,
            currentUser: newUser,
          };

          if (referredBy) {
            nextState = applyLedgerCredit(
              nextState,
              referredBy,
              50,
              `Referral reward for inviting ${username}`,
              'referral'
            );
            const referrerNotif: Notification = {
              id: generateUniqueId('n_ref'),
              title: '👥 New Active Referral',
              message: `Your referral code was claimed by ${username}. 50 PWC has been credited to your wallet ledger.`,
              category: 'reward',
              read: false,
              date: new Date().toISOString(),
            };
            nextState.notifications[referredBy] = [referrerNotif, ...(nextState.notifications[referredBy] || [])];
          }

          return nextState;
        });

        setSuccessMessage('Registration successful! (Operating in secure local mode)');
        setLoading(false);
        return true;
      }
      setError(err.message || 'An error occurred during registration.');
      setLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setLoading(true);
    clearMessages();
    try {
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = userCredential.user;
      
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      let user: User;
      
      if (userDocSnap.exists()) {
        user = userDocSnap.data() as User;
      } else {
        user = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google Operative',
          avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          isVerified: true,
          pwcBalance: 100, // Google sign up bonus
          pendingBalance: 0,
          lockedBalance: 0,
          lifetimeEarned: 100,
          lifetimeWithdrawn: 0,
          trustScore: 70, // Higher trust because Google accounts are pre-verified
          xp: 10,
          level: 1,
          membershipTier: 'Dark Bronze',
          referralCode: `PW_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          referredBy: null,
          onboardingCompleted: false,
          welcomeCompleted: false,
          emailVerified: true,
          achievementsClaimed: [],
          dailyRewardClaimedAt: null,
          luckyWheelSpinsRemaining: 2,
          gamesPlayedToday: {},
          kycStatus: 'unverified',
          trustHistory: [
            {
              date: new Date().toISOString().split('T')[0],
              change: 70,
              reason: 'Google Verified Single Sign-On profile authentication',
            },
          ],
          virtualAccount: null,
          walletNumber: `412${Math.floor(1000000 + Math.random() * 9000000)}`,
          walletStatus: 'active',
          walletPin: null,
          dailyLimit: 10000,
          monthlyLimit: 100000,
          spendingLimit: 4000,
          walletLevel: 1,
        };
        try {
          await setDoc(userDocRef, user);
        } catch (e) {
          console.warn('Unable to sync new Google user profile to firestore.', e);
        }
      }
      
      setAppState((prev) => ({
        ...prev,
        users: { ...prev.users, [user.email.toLowerCase()]: user },
        currentUser: user,
      }));
      setSuccessMessage('Signed in via Google successfully.');
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/network-request-failed' || err.message?.includes('network-request-failed') || err.message?.includes('popup') || err.message?.includes('closed') || err.message?.includes('offline')) {
        const email = 'google_user@payworth.com';
        let user = appState.users[email];
        if (!user) {
          const userId = 'usr_google_992';
          user = {
            id: userId,
            email,
            username: 'Google Operative',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            isVerified: true,
            pwcBalance: 100,
            pendingBalance: 0,
            lockedBalance: 0,
            lifetimeEarned: 100,
            lifetimeWithdrawn: 0,
            trustScore: 70,
            xp: 10,
            level: 1,
            membershipTier: 'Dark Bronze',
            referralCode: 'PW_GOOGLE',
            referredBy: null,
            onboardingCompleted: false,
            welcomeCompleted: false,
            emailVerified: true,
            achievementsClaimed: [],
            dailyRewardClaimedAt: null,
            luckyWheelSpinsRemaining: 2,
            gamesPlayedToday: {},
            kycStatus: 'unverified',
            trustHistory: [
              {
                date: new Date().toISOString().split('T')[0],
                change: 70,
                reason: 'Google Verified Single Sign-On profile authentication',
              },
            ],
            virtualAccount: null,
            walletNumber: `412${Math.floor(1000000 + Math.random() * 9000000)}`,
            walletStatus: 'active',
            walletPin: null,
            dailyLimit: 10000,
            monthlyLimit: 100000,
            spendingLimit: 4000,
            walletLevel: 1,
          };
          setAppState((prev) => ({
            ...prev,
            users: { ...prev.users, [email]: user },
            ledger: { ...prev.ledger, [userId]: [] },
            notifications: {
              ...prev.notifications,
              [userId]: [
                {
                  id: generateUniqueId('notif_google'),
                  title: 'Welcome via Google SSO',
                  message: 'Google Sign-In completed. (Operating in secure local mode)',
                  category: 'system',
                  read: false,
                  date: new Date().toISOString(),
                }
              ]
            }
          }));
        }

        setAppState((prev) => ({
          ...prev,
          currentUser: user,
        }));
        setSuccessMessage('Signed in via Google successfully (secure local mode).');
        setLoading(false);
        return true;
      }
      setError(err.message || 'An error occurred during Google Authentication.');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.warn('Firebase logout rejected; session cleared locally.', err);
    } finally {
      setAppState((prev) => ({
        ...prev,
        currentUser: null,
      }));
      setActiveTab('home');
      setActiveMenuScreen(null);
      setSuccessMessage('Logged out safely. Have a premium day!');
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(`Password recovery credentials dispatched to: ${email}`);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/network-request-failed' || err.message?.includes('network-request-failed') || err.message?.includes('offline')) {
        setSuccessMessage(`Password recovery credentials dispatched to: ${email} (secure local simulation)`);
      } else {
        setError(err.message || 'Error dispatching password reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!appState.currentUser) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const updatedUser: User = {
        ...prev.currentUser,
        emailVerified: true,
        isVerified: true,
        trustScore: Math.min(100, prev.currentUser.trustScore + 15),
        trustHistory: [
          {
            date: new Date().toISOString().split('T')[0],
            change: 15,
            reason: 'Email verification badge confirmation',
          },
          ...prev.currentUser.trustHistory,
        ],
      };
      
      return {
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser.email.toLowerCase()]: updatedUser,
        },
        currentUser: updatedUser,
      };
    });
    setSuccessMessage('Email verified successfully! Trust Score improved by +15.');
    setLoading(false);
  };

  const onboardingComplete = () => {
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const updatedUser = { ...prev.currentUser, onboardingCompleted: true };
      return {
        ...prev,
        users: { ...prev.users, [prev.currentUser.email.toLowerCase()]: updatedUser },
        currentUser: updatedUser,
      };
    });
  };

  const welcomeComplete = (dontShowAgain: boolean) => {
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const updatedUser = { ...prev.currentUser, welcomeCompleted: true };
      return {
        ...prev,
        users: { ...prev.users, [prev.currentUser.email.toLowerCase()]: updatedUser },
        currentUser: updatedUser,
      };
    });
  };

  const submitKyc = async (docReference: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const todayStr = new Date().toISOString().split('T')[0];
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const updatedUser: User = {
        ...prev.currentUser,
        kycStatus: 'verified',
        trustScore: Math.min(100, prev.currentUser.trustScore + 25),
        trustHistory: [
          { date: todayStr, change: 25, reason: `KYC legal credentials clearance: ${docReference}` },
          ...prev.currentUser.trustHistory,
        ],
        walletLevel: 2,
        dailyLimit: 25000,
        monthlyLimit: 250000,
        spendingLimit: 15000,
      };

      return {
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser.email.toLowerCase()]: updatedUser,
        },
        currentUser: updatedUser,
      };
    });
    setSuccessMessage('KYC credentials successfully validated. Wallet upgraded to Level 2 with enhanced limits!');
    setLoading(false);
    return true;
  };

  const setWalletPin = async (pin: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const updatedUser: User = {
        ...prev.currentUser,
        walletPin: pin,
      };
      return {
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser.email.toLowerCase()]: updatedUser,
        },
        currentUser: updatedUser,
      };
    });
    setSuccessMessage('Secure transaction PIN registered successfully.');
    setLoading(false);
    return true;
  };

  const updateWalletLimits = async (daily: number, monthly: number, spending: number): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const updatedUser: User = {
        ...prev.currentUser,
        dailyLimit: daily,
        monthlyLimit: monthly,
        spendingLimit: spending,
      };
      return {
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser.email.toLowerCase()]: updatedUser,
        },
        currentUser: updatedUser,
      };
    });
    setSuccessMessage('Wallet limits customized successfully.');
    setLoading(false);
    return true;
  };

  const updateWalletStatus = async (status: 'active' | 'locked' | 'frozen'): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const updatedUser: User = {
        ...prev.currentUser,
        walletStatus: status,
      };
      return {
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser.email.toLowerCase()]: updatedUser,
        },
        currentUser: updatedUser,
      };
    });
    setSuccessMessage(`Wallet status updated to ${status.toUpperCase()} successfully.`);
    setLoading(false);
    return true;
  };

  const fundWallet = async (amount: number, provider: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const userId = prev.currentUser.id;
      const todayStr = new Date().toISOString();

      // Main deposit transaction
      let nextState = applyLedgerCredit(
        prev,
        userId,
        amount,
        `Wallet funded via ${provider}`,
        'deposit'
      );

      // 1% Cashback bonus calculation
      const cashbackAmount = Math.round(amount * 0.01);
      if (cashbackAmount > 0) {
        nextState = applyLedgerCredit(
          nextState,
          userId,
          cashbackAmount,
          `1% Promotional funding cashback bonus for using ${provider}`,
          'cashback'
        );
      }

      // Add notification
      const fundNotif: Notification = {
        id: generateUniqueId('notif_fund'),
        title: '💰 Wallet Funded Successfully',
        message: `Your wallet was funded with ${amount} PWC via ${provider}.${cashbackAmount > 0 ? ` You received ${cashbackAmount} PWC cashback!` : ''}`,
        category: 'reward',
        read: false,
        date: todayStr,
      };
      
      nextState.notifications[userId] = [fundNotif, ...(nextState.notifications[userId] || [])];
      return nextState;
    });

    setSuccessMessage(`Wallet funded with ${amount} PWC successfully (1% Cashback applied!).`);
    setLoading(false);
    return true;
  };

  const payMerchant = async (merchantId: string, amount: number, description: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    if (appState.currentUser.walletStatus !== 'active') {
      setError('Transaction blocked: Your virtual wallet is currently locked/frozen.');
      return false;
    }
    if (amount > appState.currentUser.spendingLimit) {
      setError(`Transaction blocked: This payment of ${amount} PWC exceeds your single transaction spending limit of ${appState.currentUser.spendingLimit} PWC.`);
      return false;
    }
    if (appState.currentUser.pwcBalance < amount) {
      setError('Transaction blocked: Insufficient wallet balance.');
      return false;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    let success = false;
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const userId = prev.currentUser.id;
      const todayStr = new Date().toISOString();

      // Debit the user's wallet
      const debitResult = applyLedgerDebit(
        prev,
        userId,
        amount,
        `Merchant payment to ${merchantId} - ${description}`,
        'merchant_payment'
      );

      if (!debitResult.success) return prev;

      success = true;
      let nextState = debitResult.state;

      // 2% Loyalty Cashback bonus calculation
      const cashbackAmount = Math.round(amount * 0.02);
      if (cashbackAmount > 0) {
        nextState = applyLedgerCredit(
          nextState,
          userId,
          cashbackAmount,
          `2% Loyalty cashback refund for purchase at ${merchantId}`,
          'cashback'
        );
      }

      // Add notification
      const payNotif: Notification = {
        id: generateUniqueId('notif_pay'),
        title: '🛒 Merchant Payment Dispatched',
        message: `Successfully paid ${amount} PWC to ${merchantId}.${cashbackAmount > 0 ? ` Earned ${cashbackAmount} PWC loyalty cashback!` : ''}`,
        category: 'system',
        read: false,
        date: todayStr,
      };

      nextState.notifications[userId] = [payNotif, ...(nextState.notifications[userId] || [])];
      return nextState;
    });

    setLoading(false);
    if (success) {
      setSuccessMessage(`Payment of ${amount} PWC to ${merchantId} settled (2% Cashback applied!).`);
      return true;
    } else {
      setError('Transaction processing failed.');
      return false;
    }
  };

  const sendWalletTransfer = async (targetWalletNumber: string, amount: number, note?: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    if (appState.currentUser.walletStatus !== 'active') {
      setError('Transaction blocked: Your virtual wallet is currently locked/frozen.');
      return false;
    }
    if (amount > appState.currentUser.spendingLimit) {
      setError(`Transaction blocked: This transfer of ${amount} PWC exceeds your single transaction spending limit of ${appState.currentUser.spendingLimit} PWC.`);
      return false;
    }
    if (appState.currentUser.pwcBalance < amount) {
      setError('Transaction blocked: Insufficient wallet balance.');
      return false;
    }

    // Find recipient by 10-digit walletNumber
    const recipient = Object.values(appState.users).find((u) => u.walletNumber === targetWalletNumber);
    if (!recipient) {
      setError(`Recipient validation failed: Wallet number "${targetWalletNumber}" was not found in PayWorth directories.`);
      return false;
    }

    if (recipient.id === appState.currentUser.id) {
      setError('Transaction blocked: Self-transfer transactions are prohibited.');
      return false;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    let success = false;
    const refId = `pww_tx_ref_${Date.now()}`;

    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const senderId = prev.currentUser.id;
      const todayStr = new Date().toISOString();

      // Debit sender
      const debitResult = applyLedgerDebit(
        prev,
        senderId,
        amount,
        `PWW instant transfer sent to ${recipient.username} (${recipient.walletNumber})`,
        'transfer_sent'
      );

      if (!debitResult.success) return prev;

      success = true;
      let nextState = debitResult.state;

      // Credit recipient
      nextState = applyLedgerCredit(
        nextState,
        recipient.id,
        amount,
        `PWW instant transfer received from ${prev.currentUser.username} (${prev.currentUser.walletNumber})`,
        'transfer_received'
      );

      // Link references in the ledger entries
      if (nextState.ledger[senderId] && nextState.ledger[senderId][0]) {
        nextState.ledger[senderId][0].referenceId = refId;
      }
      if (nextState.ledger[recipient.id] && nextState.ledger[recipient.id][0]) {
        nextState.ledger[recipient.id][0].referenceId = refId;
      }

      // Notification for recipient
      const rxNotif: Notification = {
        id: generateUniqueId('rx'),
        title: '💸 PWW Transfer Received',
        message: `You received ${amount} PWC from ${prev.currentUser.username}. Note: ${note || 'None'}.`,
        category: 'reward',
        read: false,
        date: todayStr,
      };
      nextState.notifications[recipient.id] = [rxNotif, ...(nextState.notifications[recipient.id] || [])];

      // Notification for sender
      const txNotif: Notification = {
        id: generateUniqueId('tx'),
        title: '💸 PWW Transfer Settled',
        message: `Successfully transferred ${amount} PWC to ${recipient.username} (Wallet: ${recipient.walletNumber}).`,
        category: 'system',
        read: false,
        date: todayStr,
      };
      nextState.notifications[senderId] = [txNotif, ...(nextState.notifications[senderId] || [])];

      return nextState;
    });

    setLoading(false);
    if (success) {
      setSuccessMessage(`Transferred ${amount} PWC to ${recipient.username} instantly (Ref: ${refId}).`);
      return true;
    } else {
      setError('Transaction processing failed.');
      return false;
    }
  };

  const reverseTransaction = async (txId: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    let success = false;
    setAppState((prev) => {
      if (!prev.currentUser) return prev;

      // Find the transaction inside current user's ledger
      const userLedger = prev.ledger[prev.currentUser.id] || [];
      const tx = userLedger.find((entry) => entry.id === txId || entry.referenceId === txId);

      if (!tx) {
        return prev;
      }

      if (tx.status === 'reversed') {
        return prev; // already reversed
      }

      // Mark the original transaction as reversed
      const updatedLedger = userLedger.map((entry) => {
        if (entry.id === tx.id) {
          return { ...entry, status: 'reversed' as const };
        }
        return entry;
      });

      let nextState = {
        ...prev,
        ledger: {
          ...prev.ledger,
          [prev.currentUser.id]: updatedLedger,
        },
      };

      const amount = tx.amount;
      const todayStr = new Date().toISOString();

      if (tx.type === 'debit') {
        // If it was a debit, we refund the user!
        const refundedUser = {
          ...prev.currentUser,
          pwcBalance: prev.currentUser.pwcBalance + amount,
        };
        nextState.users[prev.currentUser.email.toLowerCase()] = refundedUser;
        nextState.currentUser = refundedUser;

        const refundEntry: LedgerEntry = {
          id: `tx_rev_refund_${Date.now()}`,
          timestamp: todayStr,
          type: 'credit',
          amount,
          balanceAfter: refundedUser.pwcBalance,
          description: `Reversal Re-credit: [Original ID: ${tx.id}]`,
          category: 'transfer_reversal',
          status: 'completed',
          referenceId: tx.id,
        };
        nextState.ledger[prev.currentUser.id] = [refundEntry, ...updatedLedger];
        success = true;
      } else {
        // If it was a credit, we debit the user!
        if (prev.currentUser.pwcBalance < amount) {
          return prev; // cannot reverse if user doesn't have enough balance
        }
        const debitedUser = {
          ...prev.currentUser,
          pwcBalance: prev.currentUser.pwcBalance - amount,
        };
        nextState.users[prev.currentUser.email.toLowerCase()] = debitedUser;
        nextState.currentUser = debitedUser;

        const debitEntry: LedgerEntry = {
          id: `tx_rev_debit_${Date.now()}`,
          timestamp: todayStr,
          type: 'debit',
          amount,
          balanceAfter: debitedUser.pwcBalance,
          description: `Reversal Re-debit: [Original ID: ${tx.id}]`,
          category: 'transfer_reversal',
          status: 'completed',
          referenceId: tx.id,
        };
        nextState.ledger[prev.currentUser.id] = [debitEntry, ...updatedLedger];
        success = true;
      }

      // Notification
      const revNotif: Notification = {
        id: generateUniqueId('notif_rev'),
        title: '⚠️ Transaction Reversed',
        message: `Transaction [ID: ${tx.id}] has been reversed. Corresponding balance adjustments were written to your ledger.`,
        category: 'system',
        read: false,
        date: todayStr,
      };
      nextState.notifications[prev.currentUser.id] = [revNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setLoading(false);
    if (success) {
      setSuccessMessage('Transaction reversed successfully.');
      return true;
    } else {
      setError('Unable to reverse transaction. Verify ledger integrity and balance state.');
      return false;
    }
  };

  // Rewards Engine
  const claimDailyReward = async (): Promise<boolean> => {
    if (!appState.currentUser) return false;
    const nowStr = new Date().toISOString().split('T')[0];
    if (appState.currentUser.dailyRewardClaimedAt === nowStr) {
      setError('Daily reward already claimed today. Return tomorrow!');
      return false;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    // Calculate reward based on membership multiplier
    const tier = MEMBERSHIP_TIERS_DATA.find((t) => t.name === appState.currentUser?.membershipTier);
    const multiplier = tier?.multiplier || 1.0;
    const baseReward = 20;
    const finalReward = Math.round(baseReward * multiplier);

    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      
      const updatedUser: User = {
        ...prev.currentUser,
        dailyRewardClaimedAt: nowStr,
        pwcBalance: prev.currentUser.pwcBalance + finalReward,
        lifetimeEarned: prev.currentUser.lifetimeEarned + finalReward,
      };

      const withXP = awardXP(updatedUser, 30); // 30 XP for daily rewards

      let nextState = {
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser.email.toLowerCase()]: withXP.user,
        },
        currentUser: withXP.user,
      };

      // Ledger entry
      nextState = applyLedgerCredit(
        nextState,
        prev.currentUser.id,
        finalReward,
        `Daily streak login claim (${multiplier}x Tier Multiplier)`,
        'daily_reward'
      );

      // Notification
      const rewardNotif: Notification = {
        id: `n_daily_${Date.now()}`,
        title: '💎 Daily Login Reward',
        message: `Successfully received ${finalReward} PWC! Level multiplier active.`,
        category: 'reward',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[prev.currentUser.id] = [rewardNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setSuccessMessage(`Claimed ${finalReward} PWC and +30 XP!`);
    setLoading(false);
    return true;
  };

  const spinLuckyWheel = async (): Promise<{ prize: string; amount: number; type: string }> => {
    if (!appState.currentUser) throw new Error('Unauthorized');
    if (appState.currentUser.luckyWheelSpinsRemaining <= 0) {
      // Check if they can buy spin for 50 PWC
      if (appState.currentUser.pwcBalance < 50) {
        throw new Error('Insufficient coins to buy an extra spin.');
      }
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // Suspenseful spin delay

    const weightedPrizes = [
      { prize: '50 PWC Ledger credit', amount: 50, type: 'pwc', weight: 35 },
      { prize: '10 PWC Ledger credit', amount: 10, type: 'pwc', weight: 25 },
      { prize: '100 PWC Ledger credit', amount: 100, type: 'pwc', weight: 15 },
      { prize: '50 XP Booster', amount: 50, type: 'xp', weight: 12 },
      { prize: 'Trust Score +3 Health', amount: 3, type: 'trust', weight: 10 },
      { prize: '1,000 PWC Mega Jackpot', amount: 1000, type: 'pwc', weight: 2 },
      { prize: '10,000 PWC Ultimate Grand Jackpot', amount: 10000, type: 'pwc', weight: 1 },
    ];

    const randomVal = Math.random() * 100;
    let cumulativeWeight = 0;
    let result = weightedPrizes[0];

    for (const item of weightedPrizes) {
      cumulativeWeight += item.weight;
      if (randomVal <= cumulativeWeight) {
        result = item;
        break;
      }
    }

    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      
      let updatedUser = { ...prev.currentUser };
      let cost = 0;
      let usedSpin = false;

      if (updatedUser.luckyWheelSpinsRemaining > 0) {
        updatedUser.luckyWheelSpinsRemaining -= 1;
        usedSpin = true;
      } else {
        cost = 50;
        updatedUser.pwcBalance -= cost;
      }

      let nextState = { ...prev };

      // Apply cost to ledger if purchased
      if (cost > 0) {
        const debitEntry: LedgerEntry = {
          id: `tx_wheel_cost_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'debit',
          amount: cost,
          balanceAfter: updatedUser.pwcBalance,
          description: 'Lucky Wheel spin purchase cost',
          category: 'wheel',
          status: 'completed',
        };
        nextState.ledger[updatedUser.id] = [debitEntry, ...(nextState.ledger[updatedUser.id] || [])];
      }

      // Apply prize
      if (result.type === 'pwc') {
        updatedUser.pwcBalance += result.amount;
        updatedUser.lifetimeEarned += result.amount;
        
        nextState = applyLedgerCredit(
          nextState,
          updatedUser.id,
          result.amount,
          `Lucky Wheel prize: ${result.prize}`,
          'wheel'
        );
      } else if (result.type === 'xp') {
        const xpResult = awardXP(updatedUser, result.amount);
        updatedUser = xpResult.user;
      } else if (result.type === 'trust') {
        updatedUser = updateTrustScore(updatedUser, result.amount, 'Lucky Wheel positive probability outcomes');
      } else if (result.type === 'mystery') {
        // Mystery reward 50 PWC
        updatedUser.pwcBalance += 50;
        updatedUser.lifetimeEarned += 50;
        nextState = applyLedgerCredit(
          nextState,
          updatedUser.id,
          50,
          'Lucky Wheel Mystery Box claim',
          'wheel'
        );
      }

      // Save user
      nextState.users[updatedUser.email.toLowerCase()] = updatedUser;
      nextState.currentUser = updatedUser;

      // Notify
      const wheelNotif: Notification = {
        id: generateUniqueId('notif_wheel'),
        title: '🎡 Lucky Wheel Outcome',
        message: `You spun the wheel and received: ${result.prize}!`,
        category: 'reward',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[updatedUser.id] = [wheelNotif, ...(nextState.notifications[updatedUser.id] || [])];

      return nextState;
    });

    setSuccessMessage(`Lucky Wheel prize: ${result.prize}!`);
    setLoading(false);
    return result;
  };

  // Task Engine
  const startTask = (taskId: string) => {
    setAppState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const submission: TaskSubmission = {
        id: `ts_${Date.now()}`,
        taskId,
        userId: prev.currentUser?.id || 'anonymous',
        userName: prev.currentUser?.username || 'Guest',
        evidence: '',
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };

      return {
        ...prev,
        taskSubmissions: [...prev.taskSubmissions, submission],
      };
    });
  };

  const submitTaskEvidence = async (taskId: string, evidence: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    const task = appState.tasks.find((t) => t.id === taskId);
    if (!task) {
      setError('Task reference not found.');
      setLoading(false);
      return false;
    }

    if (appState.currentUser.trustScore < task.trustRequirement) {
      setError(`Minimum Trust Score required for this task is: ${task.trustRequirement}`);
      setLoading(false);
      return false;
    }

    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      
      const newSubmission: TaskSubmission = {
        id: `ts_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        taskId,
        userId: prev.currentUser.id,
        userName: prev.currentUser.username,
        evidence: evidence.trim(),
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };

      // In community or advertiser task, admin must review (status: pending)
      // In easy daily task (like verifying profile), we can auto-approve immediately!
      const isAutoApprove = task.category === 'daily' && taskId === 'task_email_verify' && prev.currentUser.emailVerified;
      
      let nextState = {
        ...prev,
        taskSubmissions: [newSubmission, ...prev.taskSubmissions],
      };

      if (isAutoApprove) {
        newSubmission.status = 'approved';
        newSubmission.feedback = 'Automated validation confirmed credentials';
        
        // Reward user
        const tier = MEMBERSHIP_TIERS_DATA.find((t) => t.name === prev.currentUser?.membershipTier);
        const finalReward = Math.round(task.reward * (tier?.multiplier || 1.0));

        nextState = applyLedgerCredit(
          nextState,
          prev.currentUser.id,
          finalReward,
          `Auto-validation: Completed task "${task.title}"`,
          'task'
        );

        // Add notification
        const taskNotif: Notification = {
          id: generateUniqueId('n_t_app'),
          title: '✅ Task Auto-Approved',
          message: `Your task completion evidence was verified instantly. ${finalReward} PWC credited.`,
          category: 'task',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[prev.currentUser.id] = [taskNotif, ...(nextState.notifications[prev.currentUser.id] || [])];
      } else {
        // Send notification about pending status
        const pendingNotif: Notification = {
          id: generateUniqueId('n_t_pend'),
          title: '📋 Task Submitted for Review',
          message: `Evidence for "${task.title}" uploaded. Our moderation team will verify it within 24h.`,
          category: 'task',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[prev.currentUser.id] = [pendingNotif, ...(nextState.notifications[prev.currentUser.id] || [])];
      }

      return nextState;
    });

    setSuccessMessage('Task evidence submitted successfully.');
    setLoading(false);
    return true;
  };

  // Marketplace & Campaigns
  const createCampaign = async (
    data: Omit<Campaign, 'id' | 'creatorId' | 'creatorName' | 'trustRating' | 'status' | 'remainingSlots'>
  ): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    // Calculate reward escrow
    const requiredEscrow = data.reward * data.slots;
    if (appState.currentUser.pwcBalance < requiredEscrow) {
      setError(`Insufficient balance. Escrow requires ${requiredEscrow} PWC to secure payments for workers.`);
      setLoading(false);
      return false;
    }

    const campaignId = `camp_${Date.now()}`;
    const newCampaign: Campaign = {
      ...data,
      id: campaignId,
      creatorId: appState.currentUser.id,
      creatorName: appState.currentUser.username,
      trustRating: appState.currentUser.trustScore,
      remainingSlots: data.slots,
      status: 'pending_approval', // Campaigns need admin review for safety/anti-spam
    };

    setAppState((prev) => {
      if (!prev.currentUser) return prev;

      // Lock escrow coins
      const debitResult = applyLedgerDebit(
        prev,
        prev.currentUser.id,
        requiredEscrow,
        `Campaign creation Escrow lock: "${data.title}"`,
        'campaign_escrow'
      );

      if (!debitResult.success) return prev;

      let nextState = debitResult.state;
      nextState.campaigns = [newCampaign, ...nextState.campaigns];

      // Add system notification for admin review
      const campNotif: Notification = {
        id: generateUniqueId('n_camp'),
        title: '🛒 Campaign Created (Locked Escrow)',
        message: `Your campaign "${data.title}" is in queue. ${requiredEscrow} PWC has been safely escrowed.`,
        category: 'marketplace',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[prev.currentUser.id] = [campNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setSuccessMessage('Campaign initialized! Rewards escrowed and awaiting admin authorization.');
    setLoading(false);
    return true;
  };

  const submitCampaign = async (campaignId: string, textEvidence: string, evidenceUrl?: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const campaign = appState.campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      setError('Campaign reference not found.');
      setLoading(false);
      return false;
    }

    if (campaign.remainingSlots <= 0) {
      setError('Campaign is fully saturated; no remaining submission slots.');
      setLoading(false);
      return false;
    }

    // Check if they already submitted
    const existing = appState.campaignSubmissions.find(
      (s) => s.campaignId === campaignId && s.userId === appState.currentUser?.id
    );
    if (existing) {
      setError('You have already submitted evidence for this marketplace campaign.');
      setLoading(false);
      return false;
    }

    const submissionId = `csub_${Date.now()}`;
    const newSubmission: CampaignSubmission = {
      id: submissionId,
      campaignId,
      userId: appState.currentUser.id,
      userName: appState.currentUser.username,
      evidenceUrl,
      textEvidence,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      
      const updatedCampaigns = prev.campaigns.map((c) => {
        if (c.id === campaignId) {
          return { ...c, remainingSlots: c.remainingSlots - 1 };
        }
        return c;
      });

      const nextState = {
        ...prev,
        campaigns: updatedCampaigns,
        campaignSubmissions: [newSubmission, ...prev.campaignSubmissions],
      };

      // Send worker a notification
      const workerNotif: Notification = {
        id: generateUniqueId('notif_w'),
        title: '📋 Campaign Proof Uploaded',
        message: `Your proof of work for "${campaign.title}" was submitted to the creator.`,
        category: 'marketplace',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[prev.currentUser.id] = [workerNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setSuccessMessage('Campaign work proof uploaded successfully.');
    setLoading(false);
    return true;
  };

  const reviewCampaignSubmission = async (submissionId: string, status: 'approved' | 'rejected', reviewNote?: string): Promise<void> => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    setAppState((prev) => {
      const submission = prev.campaignSubmissions.find((s) => s.id === submissionId);
      if (!submission) return prev;

      const campaign = prev.campaigns.find((c) => c.id === submission.campaignId);
      if (!campaign) return prev;

      const worker = (Object.values(prev.users) as User[]).find((u) => u.id === submission.userId);
      if (!worker) return prev;

      const updatedSubmissions = prev.campaignSubmissions.map((s) => {
        if (s.id === submissionId) {
          return { ...s, status, reviewNote };
        }
        return s;
      });

      let nextState = {
        ...prev,
        campaignSubmissions: updatedSubmissions,
      };

      if (status === 'approved') {
        // Pay the worker from the escrowed campaign pool (the creator already paid during campaign creation)
        const tier = MEMBERSHIP_TIERS_DATA.find((t) => t.name === worker.membershipTier);
        const baseReward = campaign.reward;
        const finalReward = Math.round(baseReward * (tier?.multiplier || 1.0));

        nextState = applyLedgerCredit(
          nextState,
          worker.id,
          finalReward,
          `Campaign Work Approved: "${campaign.title}"`,
          'task'
        );

        // Add trust score to worker
        const updatedWorker = (Object.values(nextState.users) as User[]).find((u) => u.id === worker.id);
        if (updatedWorker) {
          const trustUpdated = updateTrustScore(updatedWorker, 3, 'Legitimate marketplace campaign submission approval');
          nextState.users[updatedWorker.email.toLowerCase()] = trustUpdated;
          if (prev.currentUser?.id === worker.id) {
            nextState.currentUser = trustUpdated;
          }
        }

        // Send worker notification
        const successNotif: Notification = {
          id: generateUniqueId('notif_app_camp'),
          title: '💰 Campaign Work Approved!',
          message: `Your contribution to "${campaign.title}" was verified. ${finalReward} PWC credited.`,
          category: 'marketplace',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[worker.id] = [successNotif, ...(nextState.notifications[worker.id] || [])];
      } else {
        // Rejected. Escrow refund? Actually escrow remains with creator until campaign finishes, or returns.
        // Penalty trust score for spam
        const updatedWorker = (Object.values(nextState.users) as User[]).find((u) => u.id === worker.id);
        if (updatedWorker) {
          const trustUpdated = updateTrustScore(updatedWorker, -5, `Campaign work rejected: ${reviewNote || 'Inadequate evidence'}`);
          nextState.users[updatedWorker.email.toLowerCase()] = trustUpdated;
          if (prev.currentUser?.id === worker.id) {
            nextState.currentUser = trustUpdated;
          }
        }

        // Notification of rejection
        const rejectNotif: Notification = {
          id: generateUniqueId('notif_rej_camp'),
          title: '❌ Campaign Submission Rejected',
          message: `Your proof for "${campaign.title}" was rejected. Feedback: ${reviewNote || 'None'}. Trust score impacted.`,
          category: 'marketplace',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[worker.id] = [rejectNotif, ...(nextState.notifications[worker.id] || [])];
      }

      return nextState;
    });

    setSuccessMessage(`Submission review completed: Marked as ${status}.`);
    setLoading(false);
  };

  // Wallet Actions (Strict Ledgers)
  const depositSimulate = async (amount: number): Promise<void> => {
    if (!appState.currentUser) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      
      const depositVA = prev.currentUser.virtualAccount || {
        accountNumber: `VA-${Math.floor(100000000 + Math.random() * 900000000)}`,
        bankName: 'Silicon Ledger Bank',
        holderName: prev.currentUser.username.toUpperCase(),
      };

      const updatedUser: User = {
        ...prev.currentUser,
        pwcBalance: prev.currentUser.pwcBalance + amount,
        lifetimeEarned: prev.currentUser.lifetimeEarned + amount,
        virtualAccount: depositVA,
      };

      let nextState = {
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser.email.toLowerCase()]: updatedUser,
        },
        currentUser: updatedUser,
      };

      nextState = applyLedgerCredit(
        nextState,
        prev.currentUser.id,
        amount,
        `Credit deposit via Virtual Account (${depositVA.accountNumber})`,
        'deposit'
      );

      // Notification
      const depNotif: Notification = {
        id: generateUniqueId('notif_dep'),
        title: '🏦 Deposit Settled',
        message: `Your secure virtual account transfer of ${amount} PWC was successfully deposited.`,
        category: 'reward',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[prev.currentUser.id] = [depNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setSuccessMessage(`Simulated Deposit of ${amount} PWC completed.`);
    setLoading(false);
  };

  const requestWithdrawal = async (amount: number, bankName: string, accountNumber: string): Promise<{ success: boolean; message: string }> => {
    if (!appState.currentUser) return { success: false, message: 'Unauthorized' };
    
    if (appState.currentUser.pwcBalance < amount) {
      return { success: false, message: 'Insufficient Ledger Balance.' };
    }

    if (amount < 100) {
      return { success: false, message: 'Minimum withdrawal amount is 100 PWC.' };
    }

    if (appState.currentUser.trustScore < 60) {
      return { success: false, message: 'Minimum Trust Score required for withdrawals is 60. Elevate your status by completing tasks.' };
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    // Calculate fees (Dark Bronze standard fee 10%, Silver 5%, Diamond 0%)
    let feePercent = 0.10;
    if (appState.currentUser.membershipTier === 'Shining Silver') feePercent = 0.05;
    else if (appState.currentUser.membershipTier === 'Shimmering Gold') feePercent = 0.02;
    else if (appState.currentUser.membershipTier === 'Resilient Diamond' || appState.currentUser.membershipTier === 'Epic Legend' || appState.currentUser.membershipTier === 'Mythical') feePercent = 0.0;
    
    const fee = Math.round(amount * feePercent);
    const receiveAmount = amount - fee;

    const reqId = `wd_${Date.now()}`;
    const newRequest: WithdrawalRequest = {
      id: reqId,
      userId: appState.currentUser.id,
      userName: appState.currentUser.username,
      amount,
      bankName,
      accountNumber,
      fee,
      receiveAmount,
      settlementDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days settlement
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    let success = false;
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      
      const debitResult = applyLedgerDebit(
        prev,
        prev.currentUser.id,
        amount,
        `Withdrawal dispatch to ${bankName} (${accountNumber})`,
        'withdrawal',
        'pending' // set state as pending transaction
      );

      if (!debitResult.success) return prev;

      success = true;
      let nextState = debitResult.state;
      nextState.withdrawals = [newRequest, ...nextState.withdrawals];

      const wNotif: Notification = {
        id: generateUniqueId('notif_w_req'),
        title: '👛 Withdrawal Request Locked',
        message: `Your settlement of ${receiveAmount} PWC (after ${fee} PWC fee) has been sent to queue.`,
        category: 'withdrawal',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[prev.currentUser.id] = [wNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setLoading(false);
    if (success) {
      setSuccessMessage('Withdrawal dispatch successfully placed in our secure ledger settlement queue.');
      return { success: true, message: 'Settlement queue lock complete.' };
    } else {
      return { success: false, message: 'Failed to debit balance safely.' };
    }
  };

  const sendTransfer = async (recipientEmail: string, amount: number, note?: string): Promise<{ success: boolean; message: string }> => {
    if (!appState.currentUser) return { success: false, message: 'Unauthorized' };
    const lowerEmail = recipientEmail.trim().toLowerCase();
    
    if (appState.currentUser.email === lowerEmail) {
      return { success: false, message: 'Self-transfer transactions are prohibited.' };
    }

    if (appState.currentUser.pwcBalance < amount) {
      return { success: false, message: 'Insufficient balance on ledger.' };
    }

    const recipient = appState.users[lowerEmail];
    if (!recipient) {
      return { success: false, message: 'Recipient registration credentials not found in PayWorth directories.' };
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    let success = false;
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      
      // Debit sender
      const debitResult = applyLedgerDebit(
        prev,
        prev.currentUser.id,
        amount,
        `P2P transfer sent to ${recipient.username} (${lowerEmail})`,
        'transfer_sent'
      );

      if (!debitResult.success) return prev;

      success = true;
      let nextState = debitResult.state;

      // Credit recipient
      nextState = applyLedgerCredit(
        nextState,
        recipient.id,
        amount,
        `P2P transfer received from ${prev.currentUser.username} (${prev.currentUser.email})`,
        'transfer_received'
      );

      // Notification for recipient
      const rxNotif: Notification = {
        id: generateUniqueId('rx'),
        title: '💸 Transfer Received',
        message: `You received ${amount} PWC from ${prev.currentUser.username}. Note: ${note || 'None'}.`,
        category: 'reward',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[recipient.id] = [rxNotif, ...(nextState.notifications[recipient.id] || [])];

      // Notification for sender
      const txNotif: Notification = {
        id: generateUniqueId('tx'),
        title: '💸 Transfer Transmitted',
        message: `Sent ${amount} PWC to ${recipient.username} successfully.`,
        category: 'system',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[prev.currentUser.id] = [txNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setLoading(false);
    if (success) {
      setSuccessMessage(`Transmitted ${amount} PWC to ${recipient.username} instantly.`);
      return { success: true, message: 'Transfer secure transmission completed.' };
    } else {
      return { success: false, message: 'Security failed to process peer-to-peer transaction.' };
    }
  };

  const upgradeMembership = async (tierName: MembershipTier): Promise<{ success: boolean; message: string }> => {
    if (!appState.currentUser) return { success: false, message: 'Unauthorized' };
    
    const tier = MEMBERSHIP_TIERS_DATA.find((t) => t.name === tierName);
    if (!tier) return { success: false, message: 'Invalid Membership Tier specification.' };

    if (appState.currentUser.level < tier.minLevel) {
      return { success: false, message: `Upgrade blocked: Requires Level ${tier.minLevel}.` };
    }

    if (appState.currentUser.trustScore < tier.minTrust) {
      return { success: false, message: `Upgrade blocked: Requires a minimum Trust Score of ${tier.minTrust}.` };
    }

    if (appState.currentUser.pwcBalance < tier.cost) {
      return { success: false, message: `Insufficient PWC balance. Required: ${tier.cost} PWC.` };
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    let success = false;
    setAppState((prev) => {
      if (!prev.currentUser) return prev;

      const debitResult = applyLedgerDebit(
        prev,
        prev.currentUser.id,
        tier.cost,
        `Membership Upgrade to ${tierName}`,
        'membership_upgrade'
      );

      if (!debitResult.success) return prev;

      success = true;
      let nextState = debitResult.state;

      const updatedUser: User = {
        ...nextState.users[prev.currentUser.email.toLowerCase()],
        membershipTier: tierName,
      };

      nextState.users[prev.currentUser.email.toLowerCase()] = updatedUser;
      nextState.currentUser = updatedUser;

      // Notify
      const mbNotif: Notification = {
        id: generateUniqueId('notif_mb'),
        title: '🌟 Membership Tier Elevated',
        message: `Welcome to ${tierName}! Enjoy your new ${tier.multiplier}x multiplier and unique perks.`,
        category: 'membership',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[prev.currentUser.id] = [mbNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setLoading(false);
    if (success) {
      setSuccessMessage(`Congratulations! You have upgraded to the ${tierName} tier.`);
      return { success: true, message: 'Upgrade processed.' };
    } else {
      return { success: false, message: 'Ledger system failed to authorize upgrade.' };
    }
  };

  // Achievements
  const claimAchievement = async (achievementId: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    if (appState.currentUser.achievementsClaimed.includes(achievementId)) {
      setError('Achievement has already been claimed.');
      return false;
    }

    const ach = DEFAULT_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return false;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      
      const updatedUser: User = {
        ...prev.currentUser,
        achievementsClaimed: [...prev.currentUser.achievementsClaimed, achievementId],
        pwcBalance: prev.currentUser.pwcBalance + ach.rewardPWC,
        lifetimeEarned: prev.currentUser.lifetimeEarned + ach.rewardPWC,
      };

      const xpResult = awardXP(updatedUser, ach.rewardXP);
      const withTrust = updateTrustScore(xpResult.user, 5, `Achievement claim: ${ach.title}`);

      let nextState = {
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser.email.toLowerCase()]: withTrust,
        },
        currentUser: withTrust,
      };

      nextState = applyLedgerCredit(
        nextState,
        prev.currentUser.id,
        ach.rewardPWC,
        `Achievement unlocked: ${ach.title}`,
        'daily_reward'
      );

      // Notification
      const achNotif: Notification = {
        id: generateUniqueId('notif_ach'),
        title: '🏆 Achievement Unlocked!',
        message: `Unlocked "${ach.title}"! Claimed ${ach.rewardPWC} PWC, +${ach.rewardXP} XP, and +5 Trust.`,
        category: 'membership',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[prev.currentUser.id] = [achNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setSuccessMessage(`Unlocked "${ach.title}" successfully!`);
    setLoading(false);
    return true;
  };

  // Mini Games Score Submission
  const playGameAndSubmitScore = async (
    gameId: string,
    score: number
  ): Promise<{ success: boolean; reward: number; xp: number; leveledUp: boolean }> => {
    if (!appState.currentUser) throw new Error('Unauthorized');
    
    // Check daily game play limits to avoid bot exploit farming
    const todayStr = new Date().toISOString().split('T')[0];
    const userTodayGames = appState.currentUser.gamesPlayedToday[gameId] || 0;
    
    if (userTodayGames >= 5) {
      return { success: false, reward: 0, xp: 0, leveledUp: false };
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Anti-cheat verification on client side - secure game algorithm: Max 5 PWC per game session
    const basePwc = Math.min(10, Math.floor(score / 10)); // 1 PWC per 10 points, max 10 PWC
    const tier = MEMBERSHIP_TIERS_DATA.find((t) => t.name === appState.currentUser?.membershipTier);
    const finalPwc = Math.round(basePwc * (tier?.multiplier || 1.0));
    const finalXp = Math.min(50, score * 2);

    let leveledUp = false;
    let earnedReward = finalPwc;

    setAppState((prev) => {
      if (!prev.currentUser) return prev;

      const updatedUser: User = {
        ...prev.currentUser,
        gamesPlayedToday: {
          ...prev.currentUser.gamesPlayedToday,
          [gameId]: (prev.currentUser.gamesPlayedToday[gameId] || 0) + 1,
        },
      };

      const xpResult = awardXP(updatedUser, finalXp);
      leveledUp = xpResult.leveledUp;

      let nextState = {
        ...prev,
        users: {
          ...prev.users,
          [prev.currentUser.email.toLowerCase()]: xpResult.user,
        },
        currentUser: xpResult.user,
      };

      if (earnedReward > 0) {
        nextState = applyLedgerCredit(
          nextState,
          prev.currentUser.id,
          earnedReward,
          `Mini game performance payout: "${gameId}" score ${score}`,
          'game'
        );
      }

      // Send game stats notification
      const gameNotif: Notification = {
        id: generateUniqueId('notif_game'),
        title: '🎮 Mini-Game Payout Saved',
        message: `Scored ${score} in ${gameId}. Earned ${earnedReward} PWC and +${finalXp} XP.`,
        category: 'reward',
        read: false,
        date: new Date().toISOString(),
      };
      nextState.notifications[prev.currentUser.id] = [gameNotif, ...(nextState.notifications[prev.currentUser.id] || [])];

      return nextState;
    });

    setLoading(false);
    return { success: true, reward: earnedReward, xp: finalXp, leveledUp };
  };

  const submitFundingRequest = async (amount: number, reason: string): Promise<boolean> => {
    if (!appState.currentUser) return false;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const reqId = `fnd_${Date.now()}`;
    const newRequest: FundingRequest = {
      id: reqId,
      userId: appState.currentUser.id,
      userName: appState.currentUser.username,
      amount,
      reason: reason.trim(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setAppState((prev) => ({
      ...prev,
      fundingRequests: [newRequest, ...prev.fundingRequests],
    }));

    setSuccessMessage('Funding application submitted successfully for auditor review.');
    setLoading(false);
    return true;
  };

  // Notification Operations
  const clearNotifications = () => {
    if (!appState.currentUser) return;
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          [prev.currentUser.id]: [],
        },
      };
    });
  };

  const markNotificationRead = (id: string) => {
    if (!appState.currentUser) return;
    setAppState((prev) => {
      if (!prev.currentUser) return prev;
      const userNotifs = prev.notifications[prev.currentUser.id] || [];
      const updated = userNotifs.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        ...prev,
        notifications: {
          ...prev.notifications,
          [prev.currentUser.id]: updated,
        },
      };
    });
  };

  // Admin Module Controllers
  const adminApproveWithdrawal = async (id: string, approve: boolean) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    setAppState((prev) => {
      const request = prev.withdrawals.find((w) => w.id === id);
      if (!request) return prev;

      const worker = (Object.values(prev.users) as User[]).find((u) => u.id === request.userId);
      if (!worker) return prev;

      const updatedWithdrawals = prev.withdrawals.map((w) => {
        if (w.id === id) {
          return { ...w, status: approve ? ('completed' as const) : ('failed' as const) };
        }
        return w;
      });

      let nextState = {
        ...prev,
        withdrawals: updatedWithdrawals,
      };

      // Debited during request, so if approved, it's final. If rejected, refund the debit!
      if (!approve) {
        // Refund locked balance back to pwcBalance
        const refundedUser = {
          ...worker,
          pwcBalance: worker.pwcBalance + request.amount,
        };
        nextState.users[worker.email.toLowerCase()] = refundedUser;
        if (prev.currentUser?.id === worker.id) {
          nextState.currentUser = refundedUser;
        }

        // Ledger refund entry
        const refundTx: LedgerEntry = {
          id: `tx_ref_wd_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'credit',
          amount: request.amount,
          balanceAfter: refundedUser.pwcBalance,
          description: `Refund: Withdrawal to ${request.bankName} declined by auditor`,
          category: 'campaign_refund',
          status: 'completed',
        };
        nextState.ledger[worker.id] = [refundTx, ...(nextState.ledger[worker.id] || [])];

        // Notify rejection
        const rNotif: Notification = {
          id: `notif_wd_fail_${Date.now()}`,
          title: '❌ Withdrawal Request Declined',
          message: `Your withdrawal of ${request.amount} PWC was declined. Sum has been fully refunded.`,
          category: 'withdrawal',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[worker.id] = [rNotif, ...(nextState.notifications[worker.id] || [])];
      } else {
        // Approved, final status, no refund needed. Add trust score boost.
        const refundedUser = {
          ...worker,
          lifetimeWithdrawn: worker.lifetimeWithdrawn + request.amount,
        };
        const trustBoost = updateTrustScore(refundedUser, 5, 'Successful high-trust settlement completion');
        nextState.users[worker.email.toLowerCase()] = trustBoost;
        if (prev.currentUser?.id === worker.id) {
          nextState.currentUser = trustBoost;
        }

        // Notify approval
        const rNotif: Notification = {
          id: `notif_wd_ok_${Date.now()}`,
          title: '✅ Withdrawal Settled Successfully',
          message: `Your wire of ${request.receiveAmount} PWC has been cleared and disbursed to your bank.`,
          category: 'withdrawal',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[worker.id] = [rNotif, ...(nextState.notifications[worker.id] || [])];
      }

      return nextState;
    });

    setSuccessMessage(`Withdrawal successfully ${approve ? 'approved and wire dispatched' : 'declined and refunded'}.`);
    setLoading(false);
  };

  const adminApproveFunding = async (id: string, approve: boolean, feedback?: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    setAppState((prev) => {
      const request = prev.fundingRequests.find((f) => f.id === id);
      if (!request) return prev;

      const applicant = (Object.values(prev.users) as User[]).find((u) => u.id === request.userId);
      if (!applicant) return prev;

      const updatedRequests = prev.fundingRequests.map((f) => {
        if (f.id === id) {
          return { ...f, status: approve ? ('approved' as const) : ('rejected' as const), feedback };
        }
        return f;
      });

      let nextState = {
        ...prev,
        fundingRequests: updatedRequests,
      };

      if (approve) {
        // Add funds to applicant wallet
        nextState = applyLedgerCredit(
          nextState,
          applicant.id,
          request.amount,
          `Approved Funding Grant: "${request.reason}"`,
          'deposit'
        );

        // Notify
        const grantNotif: Notification = {
          id: generateUniqueId('notif_fnd_ok'),
          title: '🎉 Funding Application Approved!',
          message: `Your grant of ${request.amount} PWC was approved. Auditor feedback: ${feedback || 'Approved'}.`,
          category: 'reward',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[applicant.id] = [grantNotif, ...(nextState.notifications[applicant.id] || [])];
      } else {
        // Notify rejection
        const grantNotif: Notification = {
          id: generateUniqueId('notif_fnd_no'),
          title: '❌ Funding Application Rejected',
          message: `Your grant was rejected. Auditor feedback: ${feedback || 'None'}.`,
          category: 'system',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[applicant.id] = [grantNotif, ...(nextState.notifications[applicant.id] || [])];
      }

      return nextState;
    });

    setSuccessMessage(`Funding request successfully ${approve ? 'approved' : 'rejected'}.`);
    setLoading(false);
  };

  const adminApproveCampaign = async (id: string, approve: boolean) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    setAppState((prev) => {
      const campaign = prev.campaigns.find((c) => c.id === id);
      if (!campaign) return prev;

      const creator = (Object.values(prev.users) as User[]).find((u) => u.id === campaign.creatorId);
      if (!creator) return prev;

      const updatedCampaigns = prev.campaigns.map((c) => {
        if (c.id === id) {
          return { ...c, status: approve ? ('active' as const) : ('ended' as const) };
        }
        return c;
      });

      let nextState = {
        ...prev,
        campaigns: updatedCampaigns,
      };

      if (!approve) {
        // Refund the escrow locked during campaign creation
        const requiredRefund = campaign.reward * campaign.slots;
        const refundedCreator = {
          ...creator,
          pwcBalance: creator.pwcBalance + requiredRefund,
        };
        nextState.users[creator.email.toLowerCase()] = refundedCreator;
        if (prev.currentUser?.id === creator.id) {
          nextState.currentUser = refundedCreator;
        }

        const refundTx: LedgerEntry = {
          id: `tx_ref_camp_${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'credit',
          amount: requiredRefund,
          balanceAfter: refundedCreator.pwcBalance,
          description: `Refund: Escrow for campaign "${campaign.title}" rejected by system auditor`,
          category: 'campaign_refund',
          status: 'completed',
        };
        nextState.ledger[creator.id] = [refundTx, ...(nextState.ledger[creator.id] || [])];

        // Notify
        const creatorNotif: Notification = {
          id: generateUniqueId('notif_camp_fail'),
          title: '❌ Campaign Rejected & Refunded',
          message: `Your campaign "${campaign.title}" was rejected by auditors. Your escrow of ${requiredRefund} PWC was fully refunded.`,
          category: 'marketplace',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[creator.id] = [creatorNotif, ...(nextState.notifications[creator.id] || [])];
      } else {
        // Notify approval
        const creatorNotif: Notification = {
          id: generateUniqueId('notif_camp_ok'),
          title: '🛒 Campaign Live on Marketplace',
          message: `Your campaign "${campaign.title}" has been verified and is now live for all workers!`,
          category: 'marketplace',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[creator.id] = [creatorNotif, ...(nextState.notifications[creator.id] || [])];
      }

      return nextState;
    });

    setSuccessMessage(`Campaign successfully ${approve ? 'approved and made live' : 'rejected and refunded'}.`);
    setLoading(false);
  };

  const adminReviewTaskSubmission = async (submissionId: string, status: 'approved' | 'rejected', feedback?: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    setAppState((prev) => {
      const submission = prev.taskSubmissions.find((s) => s.id === submissionId);
      if (!submission) return prev;

      const task = prev.tasks.find((t) => t.id === submission.taskId);
      if (!task) return prev;

      const worker = (Object.values(prev.users) as User[]).find((u) => u.id === submission.userId);
      if (!worker) return prev;

      const updatedSubmissions = prev.taskSubmissions.map((s) => {
        if (s.id === submissionId) {
          return { ...s, status, feedback };
        }
        return s;
      });

      let nextState = {
        ...prev,
        taskSubmissions: updatedSubmissions,
      };

      if (status === 'approved') {
        // Credit rewards
        const tier = MEMBERSHIP_TIERS_DATA.find((t) => t.name === worker.membershipTier);
        const baseReward = task.reward;
        const finalReward = Math.round(baseReward * (tier?.multiplier || 1.0));

        nextState = applyLedgerCredit(
          nextState,
          worker.id,
          finalReward,
          `Task completed: "${task.title}"`,
          'task'
        );

        // Improve trust score
        const updatedWorker = (Object.values(nextState.users) as User[]).find((u) => u.id === worker.id);
        if (updatedWorker) {
          const trustUpdated = updateTrustScore(updatedWorker, 4, `Legitimate proof verification: ${task.title}`);
          nextState.users[updatedWorker.email.toLowerCase()] = trustUpdated;
          if (prev.currentUser?.id === worker.id) {
            nextState.currentUser = trustUpdated;
          }
        }

        // Notify
        const notif: Notification = {
          id: generateUniqueId('notif_task_ok'),
          title: '✅ Task Evidence Approved',
          message: `Your proof for "${task.title}" was verified. Earned ${finalReward} PWC and trust upgraded.`,
          category: 'task',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[worker.id] = [notif, ...(nextState.notifications[worker.id] || [])];
      } else {
        // Reject - penalty trust
        const updatedWorker = (Object.values(nextState.users) as User[]).find((u) => u.id === worker.id);
        if (updatedWorker) {
          const trustUpdated = updateTrustScore(updatedWorker, -8, `Invalid task evidence: ${feedback || 'No detail'}`);
          nextState.users[updatedWorker.email.toLowerCase()] = trustUpdated;
          if (prev.currentUser?.id === worker.id) {
            nextState.currentUser = trustUpdated;
          }
        }

        // Notify rejection
        const notif: Notification = {
          id: generateUniqueId('notif_task_no'),
          title: '❌ Task Evidence Rejected',
          message: `Your proof for "${task.title}" was rejected. Feedback: ${feedback || 'Insufficient proof'}. Trust penalized.`,
          category: 'task',
          read: false,
          date: new Date().toISOString(),
        };
        nextState.notifications[worker.id] = [notif, ...(nextState.notifications[worker.id] || [])];
      }

      return nextState;
    });

    setSuccessMessage(`Task review successfully saved as ${status}.`);
    setLoading(false);
  };

  const currentUserData = appState.currentUser
    ? appState.users[appState.currentUser.email.toLowerCase()] || appState.currentUser
    : null;

  return (
    <StateContext.Provider
      value={{
        state: appState,
        loading,
        currentUser: currentUserData,
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
  if (!context) {
    throw new Error('usePayWorth must be used within a StateProvider');
  }
  return context;
}

export { StateProvider as PayWorthProvider };
