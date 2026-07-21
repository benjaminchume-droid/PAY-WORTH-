import React from 'react';
import { PayWorthProvider, usePayWorth } from './engines/StateContext';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import WelcomePopup from './components/WelcomePopup';
import HomeView from './components/HomeView';
import TasksView from './components/TasksView';
import WalletView from './components/WalletView';
import MarketplaceView from './components/MarketplaceView';
import MenuView from './components/MenuView';
import SEOAndRouteManager from './components/SEOAndRouteManager';
import { isSupabaseConfigured } from './lib/supabase';
import { Database, Key, ShieldAlert } from 'lucide-react';

function SupabaseConfigError() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-emerald-500" />

        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Supabase Setup Required</h2>
          <p className="text-slate-400 text-sm">
            PayWorth is now configured as a secure live application. To activate authentication, wallet ledgers, and database schemas, please link your Supabase instance.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300 mt-0.5 shrink-0">1</div>
            <div>
              <p className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-500" /> Register Supabase Project
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">supabase.com</a> to create a free PostgreSQL database.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300 mt-0.5 shrink-0">2</div>
            <div>
              <p className="font-semibold text-sm text-slate-200 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-500" /> Extract API Credentials
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Go to Project Settings &gt; API, and locate your <span className="text-slate-300 font-mono text-[11px]">Project URL</span> and <span className="text-slate-300 font-mono text-[11px]">anon public API Key</span>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300 mt-0.5 shrink-0">3</div>
            <div>
              <p className="font-semibold text-sm text-slate-200">Inject Environment Variables</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Add them as secrets/environment variables in the Google AI Studio settings menu:
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[11px] text-slate-400 mt-2 border border-slate-800 space-y-1">
                <div>VITE_SUPABASE_URL=your-project-url</div>
                <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Once these keys are added to secrets, the application will refresh and connect automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentUser, activeTab, activeMenuScreen } = usePayWorth();

  const isPublicPage = activeMenuScreen && ['about', 'privacy', 'terms', 'security', 'contact', 'help'].includes(activeMenuScreen);

  // 1. If not authenticated and not on a public page, render the Auth portal
  if (!currentUser && !isPublicPage) {
    return <Auth />;
  }

  // 2. If authenticated but onboarding not completed, render the interactive Onboarding slider
  if (currentUser && !currentUser.onboardingCompleted) {
    return <Onboarding />;
  }

  // 3. Main Dashboard Layout viewports distribution
  return (
    <Layout>
      {/* Post-login interactive greeting card */}
      {currentUser && <WelcomePopup />}

      {/* Render dynamic menu screens (Membership, leaderboard, games, achievements, setting, statistics, admin, etc.) if selected */}
      {activeMenuScreen ? (
        <MenuView />
      ) : (
        /* Render core tab views */
        <>
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'wallet' && <WalletView />}
          {activeTab === 'marketplace' && <MarketplaceView />}
        </>
      )}
    </Layout>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <SupabaseConfigError />;
  }

  return (
    <PayWorthProvider>
      <SEOAndRouteManager />
      <AppContent />
    </PayWorthProvider>
  );
}

