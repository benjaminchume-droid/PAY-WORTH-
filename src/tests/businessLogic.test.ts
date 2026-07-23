// PayWorth Business Logic Automated Verification Test Suite
import { WalletService } from '../services/walletService';
import { SecurityEngine } from '../lib/security';
import { SearchService } from '../services/searchService';
import { SCREEN_REGISTRY, getScreenByPath } from '../config/screenRegistry';
import { User } from '../types';

export function runPayWorthUnitTests(): { passed: number; failed: number; logs: string[] } {
  const logs: string[] = [];
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      passed++;
      logs.push(`✅ PASS: ${testName}`);
    } else {
      failed++;
      logs.push(`❌ FAIL: ${testName}`);
    }
  };

  // 1. ROUTING REGISTRY TESTS
  assert(SCREEN_REGISTRY.length >= 20, 'Screen registry contains all 20+ defined routes');
  const homeDef = getScreenByPath('/home');
  assert(homeDef !== undefined && homeDef.id === 'home', 'Route matcher resolves /home accurately');
  const walletDef = getScreenByPath('/wallet');
  assert(walletDef !== undefined && walletDef.id === 'wallet', 'Route matcher resolves /wallet accurately');

  // 2. SECURITY ENGINE PIN ATTEMPTS TEST
  SecurityEngine.resetPinStatus();
  let pinStatus = SecurityEngine.getPinStatus();
  assert(pinStatus.count === 0 && pinStatus.lockedUntil === null, 'PIN status initializes clean with 0 attempts');

  SecurityEngine.recordFailedPinAttempt();
  pinStatus = SecurityEngine.getPinStatus();
  assert(pinStatus.count === 1, 'Failed PIN attempt increments counter');

  SecurityEngine.resetPinStatus();

  // 3. SEARCH SERVICE TESTS
  const searchResults = SearchService.query('wallet');
  assert(searchResults.length > 0, 'Search query for "wallet" returns navigation results');

  // 4. ATOMIC TRANSFER BUSINESS LOGIC TEST
  const mockSender: User = {
    id: 'user_sender_1',
    email: 'sender@test.com',
    username: 'SenderUser',
    avatar: '',
    isVerified: true,
    pwcBalance: 1000,
    pendingBalance: 0,
    lockedBalance: 0,
    lifetimeEarned: 1000,
    lifetimeWithdrawn: 0,
    trustScore: 90,
    xp: 500,
    level: 5,
    membershipTier: 'Bright Iron',
    referralCode: 'SEND123',
    referredBy: null,
    onboardingCompleted: true,
    welcomeCompleted: true,
    emailVerified: true,
    achievementsClaimed: [],
    dailyRewardClaimedAt: null,
    luckyWheelSpinsRemaining: 1,
    gamesPlayedToday: {},
    kycStatus: 'verified',
    trustHistory: [],
    virtualAccount: null,
    walletNumber: 'PW_SENDER_1',
    walletStatus: 'active',
    walletPin: '1234',
    dailyLimit: 5000,
    monthlyLimit: 50000,
    spendingLimit: 1000,
    walletLevel: 1
  };

  const mockRecipient: User = {
    ...mockSender,
    id: 'user_rec_2',
    email: 'rec@test.com',
    username: 'RecipientUser',
    pwcBalance: 200,
    walletNumber: 'PW_REC_2'
  };

  // Test PIN verification failure
  const pinFailResult = WalletService.verifyPin(mockSender, '9999');
  // Since verifyPin returns a promise:
  pinFailResult.then(res => {
    assert(!res.success, 'Invalid PIN verification returns failure response');
  });

  return { passed, failed, logs };
}
