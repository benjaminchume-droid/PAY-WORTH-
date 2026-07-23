import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getScreenByPath, SCREEN_REGISTRY } from '../config/screenRegistry';
import { ShieldAlert, RefreshCw, WifiOff, Wifi } from 'lucide-react';

export default function SEOAndRouteManager() {
  const location = useLocation();
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

  // Pure SEO and document title / meta management based on React Router location
  useEffect(() => {
    const currentPath = location.pathname;
    const screenDef = getScreenByPath(currentPath) || SCREEN_REGISTRY[0];
    const meta = screenDef.seo;

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

    const schemaData: any[] = [
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
      });
    }

    jsonLdScript = document.createElement('script');
    jsonLdScript.setAttribute('id', 'pw-jsonld-schema');
    jsonLdScript.setAttribute('type', 'application/ld+json');
    jsonLdScript.textContent = JSON.stringify(schemaData);
    document.head.appendChild(jsonLdScript);

  }, [location.pathname]);

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
