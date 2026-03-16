/**
 * Users API – create (sign up), get current user via token.
 * Backend may expose public register later; for now we use create user with validation shape.
 */

import { apiRequest } from './client.js';

/**
 * Create user (Super Admin only; requires auth).
 */
export async function createUser(payload) {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Register as employee (public). Role and userType set by backend.
 * Payload: fullName, fullNameAr?, email, password, phone?, locationId, shiftId, supervisorId?
 */
export async function registerEmployee(payload) {
  return apiRequest('/users/register/employee', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Register as service center user (public). Role=Supervisor, userType=ServiceCenter.
 * Payload: fullName, fullNameAr?, email, password, phone?, serviceCenterId?
 */
export async function registerServiceCenter(payload) {
  return apiRequest('/users/register/service-center', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** Get list (for portal/admin). */
export async function getUsers(params = {}) {
  const q = new URLSearchParams(params).toString();
  return apiRequest(`/users${q ? `?${q}` : ''}`);
}

/** Get current user with permissions (for auth state). No permission required. */
export async function getMe() {
  return apiRequest('/users/me');
}

/** Get one user by id (requires users.view or self). */
export async function getUserById(id) {
  return apiRequest(`/users/${id}`);
}

/** Update user (PATCH). */
export async function updateUser(id, payload) {
  return apiRequest(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** Soft delete user (Admin only; cannot delete super admin). */
export async function deleteUser(id) {
  return apiRequest(`/users/${id}`, { method: 'DELETE' });
}

/** Change password for a user. */
export async function changePassword(id, currentPassword, newPassword) {
  return apiRequest(`/users/${id}/change-password`, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

/** Assign role (Admin only). */
export async function assignRole(id, role) {
  return apiRequest(`/users/${id}/assign-role`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

/** Assign permissions (Admin only). */
export async function assignPermissions(id, permissionIds) {
  return apiRequest(`/users/${id}/assign-permissions`, {
    method: 'POST',
    body: JSON.stringify({ permissionIds: Array.isArray(permissionIds) ? permissionIds : [] }),
  });
}
