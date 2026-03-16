import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, PERMISSIONS } from '../utils/constants';

/** Permissions that grant access to at least one super admin page (dashboard, locations, shifts, permissions, groups). */
const SUPER_ADMIN_AREA_PERMISSIONS = [
  PERMISSIONS.USERS_VIEW,
  PERMISSIONS.LOCATIONS_VIEW,
  PERMISSIONS.LOCATIONS_MANAGE,
  PERMISSIONS.SHIFTS_VIEW,
  PERMISSIONS.SHIFTS_MANAGE,
  PERMISSIONS.PERMISSIONS_VIEW,
  PERMISSIONS.PERMISSIONS_MANAGE,
];

/**
 * Allows super admin users or users who have any super admin area permission (e.g. from a group).
 * Others redirect to portal dashboard.
 */
export function SuperAdminRoute({ children }) {
  const { user, isAuthenticated, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-[var(--color-muted-foreground)]">...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const canAccessSuperAdmin = user?.isSuperAdmin || SUPER_ADMIN_AREA_PERMISSIONS.some((p) => hasPermission(p));
  if (!canAccessSuperAdmin) {
    return <Navigate to={ROUTES.PORTAL} replace />;
  }

  return children;
}
