import React, { useEffect, useState } from 'react';
import { usePayWorth } from '../engines/StateContext';
import { ShieldAlert, RefreshCw, WifiOff, Wifi } from 'lucide-react';

interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
}

const ROUTE_METADATA: Record<string, RouteMeta> = {
  '/': {
    title: 'PayWorth – Earn Rewards, Complete Campaigns & Manage Your Wallet',
    description: 'Earn coins by completing campaigns, play instant mini-games, grow your referral network, and cash out securely with PayWorth\'s certified ledger.',
    canonical: 'https://payworth.app/'
  },
  '/verify': {
    title: 'Verify Account & Unlocks | PayWorth',
    description: 'Complete email verification to activate your virtual PWC wallet, claim referral bonuses, and enable bank wire withdrawals.',
    canonical: 'https://payworth.app/verify'
  },
  '/account_verify': {
    title: 'Account Verification | PayWorth',
    description: 'Cryptographic account verification portal for PayWorth users.',
    canonical: 'https://payworth.app/account_verify'
  },
  '/auth': {
    title: 'Portal Access & Sign In | PayWorth',
    description: 'Secure multi-factor authentication portal to access your PayWorth workspace and virtual ledger.',
    canonical: 'https://payworth.app/auth'
  },
  '/campaigns': {
    title: 'Active Campaigns | PayWorth',
    description: 'Browse active marketing briefs and sponsor campaigns on PayWorth. Secure your task slots and earn validated PWC payouts.',
    canonical: 'https://payworth.app/campaigns'
  },
  '/wallet': {
    title: 'Wallet Ledger | PayWorth',
    description: 'Manage your secure virtual account, request central settlements, trace transfers, and customize spending limits on your PayWorth wallet.',
    canonical: 'https://payworth.app/wallet'
  },
  '/tasks': {
    title: 'Earn Rewards & Tasks | PayWorth',
    description: 'Complete high-integrity micro-tasks on the PayWorth ledger. Upload verified proof to lock rewards instantly.',
    canonical: 'https://payworth.app/tasks'
  },
  '/games': {
    title: 'Mini Games Platform | PayWorth',
    description: 'Play responsive, high-fidelity mini-games on PayWorth to boost your level, earn XP multipliers, and claim bonus coin payloads.',
    canonical: 'https://payworth.app/games'
  },
  '/referrals': {
    title: 'Referral Network & Rewards | PayWorth',
    description: 'Invite members with your encrypted referral link and earn high-yield PWC commission rewards.',
    canonical: 'https://payworth.app/referrals'
  },
  '/admin': {
    title: 'Auditor & Admin Console | PayWorth',
    description: 'Central management portal for task verifications, campaign escrow, and withdrawal settlement approvals.',
    canonical: 'https://payworth.app/admin'
  },
  '/achievements': {
    title: 'Achievements & Trophies | PayWorth',
    description: 'Claim achievement badges and XP bonuses as you level up on the PayWorth platform.',
    canonical: 'https://payworth.app/achievements'
  },
  '/membership': {
    title: 'Membership Tiers & Perks | PayWorth',
    description: 'Explore Dark Bronze, Silver, Gold, Platinum, and Diamond membership benefits on PayWorth.',
    canonical: 'https://payworth.app/membership'
  },
  '/settings': {
    title: 'Profile & Security Settings | PayWorth',
    description: 'Configure multi-factor security, change email, set wallet PIN, and customize notifications.',
    canonical: 'https://payworth.app/settings'
  },
  '/stats': {
    title: 'Ledger Analytics & Stats | PayWorth',
    description: 'View real-time financial charts, task completion rates, and wallet activity statistics.',
    canonical: 'https://payworth.app/stats'
  },
  '/about': {
    title: 'About Glassline Studio | PayWorth',
    description: 'Learn about Glassline Foundry, the engineers behind PayWorth\'s liquid-glass fintech and cryptographic micro-task ledger.',
    canonical: 'https://payworth.app/about'
  },
  '/contact': {
    title: 'Contact Secure Support | PayWorth',
    description: 'Submit an encrypted ticket to the PayWorth auditor compliance desk for settlement assistance or enterprise escrow briefs.',
    canonical: 'https://payworth.app/contact'
  },
  '/help': {
    title: 'Help Center & FAQ | PayWorth',
    description: 'Find official guides on wire withdrawals, task verifications, trust multipliers, and locked escrow pools in the PayWorth Knowledge Base.',
    canonical: 'https://payworth.app/help'
  },
  '/privacy': {
    title: 'Privacy & Encryption Standards | PayWorth',
    description: 'Review PayWorth\'s bank-grade SSL protocols, AES-256 local ledger hashing, and crawler-scrubbed secure routing identity policies.',
    canonical: 'https://payworth.app/privacy'
  },
  '/terms': {
    title: 'Terms of Use & Policies | PayWorth',
    description: 'Understand PayWorth\'s micro-task compliance terms, anti-bot tracking rules, trust ratings, and withdrawal ledger guidelines.',
    canonical: 'https://payworth.app/terms'
  },
  '/security': {
    title: 'Cryptographic Security Clearance | PayWorth',
    description: 'Inspect PayWorth\'s multi-factor authorization safeguards, SHA-256 database hashing, and fraud prevention compliance systems.',
    canonical: 'https://payworth.app/security'
  }
};

