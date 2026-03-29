/**
 * Users API – create (sign up), get current user via token.
 * Backend may expose public register later; for now we use create user with validation shape.
 */

import { apiRequest } from './client.js';
import { toQueryString } from './query.js';

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

/** Public: active supervisors for a work location (employee sign-up). */
export async function getSignupSupervisors(locationId) {
  const q = toQueryString({ locationId });
  const path = '/users/register/supervisors' + (q ? `?${q}` : '');
  return apiRequest(path);
}

/**
 * Register as service center user (public). Role EmpRead until HR approves; userType=ServiceCenter.
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
  const q = toQueryString(params);
  return apiRequest(`/users${q ? `?${q}` : ''}`);
}

/** Get list for HR module (guarded by backend HR middleware). */
export async function getHrUsers(params = {}) {
  const q = toQueryString(params);
  return apiRequest(`/hr/users${q ? `?${q}` : ''}`);
}

/** HR: list users awaiting approval (scoped by company vs service center on the server). */
export async function getHrPendingRegistrations() {
  return apiRequest('/hr/pending-registrations');
}

/** HR (Supervisor/EmpManage): approve pending user and assign role. */
export async function approveHrPendingUser(id, role) {
  return apiRequest(`/hr/users/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

/** Company supervisor: pending employees linked to this supervisor (supervisorId). */
export async function getSupervisorPendingRegistrations() {
  return apiRequest('/portal/company/supervisor/pending-registrations');
}

export async function approveSupervisorPendingUser(id, role) {
  return apiRequest(`/portal/company/supervisor/users/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}

export async function getHrSupervisorsTree(params = {}) {
  const q = toQueryString(params);
  return apiRequest(`/hr/supervisors-tree${q ? `?${q}` : ''}`);
}

export async function getSuperAdminSupervisorsTree(params = {}) {
  const q = toQueryString(params);
  return apiRequest(`/users/supervisors-tree${q ? `?${q}` : ''}`);
}

export async function getMyEmployees(params = {}) {
  const q = toQueryString(params);
  return apiRequest(`/portal/company/my-employees${q ? `?${q}` : ''}`);
}

/** Company supervisor: update role for a direct report only. */
export async function updateMyEmployeeRole(id, role) {
  return apiRequest('/portal/company/my-employees/' + id, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
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

/** Update user from HR module (PATCH). */
export async function updateHrUser(id, payload) {
  return apiRequest(`/hr/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/** HR reset password (Supervisor/EmpManage only). */
export async function hrResetPassword(id, newPassword) {
  return apiRequest(`/hr/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });
}

/** Soft delete user (Admin only; cannot delete super admin). */
export async function deleteUser(id) {
  return apiRequest(`/users/${id}`, { method: 'DELETE' });
}

/** Bulk assign supervisor (and optional role) for Company users (Super Admin only). */
export async function bulkAssignSupervisor(payload) {
  return apiRequest('/users/bulk/assign-supervisor', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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
