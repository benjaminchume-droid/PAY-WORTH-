import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePayWorth } from '../engines/StateContext';
import Onboarding from './Onboarding';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { currentUser, isInitializingAccount } = usePayWorth();
  const location = useLocation();

  if (isInitializingAccount) {
    // Return null or loading spinner while initialization settles
    return null;
  }

  if (!currentUser) {
    // Redirect unauthenticated user to login portal, saving current location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const isAdmin = currentUser.email === 'admin@payworth.com' || (currentUser as any)?.role === 'admin';
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  // If authenticated but interactive onboarding is not finished
  if (!currentUser.onboardingCompleted) {
    return <Onboarding />;
  }

  return children;
}
