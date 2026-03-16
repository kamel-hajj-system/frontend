import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../utils/constants';

/**
 * Protects routes by permission. Requires auth first; if no permission, redirect to 403.
 * @param {string | string[]} permission - Permission name or array (any one required).
 */
export function PermissionRoute({ permission, children }) {
  const { isAuthenticated, hasPermission, loading } = useAuth();
  const location = useLocation();
  const list = Array.isArray(permission) ? permission : [permission];
  const allowed = list.some((p) => hasPermission(p));

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

  if (!allowed) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return children;
}
