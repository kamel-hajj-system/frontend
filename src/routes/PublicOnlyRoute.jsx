import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuthenticatedLandingRoute } from '../utils/authRedirect';

/**
 * Guest-only routes (home, login, sign-up): signed-in users are sent to their app home.
 */
export function PublicOnlyRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-[var(--color-muted-foreground)]">...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getAuthenticatedLandingRoute(user)} replace />;
  }

  return children;
}
