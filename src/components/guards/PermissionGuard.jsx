import React from 'react';
import { usePermission } from '../../hooks/usePermission';

/**
 * Renders children only if the current user has one of the given permissions.
 * Use for hiding UI elements (buttons, menu items, sections).
 * @param {string | string[]} permission - Permission name or array (any one required).
 */
export function PermissionGuard({ permission, children, fallback = null }) {
  const hasAccess = usePermission(permission);
  if (!hasAccess) return fallback;
  return children;
}
