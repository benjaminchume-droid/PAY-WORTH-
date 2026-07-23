import React from 'react';
import { PayWorthProvider, usePayWorth } from './engines/StateContext';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import WelcomePopup from './components/WelcomePopup';
import LegalUpdateModal from './components/LegalUpdateModal';
import HomeView from './components/HomeView';
import TasksView from './components/TasksView';
import WalletView from './components/WalletView';
import MarketplaceView from './components/MarketplaceView';
import MenuView from './components/MenuView';
import SEOAndRouteManager from './components/SEOAndRouteManager';
import VerificationEngine from './components/VerificationEngine';
import InitializationScreen from './components/InitializationScreen';

function AppContent() {
  const {
    currentUser,
    activeTab,
    activeMenuScreen,
    isInitializingAccount,
    initializationError,
    retryInitialization
  } = usePayWorth();

  // Check if current URL route is the verification portal or callback payload
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;
  const currentSearch = window.location.search;

  const isVerificationRoute = 
    currentPath === '/verify' || 
    currentPath === '/account_verify' ||
    currentHash.includes('type=signup') ||
    currentHash.includes('type=email_change') ||
    currentHash.includes('access_token') ||
    currentSearch.includes('code=');

  if (isVerificationRoute) {
    return <VerificationEngine />;
  }

  const isPublicPage = activeMenuScreen && ['about', 'privacy', 'terms', 'security', 'contact', 'help'].includes(activeMenuScreen);

  // 1. If account is currently initializing (provisioning profile, wallet, membership) or had an init error
  if (isInitializingAccount || initializationError) {
    return (
      <InitializationScreen
        error={initializationError}
        onRetry={retryInitialization}
      />
    );
  }

  // 2. If not authenticated and not on a public page, render the Auth portal
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

      {/* Mandatory legal terms update modal check */}
      {currentUser && <LegalUpdateModal />}

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
  return (
    <PayWorthProvider>
      <SEOAndRouteManager />
      <AppContent />
    </PayWorthProvider>
  );
}
