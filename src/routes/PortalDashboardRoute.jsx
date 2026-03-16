import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, USER_TYPES } from '../utils/constants';

/**
 * Allows access to Company dashboard only if user is authenticated and userType === 'Company'.
 * Uses the user table (userType), not permissions. If wrong type, redirect to correct dashboard or 403.
 */
export function RequirePortalCompany({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-[var(--color-muted-foreground)]">...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (user?.userType === USER_TYPES.SERVICE_CENTER) {
    return <Navigate to={ROUTES.PORTAL_SERVICE_CENTER_DASHBOARD} replace />;
  }

  if (user?.userType === USER_TYPES.COMPANY) {
    return children;
  }

  return <Navigate to={ROUTES.FORBIDDEN} replace />;
}

/**
 * Allows access to Service Center dashboard only if user is authenticated and userType === 'ServiceCenter'.
 * Uses the user table (userType / serviceCenterId), not permissions. If wrong type, redirect to correct dashboard or 403.
 */
export function RequirePortalServiceCenter({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-[var(--color-muted-foreground)]">...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (user?.userType === USER_TYPES.COMPANY) {
    return <Navigate to={ROUTES.PORTAL_COMPANY_DASHBOARD} replace />;
  }

  if (user?.userType === USER_TYPES.SERVICE_CENTER) {
    return children;
  }

  return <Navigate to={ROUTES.FORBIDDEN} replace />;
}
