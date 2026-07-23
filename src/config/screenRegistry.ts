import React from 'react';
import {
  Home,
  ClipboardList,
  Wallet,
  ShoppingBag,
  Sparkles,
  BadgeDollarSign,
  Trophy,
  Coins,
  Gamepad2,
  Award,
  Users,
  PieChart,
  Bell,
  Sliders,
  ShieldCheck,
  FileText,
  User,
  HelpCircle,
  ShieldAlert,
  Pickaxe,
  LucideIcon
} from 'lucide-react';

export interface ScreenSEO {
  title: string;
  description: string;
  canonical: string;
}

export interface ScreenDefinition {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  category: 'main' | 'engines' | 'admin' | 'public' | 'auth';
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  showInSidebar?: boolean;
  showInBottomNav?: boolean;
  seo: ScreenSEO;
}

export const SCREEN_REGISTRY: ScreenDefinition[] = [
  // MAIN NAVIGATION
  {
    id: 'home',
    path: '/home',
    label: 'Home Dashboard',
    icon: Home,
    category: 'main',
    requiresAuth: true,
    showInSidebar: true,
    showInBottomNav: true,
    seo: {
      title: 'PayWorth – Home Dashboard & Earning Hub',
      description: 'Earn rewards, view lifetime PWC balance, complete verified briefs, and track trust metrics.',
      canonical: 'https://payworth.app/home'
    }
  },
  {
    id: 'tasks',
    path: '/tasks',
    label: 'Tasks & Proofs',
    icon: ClipboardList,
    category: 'main',
    requiresAuth: true,
    showInSidebar: true,
    showInBottomNav: true,
    seo: {
      title: 'Earn Rewards & Tasks | PayWorth',
      description: 'Complete high-integrity micro-tasks on the PayWorth ledger. Upload verified proof to lock rewards instantly.',
      canonical: 'https://payworth.app/tasks'
    }
  },
  {
    id: 'wallet',
    path: '/wallet',
    label: 'Wallet & Wire Settlement',
    icon: Wallet,
    category: 'main',
    requiresAuth: true,
    showInSidebar: true,
    showInBottomNav: true,
    seo: {
      title: 'Wallet Ledger | PayWorth',
      description: 'Manage your secure virtual account, request bank settlements, trace transfers, and customize spending limits.',
      canonical: 'https://payworth.app/wallet'
    }
  },
  {
    id: 'marketplace',
    path: '/marketplace',
    label: 'Campaign Marketplace',
    icon: ShoppingBag,
    category: 'main',
    requiresAuth: true,
    showInSidebar: true,
    showInBottomNav: true,
    seo: {
      title: 'Campaign Marketplace | PayWorth',
      description: 'Browse active marketing briefs and sponsor campaigns on PayWorth. Secure task slots and earn validated PWC payouts.',
      canonical: 'https://payworth.app/marketplace'
    }
  },

  // ENGINES & FEATURES
  {
    id: 'membership',
    path: '/membership',
    label: 'Membership Tiers',
    icon: Sparkles,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Membership Tiers & Perks | PayWorth',
      description: 'Explore Dark Bronze, Silver, Gold, Platinum, and Diamond membership benefits and earning multipliers on PayWorth.',
      canonical: 'https://payworth.app/membership'
    }
  },
  {
    id: 'mining',
    path: '/mining',
    label: 'PWC Cloud Mining',
    icon: Pickaxe,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Cloud Mining Engine | PayWorth',
      description: 'Start daily automated cloud mining sessions to continuously generate PWC tokens.',
      canonical: 'https://payworth.app/mining'
    }
  },
  {
    id: 'create_campaign',
    path: '/create_campaign',
    label: 'Start Campaign',
    icon: BadgeDollarSign,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Sponsor Campaign Escrow | PayWorth',
      description: 'Create task campaigns, lock rewards in audited escrow pools, and hire verified global workers.',
      canonical: 'https://payworth.app/create_campaign'
    }
  },
  {
    id: 'leaderboard',
    path: '/leaderboard',
    label: 'Leaderboards',
    icon: Trophy,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Global Leaderboards | PayWorth',
      description: 'Active ledger ranking of global workers based on verified earnings, level XP, and trust score.',
      canonical: 'https://payworth.app/leaderboard'
    }
  },
  {
    id: 'wheel',
    path: '/wheel',
    label: 'Lucky Wheel',
    icon: Coins,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Lucky Probability Wheel | PayWorth',
      description: 'Spin our daily automated fortune wheel for PWC prizes, multiplier cards, and trust boosters.',
      canonical: 'https://payworth.app/wheel'
    }
  },
  {
    id: 'games',
    path: '/games',
    label: 'Mini Games',
    icon: Gamepad2,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Mini Games Platform | PayWorth',
      description: 'Play responsive, high-fidelity mini-games on PayWorth to boost your level and earn bonus coin payloads.',
      canonical: 'https://payworth.app/games'
    }
  },
  {
    id: 'achievements',
    path: '/achievements',
    label: 'Achievements',
    icon: Award,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Achievements & Trophies | PayWorth',
      description: 'Claim achievement badges and XP bonuses as you level up on the PayWorth platform.',
      canonical: 'https://payworth.app/achievements'
    }
  },
  {
    id: 'referrals',
    path: '/referrals',
    label: 'Referrals Network',
    icon: Users,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Referral Network & Commission | PayWorth',
      description: 'Invite members with your encrypted referral link and earn high-yield PWC commission rewards.',
      canonical: 'https://payworth.app/referrals'
    }
  },
  {
    id: 'payfunds',
    path: '/payfunds',
    label: 'Pay Funds Application',
    icon: BadgeDollarSign,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Earning Grant Funding | PayWorth',
      description: 'Apply for audited emergency project or creator funding grants up to 10,000 PWC.',
      canonical: 'https://payworth.app/payfunds'
    }
  },
  {
    id: 'statistics',
    path: '/statistics',
    label: 'Wallet Statistics',
    icon: PieChart,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Ledger Analytics & Stats | PayWorth',
      description: 'View real-time financial charts, task completion rates, and wallet activity statistics.',
      canonical: 'https://payworth.app/statistics'
    }
  },
  {
    id: 'notifications',
    path: '/notifications',
    label: 'In-app Notifications',
    icon: Bell,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'In-App Inbox & Alerts | PayWorth',
      description: 'System dispatch summaries, settlement notifications, and verification alerts.',
      canonical: 'https://payworth.app/notifications'
    }
  },
  {
    id: 'settings',
    path: '/settings',
    label: 'Engine Settings',
    icon: Sliders,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Profile & Security Settings | PayWorth',
      description: 'Configure multi-factor security, change email, set wallet PIN, and customize notifications.',
      canonical: 'https://payworth.app/settings'
    }
  },
  {
    id: 'security',
    path: '/security',
    label: 'Security Center',
    icon: ShieldCheck,
    category: 'engines',
    requiresAuth: true,
    showInSidebar: true,
    seo: {
      title: 'Cryptographic Security Clearance | PayWorth',
      description: 'Inspect PayWorth\'s multi-factor authorization safeguards, SHA-256 database hashing, and fraud prevention systems.',
      canonical: 'https://payworth.app/security'
    }
  },

  // PUBLIC / LEGAL / INFORMATION
  {
    id: 'profile',
    path: '/profile',
    label: 'My Profile',
    icon: User,
    category: 'public',
    requiresAuth: true,
    showInSidebar: false,
    seo: {
      title: 'User Profile & Identity | PayWorth',
      description: 'View your level progress, trust metrics, badges, and verified credentials on PayWorth.',
      canonical: 'https://payworth.app/profile'
    }
  },
  {
    id: 'legal_center',
    path: '/legal_center',
    label: 'Legal Repository',
    icon: FileText,
    category: 'public',
    showInSidebar: true,
    seo: {
      title: 'Legal Center & Policies | PayWorth',
      description: 'Terms of service, privacy policy, community guidelines, and compliance policies.',
      canonical: 'https://payworth.app/legal_center'
    }
  },
  {
    id: 'privacy',
    path: '/privacy',
    label: 'Privacy Standards',
    icon: ShieldCheck,
    category: 'public',
    showInSidebar: false,
    seo: {
      title: 'Privacy & Encryption Standards | PayWorth',
      description: 'Review PayWorth\'s bank-grade SSL protocols, AES-256 local ledger hashing, and privacy standards.',
      canonical: 'https://payworth.app/privacy'
    }
  },
  {
    id: 'terms',
    path: '/terms',
    label: 'Terms of Use',
    icon: FileText,
    category: 'public',
    showInSidebar: false,
    seo: {
      title: 'Terms of Use & Policies | PayWorth',
      description: 'Understand PayWorth\'s micro-task compliance terms, trust ratings, and withdrawal guidelines.',
      canonical: 'https://payworth.app/terms'
    }
  },
  {
    id: 'about',
    path: '/about',
    label: 'About PayWorth',
    icon: Sparkles,
    category: 'public',
    showInSidebar: false,
    seo: {
      title: 'About Glassline Studio | PayWorth',
      description: 'Learn about Glassline Foundry, the engineers behind PayWorth\'s liquid-glass fintech and cryptographic micro-task ledger.',
      canonical: 'https://payworth.app/about'
    }
  },
  {
    id: 'help',
    path: '/help',
    label: 'System Help Center',
    icon: HelpCircle,
    category: 'public',
    showInSidebar: false,
    seo: {
      title: 'Help Center & FAQ | PayWorth',
      description: 'Find official guides on wire withdrawals, task verifications, trust multipliers, and locked escrow pools.',
      canonical: 'https://payworth.app/help'
    }
  },
  {
    id: 'contact',
    path: '/contact',
    label: 'Secure Support Desk',
    icon: HelpCircle,
    category: 'public',
    showInSidebar: false,
    seo: {
      title: 'Contact Secure Support | PayWorth',
      description: 'Submit an encrypted ticket to the PayWorth auditor compliance desk for settlement assistance.',
      canonical: 'https://payworth.app/contact'
    }
  },

  // ADMIN / AUDITOR
  {
    id: 'admin',
    path: '/admin',
    label: 'Admin Panel',
    icon: Sliders,
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInSidebar: true,
    seo: {
      title: 'Auditor & Admin Console | PayWorth',
      description: 'Central management portal for task verifications, campaign escrow, and withdrawal settlement approvals.',
      canonical: 'https://payworth.app/admin'
    }
  },
  {
    id: 'legal_admin',
    path: '/legal_admin',
    label: 'Legal Operations',
    icon: ShieldCheck,
    category: 'admin',
    requiresAuth: true,
    requiresAdmin: true,
    showInSidebar: true,
    seo: {
      title: 'Legal & Policy Admin | PayWorth',
      description: 'Manage platform terms, legal documents, and privacy policies.',
      canonical: 'https://payworth.app/legal_admin'
    }
  },

  // AUTH & VERIFICATION
  {
    id: 'auth',
    path: '/auth',
    label: 'Sign In / Register',
    icon: User,
    category: 'auth',
    seo: {
      title: 'Portal Access & Sign In | PayWorth',
      description: 'Secure multi-factor authentication portal to access your PayWorth workspace and virtual ledger.',
      canonical: 'https://payworth.app/auth'
    }
  },
  {
    id: 'verify',
    path: '/verify',
    label: 'Email Verification',
    icon: ShieldAlert,
    category: 'auth',
    seo: {
      title: 'Verify Account & Unlocks | PayWorth',
      description: 'Complete email verification to activate your virtual PWC wallet.',
      canonical: 'https://payworth.app/verify'
    }
  },
  {
    id: 'account_verify',
    path: '/account_verify',
    label: 'Account Verification',
    icon: ShieldAlert,
    category: 'auth',
    seo: {
      title: 'Account Verification | PayWorth',
      description: 'Cryptographic account verification portal.',
      canonical: 'https://payworth.app/account_verify'
    }
  }
];

export function getScreenByPath(pathname: string): ScreenDefinition | undefined {
  const normalized = pathname.toLowerCase().replace(/\/$/, '') || '/home';
  return SCREEN_REGISTRY.find(
    (s) => s.path === normalized || (normalized === '/' && s.path === '/home')
  );
}

export function getSidebarScreens(isAdmin: boolean = false): ScreenDefinition[] {
  return SCREEN_REGISTRY.filter((screen) => {
    if (!screen.showInSidebar) return false;
    if (screen.requiresAdmin && !isAdmin) return false;
    return true;
  });
}

export function getBottomNavScreens(): ScreenDefinition[] {
  return SCREEN_REGISTRY.filter((screen) => screen.showInBottomNav);
}
