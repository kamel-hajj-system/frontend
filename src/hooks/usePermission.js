import { useAuth } from '../contexts/AuthContext';

/**
 * Returns whether the current user has the given permission (or any of the list).
 * Super Admin always has all permissions.
 * @param {string | string[]} permissionOrList - Single permission name or array (any one = true).
 */
export function usePermission(permissionOrList) {
  const { hasPermission } = useAuth();
  const list = Array.isArray(permissionOrList) ? permissionOrList : [permissionOrList];
  return list.some((p) => hasPermission(p));
}
