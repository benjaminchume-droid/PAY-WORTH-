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


