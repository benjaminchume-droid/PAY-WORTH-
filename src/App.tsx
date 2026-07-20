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

function AppContent() {
  const { currentUser, activeTab, activeMenuScreen } = usePayWorth();

  // 1. If not authenticated, render the Auth portal
  if (!currentUser) {
    return <Auth />;
  }

  // 2. If onboarding not completed, render the interactive Onboarding slider
  if (!currentUser.onboardingCompleted) {
    return <Onboarding />;
  }

  // 3. Main Dashboard Layout viewports distribution
  return (
    <Layout>
      {/* Post-login interactive greeting card */}
      <WelcomePopup />

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
      <AppContent />
    </PayWorthProvider>
  );
}