export default function SEOAndRouteManager() {
  const { activeTab, setActiveTab, activeMenuScreen, setActiveMenuScreen } = usePayWorth();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to PWA update events
  useEffect(() => {
    const handleSWUpdate = () => {
      setShowUpdatePrompt(true);
    };
    window.addEventListener('pwa-need-refresh', handleSWUpdate);
    return () => {
      window.removeEventListener('pwa-need-refresh', handleSWUpdate);
    };
  }, []);

  // URL to Subsystem State (on mount & popstate back/forward navigation)
  useEffect(() => {
    const syncUrlToState = () => {
      const path = window.location.pathname;

      if (path === '/verify' || path === '/account_verify') {
        // Verification route handled directly by component router
        return;
      }

      if (path === '/about') {
        setActiveMenuScreen('about');
      } else if (path === '/privacy') {
        setActiveMenuScreen('privacy');
      } else if (path === '/terms') {
        setActiveMenuScreen('terms');
      } else if (path === '/security') {
        setActiveMenuScreen('security');
      } else if (path === '/contact') {
        setActiveMenuScreen('contact');
      } else if (path === '/help' || path === '/faq') {
        setActiveMenuScreen('help');
      } else if (path === '/games') {
        setActiveMenuScreen('games');
      } else if (path === '/referrals' || path === '/network') {
        setActiveMenuScreen('referrals');
      } else if (path === '/admin') {
        setActiveMenuScreen('admin');
      } else if (path === '/achievements') {
        setActiveMenuScreen('achievements');
      } else if (path === '/membership') {
        setActiveMenuScreen('membership');
      } else if (path === '/settings') {
        setActiveMenuScreen('settings');
      } else if (path === '/stats') {
        setActiveMenuScreen('stats');
      } else if (path === '/campaigns' || path === '/marketplace') {
        setActiveTab('marketplace');
        setActiveMenuScreen(null);
      } else if (path === '/wallet') {
        setActiveTab('wallet');
        setActiveMenuScreen(null);
      } else if (path === '/tasks') {
        setActiveTab('tasks');
        setActiveMenuScreen(null);
      } else if (path === '/' || path === '/home' || path === '/dashboard') {
        setActiveTab('home');
        setActiveMenuScreen(null);
      }
    };

    syncUrlToState();
    window.addEventListener('popstate', syncUrlToState);
    return () => {
      window.removeEventListener('popstate', syncUrlToState);
    };
  }, [setActiveTab, setActiveMenuScreen]);

  // Subsystem State to URL & Dynamic Head/SEO Manager
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/verify' || path === '/account_verify') {
      return;
    }

    let currentPath = '/';

    if (activeMenuScreen) {
      if (['about', 'privacy', 'terms', 'security', 'contact', 'help', 'games', 'referrals', 'admin', 'achievements', 'membership', 'settings', 'stats'].includes(activeMenuScreen)) {
        currentPath = `/${activeMenuScreen}`;
      } else {
        currentPath = '/';
      }
    } else {
      switch (activeTab) {
        case 'marketplace':
          currentPath = '/campaigns';
          break;
        case 'wallet':
          currentPath = '/wallet';
          break;
        case 'tasks':
          currentPath = '/tasks';
          break;
        case 'home':
        default:
          currentPath = '/';
          break;
      }
    }

    // Push State only if pathname differs to preserve browser history
    if (window.location.pathname !== currentPath) {
      window.history.pushState(null, '', currentPath);
    }

    // Retrieve corresponding SEO metadata
    const meta = ROUTE_METADATA[currentPath] || ROUTE_METADATA['/'];

    // Update Head Title
    document.title = meta.title;

    // Update Head Meta Description
    let descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', meta.description);
    } else {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      descMeta.setAttribute('content', meta.description);
      document.head.appendChild(descMeta);
    }

    // Update Head Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', meta.canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', meta.canonical);
      document.head.appendChild(canonicalLink);
    }

    // Update OG & Twitter Previews dynamically
    const updateOGTag = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let tag = document.querySelector(selector);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute(isName ? 'name' : 'property', property);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    updateOGTag('og:title', meta.title);
    updateOGTag('og:description', meta.description);
    updateOGTag('og:url', meta.canonical);
    updateOGTag('twitter:title', meta.title, true);
    updateOGTag('twitter:description', meta.description, true);
    updateOGTag('twitter:url', meta.canonical, true);

    // Dynamic JSON-LD Structured Data Injection (Schema.org)
    let jsonLdScript = document.getElementById('pw-jsonld-schema');
    if (jsonLdScript) {
      jsonLdScript.remove();
    }

    const schemaData = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'PayWorth',
        'url': 'https://payworth.app',
        'logo': 'https://payworth.app/icon-512.png',
        'founder': {
          '@type': 'Organization',
          'name': 'Glassline Foundry'
        },
        'sameAs': [
          'https://twitter.com/PayWorthApp',
          'https://facebook.com/PayWorthApp'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'PayWorth',
        'url': 'https://payworth.app/',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://payworth.app/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        'name': 'PayWorth Client Portal',
        'operatingSystem': 'All',
        'applicationCategory': 'FinanceApplication',
        'browserRequirements': 'Requires JavaScript and HTML5',
        'screenshot': 'https://payworth.app/icon-512.png',
        'softwareHelp': {
          '@type': 'CreativeWork',
          'url': 'https://payworth.app/help'
        }
      }
    ];

    if (currentPath === '/help') {
      schemaData.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How do I request a withdrawal?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Once your verified balance exceeds 100 PWC and your Trust Score is above 60%, click Withdraw on the Wallet tab. Provide bank routing details to initiate a wire transfer.'
            }
          },
          {
            '@type': 'Question',
            'name': 'What is the Escrow system?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'When you publish briefs on the marketplace, your total slot rewards are locked in an audited escrow, guaranteeing work payments for workers who provide verified reports.'
            }
          }
        ]
      } as any);
    }

    jsonLdScript = document.createElement('script');
    jsonLdScript.setAttribute('id', 'pw-jsonld-schema');
    jsonLdScript.setAttribute('type', 'application/ld+json');
    jsonLdScript.textContent = JSON.stringify(schemaData);
    document.head.appendChild(jsonLdScript);

  }, [activeTab, activeMenuScreen]);

  const handleUpdateApp = () => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {isOffline && (
        <div className="fixed top-safe left-0 right-0 z-50 p-3 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold font-sans flex items-center justify-between shadow-lg transition-all animate-slide-in">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-white animate-pulse" />
            <span>You are offline. Reconnect to continue using PayWorth.</span>
          </div>
          <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full">CACHED UI MODE</span>
        </div>
      )}

      {!isOffline && navigator.onLine === false && (
        <div className="fixed top-safe left-0 right-0 z-50 p-3 bg-emerald-500/90 backdrop-blur-md text-slate-950 text-xs font-bold font-sans flex items-center gap-2 shadow-lg animate-fade-out">
          <Wifi className="w-4 h-4 text-slate-950" />
          <span>Connection successfully restored! Syncing platform ledgers...</span>
        </div>
      )}

      {showUpdatePrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto bg-slate-900/95 border border-emerald-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-2xl flex flex-col gap-3 transition-all">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-sans">A new version of PayWorth is available.</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Update to authorize new security audits, rewards, and performance patches.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUpdatePrompt(false)}
              className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-[10px] py-2 rounded-xl transition-all"
            >
              Dismiss
            </button>
            <button
              onClick={handleUpdateApp}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] py-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
            >
              <RefreshCw className="w-3 h-3 animate-spin" /> Update Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
