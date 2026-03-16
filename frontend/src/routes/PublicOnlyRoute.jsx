import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, USER_TYPES } from '../utils/constants';

/**
 * For login/sign up: redirect to portal or superadmin if already signed in.
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

  if (isAuthenticated) {
    if (user?.isSuperAdmin) return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
    if (user?.userType === USER_TYPES.SERVICE_CENTER) return <Navigate to={ROUTES.PORTAL_SERVICE_CENTER_DASHBOARD} replace />;
    return <Navigate to={ROUTES.PORTAL_COMPANY_DASHBOARD} replace />;
  }

  return children;
}
