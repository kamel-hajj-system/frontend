import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, USER_TYPES } from '../utils/constants';

export function PortalRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.isSuperAdmin) return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;

  if (user.userType === USER_TYPES.SERVICE_CENTER) {
    return <Navigate to={ROUTES.PORTAL_SERVICE_CENTER_DASHBOARD} replace />;
  }

  // default: company
  return <Navigate to={ROUTES.PORTAL_COMPANY_DASHBOARD} replace />;
}
