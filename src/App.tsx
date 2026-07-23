import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PayWorthProvider, usePayWorth } from './engines/StateContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import WelcomePopup from './components/WelcomePopup';
import LegalUpdateModal from './components/LegalUpdateModal';
import SEOAndRouteManager from './components/SEOAndRouteManager';
import InitializationScreen from './components/InitializationScreen';
import { PageSkeleton } from './components/ui/SkeletonLoader';

import {
  LeaderboardView,
  LuckyWheelView,
  AchievementsView,
  ReferralsView,
  PayFundsView,
  StatisticsView,
  NotificationsView,
  StaticInfoView
} from './components/MenuView';

// Lazy Loaded Page Components
const Auth = lazy(() => import('./components/Auth'));
const VerificationEngine = lazy(() => import('./components/VerificationEngine'));
const HomeView = lazy(() => import('./components/HomeView'));
const TasksView = lazy(() => import('./components/TasksView'));
const WalletView = lazy(() => import('./components/WalletView'));
const MarketplaceView = lazy(() => import('./components/MarketplaceView'));
const MembershipView = lazy(() => import('./components/MembershipView'));
const MiningView = lazy(() => import('./components/MiningView'));
const CreateCampaignView = lazy(() => import('./components/CreateCampaignView'));
const GamesView = lazy(() => import('./components/GamesView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const SecurityCenterView = lazy(() => import('./components/SecurityCenterView'));
const AboutView = lazy(() => import('./components/AboutView'));
const LegalCenterView = lazy(() => import('./components/LegalCenterView'));
const AdminPlatformView = lazy(() => import('./components/AdminPlatformView'));
const AdminLegalDashboard = lazy(() => import('./components/AdminLegalDashboard'));

function AppContent() {
  const {
    currentUser,
    isInitializingAccount,
    initializationError,
    retryInitialization
  } = usePayWorth();

  // If account is initializing or had an initialization error
  if (isInitializingAccount || initializationError) {
    return (
      <InitializationScreen
        error={initializationError}
        onRetry={retryInitialization}
      />
    );
  }

  return (
    <>
      {/* Dynamic SEO metadata manager */}
      <SEOAndRouteManager />

      {/* Post-login interactive greeting card */}
      {currentUser && <WelcomePopup />}

      {/* Mandatory legal terms update modal check */}
      {currentUser && <LegalUpdateModal />}

      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          {/* Public Auth Portal */}
          <Route path="/auth" element={<Auth />} />

          {/* Account & Email Verification Portals */}
          <Route path="/verify" element={<VerificationEngine />} />
          <Route path="/account_verify" element={<VerificationEngine />} />

          {/* Application Layout Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/home" replace />} />
            
            {/* Protected Main Routes */}
            <Route path="home" element={<ProtectedRoute><HomeView /></ProtectedRoute>} />
            <Route path="tasks" element={<ProtectedRoute><TasksView /></ProtectedRoute>} />
            <Route path="wallet" element={<ProtectedRoute><WalletView /></ProtectedRoute>} />
            <Route path="marketplace" element={<ProtectedRoute><MarketplaceView /></ProtectedRoute>} />
            
            {/* Protected Engine Routes */}
            <Route path="membership" element={<ProtectedRoute><MembershipView /></ProtectedRoute>} />
            <Route path="mining" element={<ProtectedRoute><MiningView /></ProtectedRoute>} />
            <Route path="create_campaign" element={<ProtectedRoute><CreateCampaignView /></ProtectedRoute>} />
            <Route path="leaderboard" element={<ProtectedRoute><LeaderboardView /></ProtectedRoute>} />
            <Route path="wheel" element={<ProtectedRoute><LuckyWheelView /></ProtectedRoute>} />
            <Route path="games" element={<ProtectedRoute><GamesView /></ProtectedRoute>} />
            <Route path="achievements" element={<ProtectedRoute><AchievementsView /></ProtectedRoute>} />
            <Route path="referrals" element={<ProtectedRoute><ReferralsView /></ProtectedRoute>} />
            <Route path="payfunds" element={<ProtectedRoute><PayFundsView /></ProtectedRoute>} />
            <Route path="statistics" element={<ProtectedRoute><StatisticsView /></ProtectedRoute>} />
            <Route path="stats" element={<Navigate to="/statistics" replace />} />
            <Route path="notifications" element={<ProtectedRoute><NotificationsView /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><SettingsView /></ProtectedRoute>} />
            <Route path="security" element={<ProtectedRoute><SecurityCenterView /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><StaticInfoView page="profile" /></ProtectedRoute>} />

            {/* Public / Informational Pages */}
            <Route path="help" element={<StaticInfoView page="help" />} />
            <Route path="faq" element={<Navigate to="/help" replace />} />
            <Route path="contact" element={<StaticInfoView page="contact" />} />
            <Route path="about" element={<AboutView />} />
            <Route path="privacy" element={<LegalCenterView initialDocId="privacy-policy" />} />
            <Route path="terms" element={<LegalCenterView initialDocId="terms-of-service" />} />
            <Route path="legal_center" element={<LegalCenterView />} />

            {/* Admin & Auditor Routes */}
            <Route path="admin" element={<ProtectedRoute requireAdmin><AdminPlatformView /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute requireAdmin><AdminPlatformView /></ProtectedRoute>} />
            <Route path="legal_admin" element={<ProtectedRoute requireAdmin><AdminLegalDashboard /></ProtectedRoute>} />

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PayWorthProvider>
        <AppContent />
      </PayWorthProvider>
    </ErrorBoundary>
  );
}
