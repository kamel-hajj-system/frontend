import { apiRequest } from './client.js';

/** Super Admin: grouped viewer → visible company users. */
export async function getDelegatedEmployeeVisibility() {
  return apiRequest('/delegated-employee-visibility');
}

/** Super Admin: replace visible users for one viewer. */
export async function setDelegatedEmployeeVisibility(viewerId, visibleUserIds) {
  return apiRequest(`/delegated-employee-visibility/${viewerId}`, {
    method: 'PUT',
    body: JSON.stringify({ visibleUserIds: visibleUserIds || [] }),
  });
}
