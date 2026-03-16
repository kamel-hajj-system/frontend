import { apiRequest } from './client.js';

/** List all permissions. */
export async function getPermissions(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiRequest(`/permissions${q ? `?${q}` : ''}`);
}

/** Get one permission by id. */
export async function getPermissionById(id) {
  return apiRequest(`/permissions/${id}`);
}

/** Get default permissions (optional ?userType=Company). */
export async function getDefaultPermissions(userType) {
  const q = userType ? `?userType=${encodeURIComponent(userType)}` : '';
  return apiRequest(`/permissions/defaults${q}`);
}

/** Set default permissions for a user type. */
export async function setDefaultPermissions(userType, permissionIds) {
  return apiRequest('/permissions/defaults', {
    method: 'POST',
    body: JSON.stringify({ userType, permissionIds }),
  });
}

/** Create permission (Super Admin). */
export async function createPermission(payload) {
  return apiRequest('/permissions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Update permission (Super Admin). */
export async function updatePermission(id, payload) {
  return apiRequest(`/permissions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** Delete permission (Super Admin). */
export async function deletePermission(id) {
  return apiRequest(`/permissions/${id}`, { method: 'DELETE' });
}
